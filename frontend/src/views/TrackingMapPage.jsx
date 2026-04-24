import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import axiosClient from "../axios-client";
import TradeFlowMap from "../components/TradeFlowMap";

// ─── CONFIG ────────────────────────────────────────────────

const MODE_CONFIG = {
  sea: { label: "Maritime", icon: "fa-ship", badge: "info", color: "#0dcaf0" },
  air: {
    label: "Aérien",
    icon: "fa-plane",
    badge: "primary",
    color: "#0d6efd",
  },
  road: {
    label: "Routier",
    icon: "fa-truck",
    badge: "warning",
    color: "#ffc107",
  },
  multi: {
    label: "Multimodal",
    icon: "fa-route",
    badge: "success",
    color: "#198754",
  },
};

const STATUS_CONFIG = {
  in_transit: { label: "En transit", badge: "primary" },
  on_vessel: { label: "En mer", badge: "primary" },
  at_dest_port: { label: "Au port", badge: "warning" },
  at_origin_port: { label: "Port origine", badge: "warning" },
  customs: { label: "Dédouanement", badge: "warning" },
  on_hold: { label: "Bloquée", badge: "danger" },
  out_for_delivery: { label: "En livraison", badge: "info" },
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const mo = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  return `${d} ${mo[+m - 1]} ${y}`;
};

// Expéditions actives en transit (données de démo, remplacer par API)
const DEMO_SHIPMENTS = [
  {
    id: "uuid-1",
    reference: "TFA-2025-00042",
    transport_mode: "sea",
    status: "on_vessel",
    status_display: "En mer",
    goods_description: "Équipements informatiques",
    origin_country: "CN",
    origin_port_or_city: "Shanghai",
    destination_country: "BJ",
    destination_port_or_city: "Cotonou",
    estimated_arrival: "2025-02-10",
    freight_forwarder_name: "MAERSK Bénin",
    declared_value: "18500000",
    currency: "XOF",
    vessel: {
      name: "MSC COTONOU",
      lat: 8.5,
      lng: 18.2,
      heading: 255,
      speed: 14.2,
      progress: 62,
    },
  },
  {
    id: "uuid-2",
    reference: "TFA-2025-00041",
    transport_mode: "sea",
    status: "at_dest_port",
    status_display: "Au port",
    goods_description: "Matériaux de construction",
    origin_country: "FR",
    origin_port_or_city: "Marseille",
    destination_country: "BJ",
    destination_port_or_city: "Cotonou",
    estimated_arrival: "2025-01-28",
    freight_forwarder_name: "CMA CGM Bénin",
    declared_value: "9200000",
    currency: "XOF",
    vessel: {
      name: "CMA CGM ABIDJAN",
      lat: 6.35,
      lng: 2.43,
      heading: 180,
      speed: 0,
      progress: 100,
    },
  },
  {
    id: "uuid-3",
    reference: "TFA-2025-00039",
    transport_mode: "road",
    status: "in_transit",
    status_display: "En transit",
    goods_description: "Génératrices électriques",
    origin_country: "GH",
    origin_port_or_city: "Accra",
    destination_country: "BJ",
    destination_port_or_city: "Cotonou",
    estimated_arrival: "2025-02-03",
    freight_forwarder_name: "Trans-ECOWAS",
    declared_value: "8900000",
    currency: "XOF",
    road: {
      plate: "BJ4521RB",
      driver: "Kofi Asante",
      lat: 7.1,
      lng: 1.2,
      progress: 45,
    },
  },
  {
    id: "uuid-4",
    reference: "TFA-2025-00038",
    transport_mode: "sea",
    status: "on_vessel",
    status_display: "En mer",
    goods_description: "Équipements solaires",
    origin_country: "CN",
    origin_port_or_city: "Guangzhou",
    destination_country: "BJ",
    destination_port_or_city: "Cotonou",
    estimated_arrival: "2025-02-20",
    freight_forwarder_name: "MAERSK Bénin",
    declared_value: "41200000",
    currency: "XOF",
    vessel: {
      name: "COSCO AFRICA",
      lat: 3.2,
      lng: 8.8,
      heading: 210,
      speed: 16.1,
      progress: 30,
    },
  },
  {
    id: "uuid-5",
    reference: "TFA-2025-00037",
    transport_mode: "sea",
    status: "on_hold",
    status_display: "Bloquée",
    goods_description: "Produits chimiques",
    origin_country: "NL",
    origin_port_or_city: "Rotterdam",
    destination_country: "BJ",
    destination_port_or_city: "Cotonou",
    estimated_arrival: "2025-01-30",
    freight_forwarder_name: "Bolloré Logistics",
    declared_value: "7400000",
    currency: "XOF",
    vessel: {
      name: "HAPAG LLOYD 1",
      lat: 6.35,
      lng: 2.43,
      heading: 0,
      speed: 0,
      progress: 88,
    },
  },
];

