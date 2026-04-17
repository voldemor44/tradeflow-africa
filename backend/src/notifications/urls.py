from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    MarkAllReadView,
    UnreadCountView,
    NotificationPreferenceView,
)

urlpatterns = [
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path(
        "notifications/unread-count/",
        UnreadCountView.as_view(),
        name="notification-unread-count",
    ),
    path(
        "notifications/mark-all-read/",
        MarkAllReadView.as_view(),
        name="notification-mark-all-read",
    ),
    path(
        "notifications/<uuid:pk>/",
        NotificationDetailView.as_view(),
        name="notification-detail",
    ),
    path(
        "notifications/preferences/",
        NotificationPreferenceView.as_view(),
        name="notification-preferences",
    ),
]
