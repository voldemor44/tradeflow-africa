"""
TradeFlow Africa — finance/models.py
Coûts, landed cost et paiements liés aux expéditions.
Marqué V2 dans l'UI — structure posée dès le MVP pour éviter
une migration lourde lors de l'activation de la fonctionnalité.
"""

import uuid
from django.db import models
from accounts.models import User
from shipments.models import Shipment
from partners.models import Partner


class ShipmentCost(models.Model):
    """
    Poste de coût associé à une expédition.
    Permet de calculer le landed cost total et comparer estimé vs réel.
    """

    shipment = models.ForeignKey(
        Shipment, on_delete=models.CASCADE, related_name="costs"
    )

    class CostType(models.TextChoices):
        GOODS_VALUE = "goods_value", "Valeur marchandises"
        FREIGHT = "freight", "Fret"
        INSURANCE = "insurance", "Assurance"
        CUSTOMS_DUTIES = "customs_duties", "Droits de douane"
        VAT = "vat", "TVA à l'import"
        PORT_FEES = "port_fees", "Frais portuaires"
        HANDLING = "handling", "Manutention"
        SCANNING = "scanning", "Frais de scanning"
        STORAGE = "storage", "Frais de magasinage"
        TRANSPORT_LOCAL = "transport_local", "Transport local / livraison"
        BROKER_FEES = "broker_fees", "Honoraires transitaire / courtier"
        OTHER = "other", "Autre"

    cost_type = models.CharField(max_length=25, choices=CostType.choices)
    label = models.CharField(max_length=100, blank=True)  # précision libre
    estimated_amount = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    actual_amount = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    currency = models.CharField(max_length=5, default="XOF")  # Franc CFA BCEAO
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = "Coût d'expédition"
        verbose_name_plural = "Coûts d'expédition"
        ordering = ["cost_type"]

    def __str__(self):
        return f"{self.get_cost_type_display()} — {self.shipment.reference}"

    @property
    def variance(self):
        """Écart entre estimé et réel (positif = dépassement)."""
        if self.estimated_amount and self.actual_amount:
            return self.actual_amount - self.estimated_amount
        return None


class Payment(models.Model):
    """
    Paiement lié à une expédition, effectué vers un partenaire
    (fournisseur, transitaire, administration douanière…).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey(
        Shipment, on_delete=models.CASCADE, related_name="payments"
    )
    partner = models.ForeignKey(
        Partner, on_delete=models.SET_NULL, null=True, blank=True
    )

    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=5, default="XOF")

    class PaymentMethod(models.TextChoices):
        BANK_TRANSFER = "bank_transfer", "Virement bancaire"
        LETTER_OF_CREDIT = "lc", "Lettre de crédit (L/C)"
        WESTERN_UNION = "western_union", "Western Union"
        MOBILE_MONEY = "mobile_money", "Mobile Money"
        CASH = "cash", "Espèces"
        OTHER = "other", "Autre"

    method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    reference = models.CharField(
        max_length=100, blank=True, verbose_name="Référence virement / reçu"
    )

    due_date = models.DateField(null=True, blank=True, verbose_name="Date d'échéance")
    paid_at = models.DateField(
        null=True, blank=True, verbose_name="Date de paiement effectif"
    )

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "En attente"
        PAID = "paid", "Payé"
        OVERDUE = "overdue", "En retard"
        CANCELLED = "cancelled", "Annulé"

    status = models.CharField(
        max_length=15, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ["due_date"]
        indexes = [
            models.Index(fields=["shipment", "status"]),
            models.Index(fields=["due_date"]),
        ]

    def __str__(self):
        return f"{self.amount} {self.currency} — {self.shipment.reference}"

    @property
    def is_overdue(self):
        """Retourne True si la date d'échéance est dépassée et le paiement non effectué."""
        from django.utils import timezone

        if self.due_date and self.status == self.PaymentStatus.PENDING:
            return self.due_date < timezone.now().date()
        return False


class CustomsDutySimulation(models.Model):
    """
    Simulation de droits de douane — fonctionnalité Simulateur (V2).
    Permet d'estimer les taxes avant de créer un dossier d'expédition.
    """

    organisation = models.ForeignKey("accounts.Organisation", on_delete=models.CASCADE)
    hs_code = models.CharField(max_length=20, verbose_name="Code HS")
    goods_value = models.DecimalField(
        max_digits=15, decimal_places=2, verbose_name="Valeur CIF (FCFA)"
    )
    transport_mode = models.CharField(max_length=10)
    origin_country = models.CharField(max_length=100)

    # Résultats calculés
    customs_duty = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    vat = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    other_taxes = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    total_taxes = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )

    # Taux appliqués (archivés pour référence)
    duty_rate = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    vat_rate = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    # Peut être converti en vrai dossier d'expédition
    converted_to_shipment = models.ForeignKey(
        Shipment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="duty_simulations",
    )

    class Meta:
        verbose_name = "Simulation douanière"
        verbose_name_plural = "Simulations douanières"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Simulation {self.hs_code} — {self.goods_value} XOF ({self.created_at:%d/%m/%Y})"
