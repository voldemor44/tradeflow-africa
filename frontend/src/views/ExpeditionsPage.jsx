import { useReducer, useMemo, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import NewShipmentModal from "../components/Newshipmentmodal";
import EditShipmentModal from "../components/Editshipmentmodal";
import { NavLink } from "react-router-dom";
import axiosClient from "../axios-client";
import { useTranslation } from "react-i18next";

// ─── CONFIG ────────────────────────────────────────────────

const getStatusConfig = (t) => ({
  draft: { label: t("expeditions.statusDraft"), badge: "secondary" },
  booking: { label: t("expeditions.statusBooking"), badge: "info" },
  goods_ready: { label: t("expeditions.statusGoodsReady"), badge: "info" },
  in_transit: { label: t("expeditions.statusInTransit"), badge: "primary" },
  at_origin_port: { label: t("expeditions.statusAtOrigin"), badge: "warning" },
  on_vessel: { label: t("expeditions.statusOnVessel"), badge: "primary" },
  at_dest_port: { label: t("expeditions.statusAtDest"), badge: "warning" },
  customs: { label: t("expeditions.statusCustoms"), badge: "warning" },
  cleared: { label: t("expeditions.statusCleared"), badge: "success" },
  out_for_delivery: { label: t("expeditions.statusOutForDelivery"), badge: "info" },
  delivered: { label: t("expeditions.statusDelivered"), badge: "success" },
  on_hold: { label: t("expeditions.statusOnHold"), badge: "danger" },
  cancelled: { label: t("expeditions.statusCancelled"), badge: "secondary" },
});

const getModeConfig = (t) => ({
  sea: { label: t("expeditions.modeSea"), badge: "info", icon: "fa-ship" },
  air: { label: t("expeditions.modeAir"), badge: "primary", icon: "fa-plane" },
  road: { label: t("expeditions.modeRoad"), badge: "warning", icon: "fa-truck" },
  multi: { label: t("expeditions.modeMulti"), badge: "success", icon: "fa-route" },
});

const getStatusPills = (t) => [
  { key: "in_transit", label: t("expeditions.statusInTransit") },
  { key: "on_vessel", label: t("expeditions.statusOnVessel") },
  { key: "at_dest_port", label: t("expeditions.statusAtDest") },
  { key: "customs", label: t("expeditions.statusCustoms") },
  { key: "on_hold", label: t("expeditions.statusOnHold") },
  { key: "delivered", label: t("expeditions.statusDelivered") },
  { key: "booking", label: t("expeditions.statusBooking") },
  { key: "draft", label: t("expeditions.statusDraft") },
];

const PAGE_SIZE = 10;

// ─── HELPERS ───────────────────────────────────────────────

const fmt = (val) =>
  val != null
    ? Number(val).toLocaleString("fr-FR", { maximumFractionDigits: 0 })
    : "—";

const fmtDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("T")[0].split("-");
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

const exportCSV = (rows, MODE_CONFIG, t) => {
  const h = [
    t("expeditions.csvRef"),
    t("expeditions.csvDesc"),
    t("expeditions.csvOrigin"),
    t("expeditions.csvDestination"),
    t("expeditions.csvForwarder"),
    t("expeditions.csvMode"),
    t("expeditions.csvIncoterm"),
    t("expeditions.csvStatus"),
    t("expeditions.csvETA"),
    t("expeditions.csvValue"),
    t("expeditions.csvCurrency"),
    t("expeditions.csvCreated"),
  ];
  const csv = [
    h,
    ...rows.map((s) => [
      s.reference,
      s.goods_description,
      `${s.origin_port_or_city} (${s.origin_country})`,
      `${s.destination_port_or_city} (${s.destination_country})`,
      s.freight_forwarder_name ?? "",
      MODE_CONFIG[s.transport_mode]?.label ?? s.transport_mode,
      s.incoterm,
      s.status_display,
      fmtDate(s.estimated_arrival),
      s.declared_value ?? "",
      s.currency,
      fmtDate(s.created_at),
    ]),
  ]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// Récupère TOUTES les lignes (le backend pagine par défaut à 20 par page)
const fetchAllShipments = async (params) => {
  const all = [];
  let page = 1;
  let count = null;
  while (count === null || all.length < count) {
    const { data } = await axiosClient.get("/shipments/", {
      params: { ...params, page },
    });
    count = data.count ?? 0;
    const results = data.results ?? [];
    if (results.length === 0) break;
    all.push(...results);
    page += 1;
    if (page > 500) break;
  }
  return all;
};

// ─── REDUCER ───────────────────────────────────────────────

const init = {
  // filtres
  search: "",
  status: "",
  mode: "",
  is_archived: false,
  dateFrom: "",
  dateTo: "",
  ordering: "-created_at",
  page: 1,
  // UI
  showFilters: false,
  selected: [],
  selectedShipment: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FILTER":
      // tout changement de filtre remet à la page 1
      return { ...state, [action.key]: action.value, page: 1, selected: [] };
    case "SORT": {
      const cur = state.ordering.replace("-", "");
      const desc = state.ordering.startsWith("-");
      return {
        ...state,
        ordering:
          cur === action.col
            ? desc
              ? action.col
              : `-${action.col}`
            : `-${action.col}`,
        page: 1,
      };
    }
    case "PAGE":
      return { ...state, page: action.page };
    case "TOGGLE_FILTERS":
      return { ...state, showFilters: !state.showFilters };
    case "TOGGLE_ONE": {
      const has = state.selected.includes(action.id);
      return {
        ...state,
        selected: has
          ? state.selected.filter((x) => x !== action.id)
          : [...state.selected, action.id],
      };
    }
    case "TOGGLE_ALL":
      return { ...state, selected: action.ids };
    case "CLEAR_SELECTION":
      return { ...state, selected: [] };
    case "RESET":
      return { ...init, showFilters: state.showFilters };
    case "SET_EDIT":
      return { ...state, selectedShipment: action.shipment };
    case "CLEAR_EDIT":
      return { ...state, selectedShipment: null };
    default:
      return state;
  }
};

// ─── SOUS-COMPOSANTS ───────────────────────────────────────

const StatusBadge = ({ status, display, config }) => {
  const c = config[status] ?? { badge: "secondary", label: status };
  return (
    <span className={`badge badge-phoenix badge-phoenix-${c.badge} fs-10`}>
      {display ?? c.label}
    </span>
  );
};

const ModeBadge = ({ mode, display, config }) => {
  const c = config[mode] ?? {
    badge: "secondary",
    icon: "fa-box",
    label: mode,
  };
  return (
    <span className={`badge badge-phoenix badge-phoenix-${c.badge} fs-10`}>
      <span className={`fas ${c.icon} me-1`} />
      {display ?? c.label}
    </span>
  );
};

const SortTh = ({ col, label, ordering, onSort, className = "" }) => (
  <th
    className={`align-middle white-space-nowrap ${className}`}
    style={{ cursor: col ? "pointer" : "default", minWidth: 100 }}
    onClick={col ? () => onSort(col) : undefined}
  >
    {label}
    {col &&
      (ordering.replace("-", "") === col ? (
        <span
          className={`fas ${ordering.startsWith("-") ? "fa-sort-down" : "fa-sort-up"} ms-1 text-primary`}
        />
      ) : (
        <span className="fas fa-sort ms-1 text-body-quaternary" />
      ))}
  </th>
);

const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 11 }).map((_, i) => (
      <td
        key={i}
        className={`py-3${i === 0 ? " ps-3" : ""}${i === 9 ? " text-end pe-3" : ""}${i === 10 ? " pe-3" : ""}`}
      >
        <div
          className={`bg-body-secondary rounded placeholder-wave${i === 9 ? " ms-auto" : ""}`}
          style={{
            height: 13,
            width: [16, 110, 170, 150, 130, 60, 55, 90, 80, 90, 28][i],
            opacity: 0.45,
          }}
        />
      </td>
    ))}
  </tr>
);

