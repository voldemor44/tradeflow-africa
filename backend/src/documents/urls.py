from django.urls import path
from .views import (
    DocumentTypeListView,
    DocumentListCreateView,
    DocumentDetailView,
    DocumentValidateView,
    ShipmentDocumentListView,
)

urlpatterns = [
    path("document-types/", DocumentTypeListView.as_view(), name="document-type-list"),
    path("documents/", DocumentListCreateView.as_view(), name="document-list"),
    path("documents/<uuid:pk>/", DocumentDetailView.as_view(), name="document-detail"),
    path(
        "documents/<uuid:pk>/validate/",
        DocumentValidateView.as_view(),
        name="document-validate",
    ),
    path(
        "shipments/<uuid:pk>/documents/",
        ShipmentDocumentListView.as_view(),
        name="shipment-documents",
    ),
]
