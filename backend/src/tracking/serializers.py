"""
TradeFlow Africa — tracking/serializers.py
"""

from rest_framework import serializers
from .models import VesselTracking, VesselPositionLog, RoadTracking


# ──────────────────────────────────────────────────────────────
# VESSEL POSITION LOG
# ──────────────────────────────────────────────────────────────


class VesselPositionLogSerializer(serializers.ModelSerializer):
    """Log de position — lecture seule (alimenté par Celery)."""

    class Meta:
        model = VesselPositionLog
        fields = ["id", "latitude", "longitude", "speed_knots", "recorded_at"]
        read_only_fields = fields


# ──────────────────────────────────────────────────────────────
# VESSEL TRACKING
# ──────────────────────────────────────────────────────────────


class VesselTrackingSerializer(serializers.ModelSerializer):
    """
    Données complètes du tracking navire.
    Inclut les dernières positions pour dessiner la trajectoire.
    """

    # Dernières positions (limitées à 50 pour la carte)
    recent_positions = serializers.SerializerMethodField()

    class Meta:
        model = VesselTracking
        fields = [
            "id",
            "shipment",
            "vessel_name",
            "imo_number",
            "mmsi",
            "vessel_flag",
            "bill_of_lading",
            "container_number",
            "voyage_number",
            "current_latitude",
            "current_longitude",
            "current_speed_knots",
            "current_heading",
            "current_status",
            "last_position_at",
            "vessel_eta",
            "departure_port_code",
            "arrival_port_code",
            "last_synced_at",
            "tracking_active",
            "recent_positions",
        ]
        read_only_fields = [
            "id",
            "current_latitude",
            "current_longitude",
            "current_speed_knots",
            "current_heading",
            "current_status",
            "last_position_at",
            "last_synced_at",
        ]

    def get_recent_positions(self, obj):
        qs = obj.position_logs.order_by("-recorded_at")[:50]
        return VesselPositionLogSerializer(qs, many=True).data


class VesselTrackingCreateSerializer(serializers.ModelSerializer):
    """
    Création / liaison d'un navire à une expédition.
    Seuls les champs saisis manuellement sont exposés.
    """

    class Meta:
        model = VesselTracking
        fields = [
            "shipment",
            "vessel_name",
            "imo_number",
            "mmsi",
            "vessel_flag",
            "bill_of_lading",
            "container_number",
            "voyage_number",
            "departure_port_code",
            "arrival_port_code",
            "tracking_active",
        ]

    def validate_shipment(self, value):
        if hasattr(value, "vessel_tracking"):
            raise serializers.ValidationError(
                "Cette expédition a déjà un tracking navire associé."
            )
        return value


class VesselPositionUpdateSerializer(serializers.Serializer):
    """
    Mise à jour de la position courante du navire.
    Utilisé par la tâche Celery de synchronisation MarineTraffic.
    """

    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    speed_knots = serializers.DecimalField(
        max_digits=5, decimal_places=1, required=False, allow_null=True
    )
    heading = serializers.IntegerField(
        required=False, allow_null=True, min_value=0, max_value=360
    )
    status = serializers.CharField(required=False, allow_blank=True)
    vessel_eta = serializers.DateTimeField(required=False, allow_null=True)

    def save(self, instance):
        from django.utils import timezone

        data = self.validated_data

        instance.current_latitude = data["latitude"]
        instance.current_longitude = data["longitude"]
        instance.current_speed_knots = data.get("speed_knots")
        instance.current_heading = data.get("heading")
        instance.current_status = data.get("status", "")
        instance.last_position_at = timezone.now()
        instance.last_synced_at = timezone.now()
        if "vessel_eta" in data:
            instance.vessel_eta = data["vessel_eta"]
        instance.save()

        # Log de position pour la trajectoire
        VesselPositionLog.objects.create(
            vessel=instance,
            latitude=data["latitude"],
            longitude=data["longitude"],
            speed_knots=data.get("speed_knots"),
            recorded_at=timezone.now(),
        )
        return instance


# ──────────────────────────────────────────────────────────────
# ROAD TRACKING
# ──────────────────────────────────────────────────────────────


class RoadTrackingSerializer(serializers.ModelSerializer):
    """Tracking routier — lecture et mise à jour manuelle."""

    class Meta:
        model = RoadTracking
        fields = [
            "id",
            "shipment",
            "vehicle_plate",
            "driver_name",
            "driver_phone",
            "current_latitude",
            "current_longitude",
            "last_position_at",
            "checkpoints_passed",
            "tracking_active",
        ]
        read_only_fields = ["id", "last_position_at"]

    def validate_shipment(self, value):
        if hasattr(value, "road_tracking"):
            raise serializers.ValidationError(
                "Cette expédition a déjà un tracking routier associé."
            )
        return value


class RoadPositionUpdateSerializer(serializers.Serializer):
    """Mise à jour manuelle ou GPS de la position d'un camion."""

    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    checkpoint_name = serializers.CharField(required=False, allow_blank=True)

    def save(self, instance):
        from django.utils import timezone

        data = self.validated_data

        instance.current_latitude = data["latitude"]
        instance.current_longitude = data["longitude"]
        instance.last_position_at = timezone.now()

        if data.get("checkpoint_name"):
            checkpoints = instance.checkpoints_passed or []
            checkpoints.append(
                {
                    "name": data["checkpoint_name"],
                    "passed_at": timezone.now().isoformat(),
                    "latitude": str(data["latitude"]),
                    "longitude": str(data["longitude"]),
                }
            )
            instance.checkpoints_passed = checkpoints

        instance.save()
        return instance
