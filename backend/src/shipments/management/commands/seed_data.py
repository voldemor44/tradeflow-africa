"""
TradeFlow Africa — Management Command : seed_data
Peuple la base avec des données réalistes pour le développement et la démo.

Usage :
    python manage.py seed_data                  # peuple tout
    python manage.py seed_data --flush          # vide d'abord la DB (hors admin)
    python manage.py seed_data --org=1          # peuple une org existante seulement

Ce qui est créé :
    3 organisations (Bénin, Côte d'Ivoire, Sénégal)
    3 admins + 6 opérateurs (1 admin + 2 opérateurs par org)
    27 partenaires (~9 par org)
    10 types de documents
    54 expéditions (~18 par org, tous statuts, modes et directions)
    Historique de statuts pour chaque expédition
    Documents pour chaque expédition (1 à 4)
    Coûts pour chaque expédition (4 à 6 postes)
    Paiements pour les expéditions actives
    Tracking navire pour les maritimes, routier pour les terrestres
    Notifications pour chaque utilisateur
"""

import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from accounts.models import Organisation, User
from partners.models import Partner
from shipments.models import Shipment, ShipmentStatusHistory
from tracking.models import VesselTracking, VesselPositionLog, RoadTracking
from documents.models import DocumentType, Document
from finance.models import ShipmentCost, Payment
from notifications.models import Notification, NotificationPreference


# ─────────────────────────────────────────────────────────────
# DONNÉES DE RÉFÉRENCE
# ─────────────────────────────────────────────────────────────

ORGANISATIONS = [
    {
        "name": "ATLAS Import-Export SARL",
        "slug": "atlas-import-export",
        "country": "Bénin",
        "city": "Cotonou",
        "email": "contact@atlas-ie.bj",
        "tax_id": "IFU-20230045-B",
        "plan": "pro",
    },
    {
        "name": "SAVANE Logistics CI",
        "slug": "savane-logistics-ci",
        "country": "Côte d'Ivoire",
        "city": "Abidjan",
        "email": "info@savane-log.ci",
        "tax_id": "CC-CI-2022-88712",
        "plan": "business",
    },
    {
        "name": "TERANGA Commerce SN",
        "slug": "teranga-commerce-sn",
        "country": "Sénégal",
        "city": "Dakar",
        "email": "direction@teranga-com.sn",
        "tax_id": "NINEA-003456782",
        "plan": "starter",
    },
]

# (prénom, nom, username, email, rôle)
USERS_PER_ORG = [
    ("Kwame", "Mensah", "kwame.mensah", "kwame@{}", User.Role.ADMIN),
    ("Fatou", "Diallo", "fatou.diallo", "fatou@{}", User.Role.OPERATOR),
    ("Ibrahim", "Coulibaly", "ibrahim.coul", "ibrahim@{}", User.Role.OPERATOR),
]

PARTNER_TEMPLATES = [
    {"type": "freight_forwarder", "name": "MAERSK {city}", "country": "DK"},
    {"type": "freight_forwarder", "name": "CMA CGM {city}", "country": "FR"},
    {"type": "freight_forwarder", "name": "BOLLORÉ Logistics {city}", "country": "FR"},
    {"type": "customs_broker", "name": "SAGA Transit {city}", "country": None},
    {"type": "customs_broker", "name": "BESCO Douane {city}", "country": None},
    {"type": "transporter", "name": "Trans-ECOWAS {city}", "country": None},
    {"type": "supplier", "name": "Guangzhou Trading Co.", "country": "CN"},
    {"type": "supplier", "name": "Istanbul Textile SA", "country": "TR"},
    {"type": "insurer", "name": "SUNU Assurances {city}", "country": None},
]

DOCUMENT_TYPES_DATA = [
    {
        "name": "Bill of Lading",
        "code": "BL",
        "has_expiry": False,
        "mandatory_import": True,
        "mandatory_export": True,
        "icon": "file-text",
    },
    {
        "name": "Facture commerciale",
        "code": "INVOICE",
        "has_expiry": False,
        "mandatory_import": True,
        "mandatory_export": True,
        "icon": "file",
    },
    {
        "name": "Certificat d'origine",
        "code": "CERT_ORIG",
        "has_expiry": True,
        "mandatory_import": True,
        "mandatory_export": False,
        "icon": "award",
    },
    {
        "name": "Liste de colisage",
        "code": "PACKING",
        "has_expiry": False,
        "mandatory_import": True,
        "mandatory_export": True,
        "icon": "list",
    },
    {
        "name": "Déclaration en douane (DUA)",
        "code": "DUA",
        "has_expiry": False,
        "mandatory_import": True,
        "mandatory_export": True,
        "icon": "clipboard",
    },
    {
        "name": "Certificat phytosanitaire",
        "code": "PHYTO",
        "has_expiry": True,
        "mandatory_import": False,
        "mandatory_export": False,
        "icon": "leaf",
    },
    {
        "name": "Lettre de crédit (L/C)",
        "code": "LC",
        "has_expiry": True,
        "mandatory_import": False,
        "mandatory_export": False,
        "icon": "credit-card",
    },
    {
        "name": "Certificat d'assurance",
        "code": "INSURANCE",
        "has_expiry": True,
        "mandatory_import": False,
        "mandatory_export": False,
        "icon": "shield",
    },
    {
        "name": "Bon de commande",
        "code": "PO",
        "has_expiry": False,
        "mandatory_import": False,
        "mandatory_export": True,
        "icon": "shopping-cart",
    },
    {
        "name": "Rapport d'inspection",
        "code": "INSPECTION",
        "has_expiry": True,
        "mandatory_import": False,
        "mandatory_export": False,
        "icon": "search",
    },
]

