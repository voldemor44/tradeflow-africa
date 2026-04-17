"""
TradeFlow Africa — accounts/models.py
Gestion des utilisateurs, organisations et abonnements.
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class Organisation(models.Model):
    """
    Unité de base du multi-tenant.
    Toutes les données métier sont isolées par organisation.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom de l'entreprise")
    slug = models.SlugField(unique=True)
    country = models.CharField(max_length=100, default="Bénin")
    city = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    tax_id = models.CharField(
        max_length=50, blank=True, verbose_name="IFU / Numéro fiscal"
    )
    logo = models.ImageField(upload_to="logos/", null=True, blank=True)

    class Plan(models.TextChoices):
        STARTER = "starter", "Starter (Gratuit)"
        PRO = "pro", "Pro"
        BUSINESS = "business", "Business"

    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.STARTER)
    plan_expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Organisation"
        verbose_name_plural = "Organisations"
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(AbstractUser):
    """
    Utilisateur étendu. Appartient à une Organisation et a un rôle
    qui définit ses permissions dans l'application.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organisation = models.ForeignKey(
        Organisation,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True,
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    class Role(models.TextChoices):
        ADMIN = "admin", "Administrateur"
        MANAGER = "manager", "Gestionnaire"
        OPERATOR = "operator", "Opérateur"
        VIEWER = "viewer", "Lecteur"
        PARTNER = "partner", "Partenaire externe"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OPERATOR)
    is_verified = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.get_full_name()} ({self.organisation})"
