"""
TradeFlow Africa — shipments/models.py
Cœur du système : dossiers d'expédition et leur cycle de vie complet.
"""

import uuid
from django.db import models
from accounts.models import Organisation, User
from partners.models import Partner


class Shipment(models.Model):
    """
    Dossier d'expédition — l'entité centrale de TradeFlow Africa.
    Représente un mouvement de marchandises de A à B, avec tous
    les acteurs, documents et événements associés.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organisation = models.ForeignKey(
        Organisation, on_delete=models.CASCADE, related_name="shipments"
    )
    # Référence lisible — ex: TFA-2025-00042 — générée via signal post_save
    reference = models.CharField(
        max_length=50, unique=True, verbose_name="Référence dossier"
    )

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_shipments"
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_shipments",
    )

    # ── Sens de l'opération ──────────────────────────────────
    class Direction(models.TextChoices):
        IMPORT = "import", "Importation"
        EXPORT = "export", "Exportation"
        TRANSIT = "transit", "Transit"

    direction = models.CharField(max_length=10, choices=Direction.choices)

    # ── Géographie ───────────────────────────────────────────
    origin_country = models.CharField(max_length=100, verbose_name="Pays d'origine")
    origin_port_or_city = models.CharField(
        max_length=100, verbose_name="Port / Ville d'origine"
    )
    destination_country = models.CharField(
        max_length=100, verbose_name="Pays de destination"
    )
    destination_port_or_city = models.CharField(
        max_length=100, verbose_name="Port / Ville de destination"
    )

    # ── Marchandises ─────────────────────────────────────────
    goods_description = models.TextField(verbose_name="Description des marchandises")
    hs_code = models.CharField(max_length=20, blank=True, verbose_name="Code HS")
    quantity = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    unit = models.CharField(max_length=30, blank=True)  # kg, tonnes, cartons, unités…
    gross_weight_kg = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    volume_m3 = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    declared_value = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    currency = models.CharField(max_length=5, default="USD")

    # ── Transport ────────────────────────────────────────────
    class TransportMode(models.TextChoices):
        SEA = "sea", "Maritime"
        AIR = "air", "Aérien"
        ROAD = "road", "Routier"
        MULTI = "multi", "Multimodal"

    transport_mode = models.CharField(max_length=10, choices=TransportMode.choices)

    # ── Incoterms ────────────────────────────────────────────
    class Incoterm(models.TextChoices):
        EXW = "EXW", "EXW – Ex Works"
        FCA = "FCA", "FCA – Free Carrier"
        FAS = "FAS", "FAS – Free Alongside Ship"
        FOB = "FOB", "FOB – Free On Board"
        CFR = "CFR", "CFR – Cost and Freight"
        CIF = "CIF", "CIF – Cost Insurance Freight"
        CPT = "CPT", "CPT – Carriage Paid To"
        CIP = "CIP", "CIP – Carriage and Insurance Paid"
        DAP = "DAP", "DAP – Delivered At Place"
        DPU = "DPU", "DPU – Delivered at Place Unloaded"
        DDP = "DDP", "DDP – Delivered Duty Paid"

    incoterm = models.CharField(max_length=5, choices=Incoterm.choices, blank=True)

    # ── Partenaires impliqués ────────────────────────────────
    freight_forwarder = models.ForeignKey(
        Partner,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="forwarded_shipments",
        verbose_name="Transitaire",
    )
    customs_broker = models.ForeignKey(
        Partner,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="brokered_shipments",
        verbose_name="Commissionnaire en douane",
    )
    supplier = models.ForeignKey(
        Partner,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="supplied_shipments",
        verbose_name="Fournisseur",
    )

    # ── Statut du dossier ────────────────────────────────────
    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        BOOKING = "booking", "Réservation en cours"
        GOODS_READY = "goods_ready", "Marchandises prêtes"
        IN_TRANSIT = "in_transit", "En transit"
        AT_ORIGIN_PORT = "at_origin_port", "Au port d'origine"
        ON_VESSEL = "on_vessel", "En mer"
        AT_DEST_PORT = "at_dest_port", "Au port de destination"
        CUSTOMS = "customs", "En dédouanement"
        CLEARED = "cleared", "Dédouané"
        OUT_FOR_DELIVERY = "out_for_delivery", "En livraison finale"
        DELIVERED = "delivered", "Livré"
        ON_HOLD = "on_hold", "Bloqué"
        CANCELLED = "cancelled", "Annulé"

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )

    # ── Dates clés ───────────────────────────────────────────
    estimated_departure = models.DateField(
        null=True, blank=True, verbose_name="Départ estimé (ETD)"
    )
    actual_departure = models.DateField(
        null=True, blank=True, verbose_name="Départ réel"
    )
    estimated_arrival = models.DateField(
        null=True, blank=True, verbose_name="Arrivée estimée (ETA)"
    )
    actual_arrival = models.DateField(
        null=True, blank=True, verbose_name="Arrivée réelle"
    )
    customs_start = models.DateField(
        null=True, blank=True, verbose_name="Début dédouanement"
    )
    customs_end = models.DateField(
        null=True, blank=True, verbose_name="Fin dédouanement"
    )

    # ── Archivage (Option A — champ booléen, statut métier préservé) ──
    is_archived = models.BooleanField(default=False, verbose_name="Archivée")
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="archived_shipments",
    )

    # ── Divers ───────────────────────────────────────────────
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)  # ["urgent", "fragile", …]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Expédition"
        verbose_name_plural = "Expéditions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organisation", "status"]),
            models.Index(fields=["organisation", "is_archived"]),
            models.Index(fields=["organisation", "direction"]),
            models.Index(fields=["reference"]),
        ]

    def __str__(self):
        return f"{self.reference} — {self.origin_country} → {self.destination_country}"

    @property
    def is_active(self):
        """Retourne True si le dossier est en cours (non livré, non annulé, non archivé)."""
        inactive_statuses = {self.Status.DELIVERED, self.Status.CANCELLED}
        return not self.is_archived and self.status not in inactive_statuses


class ShipmentStatusHistory(models.Model):
    """
    Historique de tous les changements de statut d'une expédition.
    Alimenté automatiquement via signal post_save sur Shipment.
    Sert à construire la timeline visible dans l'UI.
    """

    shipment = models.ForeignKey(
        Shipment, on_delete=models.CASCADE, related_name="status_history"
    )
    status = models.CharField(max_length=20, choices=Shipment.Status.choices)
    note = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)  # "Port de Cotonou"
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Historique de statut"
        ordering = ["-changed_at"]

    def __str__(self):
        return f"{self.shipment.reference} → {self.status} ({self.changed_at:%d/%m/%Y})"
