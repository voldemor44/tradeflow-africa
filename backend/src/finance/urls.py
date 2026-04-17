from django.urls import path
from .views import (
    ShipmentCostListCreateView,
    ShipmentCostSummaryView,
    CostDetailView,
    PaymentListCreateView,
    PaymentDetailView,
    ShipmentPaymentListView,
    CustomsDutySimulateView,
    CustomsDutySimulationListView,
)

urlpatterns = [
    # Coûts
    path(
        "shipments/<uuid:pk>/costs/",
        ShipmentCostListCreateView.as_view(),
        name="shipment-costs",
    ),
    path(
        "shipments/<uuid:pk>/costs/summary/",
        ShipmentCostSummaryView.as_view(),
        name="shipment-costs-summary",
    ),
    path("costs/<int:pk>/", CostDetailView.as_view(), name="cost-detail"),
    # Paiements
    path("payments/", PaymentListCreateView.as_view(), name="payment-list"),
    path("payments/<uuid:pk>/", PaymentDetailView.as_view(), name="payment-detail"),
    path(
        "shipments/<uuid:pk>/payments/",
        ShipmentPaymentListView.as_view(),
        name="shipment-payments",
    ),
    # Simulateur douanier
    path(
        "finance/simulate/", CustomsDutySimulateView.as_view(), name="finance-simulate"
    ),
    path(
        "finance/simulations/",
        CustomsDutySimulationListView.as_view(),
        name="finance-simulations",
    ),
]
