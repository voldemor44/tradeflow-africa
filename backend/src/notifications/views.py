"""
TradeFlow Africa — notifications/views.py

Endpoints :
  GET   /notifications/               Liste des notifications (non lues en tête)
  PATCH /notifications/{id}/          Marquer comme lu
  POST  /notifications/mark-all-read/ Tout marquer comme lu
  GET   /notifications/unread-count/  Compteur pour le badge navbar

  GET   /notifications/preferences/   Préférences de l'utilisateur
  PATCH /notifications/preferences/   Modifier les préférences
"""

from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    MarkAllReadSerializer,
    NotificationPreferenceSerializer,
)


class NotificationListView(generics.ListAPIView):
    """
    GET /notifications/
    Liste des notifications de l'utilisateur connecté.
    Les non-lues apparaissent en premier, puis par date décroissante.

    Filtres :
      ?is_read=false       → non lues uniquement
      ?type=status_change
    """

    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_read", "type"]

    def get_queryset(self):
        return (
            Notification.objects.filter(user=self.request.user)
            .select_related("shipment")
            .order_by("is_read", "-created_at")  # non-lues en premier
        )


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /notifications/{id}/  → détail
    PATCH /notifications/{id}/  → marquer comme lu (is_read: true)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class MarkAllReadView(APIView):
    """
    POST /notifications/mark-all-read/
    Marque toutes les notifications non lues de l'utilisateur comme lues.
    Réponse : { "marked_read": 12 }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MarkAllReadSerializer(data={})
        serializer.is_valid()
        result = serializer.save(user=request.user)
        return Response(result)


class UnreadCountView(APIView):
    """
    GET /notifications/unread-count/
    Retourne le nombre de notifications non lues — utilisé pour le badge navbar.
    Réponse : { "count": 5 }
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """
    GET   /notifications/preferences/  → préférences actuelles
    PATCH /notifications/preferences/  → modifier canaux et seuils
    Crée les préférences avec les valeurs par défaut si elles n'existent pas encore.
    """

    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        prefs, _ = NotificationPreference.objects.get_or_create(user=self.request.user)
        return prefs

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)
