import React, { useReducer, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// ============================================================
// CONFIG (identique à NewShipmentModal)
// ============================================================

const getTransportModes = (t) => [
  { value: "sea", label: t("editShipment.modeSea") },
  { value: "air", label: t("editShipment.modeAir") },
  { value: "road", label: t("editShipment.modeRoad") },
  { value: "multi", label: t("editShipment.modeMulti") },
];

const INCOTERMS = [
  "EXW",
  "FCA",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
];

const getStatuses = (t) => [
  { value: "draft", label: t("editShipment.statusDraft") },
  { value: "booking", label: t("editShipment.statusBooking") },
  { value: "in_transit", label: t("editShipment.statusInTransit") },
  { value: "at_port", label: t("editShipment.statusAtPort") },
  { value: "customs", label: t("editShipment.statusCustoms") },
  { value: "blocked", label: t("editShipment.statusBlocked") },
  { value: "delivered", label: t("editShipment.statusDelivered") },
];

const PARTNERS_LIST = [
  { value: "BE", label: "BESCO Transitaires" },
  { value: "DH", label: "DHL Express Bénin" },
  { value: "MA", label: "MAERSK Bénin" },
  { value: "SA", label: "SAGA Transport" },
  { value: "CM", label: "CMA CGM Bénin" },
  { value: "BO", label: "Bolloré Logistics" },
  { value: "AF", label: "Air France Cargo" },
  { value: "EM", label: "Emirates SkyCargo" },
  { value: "TE", label: "Trans-ECOWAS" },
];

const COUNTRIES = [
  { value: "BJ", label: "Bénin" },
  { value: "CN", label: "Chine" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Allemagne" },
  { value: "IN", label: "Inde" },
  { value: "TR", label: "Turquie" },
  { value: "AE", label: "Émirats Arabes Unis" },
  { value: "NL", label: "Pays-Bas" },
  { value: "MA", label: "Maroc" },
  { value: "GH", label: "Ghana" },
  { value: "TG", label: "Togo" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "SN", label: "Sénégal" },
  { value: "NG", label: "Nigeria" },
  { value: "GB", label: "Royaume-Uni" },
  { value: "ES", label: "Espagne" },
  { value: "IT", label: "Italie" },
  { value: "BE", label: "Belgique" },
  { value: "US", label: "États-Unis" },
  { value: "JP", label: "Japon" },
  { value: "KR", label: "Corée du Sud" },
];

const getStatusConfig = (t) => ({
  draft: { label: t("editShipment.statusDraft"), badge: "secondary" },
  booking: { label: t("editShipment.statusBooking"), badge: "info" },
  in_transit: { label: t("editShipment.statusInTransit"), badge: "primary" },
  at_port: { label: t("editShipment.statusAtPort"), badge: "warning" },
  customs: { label: t("editShipment.statusCustoms"), badge: "warning" },
  blocked: { label: t("editShipment.statusBlocked"), badge: "danger" },
  delivered: { label: t("editShipment.statusDelivered"), badge: "success" },
});

// ============================================================
// UTILITAIRES
// ============================================================

// Convertit les données d'une expédition en valeurs de formulaire
const shipmentToForm = (shipment) => {
  if (!shipment) return null;
  return {
    description: shipment.description || "",
    details: shipment.details || "",
    status: shipment.status || "draft",
    hsCode: shipment.hsCode || "",
    quantity: shipment.quantity || "",
    weight: shipment.weight || "",
    volume: shipment.volume || "",
    declaredValue: shipment.value || "",
    mode: shipment.mode || "sea",
    incoterm: shipment.incoterm || "CIF",
    originCountry: shipment.origin?.country || "",
    originCity: shipment.origin?.city || "",
    originPort: shipment.originPort || "",
    destinationCountry: shipment.destination?.country || "BJ",
    destinationCity: shipment.destination?.city || "Cotonou",
    destinationPort: shipment.destinationPort || "Port de Cotonou",
    etd: shipment.etd || "",
    eta: shipment.eta || "",
    freightForwarder: shipment.freightForwarder || "",
    customsBroker: shipment.customsBroker || "",
    supplier: shipment.supplier || "",
    notes: shipment.notes || "",
  };
};

// ============================================================
// VALIDATION
// ============================================================

const validate = (form, t) => {
  const errors = {};
  if (!form.description.trim())
    errors.description = t("editShipment.errorDescription");
  if (!form.originCountry)
    errors.originCountry = t("editShipment.errorOriginCountry");
  if (!form.originCity.trim())
    errors.originCity = t("editShipment.errorOriginCity");
  if (!form.mode) errors.mode = t("editShipment.errorMode");
  if (!form.incoterm) errors.incoterm = t("editShipment.errorIncoterm");
  if (
    form.declaredValue &&
    isNaN(Number(form.declaredValue.replace(/\s/g, "")))
  )
    errors.declaredValue = t("editShipment.errorValue");
  if (form.eta && form.etd && form.eta < form.etd)
    errors.eta = t("editShipment.errorEta");
  return errors;
};

// ============================================================
// REDUCER
// ============================================================

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.key]: action.value },
        errors: { ...state.errors, [action.key]: "" },
        isDirty: true,
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "INIT":
      return { form: action.form, errors: {}, isDirty: false };
    default:
      return state;
  }
};

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

