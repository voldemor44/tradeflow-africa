"""
TradeFlow Africa — partners/models.py
Annuaire des partenaires logistiques de chaque organisation.
"""

import uuid
from django.db import models
from accounts.models import Organisation


class Partner(models.Model):
    """
    Partenaire externe : transitaire, transporteur, commissionnaire en douane,
    fournisseur, client étranger, etc.
    Chaque organisation gère son propre annuaire de partenaires.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organisation = models.ForeignKey(
        Organisation, on_delete=models.CASCADE, related_name="partners"
    )

    class PartnerType(models.TextChoices):
        FREIGHT_FORWARDER = "freight_forwarder", "Transitaire"
        CUSTOMS_BROKER = "customs_broker", "Commissionnaire en douane"
        TRANSPORTER = "transporter", "Transporteur"
        SUPPLIER = "supplier", "Fournisseur"
        CUSTOMER = "customer", "Client"
        PORT_AGENT = "port_agent", "Agent portuaire"
        INSURER = "insurer", "Assureur"
        OTHER = "other", "Autre"

    type = models.CharField(max_length=30, choices=PartnerType.choices)
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    contact_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)

    # Évaluation — calculée depuis les expéditions associées (signal ou tâche Celery)
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    total_shipments = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Partenaire"
        verbose_name_plural = "Partenaires"
        ordering = ["name"]
        unique_together = [["organisation", "name"]]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
