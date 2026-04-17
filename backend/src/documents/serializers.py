"""
TradeFlow Africa — documents/serializers.py
"""

from rest_framework import serializers
from accounts.serializers import UserSummarySerializer
from .models import Document, DocumentType


# ──────────────────────────────────────────────────────────────
# DOCUMENT TYPE
# ──────────────────────────────────────────────────────────────


class DocumentTypeSerializer(serializers.ModelSerializer):
    """Référentiel des types de documents — lecture seule pour les clients."""

    class Meta:
        model = DocumentType
        fields = [
            "id",
            "name",
            "code",
            "description",
            "is_mandatory_import",
            "is_mandatory_export",
            "has_expiry",
            "icon",
        ]
        read_only_fields = fields


# ──────────────────────────────────────────────────────────────
# DOCUMENT — LISTE
# ──────────────────────────────────────────────────────────────


class DocumentListSerializer(serializers.ModelSerializer):
    """Serializer léger pour la liste des documents d'une expédition."""

    document_type_name = serializers.CharField(
        source="document_type.name", read_only=True, default=None
    )
    document_type_code = serializers.CharField(
        source="document_type.code", read_only=True, default=None
    )
    validation_display = serializers.CharField(
        source="get_validation_status_display", read_only=True
    )
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = Document
        fields = [
            "id",
            "shipment",
            "document_type",
            "document_type_name",
            "document_type_code",
            "title",
            "original_filename",
            "file_format",
            "file_size_bytes",
            "reference_number",
            "issue_date",
            "expiry_date",
            "validation_status",
            "validation_display",
            "is_expired",
            "days_until_expiry",
            "uploaded_by_name",
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_at"]


# ──────────────────────────────────────────────────────────────
# DOCUMENT — DÉTAIL
# ──────────────────────────────────────────────────────────────


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Serializer complet avec informations de validation et auditeurs."""

    document_type = DocumentTypeSerializer(read_only=True)
    validation_display = serializers.CharField(
        source="get_validation_status_display", read_only=True
    )
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    uploaded_by = UserSummarySerializer(read_only=True)
    validated_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "shipment",
            "document_type",
            "file",
            "original_filename",
            "file_format",
            "file_size_bytes",
            "title",
            "reference_number",
            "issue_date",
            "expiry_date",
            "issuing_authority",
            "notes",
            "validation_status",
            "validation_display",
            "validated_by",
            "validated_at",
            "rejection_reason",
            "is_expired",
            "days_until_expiry",
            "uploaded_by",
            "uploaded_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "file",
            "original_filename",
            "file_size_bytes",
            "uploaded_by",
            "uploaded_at",
            "updated_at",
            "validated_by",
            "validated_at",
        ]


# ──────────────────────────────────────────────────────────────
# DOCUMENT — UPLOAD
# ──────────────────────────────────────────────────────────────


class DocumentUploadSerializer(serializers.ModelSerializer):
    """
    Upload d'un nouveau document.
    Le fichier est obligatoire. L'organisation est vérifiée via l'expédition.
    """

    class Meta:
        model = Document
        fields = [
            "shipment",
            "document_type",
            "file",
            "title",
            "reference_number",
            "issue_date",
            "expiry_date",
            "issuing_authority",
            "notes",
        ]

    def validate_shipment(self, value):
        """Vérifie que l'expédition appartient à l'organisation de l'utilisateur."""
        user = self.context["request"].user
        if value.organisation != user.organisation:
            raise serializers.ValidationError(
                "Cette expédition n'appartient pas à votre organisation."
            )
        return value

    def validate(self, attrs):
        file = attrs.get("file")
        doc_type = attrs.get("document_type")

        # Détermine le format depuis l'extension
        if file:
            ext = file.name.rsplit(".", 1)[-1].lower()
            format_map = {
                "pdf": "pdf",
                "xlsx": "xlsx",
                "xls": "xlsx",
                "docx": "docx",
                "jpg": "jpg",
                "jpeg": "jpg",
                "png": "png",
            }
            attrs["file_format"] = format_map.get(ext, "other")
            attrs["original_filename"] = file.name
            attrs["file_size_bytes"] = file.size

        # Vérifie que si le type de document a une expiration, la date est fournie
        if doc_type and doc_type.has_expiry and not attrs.get("expiry_date"):
            raise serializers.ValidationError(
                {"expiry_date": "Ce type de document nécessite une date d'expiration."}
            )

        return attrs

    def create(self, validated_data):
        validated_data["uploaded_by"] = self.context["request"].user
        return super().create(validated_data)


# ──────────────────────────────────────────────────────────────
# DOCUMENT — VALIDATION
# ──────────────────────────────────────────────────────────────


class DocumentValidateSerializer(serializers.Serializer):
    """Action de validation ou de rejet d'un document."""

    action = serializers.ChoiceField(choices=["approve", "reject"])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if (
            attrs["action"] == "reject"
            and not attrs.get("rejection_reason", "").strip()
        ):
            raise serializers.ValidationError(
                {"rejection_reason": "Un motif de rejet est obligatoire."}
            )
        return attrs

    def save(self, instance, user):
        from django.utils import timezone

        action = self.validated_data["action"]

        if action == "approve":
            instance.validation_status = Document.ValidationStatus.APPROVED
            instance.rejection_reason = ""
        else:
            instance.validation_status = Document.ValidationStatus.REJECTED
            instance.rejection_reason = self.validated_data["rejection_reason"]

        instance.validated_by = user
        instance.validated_at = timezone.now()
        instance.save(
            update_fields=[
                "validation_status",
                "rejection_reason",
                "validated_by",
                "validated_at",
                "updated_at",
            ]
        )
        return instance