// ─── TEMPLATE D'EXPORT PDF (impression) ────────────────────
const PrintTemplate = ({
  rows,
  generatedAt,
  lang,
  filters,
  t,
  STATUS_CONFIG,
  MODE_CONFIG,
}) => {
  const when = new Intl.DateTimeFormat(lang, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(generatedAt);

  const route = (s) => {
    const org = s.origin_port_or_city
      ? `${s.origin_port_or_city}${s.origin_country ? ` (${s.origin_country})` : ""}`
      : s.origin_country;
    const dst = s.destination_port_or_city
      ? `${s.destination_port_or_city}${s.destination_country ? ` (${s.destination_country})` : ""}`
      : s.destination_country;
    return [org, dst].filter(Boolean).join(" → ") || "—";
  };
  const statusLabel = (s) =>
    s.status_display || STATUS_CONFIG[s.status]?.label || s.status || "—";
  const modeLabel = (s) =>
    s.transport_mode_display ||
    MODE_CONFIG[s.transport_mode]?.label ||
    s.transport_mode ||
    "—";

  return (
    <div id="print-root" className="d-none d-print-block">
      <style>{`
        #print-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          color: #1f2937;
          font-size: 11px;
        }
        #print-root .pf-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          border-bottom: 2px solid #15202b;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        #print-root .pf-title { margin: 0; font-size: 20px; font-weight: 800; }
        #print-root .pf-meta {
          font-size: 10.5px;
          color: #6c757d;
          text-align: right;
          line-height: 1.5;
        }
        #print-root .pf-meta.pf-left { text-align: left; }
        #print-root table { width: 100%; border-collapse: collapse; }
        #print-root table thead th {
          text-align: left;
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6c757d;
          border-bottom: 1px solid #adb5bd;
          padding: 6px 8px;
          white-space: nowrap;
        }
        #print-root table tbody td {
          padding: 6px 8px;
          border-bottom: 1px solid #edf0f4;
          vertical-align: top;
        }
        #print-root table tbody tr { break-inside: avoid; }
        #print-root .pf-num { text-align: right; white-space: nowrap; }
        #print-root .pf-desc { white-space: pre-wrap; }
        #print-root .pf-empty { text-align: center; color: #6c757d; padding: 24px 8px; }
        #print-root .pf-footer {
          margin-top: 14px;
          font-size: 10.5px;
          color: #6c757d;
        }
        @page { size: A4; margin: 12mm 14mm; }
        @media print {
          body > #root { display: none !important; }
          #print-root { display: block !important; }
        }
      `}</style>

      <div className="pf-header">
        <div>
          <h1 className="pf-title">{t("expeditions.pdfExport")}</h1>
          <div className="pf-meta pf-left">
            {t("expeditions.printGenerated", { date: when })} ·{" "}
            {t("expeditions.printCount", { count: rows.length })}
          </div>
        </div>
        {filters && <div className="pf-meta">{filters}</div>}
      </div>

      <table>
        <thead>
          <tr>
            <th>{t("expeditions.csvRef")}</th>
            <th>{t("expeditions.csvDesc")}</th>
            <th>{t("expeditions.route")}</th>
            <th>{t("expeditions.csvForwarder")}</th>
            <th>{t("expeditions.csvMode")}</th>
            <th>{t("expeditions.csvIncoterm")}</th>
            <th>{t("expeditions.csvStatus")}</th>
            <th>{t("expeditions.csvETA")}</th>
            <th className="pf-num">{t("expeditions.csvValue")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="pf-empty">
                {t("expeditions.noExpeditions")}
              </td>
            </tr>
          ) : (
            rows.map((s) => (
              <tr key={s.id}>
                <td>
                  <div>{s.reference}</div>
                  <div className="pf-meta pf-left">{fmtDate(s.created_at)}</div>
                </td>
                <td className="pf-desc">{s.goods_description || "—"}</td>
                <td>{route(s)}</td>
                <td>{s.freight_forwarder_name || "—"}</td>
                <td>{modeLabel(s)}</td>
                <td>{s.incoterm || "—"}</td>
                <td>{statusLabel(s)}</td>
                <td>{fmtDate(s.estimated_arrival)}</td>
                <td className="pf-num">
                  {s.declared_value != null
                    ? `${fmt(s.declared_value)}${s.currency ? ` ${s.currency}` : ""}`
                    : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pf-footer">
        {t("expeditions.displayRange", {
          from: 1,
          to: rows.length,
          total: rows.length,
        })}
      </div>
    </div>
  );
};

// ─── COMPOSANT ─────────────────────────────────────────────

export default function ExpeditionsPage() {
  const { t, i18n } = useTranslation();
  const STATUS_CONFIG = getStatusConfig(t);
  const MODE_CONFIG = getModeConfig(t);
  const STATUS_PILLS = getStatusPills(t);
  const [state, dispatch] = useReducer(reducer, init);
  const {
    search,
    status,
    mode,
    is_archived,
    dateFrom,
    dateTo,
    ordering,
    page,
    showFilters,
    selected,
    selectedShipment,
  } = state;

  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Export PDF : données à imprimer + état d'export
  const [printData, setPrintData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const printTriggered = useRef(false);

  // ── Fetch déclenché par TOUS les paramètres ─────────────
  useEffect(() => {
    let cancelled = false;

    const run = () => {
      setLoading(true);
      setError(null);

      const params = { ordering };
      if (search) params.search = search;
      if (status) params.status = status;
      if (mode) params.transport_mode = mode;
      if (is_archived) params.is_archived = true;
      if (dateFrom) params.estimated_arrival_after = dateFrom;
      if (dateTo) params.estimated_arrival_before = dateTo;

      axiosClient
        .get("/shipments/", { params })
        .then(({ data }) => {
          if (!cancelled) {
            setShipments(data.results);
            setTotal(data.count);
            setHasLoaded(true);
          }
        })
        .catch((err) => {
          if (!cancelled)
            setError(err.response?.data?.detail ?? t("expeditions.errorLoad"));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    // debounce uniquement sur la saisie texte
    if (search) {
      const t = setTimeout(run, 350);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [search, status, mode, is_archived, dateFrom, dateTo, ordering, t]);

  const totalPages = Math.max(1, Math.ceil(shipments.length / PAGE_SIZE));
  const pagedShipments = shipments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // ── Compteurs pills (sur la page courante) ───────────────
  const counts = useMemo(() => {
    const c = {};
    shipments.forEach((s) => {
      c[s.status] = (c[s.status] ?? 0) + 1;
    });
    return c;
  }, [shipments]);

  const hasFilters = search || status || mode || dateFrom || dateTo;
  const allSelected =
    pagedShipments.length > 0 &&
    pagedShipments.every((s) => selected.includes(s.id));
  const selectedRows = shipments.filter((s) => selected.includes(s.id));

  // pages de pagination visibles
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

  // Export PDF : envoie TOUTES les lignes (toutes pages) puis déclenche l'impression
  const exportPDF = async () => {
    if (exporting || printData) return;
    setExporting(true);
    setError(null);
    try {
      const params = { ordering };
      if (search) params.search = search;
      if (status) params.status = status;
      if (mode) params.transport_mode = mode;
      if (is_archived) params.is_archived = true;
      if (dateFrom) params.estimated_arrival_after = dateFrom;
      if (dateTo) params.estimated_arrival_before = dateTo;

      const rows = await fetchAllShipments(params);

      const filters = [
        status ? (STATUS_CONFIG[status]?.label ?? status) : null,
        mode ? (MODE_CONFIG[mode]?.label ?? mode) : null,
        dateFrom ? `${t("expeditions.etaFrom")} ${fmtDate(dateFrom)}` : null,
        dateTo ? `${t("expeditions.etaTo")} ${fmtDate(dateTo)}` : null,
        search ? `« ${search} »` : null,
        is_archived ? t("expeditions.archives") : null,
      ]
        .filter(Boolean)
        .join(" · ");

      setPrintData({ rows, generatedAt: new Date(), filters });
    } catch {
      setError(t("expeditions.errorLoad"));
    } finally {
      setExporting(false);
    }
  };

  // Déclenche l'impression une fois le template rendu, puis nettoie après
  useEffect(() => {
    if (!printData) {
      printTriggered.current = false;
      return undefined;
    }
    const done = () => {
      printTriggered.current = false;
      setPrintData(null);
    };
    window.addEventListener("afterprint", done);
    const timer = setTimeout(() => {
      if (printTriggered.current) return;
      printTriggered.current = true;
      if (typeof window.print === "function") window.print();
    }, 80);
    return () => {
      window.removeEventListener("afterprint", done);
      clearTimeout(timer);
    };
  }, [printData]);

  // Archivage
  const archive = (id) =>
    axiosClient
      .post(`/shipments/${id}/archive/`, { archive: true })
      .then(() => setShipments((prev) => prev.filter((s) => s.id !== id)));

  // Callbacks modals
  const onUpdated = (updated) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
    dispatch({ type: "CLEAR_EDIT" });
  };
  const onCreated = (created) => {
    setShipments((prev) => [created, ...prev]);
    setTotal((n) => n + 1);
  };

  return (
    <>
      <div className="pb-6">
        {/* EN-TÊTE */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="mb-1">{t("expeditions.title")}</h2>
            <p className="text-body-tertiary mb-0 fs-9">
              {loading && !hasLoaded ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {t("expeditions.loading")}
                </>
              ) : (
                <>
                  {total} dossier{total !== 1 ? "s" : ""}
                  {loading && hasLoaded && (
                    <span className="spinner-border spinner-border-sm ms-2 text-primary" />
                  )}
                </>
              )}
              {hasFilters && (
                <button
                  className="btn btn-link p-0 ms-2 fs-9 text-danger"
                  onClick={() => dispatch({ type: "RESET" })}
                >
                  {t("expeditions.resetFilters")}
                </button>
              )}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${is_archived ? "btn-warning" : "btn-phoenix-secondary"}`}
              onClick={() => f("is_archived", !is_archived)}
            >
              <span className="fas fa-archive me-2" />
              {is_archived ? t("expeditions.viewActive") : t("expeditions.archives")}
            </button>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#newShipmentModal"
            >
              <span className="fas fa-plus me-2" />
              {t("expeditions.newExpedition")}
            </button>
          </div>
        </div>

        {/* ERREUR */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 fs-9">
            <span className="fas fa-exclamation-circle flex-shrink-0" />
            {error}
          </div>
        )}

        {/* PILLS STATUTS */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm ${!status ? "btn-primary" : "btn-phoenix-secondary"}`}
            onClick={() => f("status", "")}
          >
            {t("expeditions.all")}{" "}
            <span className="ms-2 badge bg-body-secondary text-body fw-bold">
              {total}
            </span>
          </button>
          {STATUS_PILLS.map(({ key, label }) =>
            counts[key] > 0 ? (
              <button
                key={key}
                className={`btn btn-sm ${status === key ? `btn-phoenix-${STATUS_CONFIG[key].badge}` : "btn-phoenix-secondary"}`}
                onClick={() => f("status", status === key ? "" : key)}
              >
                {label}
                <span
                  className={`ms-2 badge badge-phoenix badge-phoenix-${STATUS_CONFIG[key].badge}`}
                >
                  {counts[key]}
                </span>
              </button>
            ) : null,
          )}
        </div>

        {/* BARRE D'OUTILS */}
        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <div className="search-box flex-grow-1" style={{ maxWidth: 420 }}>
            <div className="position-relative">
              <input
                className="form-control search-input form-control-sm"
                type="search"
                placeholder={t("expeditions.searchPlaceholder")}
                value={search}
                onChange={(e) => f("search", e.target.value)}
              />
              <span className="fas fa-search search-box-icon" />
            </div>
          </div>
          <button
            className={`btn btn-sm ${showFilters ? "btn-phoenix-primary" : "btn-phoenix-secondary"}`}
            onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
          >
            <span className="fas fa-sliders-h me-2" />
            {t("expeditions.filters")}
            {hasFilters && (
              <span className="ms-2 badge badge-phoenix badge-phoenix-danger">
                !
              </span>
            )}
          </button>
          {selected.length > 0 ? (
            <div className="d-flex align-items-center gap-2 ms-auto">
              <span className="fs-9 text-body-tertiary">
                {selected.length > 1
                  ? t("expeditions.selectedCountPlural", { count: selected.length })
                  : t("expeditions.selectedCount", { count: selected.length })}
              </span>
              <button
                className="btn btn-sm btn-phoenix-secondary"
                onClick={() => exportCSV(selectedRows, MODE_CONFIG, t)}
              >
                <span className="fas fa-download me-1" />
                {t("expeditions.export")}
              </button>
              <button
                className="btn btn-sm btn-phoenix-danger"
                onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
              >
                {t("expeditions.deselect")}
              </button>
            </div>
          ) : (
            <div className="ms-auto d-flex gap-2">
              <button
                className="btn btn-sm btn-phoenix-secondary"
                onClick={() => exportCSV(shipments, MODE_CONFIG, t)}
              >
                <span className="fas fa-file-csv me-2" />
                CSV
              </button>
              <button
                className="btn btn-sm btn-phoenix-secondary"
                onClick={exportPDF}
                disabled={exporting || !!printData}
              >
                {exporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {t("expeditions.exporting")}
                  </>
                ) : (
                  <>
                    <span className="fas fa-file-pdf me-2" />
                    PDF
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* FILTRES AVANCÉS */}
        {showFilters && (
          <div className="card mb-3">
            <div className="card-body py-3">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label fs-10 fw-semibold text-body-tertiary mb-1">
                    {t("expeditions.status")}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={status}
                    onChange={(e) => f("status", e.target.value)}
                  >
                    <option value="">{t("expeditions.allStatuses")}</option>
                    {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-2">
                  <label className="form-label fs-10 fw-semibold text-body-tertiary mb-1">
                    {t("expeditions.mode")}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={mode}
                    onChange={(e) => f("mode", e.target.value)}
                  >
                    <option value="">{t("expeditions.allModes")}</option>
                    {Object.entries(MODE_CONFIG).map(([v, { label }]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-2">
                  <label className="form-label fs-10 fw-semibold text-body-tertiary mb-1">
                    {t("expeditions.etaFrom")}
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateFrom}
                    onChange={(e) => f("dateFrom", e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-2">
                  <label className="form-label fs-10 fw-semibold text-body-tertiary mb-1">
                    {t("expeditions.etaTo")}
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateTo}
                    onChange={(e) => f("dateTo", e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-sm btn-phoenix-secondary"
                    onClick={() => dispatch({ type: "RESET" })}
                  >
                    <span className="fas fa-times me-1" />
                    {t("expeditions.reset")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABLEAU */}
        <div className="card position-relative">
          {loading && hasLoaded && (
            <div
              className="progress position-absolute top-0 start-0 end-0 rounded-0"
              style={{ height: 2, zIndex: 1 }}
            >
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                style={{ width: "100%" }}
              />
            </div>
          )}
          <div className="card-body p-0">
            <div className="table-responsive scrollbar">
              <table className="table table-hover fs-9 mb-0 border-top border-translucent">
                <thead>
                  <tr>
                    <th className="ps-3 align-middle" style={{ width: 40 }}>
                      <div className="form-check mb-0 fs-8">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={allSelected}
                          disabled={loading && !hasLoaded}
                          onChange={() =>
                            dispatch({
                              type: "TOGGLE_ALL",
                              ids: allSelected
                                ? []
                                : pagedShipments.map((s) => s.id),
                            })
                          }
                        />
                      </div>
                    </th>
                    <SortTh
                      col="reference"
                      label={t("expeditions.reference")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col="goods_description"
                      label={t("expeditions.goods")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col={null}
                      label={t("expeditions.route")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col={null}
                      label={t("expeditions.forwarder")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col="transport_mode"
                      label={t("expeditions.mode")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col={null}
                      label={t("expeditions.incoterm")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col="status"
                      label={t("expeditions.status")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col="estimated_arrival"
                      label={t("expeditions.eta")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                    />
                    <SortTh
                      col="declared_value"
                      label={t("expeditions.value")}
                      ordering={ordering}
                      onSort={(c) => dispatch({ type: "SORT", col: c })}
                      className="text-end pe-3"
                    />
                    <th style={{ width: 48 }} />
                  </tr>
                </thead>
                <tbody>
                  {loading && !hasLoaded ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : pagedShipments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-7 text-body-tertiary"
                      >
                        <span className="fas fa-inbox fs-5 d-block mb-2 opacity-50" />
                        {hasFilters
                          ? t("expeditions.noResult")
                          : t("expeditions.noExpeditions")}
                      </td>
                    </tr>
                  ) : (
                    pagedShipments.map((s) => (
                      <tr
                        key={s.id}
                        className={`hover-actions-trigger btn-reveal-trigger position-static${selected.includes(s.id) ? " table-active" : ""}`}
                      >
                        <td className="ps-3 align-middle">
                          <div className="form-check mb-0 fs-8">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selected.includes(s.id)}
                              onChange={() =>
                                dispatch({ type: "TOGGLE_ONE", id: s.id })
                              }
                            />
                          </div>
                        </td>
                        <td className="align-middle white-space-nowrap">
                          <NavLink
                            className="fw-bold text-primary"
                            to={`/expeditions/${s.id}`}
                          >
                            {s.reference}
                          </NavLink>
                          <p className="mb-0 fs-10 text-body-tertiary">
                            {fmtDate(s.created_at)}
                          </p>
                        </td>
                        <td className="align-middle">
                          <p
                            className="mb-0 fw-semibold text-body-highlight text-truncate"
                            style={{ maxWidth: 190 }}
                          >
                            {s.goods_description}
                          </p>
                          <p className="mb-0 fs-10 text-body-tertiary">
                            {s.direction_display}
                          </p>
                        </td>
                        <td className="align-middle">
                          <div className="d-flex flex-column gap-1">
                            <span className="fs-10 text-body-tertiary">
                              <span className="fas fa-circle-dot me-1 opacity-50" />
                              {s.origin_port_or_city}
                              <span className="ms-1 badge bg-body-secondary text-body fw-normal">
                                {s.origin_country}
                              </span>
                            </span>
                            <span className="fs-10 fw-semibold">
                              <span className="fas fa-map-marker-alt me-1 text-primary" />
                              {s.destination_port_or_city}
                              <span className="ms-1 badge bg-body-secondary text-body fw-normal">
                                {s.destination_country}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="align-middle white-space-nowrap">
                          {s.freight_forwarder_name ? (
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar avatar-m flex-shrink-0">
                                <div className="avatar-name rounded-circle bg-primary-subtle">
                                  <span className="text-primary fw-bold fs-10">
                                    {s.freight_forwarder_name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <span className="fs-9 fw-semibold">
                                {s.freight_forwarder_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-body-quaternary">—</span>
                          )}
                        </td>
                        <td className="align-middle">
                          <ModeBadge
                            mode={s.transport_mode}
                            display={s.transport_mode_display}
                            config={MODE_CONFIG}
                          />
                        </td>
                        <td className="align-middle">
                          <span className="badge bg-body-secondary text-body fw-bold fs-10">
                            {s.incoterm || "—"}
                          </span>
                        </td>
                        <td className="align-middle">
                          <StatusBadge
                            status={s.status}
                            display={s.status_display}
                            config={STATUS_CONFIG}
                          />
                        </td>
                        <td className="align-middle white-space-nowrap">
                          <span
                            className={`fs-9 fw-semibold ${s.status === "on_hold" ? "text-danger" : ""}`}
                          >
                            {fmtDate(s.estimated_arrival)}
                          </span>
                        </td>
                        <td className="align-middle text-end pe-3 white-space-nowrap">
                          {s.declared_value != null ? (
                            <>
                              <span className="fs-9 fw-semibold">
                                {fmt(s.declared_value)}
                              </span>
                              {s.currency && (
                                <span className="fs-10 text-body-tertiary ms-1">
                                  {s.currency}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-body-quaternary">—</span>
                          )}
                        </td>
                        <td className="align-middle pe-3">
                          <button
                            className="btn btn-sm dropdown-toggle dropdown-caret-none btn-reveal"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            <span className="fas fa-ellipsis-h" />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end py-2">
                            <NavLink
                              className="dropdown-item"
                              to={`/expeditions/${s.id}`}
                            >
                              <span className="fas fa-eye me-2 text-body-tertiary" />
                              {t("expeditions.viewFile")}
                            </NavLink>
                            <button
                              className="dropdown-item w-100 text-start border-0 bg-transparent"
                              onClick={() =>
                                dispatch({ type: "SET_EDIT", shipment: s })
                              }
                            >
                              <span className="fas fa-edit me-2 text-body-tertiary" />
                              {t("expeditions.edit")}
                            </button>
                            <NavLink
                              className="dropdown-item"
                              to={`/documents?shipment=${s.id}`}
                            >
                              <span className="fas fa-file-alt me-2 text-body-tertiary" />
                              {t("expeditions.documents")}
                            </NavLink>
                            <NavLink
                              className="dropdown-item"
                              to={`/tracking/carte?shipment=${s.id}`}
                            >
                              <span className="fas fa-map-marker-alt me-2 text-body-tertiary" />
                              {t("expeditions.onMap")}
                            </NavLink>
                            {!s.is_archived && (
                              <>
                                <div className="dropdown-divider" />
                                <button
                                  className="dropdown-item text-danger w-100 text-start border-0 bg-transparent"
                                  onClick={() => archive(s.id)}
                                >
                                  <span className="fas fa-archive me-2" />
                                  {t("expeditions.archive")}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          {total > PAGE_SIZE && (
            <div className="card-footer d-flex align-items-center justify-content-between py-3 flex-wrap gap-2">
              <p className="mb-0 fs-9 text-body-tertiary">
                {t("expeditions.displayRange", {
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, total),
                  total,
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

      <EditShipmentModal
        shipment={selectedShipment}
        onUpdated={onUpdated}
        onClose={() => dispatch({ type: "CLEAR_EDIT" })}
      />
      <NewShipmentModal onCreated={onCreated} />

      {printData &&
        createPortal(
          <PrintTemplate
            rows={printData.rows}
            generatedAt={printData.generatedAt}
            lang={i18n.language}
            filters={printData.filters}
            t={t}
            STATUS_CONFIG={STATUS_CONFIG}
            MODE_CONFIG={MODE_CONFIG}
          />,
          document.body,
        )}
    </>
  );
}
