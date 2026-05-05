"""
TradeFlow Africa — settings.py
Lit toutes les valeurs sensibles depuis .env via python-decouple.
"""

from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY")
DEBUG      = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())


# ──────────────────────────────────────────────────────────────
# APPLICATIONS
# ──────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Tiers
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",  # logout par blacklist
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "django_celery_beat",

    # Apps TradeFlow
    "accounts",
    "partners",
    "shipments",
    "tracking",
    "documents",
    "finance",
    "notifications",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",          # CORS — doit être haut
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF    = "tradeflow.urls"
AUTH_USER_MODEL = "accounts.User"

TEMPLATES = [
    {
        "BACKEND":  "django.template.backends.django.DjangoTemplates",
        "DIRS":     [],
        "APP_DIRS": True,
        "OPTIONS":  {"context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ]},
    }
]

WSGI_APPLICATION = "tradeflow.wsgi.application"


# ──────────────────────────────────────────────────────────────
# BASE DE DONNÉES
# ──────────────────────────────────────────────────────────────

DATABASES = {
    "default": {
        "ENGINE":   "django.db.backends.postgresql",
        "NAME":     config("DB_NAME",     default="tradeflow"),
        "USER":     config("DB_USER",     default="postgres"),
        "PASSWORD": config("DB_PASSWORD", default=""),
        "HOST":     config("DB_HOST",     default="localhost"),
        "PORT":     config("DB_PORT",     default="5432"),
    }
}


# ──────────────────────────────────────────────────────────────
# DJANGO REST FRAMEWORK
# ──────────────────────────────────────────────────────────────

REST_FRAMEWORK = {
    # JWT comme méthode d'authentification par défaut
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    # Par défaut : authentification obligatoire (sauf vues avec AllowAny)
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # Filtrage
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    # Pagination par défaut
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    # Schéma OpenAPI (drf-spectacular)
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# ──────────────────────────────────────────────────────────────
# JWT — djangorestframework-simplejwt
# ──────────────────────────────────────────────────────────────

SIMPLE_JWT = {
    # Durées
    "ACCESS_TOKEN_LIFETIME":  timedelta(minutes=120),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS":  True,   # nouveau refresh token à chaque refresh
    "BLACKLIST_AFTER_ROTATION": True, # l'ancien refresh est blacklisté

    # Header
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME":  "HTTP_AUTHORIZATION",

    # Claims
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "TOKEN_TYPE_CLAIM": "token_type",

    # Algorithme
    "ALGORITHM": "HS256",
    "SIGNING_KEY": config("SECRET_KEY"),
}


# ──────────────────────────────────────────────────────────────
# CORS — django-cors-headers
# ──────────────────────────────────────────────────────────────

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://localhost:3000",
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True


# ──────────────────────────────────────────────────────────────
# STOCKAGE FICHIERS — django-storages + S3/R2
# ──────────────────────────────────────────────────────────────

USE_S3 = config("USE_S3", default=False, cast=bool)

if USE_S3:
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    AWS_ACCESS_KEY_ID     = config("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_ENDPOINT_URL   = config("AWS_S3_ENDPOINT_URL", default=None)  # Cloudflare R2
    AWS_S3_CUSTOM_DOMAIN  = config("AWS_S3_CUSTOM_DOMAIN", default=None)
    AWS_DEFAULT_ACL       = None
    AWS_S3_FILE_OVERWRITE = False
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.r2.cloudflarestorage.com/"
else:
    MEDIA_URL  = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"


# ──────────────────────────────────────────────────────────────
# CELERY — tâches asynchrones
# ──────────────────────────────────────────────────────────────

CELERY_BROKER_URL        = config("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND    = config("REDIS_URL", default="redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT    = ["json"]
CELERY_TASK_SERIALIZER   = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE          = "Africa/Porto-Novo"

# Tâches périodiques (django-celery-beat)
from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    # Sync positions navires toutes les 4h
    "sync-vessel-positions": {
        "task":     "tracking.tasks.sync_all_vessel_positions",
        "schedule": crontab(minute=0, hour="*/4"),
    },
    # Alertes documents expirants — chaque matin à 7h
    "check-document-expiry": {
        "task":     "notifications.tasks.check_document_expiry",
        "schedule": crontab(minute=0, hour=7),
    },
    # Alertes paiements en retard — chaque matin à 7h30
    "check-payment-overdue": {
        "task":     "notifications.tasks.check_payment_overdue",
        "schedule": crontab(minute=30, hour=7),
    },
}


# ──────────────────────────────────────────────────────────────
# CACHE — Redis
# ──────────────────────────────────────────────────────────────

CACHES = {
    "default": {
        "BACKEND":  "django.core.cache.backends.redis.RedisCache",
        "LOCATION": config("REDIS_URL", default="redis://localhost:6379/1"),
    }
}


# ──────────────────────────────────────────────────────────────
# DRF SPECTACULAR — documentation OpenAPI
# ──────────────────────────────────────────────────────────────

SPECTACULAR_SETTINGS = {
    "TITLE":       "TradeFlow Africa API",
    "DESCRIPTION": "API de gestion des expéditions import/export — Bénin & ECOWAS",
    "VERSION":     "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}


# ──────────────────────────────────────────────────────────────
# DIVERS
# ──────────────────────────────────────────────────────────────

LANGUAGE_CODE = "fr-fr"
TIME_ZONE     = "Africa/Porto-Novo"
USE_I18N      = True
USE_TZ        = True

STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]