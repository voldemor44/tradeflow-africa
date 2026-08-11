import { useReducer, useEffect, useState, useMemo } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import axiosClient from "../axios-client";
import { useTranslation } from "react-i18next";

// ─── CONFIG ────────────────────────────────────────────────

const getValidationConfig = (t) => ({
  pending: { label: t("documents.statusPending"), badge: "warning", icon: "fa-clock" },
  approved: { label: t("documents.statusApproved"), badge: "success", icon: "fa-check-circle" },
  rejected: { label: t("documents.statusRejected"), badge: "danger", icon: "fa-times-circle" },
  expired: { label: t("documents.statusExpired"), badge: "secondary", icon: "fa-calendar-xmark" },
});

const FORMAT_CONFIG = {
  pdf: { icon: "fa-file-pdf", color: "#dc3545" },
  xlsx: { icon: "fa-file-excel", color: "#198754" },
  docx: { icon: "fa-file-word", color: "#0d6efd" },
  jpg: { icon: "fa-file-image", color: "#fd7e14" },
  png: { icon: "fa-file-image", color: "#fd7e14" },
  other: { icon: "fa-file", color: "#6c757d" },
};

const PAGE_SIZE = 15;

// ─── HELPERS ───────────────────────────────────────────────

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

const fmtSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
};

const expiryClass = (days, isExpired) => {
  if (isExpired || days < 0) return "text-danger";
  if (days <= 7) return "text-danger";
  if (days <= 30) return "text-warning";
  return "text-body-tertiary";
};

// ─── REDUCER ───────────────────────────────────────────────

const init = {
  search: "",
  status: "",
  doc_type: "",
  shipment: "",
  page: 1,
  showFilters: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FILTER":
      return { ...state, [action.key]: action.value, page: 1 };
    case "PAGE":
      return { ...state, page: action.page };
    case "TOGGLE_FILTERS":
      return { ...state, showFilters: !state.showFilters };
    case "RESET":
      return { ...init, showFilters: state.showFilters };
    default:
      return state;
  }
};

// ─── SOUS-COMPOSANTS ───────────────────────────────────────

