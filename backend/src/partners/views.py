"""
TradeFlow Africa — partners/views.py

Endpoints :
  GET    /partners/               Liste des partenaires (filtrable)
  POST   /partners/               Créer un partenaire
  GET    /partners/{id}/          Détail
  PATCH  /partners/{id}/          Modifier
  DELETE /partners/{id}/          Désactiver (soft delete)
  PATCH  /partners/{id}/toggle/   Activer / désactiver
"""

from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsOrganisationAdmin, IsSameOrganisation
from .models import Partner
from .serializers import PartnerSerializer, PartnerCreateSerializer


class PartnerListCreateView(generics.ListCreateAPIView):
    """
    GET  /partners/  → liste paginée, filtrable, recherchable
    POST /partners/  → créer un partenaire (admin/manager)

    Filtres disponibles :
      ?type=freight_forwarder
      ?is_active=true
      ?country=France
      ?search=BESCO          (nom, ville, contact)
      ?ordering=name         (ou -rating, -total_shipments)
    """

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["type", "is_active", "country"]
    search_fields = ["name", "city", "contact_name", "email"]
    ordering_fields = ["name", "rating", "total_shipments", "created_at"]
    ordering = ["name"]

    def get_serializer_class(self):
        return (
            PartnerCreateSerializer
            if self.request.method == "POST"
            else PartnerSerializer
        )

    def get_queryset(self):
        return Partner.objects.filter(
            organisation=self.request.user.organisation
        ).select_related("organisation")

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsOrganisationAdmin()]
        return [permissions.IsAuthenticated()]


class PartnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /partners/{id}/  → détail complet
    PATCH  /partners/{id}/  → modifier (admin/manager)
    DELETE /partners/{id}/  → désactiver
    """

    permission_classes = [permissions.IsAuthenticated, IsSameOrganisation]

    def get_serializer_class(self):
        return (
            PartnerCreateSerializer
            if self.request.method in ("PUT", "PATCH")
            else PartnerSerializer
        )

    def get_queryset(self):
        return Partner.objects.filter(organisation=self.request.user.organisation)

    def get_permissions(self):
        if self.request.method not in ("GET", "HEAD", "OPTIONS"):
            return [
                permissions.IsAuthenticated(),
                IsOrganisationAdmin(),
                IsSameOrganisation(),
            ]
        return [permissions.IsAuthenticated(), IsSameOrganisation()]

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        partner = self.get_object()
        if partner.total_shipments > 0:
            # Ne supprime pas — désactive pour préserver l'historique
            partner.is_active = False
            partner.save(update_fields=["is_active"])
            return Response(
                {"detail": "Partenaire désactivé (historique d'expéditions préservé)."},
                status=status.HTTP_200_OK,
            )
        partner.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PartnerToggleView(APIView):
    """
    PATCH /partners/{id}/toggle/
    Active ou désactive un partenaire selon son état actuel.
    """

    permission_classes = [permissions.IsAuthenticated, IsOrganisationAdmin]

    def patch(self, request, pk):
        try:
            partner = Partner.objects.get(pk=pk, organisation=request.user.organisation)
        except Partner.DoesNotExist:
            return Response(
                {"detail": "Partenaire introuvable."}, status=status.HTTP_404_NOT_FOUND
            )

        partner.is_active = not partner.is_active
        partner.save(update_fields=["is_active"])
        state = "activé" if partner.is_active else "désactivé"
        return Response(
            {"detail": f"Partenaire {state}.", "is_active": partner.is_active}
        )
