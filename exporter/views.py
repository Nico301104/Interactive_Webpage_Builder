import io
import zipfile

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from .engine import build_html, build_css, build_js


class ExportProjectView(APIView):
    """
    GET /api/export/{pk}/?type=zip   → ZIP cu index.html, styles.css, main.js
    GET /api/export/{pk}/?type=json  → JSON cu html, css, js

    IMPORTANT: folosim ?type= in loc de ?format=
    ?format= este rezervat de DRF pentru content negotiation si cauzeaza 404.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk, owner=request.user)

        html = build_html(project)
        css  = build_css(project)
        js   = build_js(project)

        # Citim din request.query_params dar evitam 'format' (rezervat DRF)
        # Acceptam: ?type=zip, ?type=json
        export_type = request.query_params.get('type', 'zip')

        if export_type == 'zip':
            buf = io.BytesIO()
            with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
                zf.writestr('index.html', html)
                zf.writestr('styles.css', css)
                zf.writestr('main.js',    js)
            buf.seek(0)
            filename = f'{project.slug or str(project.id)}-export.zip'
            resp = HttpResponse(buf.read(), content_type='application/zip')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp

        if export_type == 'json':
            return Response({'html': html, 'css': css, 'js': js})

        return Response(
            {'detail': "Tip invalid. Foloseste ?type=zip sau ?type=json"},
            status=400,
        )
