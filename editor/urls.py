from django.urls import path
from .views import (
    ProjectLayoutView,
    ComponentUpsertView,
    ComponentDeleteView,
    ComponentReorderView,
    ComponentDefaultsView,
)

app_name = 'editor'

urlpatterns = [
    # Layout complet
    path('projects/<uuid:pk>/layout/',              ProjectLayoutView.as_view(),     name='layout'),
    # Componente individuale
    path('projects/<uuid:pk>/components/',           ComponentUpsertView.as_view(),   name='component-upsert'),
    path('projects/<uuid:pk>/components/delete/',    ComponentDeleteView.as_view(),   name='component-delete'),
    path('projects/<uuid:pk>/components/reorder/',   ComponentReorderView.as_view(),  name='component-reorder'),
    # Default props (frontend le foloseste la drag-and-drop)
    path('component-defaults/<str:component_type>/', ComponentDefaultsView.as_view(), name='component-defaults'),
]
