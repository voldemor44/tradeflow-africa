"""
TradeFlow Africa — accounts/serializers.py
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Organisation, User


# ──────────────────────────────────────────────────────────────
# ORGANISATION
# ──────────────────────────────────────────────────────────────


class OrganisationSerializer(serializers.ModelSerializer):
    """Lecture complète d'une organisation."""

    class Meta:
        model = Organisation
        fields = [
            "id",
            "name",
            "slug",
            "country",
            "city",
            "phone",
            "email",
            "tax_id",
            "logo",
            "plan",
            "plan_expires_at",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OrganisationSummarySerializer(serializers.ModelSerializer):
    """Représentation légère — utilisée dans les serializers imbriqués."""

    class Meta:
        model = Organisation
        fields = ["id", "name", "slug", "plan"]


# ──────────────────────────────────────────────────────────────
# USER
# ──────────────────────────────────────────────────────────────


class UserSerializer(serializers.ModelSerializer):
    """
    Lecture d'un utilisateur.
    Expose le nom complet calculé et l'organisation résumée.
    """

    full_name = serializers.SerializerMethodField()
    organisation = OrganisationSummarySerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "organisation",
            "phone",
            "avatar",
            "role",
            "is_verified",
            "is_active",
            "last_seen",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "last_seen", "is_verified"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserSummarySerializer(serializers.ModelSerializer):
    """Représentation légère — utilisée dans les serializers imbriqués (created_by, assigned_to…)."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "avatar", "role"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Création d'un utilisateur avec mot de passe.
    Le mot de passe est hashé avant sauvegarde.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "organisation",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour du profil (sans mot de passe)."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "avatar", "role"]


class ChangePasswordSerializer(serializers.Serializer):
    """Changement de mot de passe authentifié."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
