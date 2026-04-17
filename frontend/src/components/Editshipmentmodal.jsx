import React, { useReducer, useCallback, useEffect, useRef } from "react";

// ============================================================
// CONFIG (identique à NewShipmentModal)
// ============================================================

const TRANSPORT_MODES = [
  { value: "sea", label: "Maritime" },
  { value: "air", label: "Aérien" },
  { value: "road", label: "Routier" },
  { value: "multi", label: "Multimodal" },
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

const STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "booking", label: "Réservation" },
  { value: "in_transit", label: "En transit" },
  { value: "at_port", label: "Au port" },
  { value: "customs", label: "En dédouanement" },
  { value: "blocked", label: "Bloquée" },
  { value: "delivered", label: "Livré" },
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

const STATUS_CONFIG = {
  draft: { label: "Brouillon", badge: "secondary" },
  booking: { label: "Réservation", badge: "info" },
  in_transit: { label: "En transit", badge: "primary" },
  at_port: { label: "Au port", badge: "warning" },
  customs: { label: "En dédouanement", badge: "warning" },
  blocked: { label: "Bloquée", badge: "danger" },
  delivered: { label: "Livré", badge: "success" },
};

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

const validate = (form) => {
  const errors = {};
  if (!form.description.trim())
    errors.description = "La description est requise.";
  if (!form.originCountry)
    errors.originCountry = "Le pays d'origine est requis.";
  if (!form.originCity.trim())
    errors.originCity = "La ville d'origine est requise.";
  if (!form.mode) errors.mode = "Le mode de transport est requis.";
  if (!form.incoterm) errors.incoterm = "L'incoterm est requis.";
  if (
    form.declaredValue &&
    isNaN(Number(form.declaredValue.replace(/\s/g, "")))
  )
    errors.declaredValue = "Valeur invalide.";
  if (form.eta && form.etd && form.eta < form.etd)
    errors.eta = "L'ETA doit être après l'ETD.";
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
  const modalRef = useRef(null);
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
      const validationErrors = validate(form);
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
    [form, shipment, onUpdated],
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
                    Modifier l'expédition
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
                      Modifications non enregistrées
                    </span>
                  )}
                </div>
                <p className="mb-0 fs-10 text-body-tertiary">
                  Créé le {shipment.createdAtDisplay}
                  {shipment.updatedAt && (
                    <>
                      {" "}
                      · Modifié le{" "}
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
              aria-label="Fermer"
            />
          </div>

          {/* ── BODY ── */}
          <div className="modal-body px-4 py-3">
            <form id="editShipmentForm" onSubmit={handleSubmit} noValidate>
              {/* ── SECTION 1 : Informations générales ── */}
              <SectionTitle icon="info-circle" title="Informations générales" />
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Field
                    label="Description de la marchandise"
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
                    label="Détails / Conditionnement"
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
                  <Field label="Statut" error={errors.status}>
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
              <SectionTitle icon="box" title="Marchandise" />
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Field label="Code SH (HS Code)" error={errors.hsCode}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Ex : 8471.30"
                      value={form.hsCode}
                      onChange={(e) => setField("hsCode", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-6 col-md-3">
                  <Field label="Quantité" error={errors.quantity}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.quantity}
                      onChange={(e) => setField("quantity", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-6 col-md-3">
                  <Field label="Poids brut (kg)" error={errors.weight}>
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
                  <Field label="Volume (m³)" error={errors.volume}>
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
                    label="Valeur déclarée (FCFA)"
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
              <SectionTitle icon="truck" title="Transport" />
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-3">
                  <Field label="Mode de transport" required error={errors.mode}>
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
                  <Field label="Incoterm" required error={errors.incoterm}>
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
                  <Field label="ETD — Date de départ" error={errors.etd}>
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
                    label="ETA — Date d'arrivée estimée"
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
              <SectionTitle icon="map-pin" title="Origine & Destination" />
              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <p className="fs-10 fw-bold text-body-tertiary mb-2">
                    <span className="fas fa-arrow-up me-1 text-primary" />
                    DÉPART
                  </p>
                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <Field
                        label="Pays d'origine"
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
                          <option value="">Sélectionner…</option>
                          {COUNTRIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label="Ville" required error={errors.originCity}>
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
                        label="Port / Aéroport de chargement"
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
                    ARRIVÉE
                  </p>
                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <Field
                        label="Pays de destination"
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
                      <Field label="Ville" error={errors.destinationCity}>
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
                        label="Port / Aéroport de déchargement"
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
              <SectionTitle icon="users" title="Partenaires" />
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <Field label="Transitaire" error={errors.freightForwarder}>
                    <select
                      className="form-select form-select-sm"
                      value={form.freightForwarder}
                      onChange={(e) =>
                        setField("freightForwarder", e.target.value)
                      }
                    >
                      <option value="">Sélectionner…</option>
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
                    label="Commissionnaire en douane"
                    error={errors.customsBroker}
                  >
                    <select
                      className="form-select form-select-sm"
                      value={form.customsBroker}
                      onChange={(e) =>
                        setField("customsBroker", e.target.value)
                      }
                    >
                      <option value="">Sélectionner…</option>
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
                    label="Fournisseur / Expéditeur"
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
              <SectionTitle icon="file-text" title="Notes internes" />
              <Field
                label="Notes & instructions particulières"
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
              Annuler
            </button>
            <button
              type="submit"
              form="editShipmentForm"
              className="btn btn-primary"
              disabled={!isDirty}
            >
              <span className="fas fa-save me-2" />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditShipmentModal;
