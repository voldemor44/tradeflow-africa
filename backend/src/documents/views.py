"""
TradeFlow Africa — documents/views.py

Endpoints :
  GET  /document-types/                         Référentiel des types (lecture seule)
  GET  /documents/                              Tous les documents de l'organisation
  POST /documents/                              Uploader un document
  GET  /documents/{id}/                         Détail
  PATCH /documents/{id}/                        Modifier métadonnées
  DELETE /documents/{id}/                       Supprimer
  POST /documents/{id}/validate/                Approuver ou rejeter
  GET  /shipments/{id}/documents/               Documents d'une expédition
"""

from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsOrganisationAdmin, IsSameOrganisation, IsOwnerOrAdmin
from shipments.models import Shipment
from .models import Document, DocumentType
from .serializers import (
    DocumentTypeSerializer,
    DocumentListSerializer,
    DocumentDetailSerializer,
    DocumentUploadSerializer,
    DocumentValidateSerializer,
)


class DocumentTypeListView(generics.ListAPIView):
    """
    GET /document-types/
    Référentiel complet des types de documents — lecture seule pour tous les utilisateurs.
    """

    serializer_class = DocumentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = DocumentType.objects.all().order_by("name")
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "code"]


class DocumentListCreateView(generics.ListCreateAPIView):
    """
    GET  /documents/  → tous les documents de l'organisation
    POST /documents/  → uploader un document (multipart/form-data)

    Filtres :
      ?shipment={uuid}
      ?document_type={id}
      ?validation_status=pending
      ?file_format=pdf
      ?search=facture
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["shipment", "document_type", "validation_status", "file_format"]
    search_fields = [
        "title",
        "reference_number",
        "original_filename",
        "issuing_authority",
    ]
    ordering_fields = ["uploaded_at", "expiry_date", "title"]
    ordering = ["-uploaded_at"]

    def get_serializer_class(self):
        return (
            DocumentUploadSerializer
            if self.request.method == "POST"
            else DocumentListSerializer
        )

    def get_queryset(self):
        return Document.objects.filter(
            shipment__organisation=self.request.user.organisation
        ).select_related("shipment", "document_type", "uploaded_by")


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /documents/{id}/  → détail avec infos de validation
    PATCH  /documents/{id}/  → modifier titre, notes, dates
    DELETE /documents/{id}/  → supprimer
    """

    permission_classes = [permissions.IsAuthenticated, IsSameOrganisation]

    def get_serializer_class(self):
        return (
            DocumentUploadSerializer
            if self.request.method in ("PUT", "PATCH")
            else DocumentDetailSerializer
        )

    def get_queryset(self):
        return Document.objects.filter(
            shipment__organisation=self.request.user.organisation
        ).select_related("shipment", "document_type", "uploaded_by", "validated_by")

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [
                permissions.IsAuthenticated(),
                IsOwnerOrAdmin(),
                IsSameOrganisation(),
            ]
        return [permissions.IsAuthenticated(), IsSameOrganisation()]

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        # Supprime le fichier physique du storage
        if doc.file:
            doc.file.delete(save=False)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentValidateView(APIView):
    """
    POST /documents/{id}/validate/
    Body : { "action": "approve" }
         | { "action": "reject", "rejection_reason": "Document illisible." }
    Réservé aux admins et managers.
    """

    permission_classes = [permissions.IsAuthenticated, IsOrganisationAdmin]

    def post(self, request, pk):
        try:
            doc = Document.objects.get(
                pk=pk, shipment__organisation=request.user.organisation
            )
        except Document.DoesNotExist:
            return Response(
                {"detail": "Document introuvable."}, status=status.HTTP_404_NOT_FOUND
            )

        if doc.validation_status == Document.ValidationStatus.APPROVED:
            return Response(
                {"detail": "Ce document est déjà approuvé."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DocumentValidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        doc = serializer.save(instance=doc, user=request.user)
        return Response(DocumentDetailSerializer(doc).data)


class ShipmentDocumentListView(generics.ListAPIView):
    """
    GET /shipments/{id}/documents/
    Tous les documents liés à une expédition spécifique.
    """

    serializer_class = DocumentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["document_type", "validation_status"]
    ordering = ["document_type__name"]

    def get_queryset(self):
        return Document.objects.filter(
            shipment__pk=self.kwargs["pk"],
            shipment__organisation=self.request.user.organisation,
        ).select_related("document_type", "uploaded_by")
