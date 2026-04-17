"""
TradeFlow Africa — urls.py (racine)
Toutes les routes sont préfixées /api/v1/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

API = "api/v1/"

urlpatterns = [
    # Admin Django
    path("admin/", admin.site.urls),
    # Documentation OpenAPI
    path(f"{API}schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        f"{API}docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(f"{API}redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # Apps
    path(f"{API}", include("accounts.urls")),
    path(f"{API}", include("partners.urls")),
    path(f"{API}", include("shipments.urls")),
    path(f"{API}", include("tracking.urls")),
    path(f"{API}", include("documents.urls")),
    path(f"{API}", include("finance.urls")),
    path(f"{API}", include("notifications.urls")),
]

# Fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
