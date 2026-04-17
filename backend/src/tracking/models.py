"""
TradeFlow Africa — tracking/models.py
Suivi en temps réel des navires et véhicules terrestres.
Données alimentées via API MarineTraffic / tâches Celery périodiques.
"""

from django.db import models
from shipments.models import Shipment


class VesselTracking(models.Model):
    """
    Données de tracking du navire associé à une expédition maritime.
    Relation OneToOne avec Shipment — un dossier = un navire suivi.
    """

    shipment = models.OneToOneField(
        Shipment, on_delete=models.CASCADE, related_name="vessel_tracking"
    )

    # ── Identité du navire ───────────────────────────────────
    vessel_name = models.CharField(max_length=100, verbose_name="Nom du navire")
    imo_number = models.CharField(max_length=20, blank=True, verbose_name="Numéro IMO")
    mmsi = models.CharField(max_length=20, blank=True, verbose_name="MMSI")
    vessel_flag = models.CharField(max_length=5, blank=True)  # "CN", "PA", "LR"…

    # ── Références du voyage ─────────────────────────────────
    bill_of_lading = models.CharField(
        max_length=50, blank=True, verbose_name="Connaissement (B/L)"
    )
    container_number = models.CharField(
        max_length=20, blank=True, verbose_name="Numéro de conteneur"
    )
    voyage_number = models.CharField(
        max_length=20, blank=True, verbose_name="Numéro de voyage"
    )

    # ── Position actuelle (mise à jour par tâche Celery) ─────
    current_latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    current_longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    current_speed_knots = models.DecimalField(
        max_digits=5, decimal_places=1, null=True, blank=True
    )
    current_heading = models.IntegerField(null=True, blank=True)  # 0–360 degrés
    current_status = models.CharField(
        max_length=50, blank=True
    )  # "Underway", "At anchor"…
    last_position_at = models.DateTimeField(null=True, blank=True)

    # ── ETA officielle navire (fournie par MarineTraffic) ────
    vessel_eta = models.DateTimeField(
        null=True, blank=True, verbose_name="ETA navire (officielle)"
    )

    # ── Ports (codes UN/LOCODE) ──────────────────────────────
    departure_port_code = models.CharField(
        max_length=10, blank=True
    )  # "CNSHA" = Shanghai
    arrival_port_code = models.CharField(max_length=10, blank=True)  # "BJCOO" = Cotonou

    last_synced_at = models.DateTimeField(
        null=True, blank=True, verbose_name="Dernière sync API"
    )
    tracking_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Tracking navire"

    def __str__(self):
        return f"{self.vessel_name} ({self.shipment.reference})"


class VesselPositionLog(models.Model):
    """
    Historique des positions du navire — permet de dessiner la trajectoire sur la carte.
    Alimenté à chaque sync Celery (toutes les 4h par exemple).
    """

    vessel = models.ForeignKey(
        VesselTracking, on_delete=models.CASCADE, related_name="position_logs"
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    speed_knots = models.DecimalField(
        max_digits=5, decimal_places=1, null=True, blank=True
    )
    recorded_at = models.DateTimeField()

    class Meta:
        verbose_name = "Log de position navire"
        ordering = ["-recorded_at"]
        indexes = [models.Index(fields=["vessel", "recorded_at"])]

    def __str__(self):
        return f"{self.vessel.vessel_name} — {self.recorded_at:%d/%m/%Y %H:%M}"


class RoadTracking(models.Model):
    """
    Tracking des expéditions terrestres (camions, convois).
    Alimenté manuellement ou via GPS tracker.
    """

    shipment = models.OneToOneField(
        Shipment, on_delete=models.CASCADE, related_name="road_tracking"
    )
    vehicle_plate = models.CharField(
        max_length=20, blank=True, verbose_name="Immatriculation"
    )
    driver_name = models.CharField(
        max_length=100, blank=True, verbose_name="Nom du chauffeur"
    )
    driver_phone = models.CharField(max_length=20, blank=True)

    current_latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    current_longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    last_position_at = models.DateTimeField(null=True, blank=True)

    # Checkpoints frontaliers (ex : Cotonou → Niamey passe par Malanville)
    checkpoints_passed = models.JSONField(default=list, blank=True)
    # [{"name": "Malanville", "passed_at": "2025-01-10T14:30:00Z"}, …]

    tracking_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Tracking routier"

    def __str__(self):
        return f"{self.vehicle_plate} ({self.shipment.reference})"
