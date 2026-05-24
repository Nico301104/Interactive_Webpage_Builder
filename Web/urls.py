from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Landing API (public)
    path('api/', include('landing.urls')),

    # Auth JWT
    path('api/auth/', include('users.urls')),

    # Projects + Editor
    path('api/projects/', include('projects.urls')),
    path('api/editor/', include('editor.urls')),

    # Export
    path('api/export/', include('exporter.urls')),

    # Payments
    path('api/payments/', include('payments.urls')),

    # SPA catch-all — serve index.html for all non-api routes
    # Must be LAST
    re_path(r'^(?!api/).*$', TemplateView.as_view(template_name='index.html')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