const Field = ({ label, required, error, children }) => (
  <div className="mb-3">
    <label className="form-label fs-9 fw-semibold text-body-tertiary mb-1">
      {label.toUpperCase()}
      {required && <span className="text-danger ms-1">*</span>}
    </label>
    {children}
    {error && <div className="invalid-feedback d-block fs-10">{error}</div>}
  </div>
);

const SectionTitle = ({ icon, title }) => (
  <div className="d-flex align-items-center gap-2 mb-3 mt-4">
    <span className={`fas fa-${icon} text-primary fs-9`} />
    <h6 className="mb-0 text-body-emphasis fw-bold">{title}</h6>
    <hr className="flex-grow-1 my-0 ms-2" />
  </div>
);

// ============================================================
// COMPOSANT MODAL
// ============================================================

/**
 * EditShipmentModal
 *
 * @param {object}   shipment   — L'expédition à modifier (null = modal fermé/vide)
 * @param {function} onUpdated  — Callback appelé avec les données mises à jour
 * @param {function} onClose    — Callback appelé à la fermeture sans sauvegarde
 */
const EditShipmentModal = ({ shipment, onUpdated, onClose }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const STATUS_CONFIG = getStatusConfig(t);
  const TRANSPORT_MODES = getTransportModes(t);
  const STATUSES = getStatuses(t);
  const [state, dispatch] = useReducer(formReducer, {
    form: shipmentToForm(shipment) || {},
    errors: {},
    isDirty: false,
  });
  const { form, errors, isDirty } = state;

  const setField = useCallback((key, value) => {
    dispatch({ type: "SET_FIELD", key, value });
  }, []);

  // Pré-remplit le formulaire chaque fois qu'une nouvelle expédition est passée
  useEffect(() => {
    if (shipment) {
      dispatch({ type: "INIT", form: shipmentToForm(shipment) });
    }
  }, [shipment]);

  // Ouvre le modal Bootstrap dès qu'une expédition est sélectionnée
  useEffect(() => {
    if (!modalRef.current || !shipment) return;
    const modal = window.bootstrap?.Modal?.getOrCreateInstance(
      modalRef.current,
    );
    modal?.show();
  }, [shipment]);

  // Gestion fermeture Bootstrap → appelle onClose
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const handleHidden = () => {
      if (onClose) onClose();
    };
    el.addEventListener("hidden.bs.modal", handleHidden);
    return () => el.removeEventListener("hidden.bs.modal", handleHidden);
  }, [onClose]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const validationErrors = validate(form, t);
      if (Object.keys(validationErrors).length > 0) {
        dispatch({ type: "SET_ERRORS", errors: validationErrors });
        const firstError = document.querySelector(
          "#editShipmentForm .invalid-feedback.d-block",
        );
        firstError
          ?.closest(".mb-3")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const updatedShipment = {
        ...shipment,
        description: form.description,
        details: form.details,
        status: form.status,
        hsCode: form.hsCode,
        quantity: form.quantity,
        weight: form.weight,
        volume: form.volume,
        value: form.declaredValue,
        mode: form.mode,
        incoterm: form.incoterm,
        origin: {
          country: form.originCountry,
          city: form.originCity,
        },
        originPort: form.originPort,
        destination: {
          country: form.destinationCountry,
          city: form.destinationCity,
        },
        destinationPort: form.destinationPort,
        etd: form.etd,
        eta: form.eta,
        etaDisplay: form.eta
          ? new Date(form.eta).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : shipment.etaDisplay,
        freightForwarder: form.freightForwarder,
        customsBroker: form.customsBroker,
        supplier: form.supplier,
        notes: form.notes,
        updatedAt: new Date().toISOString(),
      };

      const modal = window.bootstrap?.Modal?.getInstance(modalRef.current);
      modal?.hide();

      if (onUpdated) onUpdated(updatedShipment);
    },
    [form, shipment, onUpdated, t],
  );

  if (!shipment) return null;

  const currentStatus = STATUS_CONFIG[form.status] || STATUS_CONFIG.draft;

  return (
    <div
      className="modal fade"
      id="editShipmentModal"
      tabIndex={-1}
      aria-labelledby="editShipmentModalLabel"
      aria-hidden="true"
      ref={modalRef}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          {/* ── HEADER ── */}
          <div className="modal-header border-bottom border-translucent py-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center bg-warning-subtle rounded-2"
                style={{ width: 36, height: 36 }}
              >
                <span className="fas fa-edit text-warning fs-9" />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5
                    className="modal-title mb-0 fw-bold"
                    id="editShipmentModalLabel"
                  >
                    {t("editShipment.title")}
                  </h5>
                  <span className="fw-bold text-primary fs-9">
                    {shipment.id}
                  </span>
                  <span
                    className={`badge badge-phoenix badge-phoenix-${currentStatus.badge} fs-10`}
                  >
                    {currentStatus.label}
                  </span>
                  {isDirty && (
                    <span className="badge bg-warning-subtle text-warning fs-10">
                      <span
                        className="fas fa-circle me-1"
                        style={{ fontSize: 7 }}
                      />
                      {t("editShipment.unsavedChanges")}
                    </span>
                  )}
                </div>
                <p className="mb-0 fs-10 text-body-tertiary">
                  {t("editShipment.createdOn")} {shipment.createdAtDisplay}
                  {shipment.updatedAt && (
                    <>
                      {" "}
                      · {t("editShipment.modifiedOn")}{" "}
                      {new Date(shipment.updatedAt).toLocaleDateString("fr-FR")}
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label={t("editShipment.close")}
            />
          </div>

          {/* ── BODY ── */}
          <div className="modal-body px-4 py-3">
            <form id="editShipmentForm" onSubmit={handleSubmit} noValidate>
              {/* ── SECTION 1 : Informations générales ── */}
              <SectionTitle icon="info-circle" title={t("editShipment.sectionGeneral")} />
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Field
                    label={t("editShipment.descriptionLabel")}
                    required
                    error={errors.description}
                  >
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors.description ? "is-invalid" : ""}`}
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12 col-md-4">
                  <Field
                    label={t("editShipment.detailsLabel")}
                    error={errors.details}
                  >
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.details}
                      onChange={(e) => setField("details", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12 col-md-2">
                  <Field label={t("editShipment.statusLabel")} error={errors.status}>
                    <select
                      className="form-select form-select-sm"
                      value={form.status}
                      onChange={(e) => setField("status", e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* ── SECTION 2 : Marchandise ── */}
              <SectionTitle icon="box" title={t("editShipment.sectionGoods")} />
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Field label={t("editShipment.hsCodeLabel")} error={errors.hsCode}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder={t("editShipment.hsCodePlaceholder")}
                      value={form.hsCode}
                      onChange={(e) => setField("hsCode", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-6 col-md-3">
                  <Field label={t("editShipment.quantityLabel")} error={errors.quantity}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.quantity}
                      onChange={(e) => setField("quantity", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-6 col-md-3">
                  <Field label={t("editShipment.weightLabel")} error={errors.weight}>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="0"
                      value={form.weight}
                      onChange={(e) => setField("weight", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-6 col-md-3">
                  <Field label={t("editShipment.volumeLabel")} error={errors.volume}>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="0"
                      value={form.volume}
                      onChange={(e) => setField("volume", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12 col-md-4">
                  <Field
                    label={t("editShipment.declaredValueLabel")}
                    error={errors.declaredValue}
                  >
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors.declaredValue ? "is-invalid" : ""}`}
                      value={form.declaredValue}
                      onChange={(e) =>
                        setField("declaredValue", e.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>

              {/* ── SECTION 3 : Transport ── */}
              <SectionTitle icon="truck" title={t("editShipment.sectionTransport")} />
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-3">
                  <Field label={t("editShipment.modeLabel")} required error={errors.mode}>
                    <select
                      className={`form-select form-select-sm ${errors.mode ? "is-invalid" : ""}`}
                      value={form.mode}
                      onChange={(e) => setField("mode", e.target.value)}
                    >
                      {TRANSPORT_MODES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <Field label={t("editShipment.incotermLabel")} required error={errors.incoterm}>
                    <select
                      className={`form-select form-select-sm ${errors.incoterm ? "is-invalid" : ""}`}
                      value={form.incoterm}
                      onChange={(e) => setField("incoterm", e.target.value)}
                    >
                      {INCOTERMS.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <Field label={t("editShipment.etdLabel")} error={errors.etd}>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={form.etd}
                      onChange={(e) => setField("etd", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <Field
                    label={t("editShipment.etaLabel")}
                    error={errors.eta}
                  >
                    <input
                      type="date"
                      className={`form-control form-control-sm ${errors.eta ? "is-invalid" : ""}`}
                      value={form.eta}
                      onChange={(e) => setField("eta", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* ── SECTION 4 : Origine & Destination ── */}
              <SectionTitle icon="map-pin" title={t("editShipment.sectionRoute")} />
              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <p className="fs-10 fw-bold text-body-tertiary mb-2">
                    <span className="fas fa-arrow-up me-1 text-primary" />
                    {t("editShipment.departure")}
                  </p>
                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <Field
                        label={t("editShipment.originCountryLabel")}
                        required
                        error={errors.originCountry}
                      >
                        <select
                          className={`form-select form-select-sm ${errors.originCountry ? "is-invalid" : ""}`}
                          value={form.originCountry}
                          onChange={(e) =>
                            setField("originCountry", e.target.value)
                          }
                        >
                          <option value="">{t("editShipment.select")}</option>
                          {COUNTRIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label={t("editShipment.cityLabel")} required error={errors.originCity}>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${errors.originCity ? "is-invalid" : ""}`}
                          value={form.originCity}
                          onChange={(e) =>
                            setField("originCity", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field
                        label={t("editShipment.loadingPortLabel")}
                        error={errors.originPort}
                      >
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.originPort}
                          onChange={(e) =>
                            setField("originPort", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <p className="fs-10 fw-bold text-body-tertiary mb-2">
                    <span className="fas fa-arrow-down me-1 text-success" />
                    {t("editShipment.arrival")}
                  </p>
                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <Field
                        label={t("editShipment.destCountryLabel")}
                        error={errors.destinationCountry}
                      >
                        <select
                          className="form-select form-select-sm"
                          value={form.destinationCountry}
                          onChange={(e) =>
                            setField("destinationCountry", e.target.value)
                          }
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label={t("editShipment.cityLabel")} error={errors.destinationCity}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.destinationCity}
                          onChange={(e) =>
                            setField("destinationCity", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field
                        label={t("editShipment.unloadingPortLabel")}
                        error={errors.destinationPort}
                      >
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.destinationPort}
                          onChange={(e) =>
                            setField("destinationPort", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 5 : Partenaires ── */}
              <SectionTitle icon="users" title={t("editShipment.sectionPartners")} />
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <Field label={t("editShipment.forwarderLabel")} error={errors.freightForwarder}>
                    <select
                      className="form-select form-select-sm"
                      value={form.freightForwarder}
                      onChange={(e) =>
                        setField("freightForwarder", e.target.value)
                      }
                    >
                      <option value="">{t("editShipment.select")}</option>
                      {PARTNERS_LIST.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="col-12 col-md-4">
                  <Field
                    label={t("editShipment.customsBrokerLabel")}
                    error={errors.customsBroker}
                  >
                    <select
                      className="form-select form-select-sm"
                      value={form.customsBroker}
                      onChange={(e) =>
                        setField("customsBroker", e.target.value)
                      }
                    >
                      <option value="">{t("editShipment.select")}</option>
                      {PARTNERS_LIST.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="col-12 col-md-4">
                  <Field
                    label={t("editShipment.supplierLabel")}
                    error={errors.supplier}
                  >
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.supplier}
                      onChange={(e) => setField("supplier", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* ── SECTION 6 : Notes ── */}
              <SectionTitle icon="file-text" title={t("editShipment.sectionNotes")} />
              <Field
                label={t("editShipment.notesLabel")}
                error={errors.notes}
              >
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </Field>
            </form>
          </div>

          {/* ── FOOTER ── */}
          <div className="modal-footer border-top border-translucent py-3 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-phoenix-secondary"
              data-bs-dismiss="modal"
            >
              <span className="fas fa-times me-2" />
              {t("editShipment.cancel")}
            </button>
            <button
              type="submit"
              form="editShipmentForm"
              className="btn btn-primary"
              disabled={!isDirty}
            >
              <span className="fas fa-save me-2" />
              {t("editShipment.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditShipmentModal;
