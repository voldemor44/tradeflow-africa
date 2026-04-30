import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import axiosClient from "../axios-client";

// ─── CONFIG ────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft: { label: "Brouillon", badge: "secondary", icon: "fa-pencil" },
  booking: { label: "Réservation", badge: "info", icon: "fa-calendar-check" },
  goods_ready: { label: "Prêt", badge: "info", icon: "fa-box-open" },
  in_transit: { label: "En transit", badge: "primary", icon: "fa-route" },
  at_origin_port: {
    label: "Port origine",
    badge: "warning",
    icon: "fa-anchor",
  },
  on_vessel: { label: "En mer", badge: "primary", icon: "fa-ship" },
  at_dest_port: { label: "Au port", badge: "warning", icon: "fa-anchor" },
  customs: { label: "Dédouanement", badge: "warning", icon: "fa-stamp" },
  cleared: { label: "Dédouané", badge: "success", icon: "fa-check" },
  out_for_delivery: { label: "En livraison", badge: "info", icon: "fa-truck" },
  delivered: { label: "Livré", badge: "success", icon: "fa-circle-check" },
  on_hold: {
    label: "Bloquée",
    badge: "danger",
    icon: "fa-triangle-exclamation",
  },
  cancelled: { label: "Annulée", badge: "secondary", icon: "fa-ban" },
};

const MODE_CONFIG = {
  sea: { label: "Maritime", icon: "fa-ship", badge: "info" },
  air: { label: "Aérien", icon: "fa-plane", badge: "primary" },
  road: { label: "Routier", icon: "fa-truck", badge: "warning" },
  multi: { label: "Multimodal", icon: "fa-route", badge: "success" },
};

// Flux de statuts dans l'ordre chronologique
const STATUS_FLOW = [
  "draft",
  "booking",
  "goods_ready",
  "in_transit",
  "at_origin_port",
  "on_vessel",
  "at_dest_port",
  "customs",
  "cleared",
  "out_for_delivery",
  "delivered",
];

// ─── HELPERS ───────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
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

const fmtNum = (v) =>
  v != null
    ? Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 })
    : "—";

// ─── SOUS-COMPOSANTS ───────────────────────────────────────

// Section avec titre
const Section = ({ icon, title, children, action }) => (
  <div className="card mb-4">
    <div className="card-header d-flex align-items-center justify-content-between py-3">
      <div className="d-flex align-items-center gap-2">
        <span className={`fas ${icon} text-primary`} />
        <h6 className="mb-0 fw-bold">{title}</h6>
      </div>
      {action}
    </div>
    <div className="card-body">{children}</div>
  </div>
);

// Ligne de métadonnée label / valeur
const Meta = ({ label, value, className = "" }) => (
  <div
    className={`d-flex justify-content-between align-items-start py-2 border-bottom border-translucent ${className}`}
  >
    <span className="fs-9 text-body-tertiary flex-shrink-0 me-3">{label}</span>
    <span className="fs-9 fw-semibold text-end text-body">{value ?? "—"}</span>
  </div>
);

// Badge partenaire
const PartnerBadge = ({ partner, label }) => {
  if (!partner) return <span className="text-body-quaternary fs-9">—</span>;
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="avatar avatar-m flex-shrink-0">
        <div className="avatar-name rounded-circle bg-primary-subtle">
          <span className="text-primary fw-bold fs-10">
            {partner.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
      <div>
        <p className="mb-0 fs-9 fw-semibold">{partner.name}</p>
        <p className="mb-0 fs-10 text-body-tertiary">
          {partner.country}
          {partner.city ? ` · ${partner.city}` : ""}
        </p>
      </div>
    </div>
  );
};

