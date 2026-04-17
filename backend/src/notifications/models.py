"""
TradeFlow Africa — notifications/models.py
Notifications système générées automatiquement par les signaux Django
et les tâches Celery périodiques (documents expirants, navires arrivés…).
"""

import uuid
from django.db import models
from accounts.models import User
from shipments.models import Shipment


class Notification(models.Model):
    """
    Notification envoyée à un utilisateur.
    Générée automatiquement — jamais créée manuellement par l'UI.

    Sources de création :
    - signal post_save Shipment          → STATUS_CHANGE
    - tâche Celery quotidienne documents → DOCUMENT_EXPIRY / DOCUMENT_EXPIRED
    - tâche Celery tracking navires      → VESSEL_ARRIVED
    - tâche Celery paiements             → PAYMENT_DUE / PAYMENT_OVERDUE
    - signal post_save Document          → CUSTOMS_ALERT
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    class NotificationType(models.TextChoices):
        STATUS_CHANGE = "status_change", "Changement de statut"
        DOCUMENT_EXPIRY = "document_expiry", "Document bientôt expiré"
        DOCUMENT_EXPIRED = "document_expired", "Document expiré"
        VESSEL_ARRIVED = "vessel_arrived", "Navire arrivé au port"
        PAYMENT_DUE = "payment_due", "Échéance de paiement proche"
        PAYMENT_OVERDUE = "payment_overdue", "Paiement en retard"
        CUSTOMS_ALERT = "customs_alert", "Alerte douanière"
        SYSTEM = "system", "Système"

    type = models.CharField(max_length=25, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()

    # ── Lecture ──────────────────────────────────────────────
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # ── Canaux d'envoi ───────────────────────────────────────
    sent_via_email = models.BooleanField(default=False)
    sent_via_whatsapp = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["user", "type"]),
        ]

    def __str__(self):
        return f"{self.get_type_display()} → {self.user} ({self.created_at:%d/%m/%Y})"

    def mark_as_read(self):
        """Marque la notification comme lue."""
        from django.utils import timezone

        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=["is_read", "read_at"])


class NotificationPreference(models.Model):
    """
    Préférences de notification par utilisateur.
    Permet à chaque utilisateur de choisir quels événements
    le notifient et via quels canaux.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="notification_preferences"
    )

    # Email
    email_status_change = models.BooleanField(default=True)
    email_document_expiry = models.BooleanField(default=True)
    email_vessel_arrived = models.BooleanField(default=True)
    email_payment_due = models.BooleanField(default=True)
    email_customs_alert = models.BooleanField(default=True)

    # WhatsApp
    whatsapp_status_change = models.BooleanField(default=False)
    whatsapp_vessel_arrived = models.BooleanField(default=False)
    whatsapp_payment_overdue = models.BooleanField(default=False)

    # Seuil d'alerte document (en jours avant expiration)
    document_expiry_alert_days = models.PositiveIntegerField(
        default=7, verbose_name="Alerter X jours avant expiration document"
    )

    # Seuil d'alerte paiement (en jours avant échéance)
    payment_due_alert_days = models.PositiveIntegerField(
        default=3, verbose_name="Alerter X jours avant échéance paiement"
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Préférence de notification"
        verbose_name_plural = "Préférences de notifications"

    def __str__(self):
        return f"Préférences notifications — {self.user}"
