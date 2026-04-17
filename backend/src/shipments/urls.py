from django.urls import path
from .views import (
    ShipmentListCreateView,
    ShipmentDetailView,
    ShipmentStatusView,
    ShipmentArchiveView,
    ShipmentHistoryView,
)

urlpatterns = [
    path("shipments/", ShipmentListCreateView.as_view(), name="shipment-list"),
    path("shipments/<uuid:pk>/", ShipmentDetailView.as_view(), name="shipment-detail"),
    path(
        "shipments/<uuid:pk>/status/",
        ShipmentStatusView.as_view(),
        name="shipment-status",
    ),
    path(
        "shipments/<uuid:pk>/archive/",
        ShipmentArchiveView.as_view(),
        name="shipment-archive",
    ),
    path(
        "shipments/<uuid:pk>/history/",
        ShipmentHistoryView.as_view(),
        name="shipment-history",
    ),
]