// Barre de progression du statut
const StatusTimeline = ({ currentStatus, history }) => {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  const isBlocked = currentStatus === "on_hold";
  const isCancelled = currentStatus === "cancelled";

  return (
    <div>
      {/* Barre horizontale */}
      <div className="position-relative mb-4">
        <div className="d-flex align-items-center justify-content-between position-relative">
          {/* Ligne de fond */}
          <div
            className="position-absolute w-100 bg-body-secondary"
            style={{ height: 3, top: 14, zIndex: 0 }}
          />
          {/* Ligne de progression */}
          <div
            className={`position-absolute bg-${isBlocked ? "danger" : "primary"}`}
            style={{
              height: 3,
              top: 14,
              zIndex: 1,
              left: 0,
              width: isCancelled
                ? "100%"
                : `${Math.max(0, (currentIdx / (STATUS_FLOW.length - 1)) * 100)}%`,
              transition: "width .5s ease",
            }}
          />
          {STATUS_FLOW.map((s, i) => {
            const cfg = STATUS_CONFIG[s];
            const done = i < currentIdx;
            const active = s === currentStatus;
            return (
              <div
                key={s}
                className="d-flex flex-column align-items-center position-relative"
                style={{ zIndex: 2 }}
              >
                <div
                  className={`d-flex align-items-center justify-content-center rounded-circle border-2
                    ${done ? "bg-primary border-primary text-white" : ""}
                    ${active && !isBlocked ? "bg-primary border-primary text-white" : ""}
                    ${active && isBlocked ? "bg-danger border-danger text-white" : ""}
                    ${!done && !active ? "bg-body border-body-secondary text-body-tertiary" : ""}
                  `}
                  style={{ width: 30, height: 30, fontSize: 11 }}
                >
                  <span
                    className={`fas ${done ? "fa-check" : (cfg?.icon ?? "fa-circle")}`}
                    style={{ fontSize: 10 }}
                  />
                </div>
                <span
                  className={`mt-1 text-center fw-semibold d-none d-lg-block ${active ? (isBlocked ? "text-danger" : "text-primary") : done ? "text-body-tertiary" : "text-body-quaternary"}`}
                  style={{ fontSize: 9, maxWidth: 68, lineHeight: 1.2 }}
                >
                  {cfg?.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique */}
      {history?.length > 0 && (
        <div className="mt-4">
          <p className="fs-10 fw-semibold text-body-tertiary text-uppercase mb-3">
            Historique des changements
          </p>
          <div className="position-relative">
            {[...history].reverse().map((h, i) => {
              const cfg = STATUS_CONFIG[h.status] ?? {
                badge: "secondary",
                icon: "fa-circle",
                label: h.status_display,
              };
              return (
                <div key={h.id} className="d-flex gap-3 mb-3">
                  {/* Dot + ligne */}
                  <div className="d-flex flex-column align-items-center flex-shrink-0">
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-circle bg-${cfg.badge}-subtle`}
                      style={{ width: 28, height: 28 }}
                    >
                      <span
                        className={`fas ${cfg.icon} text-${cfg.badge}`}
                        style={{ fontSize: 10 }}
                      />
                    </div>
                    {i < history.length - 1 && (
                      <div
                        className="bg-body-secondary flex-grow-1"
                        style={{ width: 2, marginTop: 4 }}
                      />
                    )}
                  </div>
                  {/* Contenu */}
                  <div className="pb-3 min-w-0">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`badge badge-phoenix badge-phoenix-${cfg.badge} fs-10`}
                      >
                        {h.status_display}
                      </span>
                      <span className="fs-10 text-body-tertiary">
                        {fmtDate(h.changed_at)}
                      </span>
                    </div>
                    {h.location && (
                      <p className="mb-1 fs-10 text-body-tertiary">
                        <span className="fas fa-map-marker-alt me-1" />
                        {h.location}
                      </p>
                    )}
                    {h.note && <p className="mb-1 fs-9 text-body">{h.note}</p>}
                    {h.changed_by && (
                      <p className="mb-0 fs-10 text-body-tertiary">
                        Par <strong>{h.changed_by.full_name}</strong>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Modal changement de statut
const StatusChangeModal = ({ shipment, onDone, onClose }) => {
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableStatuses = Object.entries(STATUS_CONFIG).filter(
    ([k]) => k !== shipment.status,
  );

  const submit = () => {
    if (!newStatus) {
      setError("Choisissez un statut.");
      return;
    }
    setLoading(true);
    axiosClient
      .post(`/shipments/${shipment.id}/status/`, {
        status: newStatus,
        note,
        location,
      })
      .then(({ data }) => onDone(data))
      .catch((err) =>
        setError(
          err.response?.data?.detail ?? "Erreur lors du changement de statut.",
        ),
      )
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <span className="fas fa-arrow-right-arrow-left me-2 text-primary" />
              Changer le statut
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fs-9 fw-semibold">
                Nouveau statut <span className="text-danger">*</span>
              </label>
              <div className="row g-2">
                {availableStatuses.map(([k, v]) => (
                  <div key={k} className="col-6">
                    <div
                      className={`p-2 rounded-2 border text-center ${newStatus === k ? `border-${v.badge} bg-${v.badge}-subtle` : "border-translucent"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setNewStatus(k);
                        setError("");
                      }}
                    >
                      <span
                        className={`fas ${v.icon} text-${v.badge} d-block mb-1`}
                        style={{ fontSize: 14 }}
                      />
                      <span className="fs-10 fw-semibold">{v.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fs-9 fw-semibold">
                Localisation (optionnel)
              </label>
              <input
                type="text"
                className="form-control fs-9"
                placeholder="Ex : Port de Cotonou, Douane de Lomé…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fs-9 fw-semibold">
                Note (optionnel)
              </label>
              <textarea
                className="form-control fs-9"
                rows={2}
                placeholder="Informations complémentaires…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            {error && (
              <div className="alert alert-danger py-2 fs-9">{error}</div>
            )}
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-phoenix-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Traitement…
                </>
              ) : (
                "Confirmer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);

  // ── Fetch ───────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get(`/shipments/${id}/`),
      axiosClient.get("/documents/", { params: { shipment: id } }),
    ])
      .then(([{ data: s }, { data: d }]) => {
        setShipment(s);
        setDocuments(d.results ?? d);
      })
      .catch(() => setError("Impossible de charger cette expédition."))
      .finally(() => setLoading(false));
  }, [id]);

  const onStatusChanged = (updated) => {
    setShipment(updated);
    setChangingStatus(false);
  };

  // ── Loading ─────────────────────────────────────────────
  if (loading)
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center text-body-tertiary">
          <span className="spinner-border text-primary mb-3 d-block mx-auto" />
          Chargement du dossier…
        </div>
      </div>
    );

  if (error || !shipment)
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center">
          <span className="fas fa-triangle-exclamation text-danger fs-3 d-block mb-3" />
          <p className="text-body-tertiary mb-3">
            {error ?? "Dossier introuvable."}
          </p>
          <button
            className="btn btn-phoenix-secondary"
            onClick={() => navigate("/expeditions")}
          >
            <span className="fas fa-arrow-left me-2" />
            Retour aux expéditions
          </button>
        </div>
      </div>
    );

  const st = STATUS_CONFIG[shipment.status] ?? {
    badge: "secondary",
    icon: "fa-circle",
    label: shipment.status_display,
  };
  const mode = MODE_CONFIG[shipment.transport_mode] ?? MODE_CONFIG.sea;

  const pendingDocs = documents.filter(
    (d) => d.validation_status === "pending",
  ).length;
  const expiringDocs = documents.filter(
    (d) =>
      !d.is_expired && d.days_until_expiry >= 0 && d.days_until_expiry <= 7,
  ).length;

  return (
    <>
      <div className="pb-6">
        {/* ── EN-TÊTE ─────────────────────────────────── */}
        <div className="mb-4">
          {/* Breadcrumb */}
          <nav className="mb-2">
            <ol className="breadcrumb fs-10 mb-0">
              <li className="breadcrumb-item">
                <NavLink to="/expeditions" className="text-body-tertiary">
                  Expéditions
                </NavLink>
              </li>
              <li className="breadcrumb-item active text-body">
                {shipment.reference}
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-3 flex-wrap mb-1">
                <h2 className="mb-0">{shipment.reference}</h2>
                <span
                  className={`badge badge-phoenix badge-phoenix-${st.badge} fs-9`}
                >
                  <span className={`fas ${st.icon} me-1`} />
                  {st.label}
                </span>
                {shipment.is_archived && (
                  <span className="badge bg-body-secondary text-body fs-9">
                    <span className="fas fa-archive me-1" />
                    Archivée
                  </span>
                )}
              </div>
              <p className="text-body-tertiary mb-0 fs-9">
                <span className={`fas ${mode.icon} me-1 text-${mode.badge}`} />
                {mode.label} · {shipment.direction_display} · Incoterm{" "}
                {shipment.incoterm}
                <span className="ms-3 text-body-quaternary">
                  Créé le {fmtDate(shipment.created_at)}
                  {shipment.created_by &&
                    ` par ${shipment.created_by.full_name}`}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 flex-wrap">
              <NavLink
                className="btn btn-phoenix-secondary btn-sm"
                to={`/documents?shipment=${shipment.id}`}
              >
                <span className="fas fa-file-alt me-2" />
                Documents
                {pendingDocs > 0 && (
                  <span className="ms-2 badge badge-phoenix badge-phoenix-warning">
                    {pendingDocs}
                  </span>
                )}
              </NavLink>
              <NavLink
                className="btn btn-phoenix-secondary btn-sm"
                to={`/tracking/carte?shipment=${shipment.id}`}
              >
                <span className="fas fa-map-marker-alt me-2" />
                Carte
              </NavLink>
              <button
                className="btn btn-phoenix-secondary btn-sm"
                onClick={() => setChangingStatus(true)}
              >
                <span className="fas fa-arrow-right-arrow-left me-2" />
                Changer statut
              </button>
              <div className="dropdown">
                <button
                  className="btn btn-phoenix-secondary btn-sm dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <span className="fas fa-ellipsis-h" />
                </button>
                <div className="dropdown-menu dropdown-menu-end py-2">
                  <button className="dropdown-item">
                    <span className="fas fa-edit me-2 text-body-tertiary" />
                    Modifier
                  </button>
                  <button className="dropdown-item text-danger">
                    <span className="fas fa-archive me-2" />
                    Archiver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ALERTES ─────────────────────────────────── */}
        {(pendingDocs > 0 ||
          expiringDocs > 0 ||
          shipment.status === "on_hold") && (
          <div className="d-flex flex-column gap-2 mb-4">
            {shipment.status === "on_hold" && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-0">
                <span className="fas fa-triangle-exclamation flex-shrink-0" />
                <span className="fs-9">
                  Cette expédition est <strong>bloquée</strong>. Une
                  intervention est requise.
                </span>
              </div>
            )}
            {pendingDocs > 0 && (
              <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-0">
                <span className="fas fa-clock flex-shrink-0" />
                <span className="fs-9">
                  <strong>
                    {pendingDocs} document{pendingDocs > 1 ? "s" : ""}
                  </strong>{" "}
                  en attente de validation.{" "}
                  <NavLink
                    to={`/documents?shipment=${shipment.id}&status=pending`}
                    className="fw-semibold"
                  >
                    Valider maintenant
                  </NavLink>
                </span>
              </div>
            )}
            {expiringDocs > 0 && (
              <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-0">
                <span className="fas fa-calendar-xmark flex-shrink-0" />
                <span className="fs-9">
                  <strong>
                    {expiringDocs} document{expiringDocs > 1 ? "s" : ""}
                  </strong>{" "}
                  expire{expiringDocs > 1 ? "nt" : ""} dans moins de 7 jours.
                </span>
              </div>
            )}
          </div>
        )}

        <div className="row g-4">
          {/* ── COLONNE GAUCHE ──────────────────────────── */}
          <div className="col-12 col-xl-8">
            {/* Progression / Timeline */}
            <Section icon="fa-route" title="Progression du dossier">
              <StatusTimeline
                currentStatus={shipment.status}
                history={shipment.status_history}
              />
            </Section>

            {/* Marchandise */}
            <Section icon="fa-box" title="Marchandise">
              <div className="row g-0">
                <div className="col-12 col-md-6 pe-md-4">
                  <Meta
                    label="Description"
                    value={shipment.goods_description}
                  />
                  <Meta label="Code HS" value={shipment.hs_code} />
                  <Meta
                    label="Quantité"
                    value={
                      shipment.quantity
                        ? `${fmtNum(shipment.quantity)} ${shipment.unit ?? ""}`
                        : null
                    }
                  />
                </div>
                <div className="col-12 col-md-6 ps-md-4">
                  <Meta
                    label="Poids brut"
                    value={
                      shipment.gross_weight_kg
                        ? `${fmtNum(shipment.gross_weight_kg)} kg`
                        : null
                    }
                  />
                  <Meta
                    label="Volume"
                    value={
                      shipment.volume_m3
                        ? `${fmtNum(shipment.volume_m3)} m³`
                        : null
                    }
                  />
                  <Meta
                    label="Valeur déclarée"
                    value={
                      shipment.declared_value ? (
                        <span className="fw-bold">
                          {fmtNum(shipment.declared_value)}{" "}
                          <span className="text-body-tertiary fw-normal">
                            {shipment.currency}
                          </span>
                        </span>
                      ) : null
                    }
                  />
                </div>
              </div>
              {shipment.tags?.length > 0 && (
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  {shipment.tags.map((t) => (
                    <span
                      key={t}
                      className="badge bg-body-secondary text-body fs-10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Transport */}
            <Section icon="fa-ship" title="Transport & Dates">
              <div className="row g-0">
                <div className="col-12 col-md-6 pe-md-4">
                  <Meta
                    label="Mode"
                    value={
                      <>
                        <span
                          className={`fas ${mode.icon} me-2 text-${mode.badge}`}
                        />
                        {mode.label}
                      </>
                    }
                  />
                  <Meta
                    label="Incoterm"
                    value={
                      <span className="badge bg-body-secondary text-body fw-bold">
                        {shipment.incoterm}
                      </span>
                    }
                  />
                  <Meta label="Direction" value={shipment.direction_display} />
                </div>
                <div className="col-12 col-md-6 ps-md-4">
                  <Meta
                    label="ETD estimée"
                    value={fmtDate(shipment.estimated_departure)}
                  />
                  <Meta
                    label="ETD réelle"
                    value={fmtDate(shipment.actual_departure)}
                  />
                  <Meta
                    label="ETA estimée"
                    value={fmtDate(shipment.estimated_arrival)}
                  />
                  <Meta
                    label="ETA réelle"
                    value={fmtDate(shipment.actual_arrival)}
                  />
                </div>
              </div>
              {(shipment.customs_start || shipment.customs_end) && (
                <div className="row g-0 mt-2">
                  <div className="col-12 col-md-6 pe-md-4">
                    <Meta
                      label="Début dédouanement"
                      value={fmtDate(shipment.customs_start)}
                    />
                  </div>
                  <div className="col-12 col-md-6 ps-md-4">
                    <Meta
                      label="Fin dédouanement"
                      value={fmtDate(shipment.customs_end)}
                    />
                  </div>
                </div>
              )}
            </Section>

            {/* Route */}
            <Section icon="fa-map-marked-alt" title="Route">
              <div className="d-flex align-items-center gap-4 flex-wrap">
                {/* Origine */}
                <div className="text-center">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-body-tertiary mb-2"
                    style={{ width: 52, height: 52 }}
                  >
                    <span className="fas fa-circle-dot text-body-tertiary fs-6" />
                  </div>
                  <p className="mb-0 fw-bold fs-8">
                    {shipment.origin_port_or_city}
                  </p>
                  <p className="mb-0 fs-10 text-body-tertiary">
                    {shipment.origin_country}
                  </p>
                </div>

                {/* Flèche avec mode */}
                <div className="flex-grow-1 text-center position-relative">
                  <div className="d-flex align-items-center gap-0">
                    <div
                      className="flex-grow-1 bg-body-secondary"
                      style={{ height: 2 }}
                    />
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-circle bg-${mode.badge}-subtle border border-${mode.badge}-subtle mx-2`}
                      style={{ width: 36, height: 36 }}
                    >
                      <span
                        className={`fas ${mode.icon} text-${mode.badge}`}
                        style={{ fontSize: 14 }}
                      />
                    </div>
                    <div
                      className="flex-grow-1 bg-body-secondary"
                      style={{ height: 2 }}
                    />
                  </div>
                  <p className="mb-0 fs-10 text-body-tertiary mt-1">
                    {mode.label} · {shipment.incoterm}
                  </p>
                </div>

                {/* Destination */}
                <div className="text-center">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle mb-2"
                    style={{ width: 52, height: 52 }}
                  >
                    <span className="fas fa-map-marker-alt text-primary fs-6" />
                  </div>
                  <p className="mb-0 fw-bold fs-8">
                    {shipment.destination_port_or_city}
                  </p>
                  <p className="mb-0 fs-10 text-body-tertiary">
                    {shipment.destination_country}
                  </p>
                </div>
              </div>
            </Section>

            {/* Notes */}
            {shipment.notes && (
              <Section icon="fa-note-sticky" title="Notes internes">
                <p className="fs-9 text-body mb-0">{shipment.notes}</p>
              </Section>
            )}
          </div>

          {/* ── COLONNE DROITE ──────────────────────────── */}
          <div className="col-12 col-xl-4">
            {/* Résumé rapide */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div
                    className={`d-flex align-items-center justify-content-center rounded-circle bg-${st.badge}-subtle`}
                    style={{ width: 52, height: 52 }}
                  >
                    <span className={`fas ${st.icon} text-${st.badge} fs-6`} />
                  </div>
                  <div>
                    <p className="mb-0 fs-10 text-body-tertiary">
                      Statut actuel
                    </p>
                    <p className="mb-0 fw-bold fs-8">{st.label}</p>
                  </div>
                </div>
                <div className="row g-3 text-center">
                  {[
                    {
                      label: "Documents",
                      value: shipment.documents_count ?? 0,
                      icon: "fa-file-alt",
                      badge: "primary",
                    },
                    {
                      label: "En attente",
                      value: shipment.pending_documents_count ?? 0,
                      icon: "fa-clock",
                      badge: "warning",
                    },
                  ].map(({ label, value, icon, badge }) => (
                    <div key={label} className="col-6">
                      <div className={`p-3 rounded-2 bg-${badge}-subtle`}>
                        <span
                          className={`fas ${icon} text-${badge} d-block mb-1 fs-7`}
                        />
                        <h5 className={`mb-0 text-${badge}`}>{value}</h5>
                        <p className="mb-0 fs-10 text-body-tertiary">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <NavLink
                  className="btn btn-phoenix-primary w-100 mt-3 fs-9"
                  to={`/documents?shipment=${shipment.id}`}
                >
                  <span className="fas fa-file-alt me-2" />
                  Gérer les documents
                </NavLink>
              </div>
            </div>

            {/* Partenaires */}
            <Section icon="fa-handshake" title="Partenaires">
              <div className="d-flex flex-column gap-4">
                {[
                  { label: "Transitaire", partner: shipment.freight_forwarder },
                  {
                    label: "Commissionnaire",
                    partner: shipment.customs_broker,
                  },
                  { label: "Fournisseur", partner: shipment.supplier },
                ].map(({ label, partner }) => (
                  <div key={label}>
                    <p className="fs-10 fw-semibold text-body-tertiary text-uppercase mb-2">
                      {label}
                    </p>
                    <PartnerBadge partner={partner} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Équipe */}
            <Section icon="fa-users" title="Équipe">
              {[
                { label: "Créé par", user: shipment.created_by },
                { label: "Assigné à", user: shipment.assigned_to },
              ].map(({ label, user }) => (
                <div
                  key={label}
                  className="d-flex align-items-center justify-content-between py-2 border-bottom border-translucent"
                >
                  <span className="fs-9 text-body-tertiary">{label}</span>
                  {user ? (
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-m">
                        <div className="avatar-name rounded-circle bg-primary-subtle">
                          <span className="text-primary fw-bold fs-10">
                            {user.full_name?.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="fs-9 fw-semibold">{user.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-body-quaternary fs-9">—</span>
                  )}
                </div>
              ))}
              {shipment.closed_at && (
                <div className="d-flex justify-content-between py-2">
                  <span className="fs-9 text-body-tertiary">Clôturé le</span>
                  <span className="fs-9 fw-semibold">
                    {fmtDate(shipment.closed_at)}
                  </span>
                </div>
              )}
            </Section>

            {/* Documents récents */}
            {documents.length > 0 && (
              <Section
                icon="fa-file-alt"
                title="Documents récents"
                action={
                  <NavLink
                    className="btn btn-sm btn-phoenix-secondary"
                    to={`/documents?shipment=${shipment.id}`}
                  >
                    Voir tous
                  </NavLink>
                }
              >
                <div className="d-flex flex-column gap-2">
                  {documents.slice(0, 4).map((d) => {
                    const valCfg = {
                      pending: { badge: "warning", icon: "fa-clock" },
                      approved: { badge: "success", icon: "fa-check-circle" },
                      rejected: { badge: "danger", icon: "fa-times-circle" },
                    };
                    const v = valCfg[d.validation_status] ?? valCfg.pending;
                    return (
                      <div
                        key={d.id}
                        className="d-flex align-items-center justify-content-between gap-2 p-2 bg-body-tertiary rounded-2"
                      >
                        <div className="min-w-0">
                          <p className="mb-0 fs-9 fw-semibold text-truncate">
                            {d.title}
                          </p>
                          <p className="mb-0 fs-10 text-body-tertiary">
                            {d.document_type_name}
                          </p>
                        </div>
                        <span
                          className={`fas ${v.icon} text-${v.badge} flex-shrink-0`}
                        />
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Modal changement de statut */}
      {changingStatus && (
        <StatusChangeModal
          shipment={shipment}
          onDone={onStatusChanged}
          onClose={() => setChangingStatus(false)}
        />
      )}
    </>
  );
}
