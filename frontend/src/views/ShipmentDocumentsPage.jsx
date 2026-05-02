import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, NavLink } from "react-router-dom";
import axiosClient from "../axios-client";

// ─── CONFIG ────────────────────────────────────────────────

const VALIDATION_CONFIG = {
  pending: { label: "En attente", badge: "warning", icon: "fa-clock" },
  approved: { label: "Approuvé", badge: "success", icon: "fa-check-circle" },
  rejected: { label: "Rejeté", badge: "danger", icon: "fa-times-circle" },
  expired: { label: "Expiré", badge: "secondary", icon: "fa-calendar-xmark" },
};

const FORMAT_CONFIG = {
  pdf: { icon: "fa-file-pdf", color: "#dc3545", bg: "#dc354518" },
  xlsx: { icon: "fa-file-excel", color: "#198754", bg: "#19875418" },
  docx: { icon: "fa-file-word", color: "#0d6efd", bg: "#0d6efd18" },
  jpg: { icon: "fa-file-image", color: "#fd7e14", bg: "#fd7e1418" },
  png: { icon: "fa-file-image", color: "#fd7e14", bg: "#fd7e1418" },
  other: { icon: "fa-file", color: "#6c757d", bg: "#6c757d18" },
};

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

const fmtSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
};

const daysLabel = (days, isExpired) => {
  if (isExpired || days < 0) return { text: "Expiré", cls: "text-danger" };
  if (days === 0) return { text: "Expire aujourd'hui", cls: "text-danger" };
  if (days <= 7) return { text: `${days}j restants`, cls: "text-danger" };
  if (days <= 30) return { text: `${days}j restants`, cls: "text-warning" };
  return { text: `${days}j restants`, cls: "text-body-tertiary" };
};

// ─── MODAL VALIDATION ──────────────────────────────────────

