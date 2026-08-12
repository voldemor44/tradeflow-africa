import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { NavLink } from "react-router-dom";
import axiosClient from "../axios-client";
import { useTranslation } from "react-i18next";

// La carte (mapbox-gl) est chargée à la demande : chunk séparé,
// pas téléchargé tant que la page n'est pas ouverte.
const TradeFlowMap = lazy(() => import("../components/TradeFlowMap"));

// ─── CONFIG ────────────────────────────────────────────────

const getModeConfig = (t) => ({
  sea: { label: t("expeditions.modeSea"), icon: "fa-ship", badge: "info", color: "#0dcaf0" },
  air: {
    label: t("expeditions.modeAir"),
    icon: "fa-plane",
    badge: "primary",
    color: "#0d6efd",
  },
  road: {
    label: t("expeditions.modeRoad"),
    icon: "fa-truck",
    badge: "warning",
    color: "#ffc107",
  },
  multi: {
    label: t("expeditions.modeMulti"),
    icon: "fa-route",
    badge: "success",
    color: "#198754",
  },
});

const getStatusConfig = (t) => ({
  in_transit: { label: t("expeditions.statusInTransit"), badge: "primary" },
  on_vessel: { label: t("expeditions.statusOnVessel"), badge: "primary" },
  at_dest_port: { label: t("expeditions.statusAtDest"), badge: "warning" },
  at_origin_port: { label: t("expeditions.statusAtOrigin"), badge: "warning" },
  customs: { label: t("expeditions.statusCustoms"), badge: "warning" },
  on_hold: { label: t("expeditions.statusOnHold"), badge: "danger" },
  out_for_delivery: { label: t("expeditions.statusOutForDelivery"), badge: "info" },
});

const MONTHS = [
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

// Gère aussi les horodatages complets ("2025-02-10T00:00:00Z")
const fmtDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  const mm = +m - 1;
  if (!y || !m || !d || mm < 0 || mm > 11) return "—";
  return `${d} ${MONTHS[mm]} ${y}`;
};

// Valeur finie sinon "—" (évite les "NaN" à l'écran)
const fmtFinite = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : "—";
};

const fmtFixed = (v, digits = 4) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
};

// Progression estimée entre deux dates
const computeProgress = (etd, eta) => {
  if (!etd || !eta) return 0;
  const start = new Date(etd).getTime();
  const end = new Date(eta).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
};

// ─── SOUS-COMPOSANTS ───────────────────────────────────────

const KpiCard = memo(({ icon, label, value, badge, sub }) => (
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
));

