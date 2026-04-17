"""
TradeFlow Africa — shipments/views.py

Endpoints :
  GET    /shipments/                     Liste (filtres, recherche, tri)
  POST   /shipments/                     Créer un dossier
  GET    /shipments/{id}/                Détail complet
  PATCH  /shipments/{id}/                Modifier
  DELETE /shipments/{id}/                Supprimer (brouillons uniquement)
  POST   /shipments/{id}/status/         Changer le statut
  POST   /shipments/{id}/archive/        Archiver / désarchiver
  GET    /shipments/{id}/history/        Historique des statuts
"""

from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsOrganisationAdmin, IsSameOrganisation, IsOwnerOrAdmin
from .models import Shipment, ShipmentStatusHistory
from .serializers import (
    ShipmentListSerializer,
    ShipmentDetailSerializer,
    ShipmentCreateSerializer,
    ShipmentUpdateSerializer,
    ShipmentStatusChangeSerializer,
    ShipmentArchiveSerializer,
    ShipmentStatusHistorySerializer,
)


class ShipmentListCreateView(generics.ListCreateAPIView):
    """
    GET  /shipments/  → liste paginée avec filtres
    POST /shipments/  → créer un nouveau dossier

    Filtres :
      ?status=in_transit
      ?status=in_transit,customs          (multi-valeur séparée par virgule)
      ?direction=import
      ?transport_mode=sea
      ?is_archived=false
      ?freight_forwarder={uuid}
      ?search=TFA-2025                    (référence, description, origine, destination)
      ?ordering=-created_at
      ?estimated_arrival_after=2025-01-01
      ?estimated_arrival_before=2025-06-30
    """

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        "direction",
        "transport_mode",
        "incoterm",
        "is_archived",
        "freight_forwarder",
        "customs_broker",
        "supplier",
    ]
    search_fields = [
        "reference",
        "goods_description",
        "origin_country",
        "origin_port_or_city",
        "destination_country",
        "destination_port_or_city",
    ]
    ordering_fields = [
        "reference",
        "created_at",
        "estimated_arrival",
        "declared_value",
        "status",
    ]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        return (
            ShipmentCreateSerializer
            if self.request.method == "POST"
            else ShipmentListSerializer
        )

    def get_queryset(self):
        qs = Shipment.objects.filter(
            organisation=self.request.user.organisation
        ).select_related(
            "freight_forwarder",
            "customs_broker",
            "supplier",
            "created_by",
            "assigned_to",
        )
        # Filtre multi-valeur sur status : ?status=in_transit,customs
        status_param = self.request.query_params.get("status")
        if status_param:
            status_list = [s.strip() for s in status_param.split(",") if s.strip()]
            qs = qs.filter(status__in=status_list)

        # Filtres sur les dates d'arrivée estimée
        after = self.request.query_params.get("estimated_arrival_after")
        before = self.request.query_params.get("estimated_arrival_before")
        if after:
            qs = qs.filter(estimated_arrival__gte=after)
        if before:
            qs = qs.filter(estimated_arrival__lte=before)

        return qs

    def perform_create(self, serializer):
        serializer.save()


class ShipmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /shipments/{id}/  → détail complet avec nested
    PATCH  /shipments/{id}/  → modifier les champs
    DELETE /shipments/{id}/  → supprimer (brouillons uniquement)
    """

    permission_classes = [permissions.IsAuthenticated, IsSameOrganisation]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ShipmentUpdateSerializer
        return ShipmentDetailSerializer

    def get_queryset(self):
        return (
            Shipment.objects.filter(organisation=self.request.user.organisation)
            .select_related(
                "organisation",
                "created_by",
                "assigned_to",
                "freight_forwarder",
                "customs_broker",
                "supplier",
            )
            .prefetch_related("status_history__changed_by", "documents")
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        shipment = self.get_object()
        if shipment.status != Shipment.Status.DRAFT:
            return Response(
                {"detail": "Seuls les dossiers en brouillon peuvent être supprimés."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        shipment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ShipmentStatusView(APIView):
    """
    POST /shipments/{id}/status/
    Body : { "status": "in_transit", "note": "...", "location": "Port de Shanghai" }
    Enregistre le changement et crée une entrée dans l'historique.
    """

    permission_classes = [permissions.IsAuthenticated, IsSameOrganisation]

    def get_object(self, pk, user):
        try:
            obj = Shipment.objects.get(pk=pk, organisation=user.organisation)
            self.check_object_permissions(self.request, obj)
            return obj
        except Shipment.DoesNotExist:
            return None

    def post(self, request, pk):
        shipment = self.get_object(pk, request.user)
        if not shipment:
            return Response(
                {"detail": "Expédition introuvable."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ShipmentStatusChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            shipment = serializer.save(instance=shipment, user=request.user)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ShipmentDetailSerializer(shipment).data)


class ShipmentArchiveView(APIView):
    """
    POST /shipments/{id}/archive/
    Body : { "archive": true }  ou  { "archive": false }
    """

    permission_classes = [permissions.IsAuthenticated, IsOrganisationAdmin]

    def post(self, request, pk):
        try:
            shipment = Shipment.objects.get(
                pk=pk, organisation=request.user.organisation
            )
        except Shipment.DoesNotExist:
            return Response(
                {"detail": "Expédition introuvable."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ShipmentArchiveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        shipment = serializer.save(instance=shipment, user=request.user)
        action = "archivée" if shipment.is_archived else "désarchivée"
        return Response(
            {"detail": f"Expédition {action}.", "is_archived": shipment.is_archived}
        )


class ShipmentHistoryView(generics.ListAPIView):
    """
    GET /shipments/{id}/history/
    Historique chronologique des changements de statut.
    """

    serializer_class = ShipmentStatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            ShipmentStatusHistory.objects.filter(
                shipment__pk=self.kwargs["pk"],
                shipment__organisation=self.request.user.organisation,
            )
            .select_related("changed_by")
            .order_by("changed_at")
        )