const KpiCard = ({ label, value, badge, icon, sub }) => (
  <div className="col-6 col-xl-3">
    <div className="card h-100">
      <div className="card-body d-flex align-items-center gap-3 py-3">
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle bg-${badge}-subtle flex-shrink-0`}
          style={{ width: 48, height: 48 }}
        >
          <span className={`fas ${icon} text-${badge} fs-7`} />
        </div>
        <div>
          <p className="mb-0 fs-10 fw-semibold text-body-tertiary text-uppercase">
            {label}
          </p>
          <h4 className="mb-0 fw-bold text-body-highlight">{value}</h4>
          {sub && <p className="mb-0 fs-10 text-body-tertiary">{sub}</p>}
        </div>
      </div>
    </div>
  </div>
);

// Modal de validation / rejet
const ValidateModal = ({ doc, onDone, onClose }) => {
  const { t } = useTranslation();
  const [action, setAction] = useState("approve");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (action === "reject" && !reason.trim()) {
      setError(t("documents.rejectReasonRequired"));
      return;
    }
    setLoading(true);
    axiosClient
      .post(`/documents/${doc.id}/validate/`, {
        action,
        rejection_reason: reason,
      })
      .then(({ data }) => onDone(data))
      .catch((err) =>
        setError(err.response?.data?.detail ?? t("documents.validationError")),
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
              <span className="fas fa-shield-check me-2 text-primary" />
              {t("documents.validateTitle")}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {/* Info document */}
            <div className="d-flex align-items-center gap-3 p-3 bg-body-tertiary rounded-2 mb-4">
              <span
                className={`fas ${FORMAT_CONFIG[doc.file_format]?.icon ?? "fa-file"} fs-5`}
                style={{ color: FORMAT_CONFIG[doc.file_format]?.color }}
              />
              <div className="min-w-0">
                <p className="mb-0 fw-semibold text-truncate">{doc.title}</p>
                <p className="mb-0 fs-10 text-body-tertiary">
                  {doc.document_type_name} · {doc.original_filename}
                </p>
              </div>
            </div>

            {/* Choix action */}
            <div className="d-flex gap-3 mb-3">
              <div
                className={`flex-grow-1 p-3 rounded-2 border text-center cursor-pointer ${action === "approve" ? "border-success bg-success-subtle" : "border-translucent"}`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setAction("approve");
                  setError("");
                }}
              >
                <span className="fas fa-check-circle fs-5 text-success d-block mb-1" />
                <span className="fw-semibold fs-9">{t("documents.approve")}</span>
              </div>
              <div
                className={`flex-grow-1 p-3 rounded-2 border text-center ${action === "reject" ? "border-danger bg-danger-subtle" : "border-translucent"}`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setAction("reject");
                  setError("");
                }}
              >
                <span className="fas fa-times-circle fs-5 text-danger d-block mb-1" />
                <span className="fw-semibold fs-9">{t("documents.reject")}</span>
              </div>
            </div>

            {/* Motif de rejet */}
            {action === "reject" && (
              <div className="mb-3">
                <label className="form-label fs-9 fw-semibold">
                  {t("documents.rejectionReason")} <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control fs-9 ${error ? "is-invalid" : ""}`}
                  rows={3}
                  placeholder={t("documents.reasonPlaceholder")}
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
          <div className="modal-footer">
            <button
              className="btn btn-phoenix-secondary"
              onClick={onClose}
              disabled={loading}
            >
              {t("documents.cancel")}
            </button>
            <button
              className={`btn btn-${action === "approve" ? "success" : "danger"}`}
              onClick={submit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {t("documents.processing")}
                </>
              ) : action === "approve" ? (
                t("documents.confirmApprove")
              ) : (
                t("documents.confirmReject")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Panneau de détail latéral
const DetailPanel = ({ doc, onValidate, onClose }) => {
  const { t } = useTranslation();
  if (!doc) return null;
  const fmt = FORMAT_CONFIG[doc.file_format] ?? FORMAT_CONFIG.other;
  const VALIDATION_CONFIG = getValidationConfig(t);
  const val =
    VALIDATION_CONFIG[doc.validation_status] ?? VALIDATION_CONFIG.pending;
  const expiring =
    !doc.is_expired && doc.days_until_expiry <= 7 && doc.days_until_expiry >= 0;

  return (
    <div
      className="position-fixed top-0 end-0 h-100 bg-body shadow-lg border-start"
      style={{ width: 380, zIndex: 1050, overflowY: "auto", top: 0 }}
    >
      {/* Header */}
      <div className="p-4 border-bottom d-flex align-items-start justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <div
            className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
            style={{ width: 44, height: 44, background: `${fmt.color}18` }}
          >
            <span
              className={`fas ${fmt.icon} fs-6`}
              style={{ color: fmt.color }}
            />
          </div>
          <div className="min-w-0">
            <h6 className="mb-0 fw-bold text-truncate">{doc.title}</h6>
            <p className="mb-0 fs-10 text-body-tertiary">
              {doc.document_type_name}
            </p>
          </div>
        </div>
        <button
          className="btn btn-sm btn-phoenix-secondary flex-shrink-0"
          onClick={onClose}
        >
          <span className="fas fa-times" />
        </button>
      </div>

      <div className="p-4">
        {/* Badge statut + alerte expiration */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <span className={`badge badge-phoenix badge-phoenix-${val.badge}`}>
            <span className={`fas ${val.icon} me-1`} />
            {val.label}
          </span>
          {expiring && (
            <span className="badge badge-phoenix badge-phoenix-warning">
              <span className="fas fa-triangle-exclamation me-1" />
              {t("documents.expiresIn", { count: doc.days_until_expiry })}
            </span>
          )}
          {doc.is_expired && (
            <span className="badge badge-phoenix badge-phoenix-danger">
              <span className="fas fa-calendar-xmark me-1" />
              {t("documents.statusExpired")}
            </span>
          )}
        </div>

        {/* Expédition liée */}
        <div className="mb-4">
          <p className="fs-10 fw-semibold text-body-tertiary text-uppercase mb-2">
            {t("documents.shipment")}
          </p>
          <NavLink
            className="d-flex align-items-center gap-2 text-primary fw-semibold fs-9"
            to={`/expeditions/${doc.shipment}`}
          >
            <span className="fas fa-folder-open me-1" />
            {t("documents.viewFile")}
          </NavLink>
        </div>

        {/* Métadonnées */}
        <div className="mb-4">
          <p className="fs-10 fw-semibold text-body-tertiary text-uppercase mb-2">
            {t("documents.info")}
          </p>
          {[
            [t("documents.reference"), doc.reference_number],
            [t("documents.file"), doc.original_filename],
            [t("documents.size"), fmtSize(doc.file_size_bytes)],
            [t("documents.authority"), doc.issuing_authority],
            [t("documents.issueDate"), fmtDate(doc.issue_date)],
            [t("documents.uploadedBy"), doc.uploaded_by_name],
            [t("documents.uploadedAt"), fmtDate(doc.uploaded_at)],
          ].map(([label, value]) =>
            value ? (
              <div
                key={label}
                className="d-flex justify-content-between py-1 border-bottom border-translucent"
              >
                <span className="fs-9 text-body-tertiary">{label}</span>
                <span
                  className="fs-9 fw-semibold text-end"
                  style={{ maxWidth: "60%" }}
                >
                  {value}
                </span>
              </div>
            ) : null,
          )}
        </div>

        {/* Date d'expiration */}
        {doc.expiry_date && (
          <div className="mb-4">
            <p className="fs-10 fw-semibold text-body-tertiary text-uppercase mb-2">
              {t("documents.expiration")}
            </p>
            <div
              className={`d-flex align-items-center gap-2 p-2 rounded-2 ${doc.is_expired ? "bg-danger-subtle" : expiring ? "bg-warning-subtle" : "bg-body-tertiary"}`}
            >
              <span
                className={`fas fa-calendar-days ${doc.is_expired ? "text-danger" : expiring ? "text-warning" : "text-body-tertiary"}`}
              />
              <span
                className={`fs-9 fw-semibold ${doc.is_expired ? "text-danger" : expiring ? "text-warning" : ""}`}
              >
                {fmtDate(doc.expiry_date)}
                {!doc.is_expired && doc.days_until_expiry >= 0 && (
                  <span className="ms-2 fw-normal text-body-tertiary">
                    ({t("documents.daysLeft", { count: doc.days_until_expiry })})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Info validation */}
        {doc.validation_status !== "pending" && (
          <div className="mb-4">
            <p className="fs-10 fw-semibold text-body-tertiary text-uppercase mb-2">
              {t("documents.validation")}
            </p>
            {doc.validated_by && (
              <p className="fs-9 mb-1">
                {t("documents.validatedBy", {
                  name: doc.validated_by?.full_name ?? "—",
                  date: fmtDate(doc.validated_at),
                })}
              </p>
            )}
            {doc.rejection_reason && (
              <div className="alert alert-danger py-2 px-3 fs-9 mb-0">
                <span className="fas fa-info-circle me-2" />
                {doc.rejection_reason}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {doc.notes && (
          <div className="mb-4">
            <p className="fs-10 fw-semibold text-body-tertiary text-uppercase mb-2">
              {t("documents.notes")}
            </p>
            <p className="fs-9 text-body-tertiary mb-0">{doc.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex flex-column gap-2">
          {doc.file && (
            <a
              className="btn btn-primary w-100"
              href={doc.file}
              target="_blank"
              rel="noreferrer"
            >
              <span className="fas fa-download me-2" />
              {t("documents.download")}
            </a>
          )}
          {doc.validation_status === "pending" && (
            <button
              className="btn btn-phoenix-success w-100"
              onClick={() => onValidate(doc)}
            >
              <span className="fas fa-shield-check me-2" />
              {t("documents.validateReject")}
            </button>
          )}
          <NavLink
            className="btn btn-phoenix-secondary w-100"
            to={`/expeditions/${doc.shipment}`}
          >
            <span className="fas fa-folder-open me-2" />
            {t("documents.openShipment")}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────

export default function DocumentsPage() {
  const { t } = useTranslation();
  const VALIDATION_CONFIG = getValidationConfig(t);
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(reducer, {
    ...init,
    shipment: searchParams.get("shipment") ?? "",
  });
  const { search, status, doc_type, shipment, page, showFilters } = state;

  const [documents, setDocuments] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null); // doc sélectionné
  const [validating, setValidating] = useState(null); // doc à valider

  // ── Chargement des types de documents (une fois) ────────
  useEffect(() => {
    axiosClient
      .get("/document-types/")
      .then(({ data }) => setDocTypes(data.results ?? data));
  }, []);

  // ── Chargement des documents ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = {};
    if (search) params.search = search;
    if (status) params.validation_status = status;
    if (doc_type) params.document_type = doc_type;
    if (shipment) params.shipment = shipment;

    const run = () => {
      axiosClient
        .get("/documents/", { params })
        .then(({ data }) => {
          if (!cancelled) setDocuments(data.results ?? data);
        })
        .catch((err) => {
          if (!cancelled)
            setError(err.response?.data?.detail ?? t("documents.loadError"));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    const t = search ? setTimeout(run, 350) : (run(), undefined);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, status, doc_type, shipment]);

  // ── KPIs ────────────────────────────────────────────────
  const kpis = useMemo(
    () => ({
      total: documents.length,
      pending: documents.filter((d) => d.validation_status === "pending")
        .length,
      approved: documents.filter((d) => d.validation_status === "approved")
        .length,
      expiring:
        documents.filter(
          (d) =>
            !d.is_expired &&
            d.days_until_expiry <= 7 &&
            d.days_until_expiry >= 0,
        ).length + documents.filter((d) => d.is_expired).length,
    }),
    [documents],
  );

  // ── Alertes expiration ──────────────────────────────────
  const expiringDocs = useMemo(
    () =>
      documents.filter(
        (d) =>
          d.is_expired ||
          (d.days_until_expiry >= 0 && d.days_until_expiry <= 7),
      ),
    [documents],
  );

  // ── Pagination locale ───────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));
  const pagedDocs = documents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || status || doc_type || shipment;

  const pageNums = useMemo(() => {
    const nums = [],
      w = 5;
    let s = Math.max(1, page - 2),
      e = Math.min(totalPages, s + w - 1);
    if (e - s < w - 1) s = Math.max(1, e - w + 1);
    for (let i = s; i <= e; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  const f = (key, value) => dispatch({ type: "FILTER", key, value });

  // Callback après validation
  const onValidated = (updated) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)),
    );
    if (detail?.id === updated.id) setDetail({ ...detail, ...updated });
    setValidating(null);
  };

  return (
    <>
      <div className="pb-6">
        {/* EN-TÊTE */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="mb-1">{t("documents.title")}</h2>
            <p className="text-body-tertiary mb-0 fs-9">
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {t("documents.loading")}
                </>
              ) : (
                <>
                  {documents.length} document{documents.length !== 1 ? "s" : ""}
                </>
              )}
              {hasFilters && (
                <button
                  className="btn btn-link p-0 ms-2 fs-9 text-danger"
                  onClick={() => dispatch({ type: "RESET" })}
                >
                  {t("documents.reset")}
                </button>
              )}
            </p>
          </div>
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#uploadDocumentModal"
          >
            <span className="fas fa-upload me-2" />
            {t("documents.upload")}
          </button>
        </div>

        {/* KPIs */}
        <div className="row g-3 mb-4">
          <KpiCard
            label={t("documents.kpiTotal")}
            value={kpis.total}
            badge="primary"
            icon="fa-file-alt"
            sub={t("documents.kpiTotalSub")}
          />
          <KpiCard
            label={t("documents.kpiPending")}
            value={kpis.pending}
            badge="warning"
            icon="fa-clock"
            sub={t("documents.kpiPendingSub")}
          />
          <KpiCard
            label={t("documents.kpiApproved")}
            value={kpis.approved}
            badge="success"
            icon="fa-check-circle"
            sub={t("documents.kpiApprovedSub")}
          />
          <KpiCard
            label={t("documents.kpiExpiring")}
            value={kpis.expiring}
            badge="danger"
            icon="fa-triangle-exclamation"
            sub={t("documents.kpiExpiringSub")}
          />
        </div>

        {/* ALERTE EXPIRATION */}
        {expiringDocs.length > 0 && (
          <div className="alert alert-danger border border-danger-subtle d-flex align-items-start gap-3 mb-4 py-3">
            <span className="fas fa-triangle-exclamation text-danger fs-6 flex-shrink-0 mt-1" />
            <div className="flex-grow-1 min-w-0">
              <p className="mb-1 fw-semibold fs-9">
                {expiringDocs.length}{" "}
                {t(
                  expiringDocs.length > 1
                    ? "documents.alertDocsPlural"
                    : "documents.alertDocs",
                )}{" "}
                {t(
                  expiringDocs.length > 1
                    ? "documents.alertRequirePlural"
                    : "documents.alertRequire",
                )}{" "}
                {t("documents.alertAttention")}
              </p>
              <div className="d-flex flex-wrap gap-2">
                {expiringDocs.slice(0, 5).map((d) => (
                  <button
                    key={d.id}
                    className="btn btn-sm btn-danger py-0 px-2 fs-10"
                    onClick={() => setDetail(d)}
                  >
                    {d.document_type_name}
                    {d.is_expired
                      ? ` · ${t("documents.statusExpired")}`
                      : ` · ${d.days_until_expiry}j`}
                  </button>
                ))}
                {expiringDocs.length > 5 && (
                  <span className="fs-10 text-danger align-self-center">
                    +{expiringDocs.length - 5} {t("documents.others")}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BARRE D'OUTILS */}
        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <div className="search-box flex-grow-1" style={{ maxWidth: 400 }}>
            <input
              className="form-control search-input"
              type="search"
              placeholder={t("documents.searchPlaceholder")}
              value={search}
              onChange={(e) => f("search", e.target.value)}
            />
            <span className="fas fa-search search-box-icon" />
          </div>
          <button
            className={`btn btn-sm ${showFilters ? "btn-phoenix-primary" : "btn-phoenix-secondary"}`}
            onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
          >
            <span className="fas fa-sliders-h me-2" />
            {t("documents.filters")}
            {hasFilters && (
              <span className="ms-2 badge badge-phoenix badge-phoenix-danger">
                !
              </span>
            )}
          </button>
        </div>

        {/* FILTRES AVANCÉS */}
        {showFilters && (
          <div className="card mb-3">
            <div className="card-body py-3">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label fs-10 fw-semibold text-body-tertiary mb-1">
                    {t("documents.status")}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={status}
                    onChange={(e) => f("status", e.target.value)}
                  >
                    <option value="">{t("documents.allStatuses")}</option>
                    {Object.entries(VALIDATION_CONFIG).map(([v, { label }]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label fs-10 fw-semibold text-body-tertiary mb-1">
                    {t("documents.type")}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={doc_type}
                    onChange={(e) => f("doc_type", e.target.value)}
                  >
                    <option value="">{t("documents.allTypes")}</option>
                    {docTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>
                        {dt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-4">
                  <label className="form-label fs-10 fw-semibold text-body-tertiary mb-1">
                    {t("documents.shipment")}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={t("documents.shipmentPlaceholder")}
                    value={shipment}
                    onChange={(e) => f("shipment", e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-sm btn-phoenix-secondary"
                    onClick={() => dispatch({ type: "RESET" })}
                  >
                    <span className="fas fa-times me-1" />
                    {t("documents.reset")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERREUR */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 fs-9">
            <span className="fas fa-exclamation-circle flex-shrink-0" />
            {error}
          </div>
        )}

        {/* TABLEAU */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive scrollbar">
              <table className="table table-hover fs-9 mb-0 border-top border-translucent">
                <thead>
                  <tr>
                    <th className="align-middle ps-3" style={{ minWidth: 220 }}>
                      {t("documents.document")}
                    </th>
                    <th className="align-middle" style={{ minWidth: 160 }}>
                      {t("documents.shipment")}
                    </th>
                    <th className="align-middle" style={{ minWidth: 140 }}>
                      {t("documents.status")}
                    </th>
                    <th className="align-middle" style={{ minWidth: 110 }}>
                      {t("documents.issue")}
                    </th>
                    <th className="align-middle" style={{ minWidth: 130 }}>
                      {t("documents.expiration")}
                    </th>
                    <th className="align-middle" style={{ minWidth: 150 }}>
                      {t("documents.uploadedBy")}
                    </th>
                    <th className="align-middle" style={{ minWidth: 80 }}>
                      {t("documents.size")}
                    </th>
                    <th className="align-middle pe-3" style={{ width: 48 }} />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="py-3">
                            <div
                              className="bg-body-secondary rounded placeholder-wave"
                              style={{
                                height: 13,
                                width: [180, 120, 90, 80, 90, 120, 50][j],
                                opacity: 0.4,
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : pagedDocs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-7 text-body-tertiary"
                      >
                        <span className="fas fa-file-circle-xmark fs-4 d-block mb-2 opacity-50" />
                        {hasFilters
                          ? t("documents.noResult")
                          : t("documents.noDocuments")}
                      </td>
                    </tr>
                  ) : (
                    pagedDocs.map((d) => {
                      const fmt =
                        FORMAT_CONFIG[d.file_format] ?? FORMAT_CONFIG.other;
                      const val =
                        VALIDATION_CONFIG[d.validation_status] ??
                        VALIDATION_CONFIG.pending;
                      const expiring =
                        !d.is_expired &&
                        d.days_until_expiry >= 0 &&
                        d.days_until_expiry <= 7;
                      const isExpired = d.is_expired || d.days_until_expiry < 0;

                      return (
                        <tr
                          key={d.id}
                          className="hover-actions-trigger btn-reveal-trigger position-static"
                          style={{ cursor: "pointer" }}
                          onClick={() => setDetail(d)}
                        >
                          {/* Document */}
                          <td className="align-middle ps-3">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                                style={{
                                  width: 36,
                                  height: 36,
                                  background: `${fmt.color}18`,
                                }}
                              >
                                <span
                                  className={`fas ${fmt.icon}`}
                                  style={{ color: fmt.color, fontSize: 15 }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="mb-0 fw-semibold text-body-highlight text-truncate"
                                  style={{ maxWidth: 160 }}
                                >
                                  {d.title}
                                </p>
                                <p className="mb-0 fs-10 text-body-tertiary">
                                  {d.document_type_name}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Expédition */}
                          <td className="align-middle">
                            <NavLink
                              className="fw-semibold text-primary fs-9"
                              to={`/expeditions/${d.shipment}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="fas fa-folder me-1 opacity-50" />
                              {t("documents.viewFolder")}
                            </NavLink>
                            {d.reference_number && (
                              <p className="mb-0 fs-10 text-body-tertiary">
                                {d.reference_number}
                              </p>
                            )}
                          </td>

                          {/* Statut */}
                          <td className="align-middle">
                            <span
                              className={`badge badge-phoenix badge-phoenix-${val.badge}`}
                            >
                              <span className={`fas ${val.icon} me-1`} />
                              {val.label}
                            </span>
                          </td>

                          {/* Émission */}
                          <td className="align-middle white-space-nowrap">
                            <span className="fs-9 text-body-tertiary">
                              {fmtDate(d.issue_date)}
                            </span>
                          </td>

                          {/* Expiration */}
                          <td className="align-middle white-space-nowrap">
                            {d.expiry_date ? (
                              <div>
                                <span
                                  className={`fs-9 fw-semibold ${expiryClass(d.days_until_expiry, isExpired)}`}
                                >
                                  {isExpired && (
                                    <span className="fas fa-triangle-exclamation me-1" />
                                  )}
                                  {expiring && (
                                    <span className="fas fa-clock me-1" />
                                  )}
                                  {fmtDate(d.expiry_date)}
                                </span>
                                {!isExpired && d.days_until_expiry >= 0 && (
                                  <p
                                    className={`mb-0 fs-10 ${expiryClass(d.days_until_expiry, false)}`}
                                  >
                                    {t("documents.daysLeft", { count: d.days_until_expiry })}
                                  </p>
                                )}
                                {isExpired && (
                                  <p className="mb-0 fs-10 text-danger">
                                    {t("documents.statusExpired")}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-body-quaternary fs-9">
                                —
                              </span>
                            )}
                          </td>

                          {/* Uploadé par */}
                          <td className="align-middle">
                            <p className="mb-0 fs-9 fw-semibold">
                              {d.uploaded_by_name ?? "—"}
                            </p>
                            <p className="mb-0 fs-10 text-body-tertiary">
                              {fmtDate(d.uploaded_at)}
                            </p>
                          </td>

                          {/* Taille */}
                          <td className="align-middle">
                            <span className="fs-9 text-body-tertiary">
                              {fmtSize(d.file_size_bytes)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td
                            className="align-middle pe-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="btn btn-sm dropdown-toggle dropdown-caret-none btn-reveal"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              <span className="fas fa-ellipsis-h" />
                            </button>
                            <div className="dropdown-menu dropdown-menu-end py-2">
                              <button
                                className="dropdown-item"
                                onClick={() => setDetail(d)}
                              >
                                <span className="fas fa-eye me-2 text-body-tertiary" />
                                {t("documents.viewDetails")}
                              </button>
                              {d.file && (
                                <a
                                  className="dropdown-item"
                                  href={d.file}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <span className="fas fa-download me-2 text-body-tertiary" />
                                  {t("documents.download")}
                                </a>
                              )}
                              {d.validation_status === "pending" && (
                                <button
                                  className="dropdown-item"
                                  onClick={() => setValidating(d)}
                                >
                                  <span className="fas fa-shield-check me-2 text-success" />
                                  {t("documents.validateReject")}
                                </button>
                              )}
                              <NavLink
                                className="dropdown-item"
                                to={`/expeditions/${d.shipment}`}
                              >
                                <span className="fas fa-folder-open me-2 text-body-tertiary" />
                                {t("documents.openShipment")}
                              </NavLink>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          {!loading && documents.length > PAGE_SIZE && (
            <div className="card-footer d-flex align-items-center justify-content-between py-3 flex-wrap gap-2">
              <p className="mb-0 fs-9 text-body-tertiary">
                {t("documents.displayRange", {
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, documents.length),
                  total: documents.length,
                })}
              </p>
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm btn-phoenix-secondary"
                  disabled={page === 1}
                  onClick={() => dispatch({ type: "PAGE", page: 1 })}
                >
                  <span className="fas fa-angle-double-left" />
                </button>
                <button
                  className="btn btn-sm btn-phoenix-secondary"
                  disabled={page === 1}
                  onClick={() => dispatch({ type: "PAGE", page: page - 1 })}
                >
                  <span className="fas fa-chevron-left" />
                </button>
                {pageNums.map((n) => (
                  <button
                    key={n}
                    className={`btn btn-sm ${n === page ? "btn-primary" : "btn-phoenix-secondary"}`}
                    onClick={() => dispatch({ type: "PAGE", page: n })}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-phoenix-secondary"
                  disabled={page === totalPages}
                  onClick={() => dispatch({ type: "PAGE", page: page + 1 })}
                >
                  <span className="fas fa-chevron-right" />
                </button>
                <button
                  className="btn btn-sm btn-phoenix-secondary"
                  disabled={page === totalPages}
                  onClick={() => dispatch({ type: "PAGE", page: totalPages })}
                >
                  <span className="fas fa-angle-double-right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PANNEAU DÉTAIL */}
      {detail && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1049, background: "rgba(0,0,0,.2)" }}
            onClick={() => setDetail(null)}
          />
          <DetailPanel
            doc={detail}
            onValidate={(d) => {
              setDetail(null);
              setValidating(d);
            }}
            onClose={() => setDetail(null)}
          />
        </>
      )}

      {/* MODAL VALIDATION */}
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
