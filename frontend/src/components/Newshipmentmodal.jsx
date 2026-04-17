import React, { useReducer, useCallback, useEffect, useRef } from "react";

// ============================================================
// CONFIG
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

// ============================================================
// INITIAL STATE & REDUCER
// ============================================================

const initialForm = {
  // Infos générales
  description: "",
  details: "",
  status: "draft",
  // Marchandise
  hsCode: "",
  quantity: "",
  weight: "",
  volume: "",
  declaredValue: "",
  // Transport
  mode: "sea",
  incoterm: "CIF",
  // Origine
  originCountry: "",
  originCity: "",
  originPort: "",
  // Destination
  destinationCountry: "BJ",
  destinationCity: "Cotonou",
  destinationPort: "Port de Cotonou",
  // Dates
  etd: "",
  eta: "",
  // Partenaires
  freightForwarder: "",
  customsBroker: "",
  supplier: "",
  // Notes
  notes: "",
};

const initialErrors = {};

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.key]: action.value },
        errors: { ...state.errors, [action.key]: "" },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "RESET":
      return { form: { ...initialForm }, errors: {} };
    default:
      return state;
  }
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

const NewShipmentModal = ({ onCreated }) => {
  const [state, dispatch] = useReducer(formReducer, {
    form: { ...initialForm },
    errors: {},
  });
  const { form, errors } = state;
  const modalRef = useRef(null);

  const setField = useCallback((key, value) => {
    dispatch({ type: "SET_FIELD", key, value });
  }, []);

  // Reset le formulaire à la fermeture du modal
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const handleHidden = () => dispatch({ type: "RESET" });
    el.addEventListener("hidden.bs.modal", handleHidden);
    return () => el.removeEventListener("hidden.bs.modal", handleHidden);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const validationErrors = validate(form);
      if (Object.keys(validationErrors).length > 0) {
        dispatch({ type: "SET_ERRORS", errors: validationErrors });
        // Scroll vers la première erreur
        const firstError = document.querySelector(".invalid-feedback.d-block");
        firstError
          ?.closest(".mb-3")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // Génère un ID provisoire (sera remplacé par l'API)
      const newId = `TFA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const newShipment = {
        ...form,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      // Ferme le modal via Bootstrap
      const modal = window.bootstrap?.Modal?.getInstance(modalRef.current);
      modal?.hide();

      // Callback parent
      if (onCreated) onCreated(newShipment);
      dispatch({ type: "RESET" });
    },
    [form, onCreated],
  );

  return (
    <div
      className="modal fade"
      id="newShipmentModal"
      tabIndex={-1}
      aria-labelledby="newShipmentModalLabel"
      aria-hidden="true"
      ref={modalRef}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          {/* ── HEADER ── */}
          <div className="modal-header border-bottom border-translucent py-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center bg-primary-subtle rounded-2"
                style={{ width: 36, height: 36 }}
              >
                <span className="fas fa-plus text-primary fs-9" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="newShipmentModalLabel"
                >
                  Nouvelle expédition
                </h5>
                <p className="mb-0 fs-10 text-body-tertiary">
                  Remplissez les informations pour créer le dossier
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
            <form id="newShipmentForm" onSubmit={handleSubmit} noValidate>
              {/* ── SECTION 1 : Informations générales ── */}
              <SectionTitle icon="info-circle" title="Informations générales" />
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <Field
                    label="Description de la marchandise"
                    required
                    error={errors.description}
                  >
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors.description ? "is-invalid" : ""}`}
                      placeholder="Ex : Équipements électroniques, Textiles…"
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12 col-md-4">
                  <Field label="Statut initial" error={errors.status}>
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
                <div className="col-12">
                  <Field
                    label="Détails / Conditionnement"
                    error={errors.details}
                  >
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Ex : 3 conteneurs 20', vrac 120t, 2 palettes réfrigérées…"
                      value={form.details}
                      onChange={(e) => setField("details", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* ── SECTION 2 : Marchandise ── */}
              <SectionTitle icon="box" title="Marchandise" />
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-3">
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
                <div className="col-12 col-sm-6 col-md-3">
                  <Field label="Quantité" error={errors.quantity}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Ex : 500 unités"
                      value={form.quantity}
                      onChange={(e) => setField("quantity", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <Field label="Poids brut (kg)" error={errors.weight}>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Ex : 12000"
                      min="0"
                      value={form.weight}
                      onChange={(e) => setField("weight", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <Field label="Volume (m³)" error={errors.volume}>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Ex : 45"
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
                      placeholder="Ex : 18 500 000"
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
                {/* Origine */}
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
                          placeholder="Ex : Shanghai"
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
                          placeholder="Ex : Port de Shanghai"
                          value={form.originPort}
                          onChange={(e) =>
                            setField("originPort", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Destination */}
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
                          placeholder="Ex : Cotonou"
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
                          placeholder="Ex : Port de Cotonou"
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
                      placeholder="Nom du fournisseur"
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
                  placeholder="Instructions douanières, contacts sur place, documents à préparer…"
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
            <div className="d-flex gap-2">
              <button
                type="submit"
                form="newShipmentForm"
                className="btn btn-phoenix-primary"
                onClick={() => setField("status", "draft")}
              >
                <span className="fas fa-save me-2" />
                Enregistrer en brouillon
              </button>
              <button
                type="submit"
                form="newShipmentForm"
                className="btn btn-primary"
              >
                <span className="fas fa-check me-2" />
                Créer l'expédition
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewShipmentModal;
