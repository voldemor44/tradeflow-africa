"""
TradeFlow Africa — notifications/serializers.py
"""

from rest_framework import serializers
from .models import Notification, NotificationPreference


# ──────────────────────────────────────────────────────────────
# NOTIFICATION
# ──────────────────────────────────────────────────────────────


class NotificationSerializer(serializers.ModelSerializer):
    """
    Lecture d'une notification.
    En écriture, seul is_read peut être modifié par l'utilisateur.
    """

    type_display = serializers.CharField(source="get_type_display", read_only=True)
    shipment_ref = serializers.CharField(
        source="shipment.reference", read_only=True, default=None
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "type_display",
            "shipment",
            "shipment_ref",
            "title",
            "message",
            "is_read",
            "read_at",
            "sent_via_email",
            "sent_via_whatsapp",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "type",
            "shipment",
            "title",
            "message",
            "read_at",
            "sent_via_email",
            "sent_via_whatsapp",
            "created_at",
        ]

    def update(self, instance, validated_data):
        """Seul is_read est modifiable — marque aussi read_at."""
        if validated_data.get("is_read") and not instance.is_read:
            instance.mark_as_read()
            return instance
        return super().update(instance, validated_data)


class NotificationListSerializer(serializers.ModelSerializer):
    """Version légère pour le centre de notifications (header navbar)."""

    type_display = serializers.CharField(source="get_type_display", read_only=True)
    shipment_ref = serializers.CharField(
        source="shipment.reference", read_only=True, default=None
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "type_display",
            "shipment_ref",
            "title",
            "is_read",
            "created_at",
        ]


class MarkAllReadSerializer(serializers.Serializer):
    """
    Action bulk — marque toutes les notifications non lues de l'utilisateur comme lues.
    Payload vide, l'action est déclenchée par POST sur /notifications/mark-all-read/.
    """

    def save(self, user):
        from django.utils import timezone

        updated = Notification.objects.filter(user=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now(),
        )
        return {"marked_read": updated}


# ──────────────────────────────────────────────────────────────
# NOTIFICATION PREFERENCES
# ──────────────────────────────────────────────────────────────


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Préférences de notification d'un utilisateur.
    Lecture et mise à jour complète.
    """

    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            # Email
            "email_status_change",
            "email_document_expiry",
            "email_vessel_arrived",
            "email_payment_due",
            "email_customs_alert",
            # WhatsApp
            "whatsapp_status_change",
            "whatsapp_vessel_arrived",
            "whatsapp_payment_overdue",
            # Seuils
            "document_expiry_alert_days",
            "payment_due_alert_days",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]

    def validate_document_expiry_alert_days(self, value):
        if value < 1 or value > 90:
            raise serializers.ValidationError(
                "La valeur doit être entre 1 et 90 jours."
            )
        return value

    def validate_payment_due_alert_days(self, value):
        if value < 1 or value > 30:
            raise serializers.ValidationError(
                "La valeur doit être entre 1 et 30 jours."
            )
        return value
