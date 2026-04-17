"""
TradeFlow Africa — finance/serializers.py
"""

from rest_framework import serializers
from accounts.serializers import UserSummarySerializer
from partners.serializers import PartnerSummarySerializer
from .models import ShipmentCost, Payment, CustomsDutySimulation


# ──────────────────────────────────────────────────────────────
# SHIPMENT COST
# ──────────────────────────────────────────────────────────────


class ShipmentCostSerializer(serializers.ModelSerializer):
    """Poste de coût — lecture et écriture."""

    cost_type_display = serializers.CharField(
        source="get_cost_type_display", read_only=True
    )
    variance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = ShipmentCost
        fields = [
            "id",
            "shipment",
            "cost_type",
            "cost_type_display",
            "label",
            "estimated_amount",
            "actual_amount",
            "variance",
            "currency",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "variance"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

    def validate_shipment(self, value):
        user = self.context["request"].user
        if value.organisation != user.organisation:
            raise serializers.ValidationError(
                "Cette expédition n'appartient pas à votre organisation."
            )
        return value


class ShipmentCostSummarySerializer(serializers.ModelSerializer):
    """
    Résumé des coûts d'une expédition — utilisé dans ShipmentDetailSerializer.
    Expose le total estimé, le total réel et l'écart global.
    """

    cost_type_display = serializers.CharField(
        source="get_cost_type_display", read_only=True
    )
    variance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = ShipmentCost
        fields = [
            "id",
            "cost_type",
            "cost_type_display",
            "label",
            "estimated_amount",
            "actual_amount",
            "variance",
            "currency",
        ]


# ──────────────────────────────────────────────────────────────
# PAYMENT
# ──────────────────────────────────────────────────────────────


class PaymentSerializer(serializers.ModelSerializer):
    """Paiement — lecture et écriture."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    method_display = serializers.CharField(source="get_method_display", read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    partner = PartnerSummarySerializer(read_only=True)
    partner_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    created_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "shipment",
            "partner",
            "partner_id",
            "amount",
            "currency",
            "method",
            "method_display",
            "reference",
            "due_date",
            "paid_at",
            "status",
            "status_display",
            "is_overdue",
            "notes",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "created_by", "is_overdue"]

    def validate_shipment(self, value):
        user = self.context["request"].user
        if value.organisation != user.organisation:
            raise serializers.ValidationError(
                "Cette expédition n'appartient pas à votre organisation."
            )
        return value

    def validate(self, attrs):
        # Si payé, la date de paiement doit être renseignée
        if attrs.get("status") == Payment.PaymentStatus.PAID and not attrs.get(
            "paid_at"
        ):
            raise serializers.ValidationError(
                {"paid_at": "La date de paiement est requise pour le statut 'Payé'."}
            )
        return attrs

    def create(self, validated_data):
        partner_id = validated_data.pop("partner_id", None)
        if partner_id:
            validated_data["partner_id"] = partner_id
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class PaymentListSerializer(serializers.ModelSerializer):
    """Version légère pour les listes."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    method_display = serializers.CharField(source="get_method_display", read_only=True)
    partner_name = serializers.CharField(
        source="partner.name", read_only=True, default=None
    )
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "shipment",
            "partner_name",
            "amount",
            "currency",
            "method",
            "method_display",
            "due_date",
            "paid_at",
            "status",
            "status_display",
            "is_overdue",
        ]


# ──────────────────────────────────────────────────────────────
# CUSTOMS DUTY SIMULATION
# ──────────────────────────────────────────────────────────────


class CustomsDutySimulationSerializer(serializers.ModelSerializer):
    """
    Simulation douanière — V2.
    Les champs de résultat sont calculés côté serveur (signal ou view).
    """

    created_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = CustomsDutySimulation
        fields = [
            "id",
            "organisation",
            "hs_code",
            "goods_value",
            "transport_mode",
            "origin_country",
            "customs_duty",
            "vat",
            "other_taxes",
            "total_taxes",
            "duty_rate",
            "vat_rate",
            "created_by",
            "created_at",
            "converted_to_shipment",
        ]
        read_only_fields = [
            "id",
            "organisation",
            "created_at",
            "created_by",
            "customs_duty",
            "vat",
            "other_taxes",
            "total_taxes",
            "duty_rate",
            "vat_rate",
        ]

    def create(self, validated_data):
        validated_data["organisation"] = self.context["request"].user.organisation
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class CustomsDutySimulationInputSerializer(serializers.Serializer):
    """
    Entrées pour lancer une simulation douanière à la volée (sans sauvegarde).
    Utilisé par l'endpoint POST /finance/simulate/.
    """

    hs_code = serializers.CharField(max_length=20)
    goods_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    transport_mode = serializers.ChoiceField(choices=["sea", "air", "road", "multi"])
    origin_country = serializers.CharField(max_length=100)