# Routes réalistes vers/depuis Cotonou, Abidjan, Dakar
ROUTES = [
    # Maritime import
    {
        "origin_country": "CN",
        "origin_port": "Shanghai",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "sea",
        "direction": "import",
        "incoterm": "CIF",
        "days": 30,
    },
    {
        "origin_country": "CN",
        "origin_port": "Guangzhou",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "sea",
        "direction": "import",
        "incoterm": "FOB",
        "days": 28,
    },
    {
        "origin_country": "CN",
        "origin_port": "Ningbo",
        "dest_country": "CI",
        "dest_port": "Abidjan",
        "mode": "sea",
        "direction": "import",
        "incoterm": "CIF",
        "days": 32,
    },
    {
        "origin_country": "TR",
        "origin_port": "Istanbul",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "sea",
        "direction": "import",
        "incoterm": "CFR",
        "days": 18,
    },
    {
        "origin_country": "FR",
        "origin_port": "Marseille",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "sea",
        "direction": "import",
        "incoterm": "CIF",
        "days": 12,
    },
    {
        "origin_country": "FR",
        "origin_port": "Le Havre",
        "dest_country": "SN",
        "dest_port": "Dakar",
        "mode": "sea",
        "direction": "import",
        "incoterm": "CIF",
        "days": 10,
    },
    {
        "origin_country": "DE",
        "origin_port": "Hambourg",
        "dest_country": "CI",
        "dest_port": "Abidjan",
        "mode": "sea",
        "direction": "import",
        "incoterm": "FOB",
        "days": 15,
    },
    {
        "origin_country": "IN",
        "origin_port": "Mumbai",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "sea",
        "direction": "import",
        "incoterm": "CIF",
        "days": 22,
    },
    {
        "origin_country": "AE",
        "origin_port": "Dubaï",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "sea",
        "direction": "import",
        "incoterm": "CFR",
        "days": 16,
    },
    # Maritime export
    {
        "origin_country": "BJ",
        "origin_port": "Cotonou",
        "dest_country": "FR",
        "dest_port": "Marseille",
        "mode": "sea",
        "direction": "export",
        "incoterm": "FOB",
        "days": 12,
    },
    {
        "origin_country": "CI",
        "origin_port": "Abidjan",
        "dest_country": "NL",
        "dest_port": "Rotterdam",
        "mode": "sea",
        "direction": "export",
        "incoterm": "FOB",
        "days": 14,
    },
    # Aérien import
    {
        "origin_country": "CN",
        "origin_port": "Pékin",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "air",
        "direction": "import",
        "incoterm": "CIP",
        "days": 3,
    },
    {
        "origin_country": "FR",
        "origin_port": "Paris CDG",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "air",
        "direction": "import",
        "incoterm": "DAP",
        "days": 2,
    },
    {
        "origin_country": "AE",
        "origin_port": "Dubaï",
        "dest_country": "CI",
        "dest_port": "Abidjan",
        "mode": "air",
        "direction": "import",
        "incoterm": "CIP",
        "days": 2,
    },
    # Routier (corridors ECOWAS)
    {
        "origin_country": "GH",
        "origin_port": "Accra",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "road",
        "direction": "import",
        "incoterm": "DAP",
        "days": 2,
    },
    {
        "origin_country": "NG",
        "origin_port": "Lagos",
        "dest_country": "BJ",
        "dest_port": "Cotonou",
        "mode": "road",
        "direction": "import",
        "incoterm": "EXW",
        "days": 1,
    },
    {
        "origin_country": "BJ",
        "origin_port": "Cotonou",
        "dest_country": "NE",
        "dest_port": "Niamey",
        "mode": "road",
        "direction": "export",
        "incoterm": "DAP",
        "days": 3,
    },
    {
        "origin_country": "BJ",
        "origin_port": "Cotonou",
        "dest_country": "BF",
        "dest_port": "Ouagadougou",
        "mode": "road",
        "direction": "export",
        "incoterm": "DAP",
        "days": 2,
    },
]

