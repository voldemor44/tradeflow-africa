"""
TradeFlow Africa — accounts/permissions.py
Permissions personnalisées réutilisables dans toutes les apps.
"""

from rest_framework.permissions import BasePermission


class IsOrganisationAdmin(BasePermission):
    """Autorise uniquement les utilisateurs avec le rôle admin ou manager."""
    message = "Seuls les administrateurs et gestionnaires peuvent effectuer cette action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ("admin", "manager")
        )


class IsSameOrganisation(BasePermission):
    """
    Vérifie au niveau objet que la ressource appartient
    à la même organisation que l'utilisateur connecté.
    """
    message = "Vous n'avez pas accès à cette ressource."

    def has_object_permission(self, request, view, obj):
        # Supporte les modèles avec organisation directe ou via shipment
        if hasattr(obj, "organisation"):
            return obj.organisation == request.user.organisation
        if hasattr(obj, "shipment"):
            return obj.shipment.organisation == request.user.organisation
        if hasattr(obj, "user"):
            return obj.user.organisation == request.user.organisation
        return False


class IsReadOnly(BasePermission):
    """Autorise uniquement les méthodes de lecture (GET, HEAD, OPTIONS)."""

    def has_permission(self, request, view):
        return request.method in ("GET", "HEAD", "OPTIONS")


class IsOwnerOrAdmin(BasePermission):
    """Autorise l'utilisateur propriétaire de l'objet ou un admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role in ("admin", "manager"):
            return True
        if hasattr(obj, "created_by"):
            return obj.created_by == request.user
        if hasattr(obj, "user"):
            return obj.user == request.user
        return False
