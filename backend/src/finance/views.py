"""
TradeFlow Africa — finance/views.py

Endpoints :
  GET    /shipments/{id}/costs/        Coûts d'une expédition
  POST   /shipments/{id}/costs/        Ajouter un poste de coût
  PATCH  /costs/{id}/                  Modifier un coût
  DELETE /costs/{id}/                  Supprimer un coût
  GET    /shipments/{id}/costs/summary/ Résumé estimé vs réel + variance

  GET    /payments/                     Tous les paiements (filtrables)
  POST   /payments/                     Créer un paiement
  GET    /payments/{id}/                Détail
  PATCH  /payments/{id}/                Modifier
  DELETE /payments/{id}/                Supprimer

  GET    /shipments/{id}/payments/      Paiements d'une expédition

  POST   /finance/simulate/             Simulation douanière à la volée (V2)
  GET    /finance/simulations/          Historique des simulations
"""

from decimal import Decimal
from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsOrganisationAdmin, IsSameOrganisation
from shipments.models import Shipment
from .models import ShipmentCost, Payment, CustomsDutySimulation
from .serializers import (
    ShipmentCostSerializer,
    ShipmentCostSummarySerializer,
    PaymentSerializer,
    PaymentListSerializer,
    CustomsDutySimulationSerializer,
    CustomsDutySimulationInputSerializer,
)


# ──────────────────────────────────────────────────────────────
# COÛTS
# ──────────────────────────────────────────────────────────────


class ShipmentCostListCreateView(generics.ListCreateAPIView):
    """
    GET  /shipments/{id}/costs/  → postes de coûts de l'expédition
    POST /shipments/{id}/costs/  → ajouter un poste
    """

    serializer_class = ShipmentCostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShipmentCost.objects.filter(
            shipment__pk=self.kwargs["pk"],
            shipment__organisation=self.request.user.organisation,
        ).order_by("cost_type")

    def perform_create(self, serializer):
        try:
            shipment = Shipment.objects.get(
                pk=self.kwargs["pk"],
                organisation=self.request.user.organisation,
            )
        except Shipment.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Expédition introuvable.")
        serializer.save(shipment=shipment)


class ShipmentCostSummaryView(APIView):
    """
    GET /shipments/{id}/costs/summary/
    Agrège les coûts pour afficher le landed cost total estimé vs réel.
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

        costs = ShipmentCost.objects.filter(shipment=shipment)
        total_estimated = sum(c.estimated_amount or 0 for c in costs)
        total_actual = sum(c.actual_amount or 0 for c in costs)

        return Response(
            {
                "shipment": str(shipment.id),
                "reference": shipment.reference,
                "currency": "XOF",
                "total_estimated": total_estimated,
                "total_actual": total_actual,
                "variance": total_actual - total_estimated,
                "costs": ShipmentCostSummarySerializer(costs, many=True).data,
            }
        )


class CostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /costs/{id}/
    PATCH  /costs/{id}/
    DELETE /costs/{id}/
    """

    serializer_class = ShipmentCostSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganisationAdmin]

    def get_queryset(self):
        return ShipmentCost.objects.filter(
            shipment__organisation=self.request.user.organisation
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


# ──────────────────────────────────────────────────────────────
# PAIEMENTS
# ──────────────────────────────────────────────────────────────


class PaymentListCreateView(generics.ListCreateAPIView):
    """
    GET  /payments/  → tous les paiements de l'organisation
    POST /payments/  → créer un paiement

    Filtres :
      ?status=pending
      ?shipment={uuid}
      ?due_date_before=2025-12-31
    """

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "method", "shipment", "partner"]
    ordering_fields = ["due_date", "amount", "created_at"]
    ordering = ["due_date"]

    def get_serializer_class(self):
        return (
            PaymentSerializer
            if self.request.method == "POST"
            else PaymentListSerializer
        )

    def get_queryset(self):
        qs = Payment.objects.filter(
            shipment__organisation=self.request.user.organisation
        ).select_related("shipment", "partner")

        # Filtre sur date d'échéance
        before = self.request.query_params.get("due_date_before")
        after = self.request.query_params.get("due_date_after")
        if before:
            qs = qs.filter(due_date__lte=before)
        if after:
            qs = qs.filter(due_date__gte=after)

        return qs


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /payments/{id}/
    PATCH  /payments/{id}/
    DELETE /payments/{id}/
    """

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganisationAdmin]

    def get_queryset(self):
        return Payment.objects.filter(
            shipment__organisation=self.request.user.organisation
        ).select_related("shipment", "partner", "created_by")

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class ShipmentPaymentListView(generics.ListAPIView):
    """
    GET /shipments/{id}/payments/
    Paiements liés à une expédition spécifique.
    """

    serializer_class = PaymentListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Payment.objects.filter(
                shipment__pk=self.kwargs["pk"],
                shipment__organisation=self.request.user.organisation,
            )
            .select_related("partner")
            .order_by("due_date")
        )


# ──────────────────────────────────────────────────────────────
# SIMULATION DOUANIÈRE (V2)
# ──────────────────────────────────────────────────────────────


class CustomsDutySimulateView(APIView):
    """
    POST /finance/simulate/
    Calcule les droits de douane estimés sans créer de dossier.
    Body : { "hs_code": "8471.30", "goods_value": 5000000, "transport_mode": "sea", "origin_country": "CN" }

    Note : les taux sont des exemples. En production, ils doivent être
    chargés depuis une base tarifaire (SYDONIA, tarif UEMOA, etc.)
    """

    permission_classes = [permissions.IsAuthenticated]

    # Taux de référence UEMOA / Bénin (à remplacer par une vraie DB tarifaire)
    DUTY_RATES = {
        "sea": Decimal("0.05"),  # 5% DD + PCL + RSI
        "air": Decimal("0.05"),
        "road": Decimal("0.05"),
        "multi": Decimal("0.05"),
    }
    VAT_RATE = Decimal("0.18")  # TVA Bénin 18%

    def post(self, request):
        serializer = CustomsDutySimulationInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        goods_value = data["goods_value"]
        duty_rate = self.DUTY_RATES.get(data["transport_mode"], Decimal("0.05"))
        customs_duty = goods_value * duty_rate
        vat = (goods_value + customs_duty) * self.VAT_RATE
        total_taxes = customs_duty + vat

        return Response(
            {
                "hs_code": data["hs_code"],
                "goods_value": goods_value,
                "duty_rate": f"{duty_rate * 100:.1f}%",
                "customs_duty": customs_duty,
                "vat_rate": f"{self.VAT_RATE * 100:.1f}%",
                "vat": vat,
                "total_taxes": total_taxes,
                "landed_cost": goods_value + total_taxes,
                "currency": "XOF",
            }
        )


class CustomsDutySimulationListView(generics.ListAPIView):
    """
    GET /finance/simulations/
    Historique des simulations de l'organisation.
    """

    serializer_class = CustomsDutySimulationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            CustomsDutySimulation.objects.filter(
                organisation=self.request.user.organisation
            )
            .select_related("created_by")
            .order_by("-created_at")
        )
