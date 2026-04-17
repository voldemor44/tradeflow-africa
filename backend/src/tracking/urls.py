from django.urls import path
from .views import (
    VesselTrackingListCreateView,
    VesselTrackingDetailView,
    VesselPositionUpdateView,
    RoadTrackingListCreateView,
    RoadTrackingDetailView,
    RoadPositionUpdateView,
    ShipmentTrackingView,
)

urlpatterns = [
    # Vessel
    path(
        "tracking/vessel/", VesselTrackingListCreateView.as_view(), name="vessel-list"
    ),
    path(
        "tracking/vessel/<int:pk>/",
        VesselTrackingDetailView.as_view(),
        name="vessel-detail",
    ),
    path(
        "tracking/vessel/<int:pk>/position/",
        VesselPositionUpdateView.as_view(),
        name="vessel-position",
    ),
    # Road
    path("tracking/road/", RoadTrackingListCreateView.as_view(), name="road-list"),
    path(
        "tracking/road/<int:pk>/", RoadTrackingDetailView.as_view(), name="road-detail"
    ),
    path(
        "tracking/road/<int:pk>/position/",
        RoadPositionUpdateView.as_view(),
        name="road-position",
    ),
    # Agrégé par expédition
    path(
        "shipments/<uuid:pk>/tracking/",
        ShipmentTrackingView.as_view(),
        name="shipment-tracking",
    ),
]
