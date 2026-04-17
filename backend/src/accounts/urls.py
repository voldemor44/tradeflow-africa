"""
TradeFlow Africa — accounts/urls.py
"""

from django.urls import path
from .views import (
    LoginView,
    RefreshView,
    RegisterView,
    LogoutView,
    MeView,
    ChangePasswordView,
    OrganisationView,
    UserListCreateView,
    UserDetailView,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/token/refresh/", RefreshView.as_view(), name="auth-token-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    # Profil
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path(
        "auth/me/change-password/",
        ChangePasswordView.as_view(),
        name="auth-change-password",
    ),
    # Organisation
    path("auth/organisation/", OrganisationView.as_view(), name="auth-organisation"),
    # Gestion des utilisateurs
    path("users/", UserListCreateView.as_view(), name="user-list"),
    path("users/<uuid:pk>/", UserDetailView.as_view(), name="user-detail"),
]