const ShipmentListItem = memo(function ShipmentListItem({
  s,
  selected,
  onSelect,
}) {
  const { t } = useTranslation();
  const MODE_CONFIG = useMemo(() => getModeConfig(t), [t]);
  const STATUS_CONFIG = useMemo(() => getStatusConfig(t), [t]);
  const mode = MODE_CONFIG[s.transport_mode] ?? MODE_CONFIG.sea;
  const st = STATUS_CONFIG[s.status] ?? {
    label: s.status_display,
    badge: "secondary",
  };
  const pos = s.vessel ?? s.road;
  const isBlocked = s.status === "on_hold";
  const progress = pos?.progress ?? 0;

  return (
    <div
      className={`p-3 border-bottom ${selected ? "bg-primary-subtle" : ""}`}
      style={{ cursor: "pointer", transition: "background .15s" }}
      onClick={() => onSelect(s)}
      onMouseEnter={(e) => {
        if (!selected)
          e.currentTarget.style.background = "var(--phoenix-body-tertiary-bg)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "";
      }}
    >
      {/* Ligne 1 — référence + badge statut */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <span
            className={`fas ${mode.icon} text-${mode.badge} flex-shrink-0`}
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
          className={`badge badge-phoenix badge-phoenix-${st.badge} flex-shrink-0`}
        >
          {st.label}
        </span>
      </div>

      {/* Ligne 2 — description */}
      <p className="mb-2 fs-9 text-body-tertiary text-truncate">
        {s.goods_description}
      </p>

      {/* Ligne 3 — route */}
      <div className="d-flex align-items-center gap-1 mb-2 fs-9">
        <span className="text-body-quaternary">
          <span className="fas fa-circle-dot me-1" style={{ fontSize: 9 }} />
          {s.origin_port_or_city}
        </span>
        <span
          className="fas fa-arrow-right text-body-quaternary"
          style={{ fontSize: 9 }}
        />
        <span className="fw-semibold text-body">
          {s.destination_port_or_city}
        </span>
      </div>

      {/* Barre de progression + % */}
      {pos && (
        <>
          <div className="d-flex justify-content-between mb-1">
            <span className="fs-10 text-body-tertiary">
              {t("trackingMap.progression")}
            </span>
            <span
              className={`fs-10 fw-semibold ${isBlocked ? "text-danger" : "text-body"}`}
            >
              {progress}%
            </span>
          </div>
          <div className="progress" style={{ height: 5 }}>
            <div
              className={`progress-bar bg-${isBlocked ? "danger" : mode.badge}`}
              style={{
                width: `${progress}%`,
                transition: "width .4s ease",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
});

const ShipmentDetailPanel = memo(function ShipmentDetailPanel({ s, onClose }) {
  const { t } = useTranslation();
  const MODE_CONFIG = useMemo(() => getModeConfig(t), [t]);
  const STATUS_CONFIG = useMemo(() => getStatusConfig(t), [t]);
  if (!s) return null;
  const mode = MODE_CONFIG[s.transport_mode] ?? MODE_CONFIG.sea;
  const st = STATUS_CONFIG[s.status] ?? {
    label: s.status_display,
    badge: "secondary",
  };
  const pos = s.vessel ?? s.road;
  const progress = pos?.progress ?? 0;
  const declared = Number(s.declared_value);

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
            {t("trackingMap.route")}
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
                {t("trackingMap.progression")}
              </p>
              <span className="fs-10 fw-bold text-body">{progress}%</span>
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div
                className={`progress-bar bg-${mode.badge}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Infos navire */}
        {s.vessel && (
          <div className="card bg-body-tertiary border-0 mb-3">
            <div className="card-body py-2 px-3">
              <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-2">
                {t("trackingMap.vessel")}
              </p>
              <p className="mb-1 fs-9 fw-semibold">{s.vessel.name}</p>
              <div className="row g-2">
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">{t("trackingMap.speed")}</p>
                  <p className="mb-0 fs-10 fw-semibold">{fmtFinite(s.vessel.speed)} kn</p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">{t("trackingMap.heading")}</p>
                  <p className="mb-0 fs-10 fw-semibold">{fmtFinite(s.vessel.heading)}°</p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">{t("trackingMap.latitude")}</p>
                  <p className="mb-0 fs-10 fw-semibold">
                    {fmtFixed(s.vessel.lat)}°
                  </p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">{t("trackingMap.longitude")}</p>
                  <p className="mb-0 fs-10 fw-semibold">
                    {fmtFixed(s.vessel.lng)}°
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
                {t("trackingMap.vehicle")}
              </p>
              <div className="row g-2">
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">
                    {t("trackingMap.licensePlate")}
                  </p>
                  <p className="mb-0 fs-10 fw-semibold">{s.road.plate}</p>
                </div>
                <div className="col-6">
                  <p className="mb-0 fs-11 text-body-tertiary">{t("trackingMap.driver")}</p>
                  <p className="mb-0 fs-10 fw-semibold">{s.road.driver}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dates & Partenaire */}
        <div className="mb-3">
          <p className="fs-11 fw-semibold text-body-tertiary text-uppercase mb-2">
            {t("trackingMap.details")}
          </p>
          <div className="d-flex justify-content-between mb-1">
            <span className="fs-10 text-body-tertiary">{t("trackingMap.eta")}</span>
            <span className="fs-10 fw-semibold">
              {fmtDate(s.estimated_arrival)}
            </span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="fs-10 text-body-tertiary">{t("trackingMap.forwarder")}</span>
            <span className="fs-10 fw-semibold">
              {s.freight_forwarder_name ?? "—"}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="fs-10 text-body-tertiary">{t("trackingMap.declaredValue")}</span>
            <span className="fs-10 fw-semibold">
              {Number.isFinite(declared)
                ? declared.toLocaleString("fr-FR")
                : "—"}{" "}
              {s.currency}
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
            {t("trackingMap.open")}
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
});

// Fallback affiché pendant le chargement du chunk de la carte
const MapSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div
      className="d-flex align-items-center justify-content-center w-100 h-100 bg-body-tertiary rounded-2"
      style={{ minHeight: 480 }}
    >
      <div className="text-center text-body-tertiary">
        <span className="spinner-border spinner-border-sm me-2" />
        {t("trackingMap.loading")}
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────

export default function TrackingMapPage() {
  const { t } = useTranslation();
  const MODE_CONFIG = useMemo(() => getModeConfig(t), [t]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modeFilter, setModeFilter] = useState("");
  const [search, setSearch] = useState("");

  // Sélection/déselection (identité stable → pas de re-rendu de la liste)
  const toggleSelect = useCallback((s) => {
    setSelected((prev) => (prev?.id === s.id ? null : s));
  }, []);

  const clearSelection = useCallback(() => setSelected(null), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([
      axiosClient.get("/shipments/", {
        params: {
          is_archived: false,
          status:
            "in_transit,on_vessel,at_dest_port,customs,on_hold,out_for_delivery",
        },
      }),
      axiosClient.get("/tracking/vessel/"),
      axiosClient.get("/tracking/road/"),
    ])
      .then(
        ([
          { data: shipmentsData },
          { data: vesselData },
          { data: roadData },
        ]) => {
          if (cancelled) return;

          // Indexe les trackings par shipment ID pour lookup O(1)
          const vesselByShipment = {};
          (vesselData.results ?? vesselData).forEach((v) => {
            vesselByShipment[v.shipment] = v;
          });

          const roadByShipment = {};
          (roadData.results ?? roadData).forEach((r) => {
            roadByShipment[r.shipment] = r;
          });

          // Fusionne chaque expédition avec son tracking
          const enriched = (shipmentsData.results ?? shipmentsData)
            .map((s) => {
              const vessel = vesselByShipment[s.id];
              const road = roadByShipment[s.id];

              return {
                ...s,
                // Normalise vers le format attendu par TradeFlowMap
                vessel: vessel
                  ? {
                      name: vessel.vessel_name,
                      lat: parseFloat(vessel.current_latitude),
                      lng: parseFloat(vessel.current_longitude),
                      heading: vessel.current_heading ?? 0,
                      speed: parseFloat(vessel.current_speed_knots ?? 0),
                      progress: computeProgress(
                        s.estimated_departure,
                        s.estimated_arrival,
                      ), // calculé ci-dessous
                    }
                  : null,
                road: road
                  ? {
                      plate: road.vehicle_plate,
                      driver: road.driver_name,
                      lat: parseFloat(road.current_latitude),
                      lng: parseFloat(road.current_longitude),
                      progress: computeProgress(
                        s.estimated_departure,
                        s.estimated_arrival,
                      ),
                    }
                  : null,
              };
            })
            // Ne garde que ceux qui ont une position connue
            .filter((s) => s.vessel?.lat || s.road?.lat);

          setShipments(enriched);
        },
      )
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      shipments.filter((s) => {
        if (modeFilter && s.transport_mode !== modeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            (s.reference ?? "").toLowerCase().includes(q) ||
            (s.goods_description ?? "").toLowerCase().includes(q) ||
            (s.origin_port_or_city ?? "").toLowerCase().includes(q) ||
            (s.destination_port_or_city ?? "").toLowerCase().includes(q)
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
          <h2 className="mb-1">{t("trackingMap.worldMap")}</h2>
          <p className="text-body-tertiary mb-0 fs-9">
            {t("trackingMap.realtimeSubtitle")}
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1 px-3 py-2">
            <span
              className="fas fa-circle fs-11"
              style={{ animation: "pulse 2s infinite" }}
            />
            {t("trackingMap.live")}
          </span>
          <NavLink
            className="btn btn-phoenix-secondary btn-sm"
            to="/expeditions"
          >
            <span className="fas fa-list me-2" />
            {t("trackingMap.listExpeditions")}
          </NavLink>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <KpiCard
          icon="fa-boxes-stacked"
          label={t("trackingMap.activeShipments")}
          value={kpis.active}
          badge="primary"
          sub={t("trackingMap.inTransit")}
        />
        <KpiCard
          icon="fa-ship"
          label={t("trackingMap.atSea")}
          value={kpis.sea}
          badge="info"
          sub={t("trackingMap.trackedVessels")}
        />
        <KpiCard
          icon="fa-truck"
          label={t("trackingMap.road")}
          value={kpis.road}
          badge="warning"
          sub={t("trackingMap.vehiclesOnRoad")}
        />
        <KpiCard
          icon="fa-triangle-exclamation"
          label={t("trackingMap.blocked")}
          value={kpis.blocked}
          badge="danger"
          sub={t("trackingMap.actionRequired")}
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
              {/* ── Filtres ── */}
              <div className="p-3 border-bottom">
                {/* Champ de recherche — search-box Phoenix */}
                <div className="search-box mb-3">
                  <input
                    className="form-control search-input"
                    type="search"
                    placeholder={t("trackingMap.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="fas fa-search search-box-icon" />
                </div>

                {/* Filtres mode — taille normale */}
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className={`btn btn-sm ${!modeFilter ? "btn-primary" : "btn-phoenix-secondary"}`}
                    onClick={() => setModeFilter("")}
                  >
                    {t("trackingMap.all")}
                  </button>
                  {Object.entries(MODE_CONFIG).map(([k, v]) => (
                    <button
                      key={k}
                      className={`btn btn-sm ${modeFilter === k ? `btn-phoenix-${v.badge}` : "btn-phoenix-secondary"}`}
                      onClick={() => setModeFilter(modeFilter === k ? "" : k)}
                    >
                      <span className={`fas ${v.icon} me-2`} />
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Liste scrollable ── */}
              <div className="overflow-auto flex-grow-1">
                {loading ? (
                  <div className="text-center py-6 text-body-tertiary">
                    <span className="spinner-border spinner-border-sm me-2" />
                    {t("trackingMap.loading")}
                  </div>
                ) : error ? (
                  <div className="text-center py-6 text-body-tertiary">
                    <span className="fas fa-triangle-exclamation fs-3 d-block mb-2 opacity-50" />
                    <p className="mb-0 fs-9">{t("trackingMap.loadError")}</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-6 text-body-tertiary">
                    <span className="fas fa-map-marker-alt fs-3 d-block mb-2 opacity-50" />
                    <p className="mb-0 fs-9">{t("trackingMap.noActiveShipments")}</p>
                  </div>
                ) : (
                  filtered.map((s) => (
                    <ShipmentListItem
                      key={s.id}
                      s={s}
                      selected={selected?.id === s.id}
                      onSelect={toggleSelect}
                    />
                  ))
                )}
              </div>

              {/* ── Footer ── */}
              <div className="p-3 border-top bg-body-tertiary">
                <p className="mb-0 fs-9 text-body-tertiary text-center">
                  <span className="fas fa-layer-group me-2 opacity-50" />
                  {filtered.length} {t("trackingMap.expedition")}
                  {filtered.length !== 1 ? "s" : ""}{" "}
                  {t("trackingMap.displayed")}
                  {filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* ── PANNEAU DROIT — Carte ── */}
            <div
              className="col-12 col-lg-8 col-xl-9 position-relative"
              style={{ minHeight: 480 }}
            >
              <div className="p-3" style={{ height: "100%" }}>
                <Suspense fallback={<MapSkeleton />}>
                  <TradeFlowMap
                    shipments={filtered}
                    selectedId={selected?.id}
                    onSelect={toggleSelect}
                  />
                </Suspense>
              </div>

              {/* Panneau détail glissant */}
              <ShipmentDetailPanel
                s={selected}
                onClose={clearSelection}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
