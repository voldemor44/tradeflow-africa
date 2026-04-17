"""
TradeFlow Africa — accounts/views.py

Authentification : JWT via djangorestframework-simplejwt
  - POST /auth/register/          → inscription + création organisation
  - POST /auth/login/             → obtenir access + refresh tokens
  - POST /auth/token/refresh/     → renouveler l'access token
  - POST /auth/logout/            → blacklister le refresh token
  - GET  /auth/me/                → profil de l'utilisateur connecté
  - PATCH /auth/me/               → mettre à jour le profil
  - POST /auth/me/change-password/ → changer le mot de passe
  - GET/PATCH /auth/organisation/ → lire/modifier son organisation

  - GET/POST   /users/            → liste + création (admin)
  - GET/PATCH/DELETE /users/{id}/ → détail utilisateur (admin)
"""

from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import TokenError

from .models import Organisation, User
from .serializers import (
    OrganisationSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsOrganisationAdmin, IsSameOrganisation


# ──────────────────────────────────────────────────────────────
# JWT CUSTOMISÉ — ajoute des claims utiles au payload du token
# ──────────────────────────────────────────────────────────────

class TradeFlowTokenSerializer(TokenObtainPairSerializer):
    """
    Enrichit le payload JWT avec les infos utiles côté frontend :
    user_id, email, full_name, role, organisation_id, organisation_name.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"]             = user.email
        token["full_name"]         = user.get_full_name() or user.username
        token["role"]              = user.role
        token["organisation_id"]   = str(user.organisation_id) if user.organisation_id else None
        token["organisation_name"] = user.organisation.name if user.organisation else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Met à jour last_seen à chaque login
        self.user.last_seen = timezone.now()
        self.user.save(update_fields=["last_seen"])
        # Ajoute le profil complet dans la réponse login (pratique pour le frontend)
        data["user"] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    """
    POST /auth/login/
    Body : { "username": "...", "password": "..." }
    Retourne : { "access": "...", "refresh": "...", "user": {...} }
    """
    serializer_class = TradeFlowTokenSerializer


class RefreshView(TokenRefreshView):
    """
    POST /auth/token/refresh/
    Body : { "refresh": "..." }
    Retourne : { "access": "..." }
    """
    pass


# ──────────────────────────────────────────────────────────────
# INSCRIPTION
# ──────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """
    POST /auth/register/
    Crée une organisation ET son premier utilisateur (admin) en une seule requête.

    Body :
    {
        "organisation_name": "Mon Entreprise SARL",
        "username": "admin",
        "email": "admin@monentreprise.com",
        "first_name": "Jean",
        "last_name": "Dupont",
        "phone": "+229 97000000",
        "password": "...",
        "password_confirm": "..."
    }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        org_name = request.data.get("organisation_name", "").strip()
        if not org_name:
            return Response(
                {"organisation_name": "Le nom de l'organisation est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Crée le serializer utilisateur avec les données reçues
        user_data = {k: v for k, v in request.data.items() if k != "organisation_name"}
        serializer = UserCreateSerializer(data=user_data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Génère un slug unique depuis le nom de l'organisation
        from django.utils.text import slugify
        base_slug = slugify(org_name)
        slug      = base_slug
        counter   = 1
        while Organisation.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Crée l'organisation puis l'utilisateur admin
        organisation = Organisation.objects.create(name=org_name, slug=slug)
        user = serializer.save(
            organisation=organisation,
            role=User.Role.ADMIN,
            is_verified=False,  # peut être mis True après vérification email
        )

        # Génère les tokens directement
        refresh = RefreshToken.for_user(user)
        refresh["email"]             = user.email
        refresh["full_name"]         = user.get_full_name() or user.username
        refresh["role"]              = user.role
        refresh["organisation_id"]   = str(organisation.id)
        refresh["organisation_name"] = organisation.name

        return Response(
            {
                "access":  str(refresh.access_token),
                "refresh": str(refresh),
                "user":    UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ──────────────────────────────────────────────────────────────
# DÉCONNEXION (blacklist du refresh token)
# ──────────────────────────────────────────────────────────────

class LogoutView(APIView):
    """
    POST /auth/logout/
    Body : { "refresh": "..." }
    Blackliste le refresh token — nécessite 'rest_framework_simplejwt.token_blacklist'
    dans INSTALLED_APPS.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"refresh": "Ce champ est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Déconnexion réussie."}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({"refresh": "Token invalide ou déjà révoqué."}, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────────────────────
# PROFIL DE L'UTILISATEUR CONNECTÉ
# ──────────────────────────────────────────────────────────────

class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /auth/me/ → profil complet de l'utilisateur connecté
    PATCH /auth/me/ → mise à jour partielle du profil
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True  # Toujours PATCH partiel
        return super().update(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """
    POST /auth/me/change-password/
    Body : { "old_password": "...", "new_password": "...", "new_password_confirm": "..." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Mot de passe modifié avec succès."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────────────────────
# ORGANISATION
# ──────────────────────────────────────────────────────────────

class OrganisationView(generics.RetrieveUpdateAPIView):
    """
    GET   /auth/organisation/ → lire les infos de son organisation
    PATCH /auth/organisation/ → modifier (admin seulement)
    """
    serializer_class   = OrganisationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.organisation

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [permissions.IsAuthenticated(), IsOrganisationAdmin()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


# ──────────────────────────────────────────────────────────────
# GESTION DES UTILISATEURS (admin de l'organisation)
# ──────────────────────────────────────────────────────────────

class UserListCreateView(generics.ListCreateAPIView):
    """
    GET  /users/ → liste des utilisateurs de l'organisation
    POST /users/ → inviter / créer un nouvel utilisateur
    Accessible aux admins et managers uniquement.
    """
    permission_classes = [permissions.IsAuthenticated, IsOrganisationAdmin]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(
            organisation=self.request.user.organisation
        ).select_related("organisation").order_by("first_name", "last_name")

    def perform_create(self, serializer):
        serializer.save(organisation=self.request.user.organisation)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /users/{id}/ → détail d'un utilisateur
    PATCH  /users/{id}/ → modifier le rôle, activer/désactiver
    DELETE /users/{id}/ → supprimer (désactiver en réalité)
    """
    permission_classes = [permissions.IsAuthenticated, IsOrganisationAdmin]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(organisation=self.request.user.organisation)

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Désactive l'utilisateur au lieu de le supprimer définitivement."""
        user = self.get_object()
        if user == request.user:
            return Response(
                {"detail": "Vous ne pouvez pas désactiver votre propre compte."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"detail": "Utilisateur désactivé."}, status=status.HTTP_200_OK)
