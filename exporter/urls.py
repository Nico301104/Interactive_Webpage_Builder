from django.urls import path
from .views import ExportProjectView

app_name = 'exporter'

urlpatterns = [
    path('<uuid:pk>/', ExportProjectView.as_view(), name='export'),
]
