from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Permite accesul doar proprietarului obiectului (obj.owner == request.user)."""

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
