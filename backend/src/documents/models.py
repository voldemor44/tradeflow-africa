"""
TradeFlow Africa — documents/models.py
Gestion des documents liés aux expéditions (BL, factures, certificats, DUA…).
Stockage sur S3/R2 via django-storages.
"""

import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User
from shipments.models import Shipment


class DocumentType(models.Model):
    """
    Référentiel des types de documents — géré par l'admin TradeFlow.
    Ex : Bill of Lading, Facture commerciale, Certificat d'origine, DUA…
    """

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)  # "BL", "INVOICE", "CERT_ORIG"
    description = models.TextField(blank=True)

    # Obligatoire selon le sens de l'opération
    is_mandatory_import = models.BooleanField(
        default=False, verbose_name="Obligatoire à l'import"
    )
    is_mandatory_export = models.BooleanField(
        default=False, verbose_name="Obligatoire à l'export"
    )
    has_expiry = models.BooleanField(default=False, verbose_name="Peut expirer")

    # Icône affichée dans l'UI (nom Feather/Lucide)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = "Type de document"
        verbose_name_plural = "Types de documents"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


def document_upload_path(instance, filename):
    """
    Organise les fichiers uploadés par organisation et expédition.
    Résultat : documents/mon-entreprise/TFA-2025-00042/facture.pdf
    """
    return f"documents/{instance.shipment.organisation.slug}/{instance.shipment.reference}/{filename}"


class Document(models.Model):
    """
    Document associé à une expédition.
    Un document peut être uploadé, validé, rejeté ou expiré.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey(
        Shipment, on_delete=models.CASCADE, related_name="documents"
    )
    document_type = models.ForeignKey(
        DocumentType, on_delete=models.SET_NULL, null=True, related_name="documents"
    )

    # ── Fichier ──────────────────────────────────────────────
    file = models.FileField(upload_to=document_upload_path)
    original_filename = models.CharField(max_length=255)
    file_size_bytes = models.PositiveIntegerField(null=True, blank=True)

    class FileFormat(models.TextChoices):
        PDF = "pdf", "PDF"
        XLSX = "xlsx", "Excel"
        DOCX = "docx", "Word"
        JPG = "jpg", "Image JPG"
        PNG = "png", "Image PNG"
        OTHER = "other", "Autre"

    file_format = models.CharField(
        max_length=10, choices=FileFormat.choices, default=FileFormat.PDF
    )

    # ── Métadonnées ──────────────────────────────────────────
    title = models.CharField(max_length=255, verbose_name="Titre du document")
    reference_number = models.CharField(
        max_length=100, blank=True, verbose_name="Numéro de référence"
    )
    issue_date = models.DateField(null=True, blank=True, verbose_name="Date d'émission")
    expiry_date = models.DateField(
        null=True, blank=True, verbose_name="Date d'expiration"
    )
    issuing_authority = models.CharField(
        max_length=255, blank=True, verbose_name="Organisme émetteur"
    )
    notes = models.TextField(blank=True)

    # ── Validation ───────────────────────────────────────────
    class ValidationStatus(models.TextChoices):
        PENDING = "pending", "En attente de validation"
        APPROVED = "approved", "Approuvé"
        REJECTED = "rejected", "Rejeté"
        EXPIRED = "expired", "Expiré"

    validation_status = models.CharField(
        max_length=15,
        choices=ValidationStatus.choices,
        default=ValidationStatus.PENDING,
    )
    validated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="validated_documents",
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # ── Audit ────────────────────────────────────────────────
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="uploaded_documents"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ["-uploaded_at"]
        indexes = [
            models.Index(fields=["shipment", "document_type"]),
            models.Index(fields=["expiry_date"]),
            models.Index(fields=["validation_status"]),
        ]

    def __str__(self):
        return f"{self.title} — {self.shipment.reference}"

    @property
    def is_expired(self):
        """Retourne True si la date d'expiration est passée."""
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False

    @property
    def days_until_expiry(self):
        """Retourne le nombre de jours avant expiration (négatif si expiré)."""
        if self.expiry_date:
            return (self.expiry_date - timezone.now().date()).days
        return None