GOODS = [
    ("Équipements informatiques", "50 cartons", Decimal("12500000")),
    ("Tissus et textiles (15 tonnes)", "15 000 kg", Decimal("8700000")),
    ("Pièces automobiles", "200 unités", Decimal("6400000")),
    ("Produits alimentaires conditionnés", "8 palettes", Decimal("3200000")),
    ("Matériaux de construction", "20 tonnes", Decimal("4100000")),
    ("Médicaments et produits pharma", "10 cartons", Decimal("18900000")),
    ("Meubles et équipements bureau", "15 colis", Decimal("5600000")),
    ("Machines industrielles", "3 unités", Decimal("41200000")),
    ("Produits cosmétiques", "500 boîtes", Decimal("2100000")),
    ("Électroménager", "80 cartons", Decimal("9800000")),
    ("Câbles et équipements électriques", "30 bobines", Decimal("7300000")),
    ("Huiles végétales (vrac)", "24 000 L", Decimal("5900000")),
    ("Café et cacao brut", "10 tonnes", Decimal("16200000")),
    ("Matière première plastique", "5 tonnes", Decimal("3800000")),
    ("Outillage professionnel", "25 caisses", Decimal("11400000")),
    ("Véhicules (2 unités)", "2 véhicules", Decimal("28500000")),
    ("Articles de sport", "100 cartons", Decimal("4600000")),
    ("Équipements médicaux", "12 colis", Decimal("22700000")),
]

VESSELS = [
    ("MSC COTONOU", "9876543", "636090012", "PA"),
    ("CMA CGM ABIDJAN", "9234567", "636012345", "FR"),
    ("MAERSK DAKAR", "9345678", "219001234", "DK"),
    ("EVER GIVEN II", "9456789", "563012340", "TW"),
    ("COSCO AFRICA", "9567890", "477012345", "CN"),
    ("HAPAG LLOYD 1", "9678901", "218001234", "DE"),
]

STATUS_FLOW = [
    Shipment.Status.DRAFT,
    Shipment.Status.BOOKING,
    Shipment.Status.GOODS_READY,
    Shipment.Status.IN_TRANSIT,
    Shipment.Status.AT_DEST_PORT,
    Shipment.Status.CUSTOMS,
    Shipment.Status.CLEARED,
    Shipment.Status.DELIVERED,
]

# Distribution cible des statuts finaux
STATUS_WEIGHTS = {
    Shipment.Status.DRAFT: 5,
    Shipment.Status.BOOKING: 5,
    Shipment.Status.GOODS_READY: 5,
    Shipment.Status.IN_TRANSIT: 15,
    Shipment.Status.AT_DEST_PORT: 8,
    Shipment.Status.CUSTOMS: 8,
    Shipment.Status.CLEARED: 5,
    Shipment.Status.DELIVERED: 15,
    Shipment.Status.ON_HOLD: 4,
}


def random_date(start_days_ago: int, end_days_ago: int = 0) -> date:
    """
    Retourne une date aléatoire entre aujourd'hui - start_days_ago
    et aujourd'hui - end_days_ago.
    Les bornes sont automatiquement ordonnées (end_days_ago peut être négatif).
    """
    lo = min(start_days_ago, end_days_ago)
    hi = max(start_days_ago, end_days_ago)
    delta = random.randint(lo, hi)
    return date.today() - timedelta(days=delta)


def make_ref(org_index: int, seq: int) -> str:
    prefixes = ["TFA", "SVL", "TRG"]
    return f"{prefixes[org_index]}-2025-{seq:05d}"


# ─────────────────────────────────────────────────────────────
# COMMAND
# ─────────────────────────────────────────────────────────────


