from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsOwner
from projects.models import Project, ProjectVersion
from projects.serializers import ProjectDetailSerializer
from .serializers import (
    ComponentSerializer,
    DeleteComponentSerializer,
    LayoutSerializer,
    ReorderSerializer,
)


def _snapshot(project, user, note='Auto-snapshot'):
    """Creeaza un snapshot al layout-ului curent inainte de modificare."""
    last = project.versions.first()
    ProjectVersion.objects.create(
        project=project,
        version_number=(last.version_number + 1) if last else 1,
        layout_snapshot=project.layout,
        created_by=user,
        note=note,
    )


class ProjectLayoutView(APIView):
    """
    GET  /api/editor/projects/{pk}/layout/  — citeste layout-ul complet
    PUT  /api/editor/projects/{pk}/layout/  — suprascrie layout-ul complet
    """
    permission_classes = [IsAuthenticated]

    def _get_project(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        if project.owner != request.user:
            self.permission_denied(request)
        return project

    def get(self, request, pk):
        project = self._get_project(request, pk)
        return Response({'layout': project.layout})

    def put(self, request, pk):
        project = self._get_project(request, pk)
        ser = LayoutSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        new_layout = ser.validated_data['layout']
        if new_layout != project.layout:
            _snapshot(project, request.user, note='Suprascrierea layout-ului complet')
            project.layout = new_layout
            project.save(update_fields=['layout', 'updated_at'])

        return Response(
            ProjectDetailSerializer(project, context={'request': request}).data
        )


class ComponentUpsertView(APIView):
    """
    POST /api/editor/projects/{pk}/components/
    Adauga o componenta noua sau actualizeaza una existenta (pe baza id-ului).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk, owner=request.user)
        ser = ComponentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        component = ser.validated_data['component']
        comp_id = component['id']

        layout = project.layout if isinstance(project.layout, dict) else {}
        components = layout.get('components', [])

        _snapshot(project, request.user, note=f'Upsert componenta {comp_id}')

        # Actualizeaza daca exista, altfel adauga
        for i, c in enumerate(components):
            if isinstance(c, dict) and c.get('id') == comp_id:
                components[i] = component
                break
        else:
            components.append(component)

        layout['components'] = components
        project.layout = layout
        project.save(update_fields=['layout', 'updated_at'])

        return Response({'layout': project.layout}, status=status.HTTP_200_OK)


class ComponentDeleteView(APIView):
    """
    DELETE /api/editor/projects/{pk}/components/
    Body: {"component_id": "some-id"}
    Sterge o componenta de nivel superior dupa id.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        project = get_object_or_404(Project, pk=pk, owner=request.user)
        ser = DeleteComponentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        comp_id = ser.validated_data['component_id']
        layout = project.layout if isinstance(project.layout, dict) else {}
        components = layout.get('components', [])
        original_len = len(components)

        components = [c for c in components if not (isinstance(c, dict) and c.get('id') == comp_id)]

        if len(components) == original_len:
            return Response(
                {'detail': f"Componenta '{comp_id}' nu a fost gasita."},
                status=status.HTTP_404_NOT_FOUND,
            )

        _snapshot(project, request.user, note=f'Stergere componenta {comp_id}')
        layout['components'] = components
        project.layout = layout
        project.save(update_fields=['layout', 'updated_at'])

        return Response({'layout': project.layout})


class ComponentReorderView(APIView):
    """
    POST /api/editor/projects/{pk}/components/reorder/
    Body: {"ordered_ids": ["id1", "id2", "id3"]}
    Reordoneaza componentele de nivel superior.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk, owner=request.user)
        ser = ReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        ordered_ids = ser.validated_data['ordered_ids']
        layout = project.layout if isinstance(project.layout, dict) else {}
        components = layout.get('components', [])

        index = {c['id']: c for c in components if isinstance(c, dict) and 'id' in c}

        missing = [cid for cid in ordered_ids if cid not in index]
        if missing:
            return Response(
                {'detail': f'ID-uri negasite: {missing}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(ordered_ids) != len(index):
            return Response(
                {'detail': 'Reordonarea trebuie sa includa toate componentele.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _snapshot(project, request.user, note='Reordonare componente')
        layout['components'] = [index[cid] for cid in ordered_ids]
        project.layout = layout
        project.save(update_fields=['layout', 'updated_at'])

        return Response({'layout': project.layout})


class ComponentDefaultsView(APIView):
    """
    GET /api/editor/component-defaults/{type}/
    Returneaza props-urile default pentru un tip de componenta.
    Folosit de frontend la drag-and-drop din library.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, component_type):
        from .serializers import COMPONENT_DEFAULTS
        from core.validators import VALID_COMPONENT_TYPES
        if component_type not in VALID_COMPONENT_TYPES:
            return Response(
                {'detail': f"Tip necunoscut: '{component_type}'."},
                status=status.HTTP_404_NOT_FOUND,
            )
        defaults = COMPONENT_DEFAULTS.get(component_type, {})
        return Response({'type': component_type, 'defaults': defaults})
