import uuid
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsOwner
from .models import FormSubmission, Page, Project, ProjectTemplate, ProjectVersion, Tag
from .serializers import (
    FormSubmissionSerializer,
    PageSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    ProjectPublicSerializer,
    ProjectTemplateSerializer,
    ProjectVersionSerializer,
    RestoreVersionSerializer,
    TagSerializer,
)


# ── Tags ──────────────────────────────────────────────────────────────────────

class TagViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TagSerializer

    def get_queryset(self):
        return Tag.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# ── Projects ──────────────────────────────────────────────────────────────────

class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-updated_at']

    def get_queryset(self):
        qs = (
            Project.objects
            .filter(owner=self.request.user)
            .prefetch_related('versions', 'tags')
            .select_related('owner')
        )
        tag_id = self.request.query_params.get('tag')
        if tag_id:
            qs = qs.filter(tags__id=tag_id)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()
        return Response({'detail': 'Proiectul a fost sters.'}, status=status.HTTP_204_NO_CONTENT)

    # ── Versiuni ──────────────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='versions')
    def list_versions(self, request, pk=None):
        project = self.get_object()
        return Response(ProjectVersionSerializer(project.versions.all(), many=True).data)

    @action(detail=True, methods=['post'], url_path='versions/restore')
    def restore_version(self, request, pk=None):
        project = self.get_object()
        ser = RestoreVersionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        version = get_object_or_404(
            ProjectVersion, id=ser.validated_data['version_id'], project=project
        )
        last = project.versions.first()
        ProjectVersion.objects.create(
            project=project,
            version_number=(last.version_number + 1) if last else 1,
            layout_snapshot=project.layout,
            created_by=request.user,
            note=f'Auto-snapshot inainte de restaurare la v{version.version_number}',
        )
        project.layout = version.layout_snapshot
        project.save(update_fields=['layout', 'updated_at'])
        return Response(ProjectDetailSerializer(project, context={'request': request}).data)

    # ── Share ─────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='toggle-public')
    def toggle_public(self, request, pk=None):
        project = self.get_object()
        project.is_public = not project.is_public
        project.save(update_fields=['is_public', 'updated_at'])
        return Response({'is_public': project.is_public, 'share_token': str(project.share_token)})

    @action(detail=True, methods=['post'], url_path='regenerate-token')
    def regenerate_token(self, request, pk=None):
        project = self.get_object()
        project.share_token = uuid.uuid4()
        project.save(update_fields=['share_token', 'updated_at'])
        return Response({'share_token': str(project.share_token)})

    # ── Duplicare ─────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate(self, request, pk=None):
        src = self.get_object()
        base = slugify(f'{src.title} copy')
        slug, n = base, 1
        while Project.objects.filter(owner=request.user, slug=slug).exists():
            slug = f'{base}-{n}'
            n += 1
        copy = Project.objects.create(
            owner=request.user,
            title=f'{src.title} (copy)',
            description=src.description,
            layout=src.layout,
            meta=src.meta,
            slug=slug,
            status=Project.Status.DRAFT,
        )
        copy.tags.set(src.tags.all())
        return Response(
            ProjectDetailSerializer(copy, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    # ── Pages ─────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['get', 'post'], url_path='pages')
    def pages(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            return Response(PageSerializer(project.pages.all(), many=True).data)

        ser = PageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        title = ser.validated_data['title']
        slug = self._unique_page_slug(project, slugify(title))
        layout = ser.validated_data.get('layout') or {'components': []}
        page = Page.objects.create(
            project=project,
            title=title,
            slug=slug,
            layout=layout,
            order=project.pages.count(),
        )
        return Response(PageSerializer(page).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='pages/reorder')
    def reorder_pages(self, request, pk=None):
        project = self.get_object()
        ordered_ids = request.data.get('ordered_ids', [])
        pages = {str(p.id): p for p in project.pages.all()}
        if set(str(i) for i in ordered_ids) != set(pages.keys()):
            return Response({'detail': 'Lista de ID-uri nu corespunde paginilor proiectului.'}, status=status.HTTP_400_BAD_REQUEST)
        for i, pid in enumerate(ordered_ids):
            p = pages[str(pid)]
            p.order = i
            p.save(update_fields=['order'])
        return Response(PageSerializer(project.pages.all(), many=True).data)

    def _unique_page_slug(self, project, base):
        slug, n = base or 'page', 1
        while Page.objects.filter(project=project, slug=slug).exists():
            slug = f'{base}-{n}'
            n += 1
        return slug

    # ── Form Submissions ──────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='submissions')
    def submissions(self, request, pk=None):
        project = self.get_object()
        qs = project.submissions.all()
        form_id = request.query_params.get('form_id')
        if form_id:
            qs = qs.filter(form_id=form_id)
        return Response(FormSubmissionSerializer(qs, many=True).data)


# ── Shared Project ────────────────────────────────────────────────────────────

class SharedProjectView(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = ProjectPublicSerializer

    def retrieve(self, request, share_token=None):
        project = get_object_or_404(Project, share_token=share_token, is_public=True)
        return Response(self.get_serializer(project).data)


# ── Pages (detail-level operations) ──────────────────────────────────────────

class PageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_page(self, request, pk, page_id):
        project = get_object_or_404(Project, pk=pk, owner=request.user)
        page = get_object_or_404(Page, pk=page_id, project=project)
        return project, page

    def patch(self, request, pk, page_id):
        project, page = self._get_page(request, pk, page_id)
        ser = PageSerializer(page, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        if 'title' in ser.validated_data:
            base = slugify(ser.validated_data['title'])
            slug, n = base or 'page', 1
            while Page.objects.filter(project=project, slug=slug).exclude(pk=page.pk).exists():
                slug = f'{base}-{n}'
                n += 1
            ser.validated_data['slug'] = slug
        ser.save()
        return Response(PageSerializer(page).data)

    def delete(self, request, pk, page_id):
        project, page = self._get_page(request, pk, page_id)
        if project.pages.count() <= 1:
            return Response(
                {'detail': 'Nu poti sterge singura pagina a proiectului.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        page.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PageSetHomepageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, page_id):
        project = get_object_or_404(Project, pk=pk, owner=request.user)
        page = get_object_or_404(Page, pk=page_id, project=project)
        project.pages.update(is_homepage=False)
        page.is_homepage = True
        page.save(update_fields=['is_homepage'])
        return Response(PageSerializer(page).data)


# ── Templates ─────────────────────────────────────────────────────────────────

class ProjectTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectTemplate.objects.all()
    serializer_class = ProjectTemplateSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='use')
    def use(self, request, pk=None):
        template = self.get_object()
        base = slugify(template.name)
        slug, n = base, 1
        while Project.objects.filter(owner=request.user, slug=slug).exists():
            slug = f'{base}-{n}'
            n += 1
        project = Project.objects.create(
            owner=request.user,
            title=template.name,
            description=template.description,
            layout=template.layout,
            slug=slug,
        )
        return Response(
            ProjectDetailSerializer(project, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


# ── Form Submissions (public endpoint) ────────────────────────────────────────

class FormSubmitView(APIView):
    permission_classes = [AllowAny]

    def _get_client_ip(self, request):
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def _find_form(self, components, form_id):
        for c in components:
            if not isinstance(c, dict):
                continue
            if c.get('id') == form_id and c.get('type') == 'form':
                return True
            for key in ('children', 'items', 'columns'):
                sub = c.get(key)
                if isinstance(sub, list) and self._find_form(sub, form_id):
                    return True
        return False

    def post(self, request, share_token, form_id):
        project = get_object_or_404(Project, share_token=share_token, is_public=True)

        components = project.layout.get('components', [])
        if not self._find_form(components, form_id):
            return Response(
                {'detail': 'Formularul nu a fost gasit in proiect.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        ip = self._get_client_ip(request)
        cache_key = f'form_rate_{share_token}_{form_id}_{ip}'
        count = cache.get(cache_key, 0)
        if count >= 10:
            return Response(
                {'detail': 'Prea multe submisii. Incearca din nou mai tarziu.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        cache.set(cache_key, count + 1, 3600)

        data = request.data if isinstance(request.data, dict) else {}
        FormSubmission.objects.create(
            project=project,
            form_id=form_id,
            data=data,
            ip_address=ip,
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        )
        return Response({'detail': 'Mesajul a fost trimis cu succes.'}, status=status.HTTP_201_CREATED)
