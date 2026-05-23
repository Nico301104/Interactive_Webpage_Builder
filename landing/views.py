from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def landing_view(request):
    """Endpoint public — pagina de start a API-ului."""
    return Response({
        'app': 'IWB API',
        'version': '1.0.0',
        'description': 'Backend pentru editor drag-and-drop de pagini web.',
        'auth': {
            'register': '/api/auth/register/',
            'login': '/api/auth/login/',
            'logout': '/api/auth/logout/',
            'refresh': '/api/auth/token/refresh/',
            'profile': '/api/auth/profile/',
        },
        'editor': {
            'projects': '/api/projects/',
            'editor': '/api/editor/projects/{id}/layout/',
        },
        'export': {
            'download_zip': '/api/export/{project_id}/?format=zip',
            'json': '/api/export/{project_id}/?format=json',
        },
    })
