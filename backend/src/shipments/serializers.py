"""
TradeFlow Africa — shipments/serializers.py
"""

from rest_framework import serializers
from accounts.serializers import UserSummarySerializer
from partners.serializers import PartnerSummarySerializer
from .models import Shipment, ShipmentStatusHistory


# ──────────────────────────────────────────────────────────────
# STATUT HISTORY
# ──────────────────────────────────────────────────────────────


class ShipmentStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserSummarySerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ShipmentStatusHistory
        fields = [
            "id",
            "status",
            "status_display",
            "note",
            "location",
            "latitude",
            "longitude",
            "changed_by",
            "changed_at",
        ]
        read_only_fields = ["id", "changed_at"]


# ──────────────────────────────────────────────────────────────
# SHIPMENT — LISTE (léger, sans nested profond)
# ──────────────────────────────────────────────────────────────


class ShipmentListSerializer(serializers.ModelSerializer):
    """
    Serializer optimisé pour la liste des expéditions.
    Données minimales pour le tableau — évite les N+1 queries
    (utiliser select_related dans la view).
    """

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    direction_display = serializers.CharField(
        source="get_direction_display", read_only=True
    )
    transport_mode_display = serializers.CharField(
        source="get_transport_mode_display", read_only=True
    )
    is_active = serializers.BooleanField(read_only=True)

    # Noms seulement — pas d'objet imbriqué complet
    freight_forwarder_name = serializers.CharField(
        source="freight_forwarder.name", read_only=True, default=None
    )
    customs_broker_name = serializers.CharField(
        source="customs_broker.name", read_only=True, default=None
    )
    supplier_name = serializers.CharField(
        source="supplier.name", read_only=True, default=None
    )

    class Meta:
        model = Shipment
        fields = [
            "id",
            "reference",
            "direction",
            "direction_display",
            "status",
            "status_display",
            "origin_country",
            "origin_port_or_city",
            "destination_country",
            "destination_port_or_city",
            "goods_description",
            "transport_mode",
            "transport_mode_display",
            "incoterm",
            "declared_value",
            "currency",
            "freight_forwarder_name",
            "customs_broker_name",
            "supplier_name",
            "estimated_departure",
            "estimated_arrival",
            "is_archived",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reference", "created_at", "updated_at"]


# ──────────────────────────────────────────────────────────────
# SHIPMENT — DÉTAIL (complet, avec nested)
# ──────────────────────────────────────────────────────────────


class ShipmentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour la page de détail d'une expédition.
    Inclut les partenaires imbriqués et l'historique de statuts.
    """

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    direction_display = serializers.CharField(
        source="get_direction_display", read_only=True
    )
    transport_mode_display = serializers.CharField(
        source="get_transport_mode_display", read_only=True
    )
    is_active = serializers.BooleanField(read_only=True)

    created_by = UserSummarySerializer(read_only=True)
    assigned_to = UserSummarySerializer(read_only=True)
    freight_forwarder = PartnerSummarySerializer(read_only=True)
    customs_broker = PartnerSummarySerializer(read_only=True)
    supplier = PartnerSummarySerializer(read_only=True)

    status_history = ShipmentStatusHistorySerializer(many=True, read_only=True)

    # Compteurs utiles pour l'UI (évite des appels supplémentaires)
    documents_count = serializers.IntegerField(source="documents.count", read_only=True)
    pending_documents_count = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = [
            "id",
            "reference",
            "organisation",
            "created_by",
            "assigned_to",
            "direction",
            "direction_display",
            "origin_country",
            "origin_port_or_city",
            "destination_country",
            "destination_port_or_city",
            "goods_description",
            "hs_code",
            "quantity",
            "unit",
            "gross_weight_kg",
            "volume_m3",
            "declared_value",
            "currency",
            "transport_mode",
            "transport_mode_display",
            "incoterm",
            "freight_forwarder",
            "customs_broker",
            "supplier",
            "status",
            "status_display",
            "estimated_departure",
            "actual_departure",
            "estimated_arrival",
            "actual_arrival",
            "customs_start",
            "customs_end",
            "is_archived",
            "archived_at",
            "notes",
            "tags",
            "is_active",
            "documents_count",
            "pending_documents_count",
            "status_history",
            "created_at",
            "updated_at",
            "closed_at",
        ]
        read_only_fields = [
            "id",
            "reference",
            "organisation",
            "created_by",
            "archived_at",
            "created_at",
            "updated_at",
        ]

    def get_pending_documents_count(self, obj):
        return obj.documents.filter(validation_status="pending").count()


# ──────────────────────────────────────────────────────────────
# SHIPMENT — CRÉATION
# ──────────────────────────────────────────────────────────────


class ShipmentCreateSerializer(serializers.ModelSerializer):
    """
    Création d'un nouveau dossier d'expédition.
    La référence et l'organisation sont injectées automatiquement.
    """

    class Meta:
        model = Shipment
        fields = [
            "direction",
            "origin_country",
            "origin_port_or_city",
            "destination_country",
            "destination_port_or_city",
            "goods_description",
            "hs_code",
            "quantity",
            "unit",
            "gross_weight_kg",
            "volume_m3",
            "declared_value",
            "currency",
            "transport_mode",
            "incoterm",
            "freight_forwarder",
            "customs_broker",
            "supplier",
            "status",
            "estimated_departure",
            "estimated_arrival",
            "notes",
            "tags",
            "assigned_to",
        ]

    def validate(self, attrs):
        # Vérifie que les partenaires appartiennent à la même organisation
        organisation = self.context["request"].user.organisation
        for field in ["freight_forwarder", "customs_broker", "supplier"]:
            partner = attrs.get(field)
            if partner and partner.organisation != organisation:
                raise serializers.ValidationError(
                    {field: "Ce partenaire n'appartient pas à votre organisation."}
                )
        # ETA doit être après ETD
        etd = attrs.get("estimated_departure")
        eta = attrs.get("estimated_arrival")
        if etd and eta and eta < etd:
            raise serializers.ValidationError(
                {"estimated_arrival": "L'ETA doit être postérieure à l'ETD."}
            )
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["organisation"] = request.user.organisation
        validated_data["created_by"] = request.user
        return super().create(validated_data)


# ──────────────────────────────────────────────────────────────
# SHIPMENT — MISE À JOUR
# ──────────────────────────────────────────────────────────────


class ShipmentUpdateSerializer(serializers.ModelSerializer):
    """
    Mise à jour d'un dossier existant.
    La référence, l'organisation et le créateur ne sont pas modifiables.
    """

    class Meta:
        model = Shipment
        fields = [
            "direction",
            "origin_country",
            "origin_port_or_city",
            "destination_country",
            "destination_port_or_city",
            "goods_description",
            "hs_code",
            "quantity",
            "unit",
            "gross_weight_kg",
            "volume_m3",
            "declared_value",
            "currency",
            "transport_mode",
            "incoterm",
            "freight_forwarder",
            "customs_broker",
            "supplier",
            "status",
            "estimated_departure",
            "actual_departure",
            "estimated_arrival",
            "actual_arrival",
            "customs_start",
            "customs_end",
            "notes",
            "tags",
            "assigned_to",
        ]

    def validate(self, attrs):
        etd = attrs.get(
            "estimated_departure", getattr(self.instance, "estimated_departure", None)
        )
        eta = attrs.get(
            "estimated_arrival", getattr(self.instance, "estimated_arrival", None)
        )
        if etd and eta and eta < etd:
            raise serializers.ValidationError(
                {"estimated_arrival": "L'ETA doit être postérieure à l'ETD."}
            )
        return attrs


# ──────────────────────────────────────────────────────────────
# ARCHIVAGE
# ──────────────────────────────────────────────────────────────


class ShipmentArchiveSerializer(serializers.Serializer):
    """Action d'archivage / désarchivage d'une expédition."""

    archive = serializers.BooleanField(
        help_text="True pour archiver, False pour désarchiver."
    )

    def save(self, instance, user):
        from django.utils import timezone

        if self.validated_data["archive"]:
            instance.is_archived = True
            instance.archived_at = timezone.now()
            instance.archived_by = user
        else:
            instance.is_archived = False
            instance.archived_at = None
            instance.archived_by = None
        instance.save(update_fields=["is_archived", "archived_at", "archived_by"])
        return instance


# ──────────────────────────────────────────────────────────────
# CHANGEMENT DE STATUT
# ──────────────────────────────────────────────────────────────


class ShipmentStatusChangeSerializer(serializers.Serializer):
    """
    Changement de statut d'une expédition avec note optionnelle.
    Crée automatiquement une entrée dans ShipmentStatusHistory.
    """

    status = serializers.ChoiceField(choices=Shipment.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )

    def save(self, instance, user):
        old_status = instance.status
        new_status = self.validated_data["status"]

        if old_status == new_status:
            raise serializers.ValidationError(
                {"status": "Le statut est déjà à cette valeur."}
            )

        instance.status = new_status
        instance.save(update_fields=["status", "updated_at"])

        ShipmentStatusHistory.objects.create(
            shipment=instance,
            status=new_status,
            note=self.validated_data.get("note", ""),
            location=self.validated_data.get("location", ""),
            latitude=self.validated_data.get("latitude"),
            longitude=self.validated_data.get("longitude"),
            changed_by=user,
        )
        return instance
