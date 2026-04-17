from django.urls import path
from .views import PartnerListCreateView, PartnerDetailView, PartnerToggleView

urlpatterns = [
    path("partners/", PartnerListCreateView.as_view(), name="partner-list"),
    path("partners/<uuid:pk>/", PartnerDetailView.as_view(), name="partner-detail"),
    path(
        "partners/<uuid:pk>/toggle/", PartnerToggleView.as_view(), name="partner-toggle"
    ),
]