// ─── SOUS-COMPOSANTS ───────────────────────────────────────

const KpiCard = ({ icon, label, value, badge, sub }) => (
  <div className="col-6 col-xl-3">
    <div className="card h-100">
      <div className="card-body d-flex align-items-center gap-3 py-3">
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle bg-${badge}-subtle flex-shrink-0`}
          style={{ width: 44, height: 44 }}
        >
          <span className={`fas ${icon} text-${badge} fs-8`} />
        </div>
        <div>
          <p className="mb-0 fs-10 fw-semibold text-body-tertiary text-uppercase">
            {label}
          </p>
          <h4 className="mb-0 text-body-highlight">{value}</h4>
          {sub && <p className="mb-0 fs-11 text-body-tertiary">{sub}</p>}
        </div>
      </div>
    </div>
  </div>
);

const ShipmentListItem = ({ s, selected, onClick }) => {
  const mode = MODE_CONFIG[s.transport_mode] ?? MODE_CONFIG.sea;
  const st = STATUS_CONFIG[s.status] ?? {
    label: s.status_display,
    badge: "secondary",
  };
  const pos = s.vessel ?? s.road;
  const isBlocked = s.status === "on_hold";

  return (
    <div
      className={`p-3 border-bottom cursor-pointer transition-bg ${selected ? "bg-primary-subtle" : "hover-bg-body-tertiary"}`}
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <span
            className={`fas ${mode.icon} text-${mode.badge} flex-shrink-0`}
            style={{ fontSize: 13 }}
          />
          <NavLink
            className="fw-bold text-primary fs-9 text-truncate"
            to={`/expeditions/${s.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {s.reference}
          </NavLink>
        </div>
        <span
          className={`badge badge-phoenix badge-phoenix-${st.badge} fs-11 flex-shrink-0`}
        >
          {st.label}
        </span>
      </div>
      <p className="mb-1 fs-10 text-body-tertiary text-truncate">
        {s.goods_description}
      </p>
      <div className="d-flex align-items-center justify-content-between">
        <span className="fs-10 text-body-tertiary">
          <span className="fas fa-circle-dot me-1 opacity-50" />
          {s.origin_port_or_city}
          <span className="fas fa-arrow-right mx-1 opacity-50" />
          <strong className="text-body">{s.destination_port_or_city}</strong>
        </span>
        {pos && (
          <span className="fs-11 text-body-tertiary">{pos.progress}%</span>
        )}
      </div>
      {pos && (
        <div className="progress mt-2" style={{ height: 3 }}>
          <div
            className={`progress-bar bg-${isBlocked ? "danger" : mode.badge}`}
            style={{ width: `${pos.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

const ShipmentDetailPanel = ({ s, onClose }) => {
  if (!s) return null;
  const mode = MODE_CONFIG[s.transport_mode] ?? MODE_CONFIG.sea;
  const st = STATUS_CONFIG[s.status] ?? {
    label: s.status_display,
    badge: "secondary",
  };
  const pos = s.vessel ?? s.road;

  return (
    <div
      className="position-absolute end-0 top-0 h-100 bg-body shadow-lg border-start"
      style={{ width: 320, zIndex: 10, overflowY: "auto" }}
    >
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
        <div>
          <NavLink
            className="fw-bold text-primary fs-8"
            to={`/expeditions/${s.id}`}
          >
            {s.reference}
          </NavLink>
          <p className="mb-0 fs-10 text-body-tertiary">{s.goods_description}</p>
        </div>
        <button
          className="btn btn-sm btn-phoenix-secondary p-1"
          onClick={onClose}
        >
          <span className="fas fa-times" />
        </button>
      </div>

      <div className="p-3">
        {/* Statut & Mode */}
        <div className="d-flex gap-2 mb-3">
          <span className={`badge badge-phoenix badge-phoenix-${st.badge}`}>
            {st.label}
          </span>
          <span className={`badge badge-phoenix badge-phoenix-${mode.badge}`}>
            <span className={`fas ${mode.icon} me-1`} />
            {mode.label}
          </span>
        </div>

        {/* Route */}
        <div className="mb-3">
          <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-2">
            Route
          </p>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="fas fa-circle-dot text-body-quaternary" />
              <span className="fs-9">
                {s.origin_port_or_city}{" "}
                <span className="badge bg-body-secondary text-body fw-normal">
                  {s.origin_country}
                </span>
              </span>
            </div>
            <div
              className="ms-1 border-start border-dashed"
              style={{ height: 16, marginLeft: 6 }}
            />
            <div className="d-flex align-items-center gap-2">
              <span className="fas fa-map-marker-alt text-primary" />
              <span className="fs-9 fw-semibold">
                {s.destination_port_or_city}{" "}
                <span className="badge bg-body-secondary text-body fw-normal">
                  {s.destination_country}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Progression */}
        {pos && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-0">
                Progression
              </p>
              <span className="fs-10 fw-bold text-body">{pos.progress}%</span>
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div
                className={`progress-bar bg-${mode.badge}`}
                style={{ width: `${pos.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Infos navire */}
        {s.vessel && (
          <div className="card bg-body-tertiary border-0 mb-3">
            <div className="card-body py-2 px-3">
              <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-2">
                Navire
              </p>
              <p className="mb-1 fs-9 fw-semibold">{s.vessel.name}</p>
              <div className="row g-2">
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">Vitesse</p>
                  <p className="mb-0 fs-10 fw-semibold">{s.vessel.speed} kn</p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">Cap</p>
                  <p className="mb-0 fs-10 fw-semibold">{s.vessel.heading}°</p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">Latitude</p>
                  <p className="mb-0 fs-10 fw-semibold">
                    {s.vessel.lat.toFixed(4)}°
                  </p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">Longitude</p>
                  <p className="mb-0 fs-10 fw-semibold">
                    {s.vessel.lng.toFixed(4)}°
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infos camion */}
        {s.road && (
          <div className="card bg-body-tertiary border-0 mb-3">
            <div className="card-body py-2 px-3">
              <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-2">
                Véhicule
              </p>
              <div className="row g-2">
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">
                    Immatriculation
                  </p>
                  <p className="mb-0 fs-10 fw-semibold">{s.road.plate}</p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">Chauffeur</p>
                  <p className="mb-0 fs-10 fw-semibold">{s.road.driver}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dates & Partenaire */}
        <div className="mb-3">
          <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-2">
            Détails
          </p>
          <div className="d-flex justify-content-between mb-1">
            <span className="fs-10 text-body-tertiary">ETA</span>
            <span className="fs-10 fw-semibold">
              {fmtDate(s.estimated_arrival)}
            </span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="fs-10 text-body-tertiary">Transitaire</span>
            <span className="fs-10 fw-semibold">
              {s.freight_forwarder_name ?? "—"}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="fs-10 text-body-tertiary">Valeur déclarée</span>
            <span className="fs-10 fw-semibold">
              {Number(s.declared_value).toLocaleString("fr-FR")} {s.currency}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <NavLink
            className="btn btn-sm btn-primary flex-grow-1"
            to={`/expeditions/${s.id}`}
          >
            <span className="fas fa-folder-open me-2" />
            Ouvrir
          </NavLink>
          <NavLink
            className="btn btn-sm btn-phoenix-secondary"
            to={`/documents?shipment=${s.id}`}
          >
            <span className="fas fa-file-alt" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};

// ─── CARTE PLACEHOLDER ─────────────────────────────────────
// En production : remplacer par Leaflet / Mapbox / Google Maps

const MapPlaceholder = ({ shipments, selectedId, onSelect }) => (
  <div
    className="position-relative w-100 h-100 bg-body-tertiary overflow-hidden rounded-2"
    style={{
      minHeight: 480,
      background:
        "linear-gradient(135deg, #e8f4f8 0%, #d4e8f0 50%, #c8e0ea 100%)",
    }}
  >
    {/* Grille décorative */}
    <svg
      className="position-absolute w-100 h-100 opacity-25"
      style={{ top: 0, left: 0 }}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#0dcaf0"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>

    {/* Continents simplifiés (SVG décoratif) */}
    <svg
      viewBox="0 0 1000 500"
      className="position-absolute w-100 h-100 opacity-20"
      style={{ top: 0, left: 0 }}
    >
      {/* Afrique */}
      <ellipse cx="520" cy="280" rx="65" ry="90" fill="#6c757d" />
      {/* Europe */}
      <ellipse cx="505" cy="170" rx="50" ry="35" fill="#6c757d" />
      {/* Asie */}
      <ellipse cx="680" cy="190" rx="120" ry="65" fill="#6c757d" />
      {/* Amériques */}
      <ellipse cx="260" cy="210" rx="65" ry="100" fill="#6c757d" />
    </svg>

    {/* Message intégration carte */}
    <div className="position-absolute top-50 start-50 translate-middle text-center z-5">
      <div className="card border shadow-sm px-4 py-3">
        <span className="fas fa-map-marked-alt fs-4 text-primary mb-2" />
        <p className="fs-9 mb-1 fw-semibold">Carte interactive</p>
        <p className="fs-10 text-body-tertiary mb-2">
          Intégrer Leaflet.js ou Mapbox
          <br />
          pour afficher les positions réelles
        </p>
        <code className="fs-11 text-body-tertiary">
          npm install leaflet react-leaflet
        </code>
      </div>
    </div>

    {/* Marqueurs simulés */}
    {shipments.map((s) => {
      const pos = s.vessel ?? s.road;
      const mode = MODE_CONFIG[s.transport_mode] ?? MODE_CONFIG.sea;
      if (!pos) return null;

      // Convertit lat/lng en % de la zone visible (approximatif pour la démo)
      const x = ((pos.lng + 20) / 80) * 100;
      const y = ((20 - pos.lat) / 40) * 100;
      const isSelected = s.id === selectedId;
      const isBlocked = s.status === "on_hold";

      return (
        <div
          key={s.id}
          className="position-absolute"
          style={{
            left: `${Math.max(5, Math.min(90, x))}%`,
            top: `${Math.max(5, Math.min(90, y))}%`,
            transform: "translate(-50%, -50%)",
            zIndex: isSelected ? 20 : 10,
            cursor: "pointer",
          }}
          onClick={() => onSelect(s)}
        >
          {/* Pulse pour les bloquées */}
          {isBlocked && (
            <div
              className="position-absolute top-50 start-50 translate-middle rounded-circle bg-danger opacity-25"
              style={{
                width: 32,
                height: 32,
                animation: "pulse 1.5s infinite",
              }}
            />
          )}
          <div
            className={`d-flex align-items-center justify-content-center rounded-circle border-2 shadow ${isSelected ? "border-primary" : "border-white"}`}
            style={{
              width: isSelected ? 36 : 28,
              height: isSelected ? 36 : 28,
              backgroundColor: isBlocked ? "#dc3545" : mode.color,
              transition: "all .2s",
            }}
          >
            <span
              className={`fas ${mode.icon} text-white`}
              style={{ fontSize: isSelected ? 14 : 11 }}
            />
          </div>
          {isSelected && (
            <div
              className="position-absolute bg-body rounded-2 shadow px-2 py-1 text-nowrap fs-11 fw-semibold"
              style={{
                bottom: "calc(100% + 6px)",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {s.reference}
            </div>
          )}
        </div>
      );
    })}

    {/* Légende */}
    <div className="position-absolute bottom-0 start-0 m-3">
      <div className="card border shadow-sm">
        <div className="card-body py-2 px-3">
          <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-2">
            Légende
          </p>
          {Object.entries(MODE_CONFIG).map(([k, v]) => (
            <div key={k} className="d-flex align-items-center gap-2 mb-1">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 18, height: 18, backgroundColor: v.color }}
              >
                <span
                  className={`fas ${v.icon} text-white`}
                  style={{ fontSize: 8 }}
                />
              </div>
              <span className="fs-11 text-body-tertiary">{v.label}</span>
            </div>
          ))}
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
              style={{ width: 18, height: 18 }}
            >
              <span
                className="fas fa-exclamation text-white"
                style={{ fontSize: 8 }}
              />
            </div>
            <span className="fs-11 text-danger fw-semibold">Bloquée</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────

export default function TrackingMapPage() {
  const [shipments, setShipments] = useState(DEMO_SHIPMENTS);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modeFilter, setModeFilter] = useState("");
  const [search, setSearch] = useState("");

  // En production : fetch depuis l'API
  // useEffect(() => {
  //   setLoading(true);
  //   axiosClient.get("/shipments/", { params: { is_archived: false, status: "in_transit,on_vessel,at_dest_port,customs,on_hold,out_for_delivery" } })
  //     .then(({ data }) => setShipments(data.results))
  //     .finally(() => setLoading(false));
  // }, []);

  const filtered = useMemo(
    () =>
      shipments.filter((s) => {
        if (modeFilter && s.transport_mode !== modeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            s.reference.toLowerCase().includes(q) ||
            s.goods_description.toLowerCase().includes(q) ||
            s.origin_port_or_city.toLowerCase().includes(q) ||
            s.destination_port_or_city.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [shipments, modeFilter, search],
  );

  // KPIs
  const kpis = useMemo(
    () => ({
      active: shipments.length,
      sea: shipments.filter((s) => s.transport_mode === "sea").length,
      road: shipments.filter((s) => s.transport_mode === "road").length,
      blocked: shipments.filter((s) => s.status === "on_hold").length,
    }),
    [shipments],
  );

  return (
    <div className="pb-6">
      {/* EN-TÊTE */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-1">Carte mondiale</h2>
          <p className="text-body-tertiary mb-0 fs-9">
            Suivi en temps réel des expéditions actives
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1 px-3 py-2">
            <span
              className="fas fa-circle fs-11"
              style={{ animation: "pulse 2s infinite" }}
            />
            En direct
          </span>
          <NavLink
            className="btn btn-phoenix-secondary btn-sm"
            to="/expeditions"
          >
            <span className="fas fa-list me-2" />
            Liste des expéditions
          </NavLink>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <KpiCard
          icon="fa-boxes-stacked"
          label="Expéditions actives"
          value={kpis.active}
          badge="primary"
          sub="En cours de transit"
        />
        <KpiCard
          icon="fa-ship"
          label="En mer"
          value={kpis.sea}
          badge="info"
          sub="Navires suivis"
        />
        <KpiCard
          icon="fa-truck"
          label="Routier"
          value={kpis.road}
          badge="warning"
          sub="Véhicules en route"
        />
        <KpiCard
          icon="fa-triangle-exclamation"
          label="Bloquées"
          value={kpis.blocked}
          badge="danger"
          sub="Intervention requise"
        />
      </div>

      {/* CORPS — Liste + Carte */}
      <div className="card">
        <div className="card-body p-0">
          <div className="row g-0" style={{ minHeight: 580 }}>
            {/* ── PANNEAU GAUCHE — Liste ── */}
            <div
              className="col-12 col-lg-4 col-xl-3 border-end d-flex flex-column"
              style={{ maxHeight: 580 }}
            >
              {/* Filtres */}
              <div className="p-3 border-bottom">
                <div className="position-relative mb-2">
                  <input
                    className="form-control form-control-sm search-input"
                    type="search"
                    placeholder="Référence, marchandise…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span
                    className="fas fa-search search-box-icon"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
                <div className="d-flex gap-1 flex-wrap">
                  <button
                    className={`btn btn-xs py-1 px-2 fs-11 ${!modeFilter ? "btn-primary" : "btn-phoenix-secondary"}`}
                    onClick={() => setModeFilter("")}
                  >
                    Tous
                  </button>
                  {Object.entries(MODE_CONFIG).map(([k, v]) => (
                    <button
                      key={k}
                      className={`btn btn-xs py-1 px-2 fs-11 ${modeFilter === k ? `btn-phoenix-${v.badge}` : "btn-phoenix-secondary"}`}
                      onClick={() => setModeFilter(modeFilter === k ? "" : k)}
                    >
                      <span className={`fas ${v.icon} me-1`} />
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste scrollable */}
              <div className="overflow-auto flex-grow-1">
                {loading ? (
                  <div className="text-center py-5 text-body-tertiary">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Chargement…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-5 text-body-tertiary">
                    <span className="fas fa-map-marker-alt fs-4 d-block mb-2 opacity-50" />
                    Aucune expédition active
                  </div>
                ) : (
                  filtered.map((s) => (
                    <ShipmentListItem
                      key={s.id}
                      s={s}
                      selected={selected?.id === s.id}
                      onClick={() =>
                        setSelected(selected?.id === s.id ? null : s)
                      }
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-top">
                <p className="mb-0 fs-10 text-body-tertiary text-center">
                  {filtered.length} expédition{filtered.length !== 1 ? "s" : ""}{" "}
                  affichée{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* ── PANNEAU DROIT — Carte ── */}
            <div
              className="col-12 col-lg-8 col-xl-9 position-relative"
              style={{ minHeight: 480 }}
            >
              <div className="p-3" style={{ height: "100%" }}>
                <TradeFlowMap
                  shipments={filtered}
                  selectedId={selected?.id}
                  onSelect={(s) =>
                    setSelected(selected?.id === s.id ? null : s)
                  }
                />
              </div>

              {/* Panneau détail glissant */}
              <ShipmentDetailPanel
                s={selected}
                onClose={() => setSelected(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
