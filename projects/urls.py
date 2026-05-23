from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FormSubmitView,
    PageDetailView,
    PageSetHomepageView,
    ProjectTemplateViewSet,
    ProjectViewSet,
    SharedProjectView,
    TagViewSet,
)

app_name = 'projects'

router = DefaultRouter()
# 'tags' and 'templates' must be registered before '' so their URL patterns
# are matched before the catch-all <pk> pattern from the empty prefix.
router.register('tags', TagViewSet, basename='tag')
router.register('templates', ProjectTemplateViewSet, basename='template')
router.register('', ProjectViewSet, basename='project')

urlpatterns = [
    path('shared/<uuid:share_token>/', SharedProjectView.as_view({'get': 'retrieve'}), name='project-shared'),
    path('shared/<uuid:share_token>/forms/<str:form_id>/submit/', FormSubmitView.as_view(), name='form-submit'),
    path('<uuid:pk>/pages/<uuid:page_id>/', PageDetailView.as_view(), name='page-detail'),
    path('<uuid:pk>/pages/<uuid:page_id>/set-homepage/', PageSetHomepageView.as_view(), name='page-set-homepage'),
    path('', include(router.urls)),
]
