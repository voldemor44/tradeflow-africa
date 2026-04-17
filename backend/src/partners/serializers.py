"""
TradeFlow Africa — partners/serializers.py
"""

from rest_framework import serializers
from .models import Partner


class PartnerSerializer(serializers.ModelSerializer):
    """Lecture / écriture complète d'un partenaire."""

    type_display = serializers.CharField(source="get_type_display", read_only=True)

    class Meta:
        model = Partner
        fields = [
            "id",
            "organisation",
            "type",
            "type_display",
            "name",
            "country",
            "city",
            "contact_name",
            "email",
            "phone",
            "whatsapp",
            "notes",
            "rating",
            "total_shipments",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organisation",
            "rating",
            "total_shipments",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        """Vérifie l'unicité du nom au sein de l'organisation (hors création multi-tenant)."""
        organisation = self.context["request"].user.organisation
        qs = Partner.objects.filter(organisation=organisation, name=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "Un partenaire avec ce nom existe déjà dans votre organisation."
            )
        return value

    def create(self, validated_data):
        validated_data["organisation"] = self.context["request"].user.organisation
        return super().create(validated_data)


class PartnerSummarySerializer(serializers.ModelSerializer):
    """Représentation légère — utilisée dans les serializers d'expédition."""

    type_display = serializers.CharField(source="get_type_display", read_only=True)

    class Meta:
        model = Partner
        fields = ["id", "name", "type", "type_display", "country", "city"]


class PartnerCreateSerializer(serializers.ModelSerializer):
    """Création d'un partenaire — champs obligatoires uniquement."""

    class Meta:
        model = Partner
        fields = [
            "type",
            "name",
            "country",
            "city",
            "contact_name",
            "email",
            "phone",
            "whatsapp",
            "notes",
        ]

    def create(self, validated_data):
        validated_data["organisation"] = self.context["request"].user.organisation
        return super().create(validated_data)