const ValidateModal = ({ doc, onDone, onClose }) => {
  const [action, setAction] = useState("approve");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (action === "reject" && !reason.trim()) {
      setError("Le motif de rejet est obligatoire.");
      return;
    }
    setLoading(true);
    axiosClient
      .post(`/documents/${doc.id}/validate/`, {
        action,
        rejection_reason: reason,
      })
      .then(({ data }) => onDone(data))
      .catch((err) => setError(err.response?.data?.detail ?? "Erreur."))
      .finally(() => setLoading(false));
  };

  const fmt = FORMAT_CONFIG[doc.file_format] ?? FORMAT_CONFIG.other;

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,.45)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              <span className="fas fa-shield-check me-2 text-primary" />
              Valider le document
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body pt-3">
            {/* Info doc */}
            <div
              className="d-flex align-items-center gap-3 p-3 rounded-2 mb-4"
              style={{ background: fmt.bg }}
            >
              <span
                className={`fas ${fmt.icon} fs-4`}
                style={{ color: fmt.color }}
              />
              <div className="min-w-0">
                <p className="mb-0 fw-semibold fs-9 text-truncate">
                  {doc.title}
                </p>
                <p className="mb-0 fs-10 text-body-tertiary">
                  {doc.document_type_name} · {doc.original_filename}
                </p>
              </div>
            </div>
            {/* Choix */}
            <div className="row g-3 mb-3">
              {[
                {
                  value: "approve",
                  label: "Approuver",
                  badge: "success",
                  icon: "fa-check-circle",
                },
                {
                  value: "reject",
                  label: "Rejeter",
                  badge: "danger",
                  icon: "fa-times-circle",
                },
              ].map((opt) => (
                <div key={opt.value} className="col-6">
                  <div
                    className={`p-3 rounded-2 border text-center h-100 ${action === opt.value ? `border-${opt.badge} bg-${opt.badge}-subtle` : "border-translucent"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setAction(opt.value);
                      setError("");
                    }}
                  >
                    <span
                      className={`fas ${opt.icon} text-${opt.badge} fs-5 d-block mb-2`}
                    />
                    <span className="fw-semibold fs-9">{opt.label}</span>
                  </div>
                </div>
              ))}
            </div>
            {action === "reject" && (
              <div className="mb-3">
                <label className="form-label fs-9 fw-semibold">
                  Motif <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control fs-9 ${error ? "is-invalid" : ""}`}
                  rows={3}
                  placeholder="Document illisible, informations incomplètes…"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError("");
                  }}
                />
                {error && <div className="invalid-feedback">{error}</div>}
              </div>
            )}
            {error && action === "approve" && (
              <div className="alert alert-danger py-2 fs-9">{error}</div>
            )}
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              className="btn btn-phoenix-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              className={`btn btn-${action === "approve" ? "success" : "danger"}`}
              onClick={submit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Traitement…
                </>
              ) : action === "approve" ? (
                "Confirmer l'approbation"
              ) : (
                "Confirmer le rejet"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CARTE DOCUMENT ────────────────────────────────────────

const DocumentCard = ({ doc, onValidate, onDeleted }) => {
  const fmt = FORMAT_CONFIG[doc.file_format] ?? FORMAT_CONFIG.other;
  const val =
    VALIDATION_CONFIG[doc.validation_status] ?? VALIDATION_CONFIG.pending;
  const expInfo = doc.expiry_date
    ? daysLabel(doc.days_until_expiry, doc.is_expired)
    : null;
  const isExpired = doc.is_expired || doc.days_until_expiry < 0;
  const expiring =
    !isExpired && doc.days_until_expiry >= 0 && doc.days_until_expiry <= 7;

  const handleDelete = () => {
    if (!window.confirm("Supprimer ce document définitivement ?")) return;
    axiosClient.delete(`/documents/${doc.id}/`).then(() => onDeleted(doc.id));
  };

  return (
    <div
      className={`card h-100 ${expiring || isExpired ? "border-danger-subtle" : ""}`}
    >
      {/* Indicateur expiration */}
      {(expiring || isExpired) && (
        <div
          className={`rounded-top-2 px-3 py-1 d-flex align-items-center gap-2 ${isExpired ? "bg-danger" : "bg-warning"}`}
        >
          <span
            className="fas fa-triangle-exclamation text-white"
            style={{ fontSize: 10 }}
          />
          <span className="text-white fw-semibold" style={{ fontSize: 10 }}>
            {isExpired
              ? "Document expiré"
              : `Expire dans ${doc.days_until_expiry} jour${doc.days_until_expiry > 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      <div className="card-body d-flex flex-column gap-3">
        {/* En-tête : icône + titre + badge */}
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
            style={{ width: 44, height: 44, background: fmt.bg }}
          >
            <span
              className={`fas ${fmt.icon} fs-6`}
              style={{ color: fmt.color }}
            />
          </div>
          <div className="flex-grow-1 min-w-0">
            <p
              className="mb-0 fw-bold fs-9 text-body-highlight text-truncate"
              title={doc.title}
            >
              {doc.title}
            </p>
            <p className="mb-0 fs-10 text-body-tertiary">
              {doc.document_type_name}
            </p>
          </div>
          <span
            className={`badge badge-phoenix badge-phoenix-${val.badge} flex-shrink-0`}
          >
            <span className={`fas ${val.icon} me-1`} />
            {val.label}
          </span>
        </div>

        {/* Métadonnées */}
        <div className="d-flex flex-column gap-1">
          {doc.reference_number && (
            <div className="d-flex justify-content-between">
              <span className="fs-10 text-body-tertiary">Référence</span>
              <span className="fs-10 fw-semibold">{doc.reference_number}</span>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <span className="fs-10 text-body-tertiary">Émission</span>
            <span className="fs-10 fw-semibold">{fmtDate(doc.issue_date)}</span>
          </div>
          {doc.expiry_date && (
            <div className="d-flex justify-content-between">
              <span className="fs-10 text-body-tertiary">Expiration</span>
              <span className={`fs-10 fw-semibold ${expInfo?.cls ?? ""}`}>
                {fmtDate(doc.expiry_date)}
                {expInfo && (
                  <span className="ms-1 fw-normal">({expInfo.text})</span>
                )}
              </span>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <span className="fs-10 text-body-tertiary">Fichier</span>
            <span
              className="fs-10 text-body-tertiary text-truncate ms-2"
              style={{ maxWidth: 140 }}
            >
              {doc.original_filename} · {fmtSize(doc.file_size_bytes)}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="fs-10 text-body-tertiary">Uploadé par</span>
            <span className="fs-10 fw-semibold">
              {doc.uploaded_by_name ?? "—"}
            </span>
          </div>
        </div>

        {/* Motif de rejet */}
        {doc.validation_status === "rejected" && doc.rejection_reason && (
          <div className="alert alert-danger py-2 px-3 mb-0 fs-10">
            <span className="fas fa-info-circle me-1" />
            {doc.rejection_reason}
          </div>
        )}

        {/* Actions */}
        <div className="d-flex gap-2 mt-auto">
          {doc.file && (
            <a
              className="btn btn-sm btn-phoenix-primary flex-grow-1"
              href={doc.file}
              target="_blank"
              rel="noreferrer"
            >
              <span className="fas fa-download me-2" />
              Télécharger
            </a>
          )}
          {doc.validation_status === "pending" && (
            <button
              className="btn btn-sm btn-phoenix-success"
              onClick={() => onValidate(doc)}
              title="Valider"
            >
              <span className="fas fa-shield-check" />
            </button>
          )}
          <button
            className="btn btn-sm btn-phoenix-danger"
            onClick={handleDelete}
            title="Supprimer"
          >
            <span className="fas fa-trash" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────

export default function ShipmentDocumentsPage() {
  // Supporte deux modes :
  //   /expeditions/:id/documents  → id depuis useParams
  //   /documents?shipment=<uuid>  → id depuis useSearchParams
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const shipmentId = paramId ?? searchParams.get("shipment");

  const [shipment, setShipment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validating, setValidating] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [view, setView] = useState("grid"); // "grid" | "list"

  // ── Chargement ─────────────────────────────────────────
  useEffect(() => {
    if (!shipmentId) return;
    setLoading(true);

    Promise.all([
      axiosClient.get(`/shipments/${shipmentId}/`),
      axiosClient.get(`/shipments/${shipmentId}/documents/`),
      axiosClient.get("/document-types/"),
    ])
      .then(([{ data: s }, { data: d }, { data: dt }]) => {
        setShipment(s);
        setDocuments(d.results ?? d);
        setDocTypes(dt.results ?? dt);
      })
      .catch(() => setError("Impossible de charger les documents."))
      .finally(() => setLoading(false));
  }, [shipmentId]);

  // ── Filtrage ────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      documents.filter((d) => {
        if (filterType && d.document_type !== filterType) return false;
        if (filterStatus && d.validation_status !== filterStatus) return false;
        return true;
      }),
    [documents, filterType, filterStatus],
  );

  // ── KPIs ────────────────────────────────────────────────
  const kpis = useMemo(
    () => ({
      total: documents.length,
      pending: documents.filter((d) => d.validation_status === "pending")
        .length,
      approved: documents.filter((d) => d.validation_status === "approved")
        .length,
      alerts: documents.filter(
        (d) =>
          d.is_expired ||
          (d.days_until_expiry >= 0 && d.days_until_expiry <= 7),
      ).length,
    }),
    [documents],
  );

  // ── Callbacks ───────────────────────────────────────────
  const onValidated = (updated) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)),
    );
    setValidating(null);
  };

  const onDeleted = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // ── États de chargement / erreur ────────────────────────
  if (loading)
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center text-body-tertiary">
          <span className="spinner-border text-primary d-block mx-auto mb-3" />
          Chargement des documents…
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center">
          <span className="fas fa-triangle-exclamation text-danger fs-3 d-block mb-3" />
          <p className="text-body-tertiary">{error}</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="pb-6">
        {/* ── EN-TÊTE ──────────────────────────────────── */}
        <div className="mb-4">
          {/* Breadcrumb */}
          <nav className="mb-2">
            <ol className="breadcrumb fs-10 mb-0">
              <li className="breadcrumb-item">
                <NavLink to="/expeditions" className="text-body-tertiary">
                  Expéditions
                </NavLink>
              </li>
              {shipment && (
                <li className="breadcrumb-item">
                  <NavLink
                    to={`/expeditions/${shipmentId}`}
                    className="text-body-tertiary"
                  >
                    {shipment.reference}
                  </NavLink>
                </li>
              )}
              <li className="breadcrumb-item active">Documents</li>
            </ol>
          </nav>

          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="mb-1">Documents</h2>
              {shipment && (
                <p className="text-body-tertiary mb-0 fs-9">
                  <span className="fas fa-folder me-1 text-primary" />
                  Expédition{" "}
                  <NavLink
                    to={`/expeditions/${shipmentId}`}
                    className="fw-semibold text-primary"
                  >
                    {shipment.reference}
                  </NavLink>
                  {" · "}
                  {shipment.goods_description}
                  {" · "}
                  {shipment.origin_port_or_city} →{" "}
                  {shipment.destination_port_or_city}
                </p>
              )}
            </div>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#uploadDocumentModal"
            >
              <span className="fas fa-upload me-2" />
              Uploader un document
            </button>
          </div>
        </div>

        {/* ── KPIs ─────────────────────────────────────── */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "Total",
              value: kpis.total,
              badge: "primary",
              icon: "fa-file-alt",
            },
            {
              label: "En attente",
              value: kpis.pending,
              badge: "warning",
              icon: "fa-clock",
            },
            {
              label: "Approuvés",
              value: kpis.approved,
              badge: "success",
              icon: "fa-check-circle",
            },
            {
              label: "Alertes",
              value: kpis.alerts,
              badge: "danger",
              icon: "fa-triangle-exclamation",
            },
          ].map(({ label, value, badge, icon }) => (
            <div key={label} className="col-6 col-md-3">
              <div className="card h-100">
                <div className="card-body d-flex align-items-center gap-3 py-3">
                  <div
                    className={`d-flex align-items-center justify-content-center rounded-circle bg-${badge}-subtle flex-shrink-0`}
                    style={{ width: 44, height: 44 }}
                  >
                    <span className={`fas ${icon} text-${badge} fs-8`} />
                  </div>
                  <div>
                    <p className="mb-0 fs-10 text-body-tertiary fw-semibold text-uppercase">
                      {label}
                    </p>
                    <h4 className="mb-0 fw-bold">{value}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TYPES MANQUANTS ──────────────────────────── */}
        {shipment &&
          docTypes.length > 0 &&
          (() => {
            const presentCodes = new Set(
              documents.map((d) => d.document_type_code),
            );
            const mandatory = docTypes.filter(
              (dt) =>
                (shipment.direction === "import"
                  ? dt.is_mandatory_import
                  : dt.is_mandatory_export) && !presentCodes.has(dt.code),
            );
            return mandatory.length > 0 ? (
              <div className="alert alert-warning border border-warning-subtle d-flex align-items-start gap-3 mb-4 py-3">
                <span className="fas fa-triangle-exclamation text-warning fs-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="mb-1 fw-semibold fs-9">
                    Documents obligatoires manquants
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {mandatory.map((dt) => (
                      <span
                        key={dt.code}
                        className="badge bg-warning-subtle text-warning border border-warning-subtle fs-10"
                      >
                        <span className="fas fa-file me-1" />
                        {dt.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null;
          })()}

        {/* ── BARRE D'OUTILS ───────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          {/* Filtres */}
          <div className="d-flex gap-2 flex-wrap">
            {/* Filtre statut — pills */}
            <button
              className={`btn btn-sm ${!filterStatus ? "btn-primary" : "btn-phoenix-secondary"}`}
              onClick={() => setFilterStatus("")}
            >
              Tous{" "}
              <span className="ms-1 badge bg-body-secondary text-body fw-bold">
                {documents.length}
              </span>
            </button>
            {Object.entries(VALIDATION_CONFIG).map(([k, v]) => {
              const count = documents.filter(
                (d) => d.validation_status === k,
              ).length;
              return count > 0 ? (
                <button
                  key={k}
                  className={`btn btn-sm ${filterStatus === k ? `btn-phoenix-${v.badge}` : "btn-phoenix-secondary"}`}
                  onClick={() => setFilterStatus(filterStatus === k ? "" : k)}
                >
                  <span className={`fas ${v.icon} me-1`} />
                  {v.label}
                  <span
                    className={`ms-1 badge badge-phoenix badge-phoenix-${v.badge}`}
                  >
                    {count}
                  </span>
                </button>
              ) : null;
            })}
          </div>

          {/* Filtre type + toggle vue */}
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tous les types</option>
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name}
                </option>
              ))}
            </select>
            <div className="btn-group">
              <button
                className={`btn btn-sm ${view === "grid" ? "btn-primary" : "btn-phoenix-secondary"}`}
                onClick={() => setView("grid")}
                title="Vue grille"
              >
                <span className="fas fa-grid-2" />
              </button>
              <button
                className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-phoenix-secondary"}`}
                onClick={() => setView("list")}
                title="Vue liste"
              >
                <span className="fas fa-list" />
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENU ──────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-7 text-body-tertiary">
              <span className="fas fa-file-circle-xmark fs-3 d-block mb-3 opacity-50" />
              <p className="mb-1 fw-semibold fs-8">Aucun document trouvé</p>
              <p className="mb-3 fs-9">
                {filterType || filterStatus
                  ? "Aucun document ne correspond aux filtres sélectionnés."
                  : "Cette expédition n'a pas encore de documents uploadés."}
              </p>
              <button
                className="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#uploadDocumentModal"
              >
                <span className="fas fa-upload me-2" />
                Uploader le premier document
              </button>
            </div>
          </div>
        ) : view === "grid" ? (
          /* Vue grille */
          <div className="row g-3">
            {filtered.map((doc) => (
              <div key={doc.id} className="col-12 col-sm-6 col-xl-4">
                <DocumentCard
                  doc={doc}
                  onValidate={setValidating}
                  onDeleted={onDeleted}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Vue liste */
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive scrollbar">
                <table className="table table-hover fs-9 mb-0 border-top border-translucent">
                  <thead>
                    <tr>
                      <th
                        className="ps-3 align-middle"
                        style={{ minWidth: 220 }}
                      >
                        DOCUMENT
                      </th>
                      <th className="align-middle" style={{ minWidth: 120 }}>
                        STATUT
                      </th>
                      <th className="align-middle" style={{ minWidth: 100 }}>
                        ÉMISSION
                      </th>
                      <th className="align-middle" style={{ minWidth: 130 }}>
                        EXPIRATION
                      </th>
                      <th className="align-middle" style={{ minWidth: 130 }}>
                        UPLOADÉ PAR
                      </th>
                      <th className="align-middle" style={{ minWidth: 70 }}>
                        TAILLE
                      </th>
                      <th
                        className="align-middle pe-3"
                        style={{ width: 120 }}
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc) => {
                      const fmt =
                        FORMAT_CONFIG[doc.file_format] ?? FORMAT_CONFIG.other;
                      const val =
                        VALIDATION_CONFIG[doc.validation_status] ??
                        VALIDATION_CONFIG.pending;
                      const expI = doc.expiry_date
                        ? daysLabel(doc.days_until_expiry, doc.is_expired)
                        : null;
                      const isExp = doc.is_expired || doc.days_until_expiry < 0;

                      return (
                        <tr key={doc.id} className="hover-actions-trigger">
                          <td className="align-middle ps-3">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                                style={{
                                  width: 36,
                                  height: 36,
                                  background: fmt.bg,
                                }}
                              >
                                <span
                                  className={`fas ${fmt.icon}`}
                                  style={{ color: fmt.color, fontSize: 15 }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="mb-0 fw-semibold text-truncate"
                                  style={{ maxWidth: 160 }}
                                >
                                  {doc.title}
                                </p>
                                <p className="mb-0 fs-10 text-body-tertiary">
                                  {doc.document_type_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="align-middle">
                            <span
                              className={`badge badge-phoenix badge-phoenix-${val.badge}`}
                            >
                              <span className={`fas ${val.icon} me-1`} />
                              {val.label}
                            </span>
                          </td>
                          <td className="align-middle white-space-nowrap">
                            <span className="text-body-tertiary">
                              {fmtDate(doc.issue_date)}
                            </span>
                          </td>
                          <td className="align-middle white-space-nowrap">
                            {doc.expiry_date ? (
                              <div>
                                <span
                                  className={`fw-semibold ${expI?.cls ?? ""}`}
                                >
                                  {isExp && (
                                    <span className="fas fa-triangle-exclamation me-1" />
                                  )}
                                  {fmtDate(doc.expiry_date)}
                                </span>
                                {expI && (
                                  <p className={`mb-0 fs-10 ${expI.cls}`}>
                                    {expI.text}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-body-quaternary">—</span>
                            )}
                          </td>
                          <td className="align-middle">
                            <p className="mb-0 fw-semibold">
                              {doc.uploaded_by_name ?? "—"}
                            </p>
                            <p className="mb-0 fs-10 text-body-tertiary">
                              {fmtDate(doc.uploaded_at)}
                            </p>
                          </td>
                          <td className="align-middle">
                            <span className="text-body-tertiary">
                              {fmtSize(doc.file_size_bytes)}
                            </span>
                          </td>
                          <td className="align-middle pe-3">
                            <div className="d-flex gap-1 justify-content-end">
                              {doc.file && (
                                <a
                                  className="btn btn-sm btn-phoenix-primary"
                                  href={doc.file}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Télécharger"
                                >
                                  <span className="fas fa-download" />
                                </a>
                              )}
                              {doc.validation_status === "pending" && (
                                <button
                                  className="btn btn-sm btn-phoenix-success"
                                  onClick={() => setValidating(doc)}
                                  title="Valider"
                                >
                                  <span className="fas fa-shield-check" />
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-phoenix-danger"
                                onClick={() => {
                                  if (window.confirm("Supprimer ce document ?"))
                                    axiosClient
                                      .delete(`/documents/${doc.id}/`)
                                      .then(() => onDeleted(doc.id));
                                }}
                                title="Supprimer"
                              >
                                <span className="fas fa-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal validation */}
      {validating && (
        <ValidateModal
          doc={validating}
          onDone={onValidated}
          onClose={() => setValidating(null)}
        />
      )}
    </>
  );
}