class Command(BaseCommand):
    help = "Peuple la base de données avec des données réalistes (dev / démo)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Supprime les données existantes avant de peupler.",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            self.flush_data()

        self.stdout.write(
            self.style.MIGRATE_HEADING("\n🌍  TradeFlow Africa — Seed Data\n")
        )

        doc_types = self.create_document_types()
        orgs, users_by_org = self.create_organisations_and_users()
        partners_by_org = self.create_partners(orgs, users_by_org)
        shipments_by_org = self.create_shipments(orgs, users_by_org, partners_by_org)
        self.create_documents(shipments_by_org, users_by_org, doc_types)
        self.create_tracking(shipments_by_org)
        self.create_finance(shipments_by_org, users_by_org)
        self.create_notifications(shipments_by_org, users_by_org)

        total = sum(len(s) for s in shipments_by_org.values())
        self.stdout.write(
            self.style.SUCCESS(f"\n✅  Seed terminé — {total} expéditions créées.\n")
        )

    # ──────────────────────────────────────────────────────────
    # FLUSH
    # ──────────────────────────────────────────────────────────

    def flush_data(self):
        self.stdout.write("🗑️  Suppression des données existantes…")
        Notification.objects.all().delete()
        Payment.objects.all().delete()
        ShipmentCost.objects.all().delete()
        VesselPositionLog.objects.all().delete()
        VesselTracking.objects.all().delete()
        RoadTracking.objects.all().delete()
        Document.objects.all().delete()
        ShipmentStatusHistory.objects.all().delete()
        Shipment.objects.all().delete()
        Partner.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        Organisation.objects.all().delete()
        self.stdout.write(
            self.style.WARNING("   Tables vidées (superusers préservés).")
        )

    # ──────────────────────────────────────────────────────────
    # ORGANISATIONS & UTILISATEURS
    # ──────────────────────────────────────────────────────────

    def create_organisations_and_users(self):
        self.stdout.write("\n📦  Organisations & utilisateurs…")
        orgs = []
        users_by_org = {}

        for i, org_data in enumerate(ORGANISATIONS):
            org, created = Organisation.objects.get_or_create(
                slug=org_data["slug"],
                defaults={
                    "name": org_data["name"],
                    "country": org_data["country"],
                    "city": org_data["city"],
                    "email": org_data["email"],
                    "tax_id": org_data["tax_id"],
                    "plan": org_data["plan"],
                },
            )
            orgs.append(org)
            domain = org_data["email"].split("@")[1]
            users = []

            for first, last, uname_tpl, email_tpl, role in USERS_PER_ORG:
                username = f"{uname_tpl}.{i}"
                email = email_tpl.format(domain)
                user, _ = User.objects.get_or_create(
                    username=username,
                    defaults={
                        "first_name": first,
                        "last_name": last,
                        "email": email,
                        "organisation": org,
                        "role": role,
                        "is_verified": True,
                        "is_active": True,
                    },
                )
                if _:
                    user.set_password("TradeFlow2025!")
                    user.save()
                    # Crée les préférences de notification par défaut
                    NotificationPreference.objects.get_or_create(user=user)
                users.append(user)

            users_by_org[org.id] = users
            status = "créée" if created else "existante"
            self.stdout.write(f"   ✓ {org.name} ({status}) — {len(users)} users")

        return orgs, users_by_org

    # ──────────────────────────────────────────────────────────
    # PARTENAIRES
    # ──────────────────────────────────────────────────────────

    def create_partners(self, orgs, users_by_org):
        self.stdout.write("\n🤝  Partenaires…")
        partners_by_org = {}

        for org in orgs:
            city = org.city
            country = org.country
            partners = []

            for tmpl in PARTNER_TEMPLATES:
                name = tmpl["name"].format(city=city)
                p_country = tmpl["country"] if tmpl["country"] else country
                partner, created = Partner.objects.get_or_create(
                    organisation=org,
                    name=name,
                    defaults={
                        "type": tmpl["type"],
                        "country": p_country,
                        "city": city,
                        "contact_name": f"Contact {name.split()[0]}",
                        "email": f"contact@{slugify(name)}.com",
                        "phone": f"+{random.randint(200,299)} {random.randint(90,99)}{random.randint(100000,999999)}",
                        "is_active": True,
                        "rating": Decimal(str(round(random.uniform(3.2, 5.0), 1))),
                    },
                )
                partners.append(partner)

            partners_by_org[org.id] = partners
            self.stdout.write(f"   ✓ {org.name} — {len(partners)} partenaires")

        return partners_by_org

    # ──────────────────────────────────────────────────────────
    # EXPÉDITIONS
    # ──────────────────────────────────────────────────────────

    def create_shipments(self, orgs, users_by_org, partners_by_org):
        self.stdout.write("\n🚢  Expéditions…")
        shipments_by_org = {}
        statuses = list(STATUS_WEIGHTS.keys())
        weights = list(STATUS_WEIGHTS.values())

        for org_idx, org in enumerate(orgs):
            users = users_by_org[org.id]
            partners = partners_by_org[org.id]
            # Partitionne les partenaires par type
            forwarders = [p for p in partners if p.type == "freight_forwarder"]
            brokers = [p for p in partners if p.type == "customs_broker"]
            shipments = []
            seq = 1

            for _ in range(18):
                route = random.choice(ROUTES)
                goods = random.choice(GOODS)
                target_status = random.choices(statuses, weights=weights, k=1)[0]
                flow_idx = (
                    STATUS_FLOW.index(target_status)
                    if target_status in STATUS_FLOW
                    else -1
                )
                is_archived = random.random() < 0.08  # 8% archivées

                # Dates cohérentes avec le statut
                created_days_ago = random.randint(10, 180)
                etd = random_date(max(created_days_ago - 5, 35), 5)
                eta = etd + timedelta(days=route["days"])

                actual_departure = None
                actual_arrival = None
                customs_start = None
                customs_end = None
                closed_at = None

                if flow_idx >= 3:  # IN_TRANSIT ou après
                    actual_departure = etd + timedelta(days=random.randint(0, 2))
                if flow_idx >= 4:  # AT_DEST_PORT ou après
                    actual_arrival = eta + timedelta(days=random.randint(-1, 3))
                if flow_idx >= 5:  # CUSTOMS
                    customs_start = (
                        actual_arrival + timedelta(days=1) if actual_arrival else None
                    )
                if flow_idx >= 6:  # CLEARED
                    customs_end = (
                        customs_start + timedelta(days=random.randint(2, 8))
                        if customs_start
                        else None
                    )
                if target_status == Shipment.Status.DELIVERED:
                    closed_at = timezone.now() - timedelta(days=random.randint(1, 30))

                s = Shipment.objects.create(
                    organisation=org,
                    reference=make_ref(org_idx, seq),
                    created_by=random.choice(users),
                    assigned_to=random.choice(users),
                    direction=route["direction"],
                    origin_country=route["origin_country"],
                    origin_port_or_city=route["origin_port"],
                    destination_country=route["dest_country"],
                    destination_port_or_city=route["dest_port"],
                    goods_description=goods[0],
                    hs_code=f"{random.randint(10,99)}{random.randint(10,99)}.{random.randint(10,99)}",
                    quantity=Decimal(str(random.randint(1, 200))),
                    unit="unités",
                    gross_weight_kg=Decimal(str(round(random.uniform(100, 15000), 1))),
                    volume_m3=Decimal(str(round(random.uniform(1, 80), 1))),
                    declared_value=goods[2],
                    currency="XOF",
                    transport_mode=route["mode"],
                    incoterm=route["incoterm"],
                    freight_forwarder=random.choice(forwarders) if forwarders else None,
                    customs_broker=random.choice(brokers) if brokers else None,
                    status=target_status,
                    estimated_departure=etd,
                    actual_departure=actual_departure,
                    estimated_arrival=eta,
                    actual_arrival=actual_arrival,
                    customs_start=customs_start,
                    customs_end=customs_end,
                    is_archived=is_archived,
                    archived_at=(
                        timezone.now() - timedelta(days=random.randint(1, 15))
                        if is_archived
                        else None
                    ),
                    notes=f"Dossier {make_ref(org_idx, seq)} — transit via {route['dest_port']}.",
                    tags=random.sample(
                        ["urgent", "fragile", "dangereux", "réfrigéré", "vrac"],
                        k=random.randint(0, 2),
                    ),
                    closed_at=closed_at,
                )
                # Historique de statuts
                self._create_status_history(s, target_status, users)

                # Mise à jour compteur partenaires
                if s.freight_forwarder:
                    Partner.objects.filter(pk=s.freight_forwarder.pk).update(
                        total_shipments=s.freight_forwarder.total_shipments + 1
                    )

                shipments.append(s)
                seq += 1

            shipments_by_org[org.id] = shipments
            self.stdout.write(f"   ✓ {org.name} — {len(shipments)} expéditions")

        return shipments_by_org

    def _create_status_history(self, shipment, target_status, users):
        """Crée un historique cohérent jusqu'au statut cible."""
        locations = {
            Shipment.Status.BOOKING: shipment.origin_port_or_city,
            Shipment.Status.GOODS_READY: shipment.origin_port_or_city,
            Shipment.Status.IN_TRANSIT: f"En route vers {shipment.destination_port_or_city}",
            Shipment.Status.AT_DEST_PORT: shipment.destination_port_or_city,
            Shipment.Status.CUSTOMS: f"Douane de {shipment.destination_port_or_city}",
            Shipment.Status.CLEARED: shipment.destination_port_or_city,
            Shipment.Status.DELIVERED: shipment.destination_port_or_city,
            Shipment.Status.ON_HOLD: shipment.destination_port_or_city,
        }
        notes_map = {
            Shipment.Status.BOOKING: "Espace réservé auprès du transporteur.",
            Shipment.Status.GOODS_READY: "Marchandises emballées et prêtes à l'embarquement.",
            Shipment.Status.IN_TRANSIT: "Navire/véhicule en route.",
            Shipment.Status.AT_DEST_PORT: "Arrivée au port de destination confirmée.",
            Shipment.Status.CUSTOMS: "Dossier ouvert en douane.",
            Shipment.Status.CLEARED: "Mainlevée obtenue.",
            Shipment.Status.DELIVERED: "Marchandises remises au destinataire.",
            Shipment.Status.ON_HOLD: "En attente — document manquant.",
        }

        if target_status == Shipment.Status.DRAFT:
            return

        flow = STATUS_FLOW
        if target_status == Shipment.Status.ON_HOLD:
            # ON_HOLD arrive après AT_DEST_PORT
            statuses_to_create = flow[1:5] + [Shipment.Status.ON_HOLD]
        else:
            try:
                idx = flow.index(target_status)
                statuses_to_create = flow[1 : idx + 1]
            except ValueError:
                statuses_to_create = [target_status]

        base_time = timezone.now() - timedelta(days=random.randint(10, 120))
        for i, st in enumerate(statuses_to_create):
            ShipmentStatusHistory.objects.create(
                shipment=shipment,
                status=st,
                note=notes_map.get(st, ""),
                location=locations.get(st, ""),
                changed_by=random.choice(users),
                changed_at=base_time + timedelta(days=i * random.randint(2, 8)),
            )

    # ──────────────────────────────────────────────────────────
    # DOCUMENTS
    # ──────────────────────────────────────────────────────────

    def create_document_types(self):
        self.stdout.write("\n📄  Types de documents…")
        doc_types = []
        for dt in DOCUMENT_TYPES_DATA:
            obj, _ = DocumentType.objects.get_or_create(
                code=dt["code"],
                defaults={
                    "name": dt["name"],
                    "has_expiry": dt["has_expiry"],
                    "is_mandatory_import": dt["mandatory_import"],
                    "is_mandatory_export": dt["mandatory_export"],
                    "icon": dt["icon"],
                },
            )
            doc_types.append(obj)
        self.stdout.write(f"   ✓ {len(doc_types)} types créés")
        return doc_types

    def create_documents(self, shipments_by_org, users_by_org, doc_types):
        self.stdout.write("\n📎  Documents…")
        validation_statuses = [
            Document.ValidationStatus.APPROVED,
            Document.ValidationStatus.APPROVED,
            Document.ValidationStatus.PENDING,
            Document.ValidationStatus.REJECTED,
        ]
        total = 0

        for org_id, shipments in shipments_by_org.items():
            users = users_by_org[org_id]
            admin = next((u for u in users if u.role == User.Role.ADMIN), users[0])

            for shipment in shipments:
                n_docs = random.randint(2, 5)
                chosen_dt = random.sample(doc_types, min(n_docs, len(doc_types)))

                for dt in chosen_dt:
                    val_status = random.choice(validation_statuses)
                    issue_date = random_date(90, 10)
                    expiry_date = (
                        issue_date + timedelta(days=365) if dt.has_expiry else None
                    )
                    # Quelques documents volontairement expirés
                    if expiry_date and random.random() < 0.1:
                        expiry_date = date.today() - timedelta(
                            days=random.randint(1, 30)
                        )

                    doc = Document.objects.create(
                        shipment=shipment,
                        document_type=dt,
                        original_filename=f"{dt.code.lower()}_{shipment.reference}.pdf",
                        file=f"documents/{shipment.organisation.slug}/{shipment.reference}/{dt.code.lower()}.pdf",
                        file_format=Document.FileFormat.PDF,
                        file_size_bytes=random.randint(50_000, 2_000_000),
                        title=f"{dt.name} — {shipment.reference}",
                        reference_number=f"REF-{random.randint(10000,99999)}",
                        issue_date=issue_date,
                        expiry_date=expiry_date,
                        issuing_authority=random.choice(
                            [
                                "DGDDI",
                                "Chambre de Commerce",
                                "Fournisseur",
                                "Banque BPI",
                            ]
                        ),
                        validation_status=val_status,
                        validated_by=(
                            admin
                            if val_status
                            in (
                                Document.ValidationStatus.APPROVED,
                                Document.ValidationStatus.REJECTED,
                            )
                            else None
                        ),
                        validated_at=(
                            timezone.now() - timedelta(days=random.randint(1, 30))
                            if val_status != Document.ValidationStatus.PENDING
                            else None
                        ),
                        rejection_reason=(
                            "Document illisible ou incomplet."
                            if val_status == Document.ValidationStatus.REJECTED
                            else ""
                        ),
                        uploaded_by=random.choice(users),
                    )
                    total += 1

        self.stdout.write(f"   ✓ {total} documents créés")

    # ──────────────────────────────────────────────────────────
    # TRACKING
    # ──────────────────────────────────────────────────────────

    def create_tracking(self, shipments_by_org):
        self.stdout.write("\n🛰️   Tracking…")
        vessel_count = 0
        road_count = 0

        for org_id, shipments in shipments_by_org.items():
            for shipment in shipments:
                if shipment.status in (Shipment.Status.DRAFT, Shipment.Status.BOOKING):
                    continue

                if shipment.transport_mode == "sea":
                    vessel_name, imo, mmsi, flag = random.choice(VESSELS)
                    vessel = VesselTracking.objects.create(
                        shipment=shipment,
                        vessel_name=vessel_name,
                        imo_number=imo,
                        mmsi=mmsi,
                        vessel_flag=flag,
                        bill_of_lading=f"BL{random.randint(100000000, 999999999)}",
                        container_number=f"MSKU{random.randint(1000000, 9999999)}",
                        voyage_number=f"V{random.randint(100, 999)}E",
                        departure_port_code=f"{shipment.origin_country}SHA",
                        arrival_port_code="BJCOO",
                        tracking_active=shipment.status
                        not in (Shipment.Status.DELIVERED, Shipment.Status.CANCELLED),
                        vessel_eta=timezone.now()
                        + timedelta(days=random.randint(-5, 15)),
                        current_latitude=Decimal(str(round(random.uniform(-5, 15), 6))),
                        current_longitude=Decimal(
                            str(round(random.uniform(-10, 40), 6))
                        ),
                        current_speed_knots=Decimal(
                            str(round(random.uniform(8, 18), 1))
                        ),
                        current_heading=random.randint(0, 359),
                        current_status=random.choice(
                            ["Underway using Engine", "At anchor", "Moored"]
                        ),
                        last_position_at=timezone.now()
                        - timedelta(hours=random.randint(1, 12)),
                        last_synced_at=timezone.now()
                        - timedelta(hours=random.randint(1, 4)),
                    )
                    # 5 à 12 positions historiques
                    n_positions = random.randint(5, 12)
                    base_lat = float(vessel.current_latitude)
                    base_lng = float(vessel.current_longitude)
                    for j in range(n_positions):
                        VesselPositionLog.objects.create(
                            vessel=vessel,
                            latitude=Decimal(
                                str(round(base_lat - j * random.uniform(0.5, 2.0), 6))
                            ),
                            longitude=Decimal(
                                str(round(base_lng + j * random.uniform(0.3, 1.5), 6))
                            ),
                            speed_knots=Decimal(str(round(random.uniform(8, 18), 1))),
                            recorded_at=timezone.now()
                            - timedelta(hours=(n_positions - j) * 4),
                        )
                    vessel_count += 1

                elif shipment.transport_mode == "road":
                    RoadTracking.objects.create(
                        shipment=shipment,
                        vehicle_plate=f"BJ{random.randint(1000,9999)}RB",
                        driver_name=random.choice(
                            [
                                "Kofi Asante",
                                "Moussa Traoré",
                                "Ismaël Diop",
                                "Yemi Adeyemi",
                            ]
                        ),
                        driver_phone=f"+229 97{random.randint(100000,999999)}",
                        current_latitude=Decimal(str(round(random.uniform(4, 14), 6))),
                        current_longitude=Decimal(str(round(random.uniform(0, 5), 6))),
                        last_position_at=timezone.now()
                        - timedelta(hours=random.randint(1, 8)),
                        tracking_active=shipment.status
                        not in (Shipment.Status.DELIVERED, Shipment.Status.CANCELLED),
                        checkpoints_passed=self._random_checkpoints(shipment),
                    )
                    road_count += 1

        self.stdout.write(
            f"   ✓ {vessel_count} navires + {road_count} véhicules routiers"
        )

    def _random_checkpoints(self, shipment):
        checkpoints = [
            {"name": "Frontière Togo/Bénin", "lat": 6.28, "lng": 1.62},
            {"name": "Malanville", "lat": 11.86, "lng": 3.39},
            {"name": "Parakou", "lat": 9.34, "lng": 2.62},
        ]
        n = random.randint(0, len(checkpoints))
        result = []
        for cp in checkpoints[:n]:
            result.append(
                {
                    "name": cp["name"],
                    "passed_at": (
                        timezone.now() - timedelta(hours=random.randint(2, 48))
                    ).isoformat(),
                    "latitude": str(cp["lat"]),
                    "longitude": str(cp["lng"]),
                }
            )
        return result

    # ──────────────────────────────────────────────────────────
    # FINANCE
    # ──────────────────────────────────────────────────────────

    def create_finance(self, shipments_by_org, users_by_org):
        self.stdout.write("\n💰  Coûts & paiements…")
        cost_count = 0
        payment_count = 0

        cost_templates = [
            (ShipmentCost.CostType.GOODS_VALUE, "Valeur marchandises", Decimal("1.00")),
            (ShipmentCost.CostType.FREIGHT, "Fret maritime/aérien", Decimal("0.08")),
            (ShipmentCost.CostType.INSURANCE, "Assurance transport", Decimal("0.012")),
            (
                ShipmentCost.CostType.CUSTOMS_DUTIES,
                "Droits de douane (5%)",
                Decimal("0.05"),
            ),
            (ShipmentCost.CostType.VAT, "TVA à l'import (18%)", Decimal("0.18")),
            (ShipmentCost.CostType.PORT_FEES, "Frais portuaires", None),
            (ShipmentCost.CostType.HANDLING, "Manutention", None),
            (ShipmentCost.CostType.BROKER_FEES, "Honoraires transitaire", None),
        ]

        for org_id, shipments in shipments_by_org.items():
            users = users_by_org[org_id]

            for shipment in shipments:
                if shipment.status == Shipment.Status.DRAFT:
                    continue

                base_value = shipment.declared_value or Decimal("5000000")
                # Sélectionne 4 à 6 postes de coût
                n_costs = random.randint(4, 6)
                selected = random.sample(cost_templates, n_costs)

                for cost_type, label, rate in selected:
                    if rate:
                        estimated = (base_value * rate).quantize(Decimal("1"))
                        actual = (
                            estimated
                            * Decimal(str(round(random.uniform(0.90, 1.15), 2)))
                        ).quantize(Decimal("1"))
                    else:
                        estimated = Decimal(str(random.randint(50_000, 500_000)))
                        actual = (
                            estimated
                            * Decimal(str(round(random.uniform(0.85, 1.20), 2)))
                        ).quantize(Decimal("1"))

                    ShipmentCost.objects.create(
                        shipment=shipment,
                        cost_type=cost_type,
                        label=label,
                        estimated_amount=estimated,
                        actual_amount=(
                            actual
                            if shipment.status
                            in (
                                Shipment.Status.DELIVERED,
                                Shipment.Status.CLEARED,
                                Shipment.Status.CUSTOMS,
                            )
                            else None
                        ),
                        currency="XOF",
                        created_by=random.choice(users),
                    )
                    cost_count += 1

                # Paiements pour les dossiers actifs ou livrés
                if shipment.status not in (
                    Shipment.Status.DRAFT,
                    Shipment.Status.BOOKING,
                ):
                    n_payments = random.randint(1, 3)
                    for _ in range(n_payments):
                        p_status = random.choice(
                            [
                                Payment.PaymentStatus.PAID,
                                Payment.PaymentStatus.PAID,
                                Payment.PaymentStatus.PENDING,
                                Payment.PaymentStatus.OVERDUE,
                            ]
                        )
                        due_date = random_date(30, -15)  # peut être dans le futur
                        paid_at = (
                            due_date - timedelta(days=random.randint(0, 5))
                            if p_status == Payment.PaymentStatus.PAID
                            else None
                        )

                        Payment.objects.create(
                            shipment=shipment,
                            amount=Decimal(str(random.randint(500_000, 5_000_000))),
                            currency="XOF",
                            method=random.choice(
                                [
                                    Payment.PaymentMethod.BANK_TRANSFER,
                                    Payment.PaymentMethod.BANK_TRANSFER,
                                    Payment.PaymentMethod.LETTER_OF_CREDIT,
                                    Payment.PaymentMethod.MOBILE_MONEY,
                                ]
                            ),
                            reference=f"VIR-{random.randint(100000,999999)}",
                            due_date=due_date,
                            paid_at=paid_at,
                            status=p_status,
                            created_by=random.choice(users),
                        )
                        payment_count += 1

        self.stdout.write(
            f"   ✓ {cost_count} postes de coûts + {payment_count} paiements"
        )

    # ──────────────────────────────────────────────────────────
    # NOTIFICATIONS
    # ──────────────────────────────────────────────────────────

    def create_notifications(self, shipments_by_org, users_by_org):
        self.stdout.write("\n🔔  Notifications…")
        total = 0

        notif_templates = [
            (
                Notification.NotificationType.STATUS_CHANGE,
                "Statut mis à jour",
                "L'expédition {ref} est maintenant : {status}.",
            ),
            (
                Notification.NotificationType.DOCUMENT_EXPIRY,
                "Document bientôt expiré",
                "Un document de {ref} expire dans moins de 7 jours.",
            ),
            (
                Notification.NotificationType.VESSEL_ARRIVED,
                "Navire arrivé au port",
                "Le navire transportant {ref} est arrivé à destination.",
            ),
            (
                Notification.NotificationType.PAYMENT_DUE,
                "Échéance de paiement proche",
                "Un paiement lié à {ref} arrive à échéance dans 3 jours.",
            ),
            (
                Notification.NotificationType.PAYMENT_OVERDUE,
                "Paiement en retard",
                "Un paiement lié à {ref} est en retard.",
            ),
            (
                Notification.NotificationType.CUSTOMS_ALERT,
                "Alerte douanière",
                "Document manquant pour le dossier {ref}.",
            ),
        ]

        for org_id, shipments in shipments_by_org.items():
            users = users_by_org[org_id]

            for user in users:
                # 5 à 10 notifications par utilisateur
                n = random.randint(5, 10)
                for _ in range(n):
                    shipment = random.choice(shipments)
                    notif_type, title, msg_tpl = random.choice(notif_templates)
                    is_read = random.random() < 0.6

                    status_label = dict(Shipment.Status.choices).get(
                        shipment.status, shipment.status
                    )
                    Notification.objects.create(
                        user=user,
                        shipment=shipment,
                        type=notif_type,
                        title=title,
                        message=msg_tpl.format(
                            ref=shipment.reference, status=status_label
                        ),
                        is_read=is_read,
                        read_at=(
                            timezone.now() - timedelta(hours=random.randint(1, 48))
                            if is_read
                            else None
                        ),
                        sent_via_email=random.random() < 0.5,
                        sent_via_whatsapp=random.random() < 0.2,
                    )
                    total += 1

        self.stdout.write(f"   ✓ {total} notifications créées")
