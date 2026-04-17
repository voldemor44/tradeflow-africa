"""
TradeFlow Africa — tracking/views.py

Endpoints :
  GET    /tracking/vessel/                  Liste tous les trackings navire actifs
  POST   /tracking/vessel/                  Lier un navire à une expédition
  GET    /tracking/vessel/{id}/             Détail + positions récentes
  PATCH  /tracking/vessel/{id}/             Modifier les infos navire
  POST   /tracking/vessel/{id}/position/    Mettre à jour la position (Celery/webhook)

  GET    /tracking/road/                    Liste tous les trackings routiers actifs
  POST   /tracking/road/                    Lier un véhicule à une expédition
  GET    /tracking/road/{id}/               Détail
  PATCH  /tracking/road/{id}/               Modifier
  POST   /tracking/road/{id}/position/      Mettre à jour la position GPS

  GET    /shipments/{id}/tracking/          Tracking complet d'une expédition (vessel + road)
"""

from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsSameOrganisation
from shipments.models import Shipment
from .models import VesselTracking, RoadTracking
from .serializers import (
    VesselTrackingSerializer,
    VesselTrackingCreateSerializer,
    VesselPositionUpdateSerializer,
    RoadTrackingSerializer,
    RoadPositionUpdateSerializer,
)


# ──────────────────────────────────────────────────────────────
# VESSEL TRACKING
# ──────────────────────────────────────────────────────────────


class VesselTrackingListCreateView(generics.ListCreateAPIView):
    """
    GET  /tracking/vessel/  → navires actifs de l'organisation
    POST /tracking/vessel/  → lier un navire à une expédition
    """

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["tracking_active"]
    search_fields = ["vessel_name", "imo_number", "container_number", "bill_of_lading"]

    def get_serializer_class(self):
        return (
            VesselTrackingCreateSerializer
            if self.request.method == "POST"
            else VesselTrackingSerializer
        )

    def get_queryset(self):
        return VesselTracking.objects.filter(
            shipment__organisation=self.request.user.organisation
        ).select_related("shipment")


class VesselTrackingDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /tracking/vessel/{id}/  → détail + 50 dernières positions
    PATCH /tracking/vessel/{id}/  → modifier infos navire (B/L, voyage number…)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return (
            VesselTrackingCreateSerializer
            if self.request.method in ("PUT", "PATCH")
            else VesselTrackingSerializer
        )

    def get_queryset(self):
        return (
            VesselTracking.objects.filter(
                shipment__organisation=self.request.user.organisation
            )
            .select_related("shipment")
            .prefetch_related("position_logs")
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class VesselPositionUpdateView(APIView):
    """
    POST /tracking/vessel/{id}/position/
    Utilisé par la tâche Celery de synchronisation MarineTraffic.
    Met à jour la position courante et loggue dans VesselPositionLog.

    Body : { "latitude": 6.35, "longitude": 2.43, "speed_knots": 12.5,
             "heading": 280, "status": "Underway", "vessel_eta": "2025-02-10T08:00:00Z" }
    """

    # En production : restreindre à l'IP du worker Celery ou à un token service
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            vessel = VesselTracking.objects.get(
                pk=pk, shipment__organisation=request.user.organisation
            )
        except VesselTracking.DoesNotExist:
            return Response(
                {"detail": "Tracking introuvable."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = VesselPositionUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        vessel = serializer.save(instance=vessel)
        return Response(VesselTrackingSerializer(vessel).data)


# ──────────────────────────────────────────────────────────────
# ROAD TRACKING
# ──────────────────────────────────────────────────────────────


class RoadTrackingListCreateView(generics.ListCreateAPIView):
    """
    GET  /tracking/road/  → transports routiers actifs
    POST /tracking/road/  → lier un camion à une expédition
    """

    serializer_class = RoadTrackingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["tracking_active"]

    def get_queryset(self):
        return RoadTracking.objects.filter(
            shipment__organisation=self.request.user.organisation
        ).select_related("shipment")


class RoadTrackingDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /tracking/road/{id}/
    PATCH /tracking/road/{id}/
    """

    serializer_class = RoadTrackingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RoadTracking.objects.filter(
            shipment__organisation=self.request.user.organisation
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class RoadPositionUpdateView(APIView):
    """
    POST /tracking/road/{id}/position/
    Mise à jour manuelle ou GPS. Peut inclure un checkpoint franchi.

    Body : { "latitude": 11.86, "longitude": 3.22, "checkpoint_name": "Malanville" }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            road = RoadTracking.objects.get(
                pk=pk, shipment__organisation=request.user.organisation
            )
        except RoadTracking.DoesNotExist:
            return Response(
                {"detail": "Tracking introuvable."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = RoadPositionUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        road = serializer.save(instance=road)
        return Response(RoadTrackingSerializer(road).data)


# ──────────────────────────────────────────────────────────────
# VUE AGRÉGÉE PAR EXPÉDITION
# ──────────────────────────────────────────────────────────────


class ShipmentTrackingView(APIView):
    """
    GET /shipments/{id}/tracking/
    Retourne le tracking complet d'une expédition (vessel OU road selon le mode).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            shipment = Shipment.objects.get(
                pk=pk, organisation=request.user.organisation
            )
        except Shipment.DoesNotExist:
            return Response(
                {"detail": "Expédition introuvable."}, status=status.HTTP_404_NOT_FOUND
            )

        data = {
            "shipment_id": str(shipment.id),
            "transport_mode": shipment.transport_mode,
        }

        if shipment.transport_mode == "sea":
            vessel = getattr(shipment, "vessel_tracking", None)
            data["vessel"] = VesselTrackingSerializer(vessel).data if vessel else None
        elif shipment.transport_mode == "road":
            road = getattr(shipment, "road_tracking", None)
            data["road"] = RoadTrackingSerializer(road).data if road else None
        else:
            # Multimodal — peut avoir les deux
            vessel = getattr(shipment, "vessel_tracking", None)
            road = getattr(shipment, "road_tracking", None)
            data["vessel"] = VesselTrackingSerializer(vessel).data if vessel else None
            data["road"] = RoadTrackingSerializer(road).data if road else None

        return Response(data)
