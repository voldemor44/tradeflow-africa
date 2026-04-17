import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

// ─── CONFIG ────────────────────────────────────────────────
const TOTAL_STEPS = 3;

const COUNTRIES = [
  "Bénin",
  "Burkina Faso",
  "Côte d'Ivoire",
  "Ghana",
  "Guinée",
  "Mali",
  "Niger",
  "Nigeria",
  "Sénégal",
  "Togo",
  "Cameroun",
  "Congo",
  "Gabon",
  "France",
  "Chine",
  "Allemagne",
  "Inde",
  "Turquie",
  "Émirats Arabes Unis",
];

const PLANS = [
  {
    value: "starter",
    label: "Starter",
    price: "Gratuit",
    color: "secondary",
    icon: "fa-seedling",
    features: ["5 expéditions / mois", "2 utilisateurs", "Documents de base"],
  },
  {
    value: "pro",
    label: "Pro",
    price: "29 000 XOF/mois",
    color: "primary",
    icon: "fa-rocket",
    features: [
      "50 expéditions / mois",
      "10 utilisateurs",
      "Tracking navires",
      "Export PDF/CSV",
    ],
    recommended: true,
  },
  {
    value: "business",
    label: "Business",
    price: "79 000 XOF/mois",
    color: "warning",
    icon: "fa-building",
    features: [
      "Illimité",
      "Utilisateurs illimités",
      "API access",
      "Support dédié",
    ],
  },
];

// ─── UTILS ─────────────────────────────────────────────────
const validate = (step, data) => {
  const errors = {};

  if (step === 1) {
    if (!data.org_name.trim())
      errors.org_name = "Le nom de l'entreprise est requis.";
    if (!data.org_country) errors.org_country = "Le pays est requis.";
    if (!data.org_city.trim()) errors.org_city = "La ville est requise.";
  }

  if (step === 2) {
    if (!data.first_name.trim()) errors.first_name = "Le prénom est requis.";
    if (!data.last_name.trim()) errors.last_name = "Le nom est requis.";
    if (!data.email.trim()) errors.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = "Email invalide.";
    if (!data.username.trim())
      errors.username = "Le nom d'utilisateur est requis.";
    if (!data.password) errors.password = "Le mot de passe est requis.";
    else if (data.password.length < 8)
      errors.password = "Minimum 8 caractères.";
    if (data.password !== data.password_confirm)
      errors.password_confirm = "Les mots de passe ne correspondent pas.";
  }

  if (step === 3) {
    if (!data.plan) errors.plan = "Choisissez un plan.";
    if (!data.terms) errors.terms = "Vous devez accepter les conditions.";
  }

  return errors;
};

// ─── SOUS-COMPOSANTS ───────────────────────────────────────

const FieldError = ({ msg }) =>
  msg ? <div className="invalid-feedback d-block fs-10 mt-1">{msg}</div> : null;

const FormField = ({ label, error, required, children }) => (
  <div className="mb-3">
    <label className="form-label fs-9 fw-semibold text-body-tertiary mb-1">
      {label.toUpperCase()}
      {required && <span className="text-danger ms-1">*</span>}
    </label>
    {children}
    <FieldError msg={error} />
  </div>
);

// Barre de progression
const StepIndicator = ({ current }) => {
  const steps = [
    { n: 1, icon: "fa-building", label: "Organisation" },
    { n: 2, icon: "fa-user", label: "Compte admin" },
    { n: 3, icon: "fa-check", label: "Plan & Confirmation" },
  ];

  return (
    <div className="d-flex align-items-center justify-content-center gap-0 mb-5">
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="d-flex align-items-center">
            {/* Cercle */}
            <div className="d-flex flex-column align-items-center">
              <div
                className={`
                  d-flex align-items-center justify-content-center rounded-circle fw-bold
                  ${done ? "bg-success text-white" : ""}
                  ${active ? "bg-primary text-white" : ""}
                  ${!done && !active ? "bg-body-secondary text-body-tertiary" : ""}
                `}
                style={{
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  transition: "all .3s",
                }}
              >
                {done ? (
                  <span className="fas fa-check" style={{ fontSize: 12 }} />
                ) : (
                  <span className={`fas ${s.icon}`} style={{ fontSize: 13 }} />
                )}
              </div>
              <span
                className={`mt-1 fs-11 fw-semibold ${active ? "text-primary" : done ? "text-success" : "text-body-tertiary"}`}
                style={{ fontSize: 10, whiteSpace: "nowrap" }}
              >
                {s.label}
              </span>
            </div>
            {/* Trait */}
            {i < steps.length - 1 && (
              <div
                className={`mx-2 ${done ? "bg-success" : "bg-body-secondary"}`}
                style={{
                  height: 2,
                  width: 48,
                  marginBottom: 20,
                  transition: "background .3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── ÉTAPES ────────────────────────────────────────────────

const Step1Organisation = ({ data, errors, onChange }) => (
  <div>
    <div className="text-center mb-4">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle mb-3"
        style={{ width: 56, height: 56 }}
      >
        <span className="fas fa-building text-primary fs-6" />
      </div>
      <h4 className="fw-bold text-body-emphasis mb-1">Votre entreprise</h4>
      <p className="text-body-tertiary fs-9 mb-0">
        Ces informations identifient votre organisation sur la plateforme.
      </p>
    </div>

    <FormField label="Nom de l'entreprise" required error={errors.org_name}>
      <input
        type="text"
        className={`form-control ${errors.org_name ? "is-invalid" : ""}`}
        placeholder="Ex : ATLAS Import-Export SARL"
        value={data.org_name}
        onChange={(e) => onChange("org_name", e.target.value)}
        autoFocus
      />
    </FormField>

    <div className="row g-3">
      <div className="col-12 col-sm-6">
        <FormField label="Pays" required error={errors.org_country}>
          <select
            className={`form-select ${errors.org_country ? "is-invalid" : ""}`}
            value={data.org_country}
            onChange={(e) => onChange("org_country", e.target.value)}
          >
            <option value="">Sélectionner…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="col-12 col-sm-6">
        <FormField label="Ville" required error={errors.org_city}>
          <input
            type="text"
            className={`form-control ${errors.org_city ? "is-invalid" : ""}`}
            placeholder="Ex : Cotonou"
            value={data.org_city}
            onChange={(e) => onChange("org_city", e.target.value)}
          />
        </FormField>
      </div>
    </div>

    <FormField label="Numéro fiscal / IFU (optionnel)" error={errors.tax_id}>
      <input
        type="text"
        className="form-control"
        placeholder="Ex : IFU-20230045-B"
        value={data.tax_id}
        onChange={(e) => onChange("tax_id", e.target.value)}
      />
    </FormField>

    <FormField
      label="Email de l'entreprise (optionnel)"
      error={errors.org_email}
    >
      <input
        type="email"
        className="form-control"
        placeholder="contact@monentreprise.com"
        value={data.org_email}
        onChange={(e) => onChange("org_email", e.target.value)}
      />
    </FormField>
  </div>
);

const Step2Account = ({ data, errors, onChange }) => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Indicateur de force du mot de passe
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: "Très faible", color: "danger" },
      { label: "Faible", color: "warning" },
      { label: "Moyen", color: "warning" },
      { label: "Fort", color: "success" },
      { label: "Très fort", color: "success" },
    ];
    return { score, ...levels[score] };
  };
  const strength = getStrength(data.password);

  return (
    <div>
      <div className="text-center mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle mb-3"
          style={{ width: 56, height: 56 }}
        >
          <span className="fas fa-user-shield text-warning fs-6" />
        </div>
        <h4 className="fw-bold text-body-emphasis mb-1">
          Compte administrateur
        </h4>
        <p className="text-body-tertiary fs-9 mb-0">
          Vous serez le premier administrateur de votre organisation.
        </p>
      </div>

      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <FormField label="Prénom" required error={errors.first_name}>
            <input
              type="text"
              className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
              placeholder="Jean"
              value={data.first_name}
              onChange={(e) => onChange("first_name", e.target.value)}
              autoFocus
            />
          </FormField>
        </div>
        <div className="col-12 col-sm-6">
          <FormField label="Nom" required error={errors.last_name}>
            <input
              type="text"
              className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
              placeholder="Dupont"
              value={data.last_name}
              onChange={(e) => onChange("last_name", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      <FormField label="Adresse email" required error={errors.email}>
        <input
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          placeholder="admin@monentreprise.com"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </FormField>

      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <FormField label="Nom d'utilisateur" required error={errors.username}>
            <div className="input-group">
              <span className="input-group-text fs-9 text-body-tertiary">
                @
              </span>
              <input
                type="text"
                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                placeholder="jean.dupont"
                value={data.username}
                onChange={(e) =>
                  onChange(
                    "username",
                    e.target.value.toLowerCase().replace(/\s/g, "."),
                  )
                }
              />
            </div>
          </FormField>
        </div>
        <div className="col-12 col-sm-6">
          <FormField label="Téléphone (optionnel)" error={errors.phone}>
            <input
              type="tel"
              className="form-control"
              placeholder="+229 97 00 00 00"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* Mot de passe */}
      <FormField label="Mot de passe" required error={errors.password}>
        <div className="position-relative">
          <input
            type={showPwd ? "text" : "password"}
            className={`form-control pe-6 ${errors.password ? "is-invalid" : ""}`}
            placeholder="Minimum 8 caractères"
            value={data.password}
            onChange={(e) => onChange("password", e.target.value)}
          />
          <button
            type="button"
            className="btn px-3 py-0 h-100 position-absolute top-0 end-0 text-body-tertiary"
            onClick={() => setShowPwd((v) => !v)}
            tabIndex={-1}
          >
            <span className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
          </button>
        </div>
        {/* Barre de force */}
        {data.password && (
          <div className="mt-2">
            <div className="d-flex gap-1 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-pill flex-grow-1 ${i <= strength.score ? `bg-${strength.color}` : "bg-body-secondary"}`}
                  style={{ height: 4, transition: "background .3s" }}
                />
              ))}
            </div>
            <span
              className={`fs-11 text-${strength.color}`}
              style={{ fontSize: 10 }}
            >
              {strength.label}
            </span>
          </div>
        )}
      </FormField>

      <FormField
        label="Confirmer le mot de passe"
        required
        error={errors.password_confirm}
      >
        <div className="position-relative">
          <input
            type={showConfirm ? "text" : "password"}
            className={`form-control pe-6 ${errors.password_confirm ? "is-invalid" : ""}`}
            placeholder="Répétez le mot de passe"
            value={data.password_confirm}
            onChange={(e) => onChange("password_confirm", e.target.value)}
          />
          <button
            type="button"
            className="btn px-3 py-0 h-100 position-absolute top-0 end-0 text-body-tertiary"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
          >
            <span
              className={`fas ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}
            />
          </button>
        </div>
      </FormField>
    </div>
  );
};

const Step3Plan = ({ data, errors, onChange }) => (
  <div>
    <div className="text-center mb-4">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle mb-3"
        style={{ width: 56, height: 56 }}
      >
        <span className="fas fa-rocket text-success fs-6" />
      </div>
      <h4 className="fw-bold text-body-emphasis mb-1">Choisissez votre plan</h4>
      <p className="text-body-tertiary fs-9 mb-0">
        Vous pourrez changer de plan à tout moment depuis votre tableau de bord.
      </p>
    </div>

    <div className="row g-3 mb-4">
      {PLANS.map((plan) => {
        const selected = data.plan === plan.value;
        return (
          <div key={plan.value} className="col-12 col-sm-4">
            <div
              className={`
                card h-100 cursor-pointer position-relative
                ${selected ? `border border-${plan.color} shadow-sm` : "border border-translucent"}
              `}
              style={{ transition: "all .2s", cursor: "pointer" }}
              onClick={() => onChange("plan", plan.value)}
            >
              {plan.recommended && (
                <div
                  className={`position-absolute top-0 start-50 translate-middle badge bg-${plan.color}`}
                  style={{ fontSize: 9 }}
                >
                  Recommandé
                </div>
              )}
              <div className="card-body p-3 text-center">
                <div
                  className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${plan.color}-subtle mb-2`}
                  style={{ width: 40, height: 40 }}
                >
                  <span
                    className={`fas ${plan.icon} text-${plan.color} fs-9`}
                  />
                </div>
                <div className="fw-bold fs-8 mb-1">{plan.label}</div>
                <div className={`text-${plan.color} fw-semibold fs-10 mb-2`}>
                  {plan.price}
                </div>
                <ul className="list-unstyled text-start mb-0">
                  {plan.features.map((f) => (
                    <li key={f} className="d-flex align-items-start gap-1 mb-1">
                      <span
                        className={`fas fa-check text-${plan.color} fs-11 mt-1 flex-shrink-0`}
                      />
                      <span className="fs-10 text-body-tertiary">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {selected && (
                <div
                  className={`position-absolute bottom-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle bg-${plan.color}`}
                  style={{ width: 20, height: 20 }}
                >
                  <span
                    className="fas fa-check text-white"
                    style={{ fontSize: 10 }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    <FieldError msg={errors.plan} />

    {/* Résumé */}
    {data.org_name && (
      <div className="alert alert-subtle-primary border border-primary-subtle rounded-2 py-2 px-3 mb-3">
        <div className="fs-10 text-body-tertiary mb-1">
          Récapitulatif du compte
        </div>
        <div className="d-flex flex-wrap gap-3">
          <span className="fs-9">
            <span className="fas fa-building me-1 text-primary" />
            <strong>{data.org_name}</strong>
          </span>
          <span className="fs-9">
            <span className="fas fa-map-marker-alt me-1 text-primary" />
            {data.org_city}
            {data.org_country ? `, ${data.org_country}` : ""}
          </span>
          <span className="fs-9">
            <span className="fas fa-user me-1 text-primary" />
            {data.first_name} {data.last_name}
          </span>
          <span className="fs-9">
            <span className="fas fa-envelope me-1 text-primary" />
            {data.email}
          </span>
        </div>
      </div>
    )}

    {/* CGU */}
    <div className={`form-check mb-3 ${errors.terms ? "is-invalid" : ""}`}>
      <input
        className={`form-check-input ${errors.terms ? "is-invalid" : ""}`}
        id="terms"
        type="checkbox"
        checked={data.terms}
        onChange={(e) => onChange("terms", e.target.checked)}
      />
      <label className="form-check-label fs-9" htmlFor="terms">
        J'accepte les{" "}
        <a href="#!" className="fw-semibold">
          conditions d'utilisation
        </a>{" "}
        et la{" "}
        <a href="#!" className="fw-semibold">
          politique de confidentialité
        </a>{" "}
        de TradeFlow Africa.
      </label>
      <FieldError msg={errors.terms} />
    </div>
  </div>
);

// ─── COMPOSANT PRINCIPAL ────────────────────────────────────

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const { setToken, setRefreshToken, setUser, setUserId } = useStateContext();

  const [data, setData] = useState({
    // Étape 1 — Organisation
    org_name: "",
    org_country: "Bénin",
    org_city: "",
    tax_id: "",
    org_email: "",
    // Étape 2 — Compte admin
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    password_confirm: "",
    // Étape 3 — Plan
    plan: "pro",
    terms: false,
  });

  const onChange = useCallback((key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setApiError("");
  }, []);

  const handleNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(3, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");

    axiosClient
      .post("/auth/register/", {
        organisation_name: data.org_name,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        password: data.password,
        password_confirm: data.password_confirm,
      })
      .then(({ data: json }) => {
        setToken(json.access);
        setRefreshToken(json.refresh);
        setUser(json.user);
        setUserId(json.user?.id);
        navigate("/dashboard");
      })
      .catch((error) => {
        const json = error.response?.data;
        if (json) {
          const firstError = Object.values(json)[0];
          setApiError(
            Array.isArray(firstError) ? firstError[0] : String(firstError),
          );
        } else {
          setApiError("Une erreur est survenue. Vérifiez votre connexion.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const stepComponents = {
    1: <Step1Organisation data={data} errors={errors} onChange={onChange} />,
    2: <Step2Account data={data} errors={errors} onChange={onChange} />,
    3: <Step3Plan data={data} errors={errors} onChange={onChange} />,
  };

  return (
    <div className="row flex-center position-relative min-vh-100 g-0 py-5">
      <div className="col-11 col-sm-10 col-xl-8">
        <div className="card border border-translucent auth-card">
          <div className="card-body pe-md-0">
            <div className="row align-items-center gx-0 gy-7">
              {/* ── Panneau gauche ── */}
              <div className="col-auto bg-body-highlight dark__bg-gray-1100 rounded-3 position-relative overflow-hidden auth-title-box  vh-100">
                <div
                  className="bg-holder"
                  style={{ backgroundImage: "url(/assets/img/bg/38.png)" }}
                />
                <div className="position-relative px-4 px-lg-7 pt-7 pb-7 pb-sm-5 text-center text-md-start pb-lg-7 card-sign-up">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <img
                      src="/assets/img/logo.png"
                      alt="TradeFlow Africa"
                      width={32}
                      height={32}
                    />
                    <span className="fw-bold fs-7 text-body-emphasis">
                      TradeFlow
                    </span>
                  </div>
                  <h3 className="mb-3 text-body-emphasis fs-7">
                    Gérez vos expéditions
                    <br />
                    en toute simplicité
                  </h3>
                  <p className="text-body-tertiary mb-4">
                    La plateforme dédiée aux importateurs et exportateurs
                    d'Afrique de l'Ouest.
                  </p>
                  <ul className="list-unstyled mb-0 w-max-content w-md-auto">
                    {[
                      "Suivi en temps réel",
                      "Gestion documentaire",
                      "Simulation douanière",
                      "Multi-partenaires",
                    ].map((f) => (
                      <li key={f} className="d-flex align-items-center mb-2">
                        <span className="fas fa-check-circle text-success me-2" />
                        <span className="text-body-tertiary fw-semibold fs-9">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-6 d-none d-md-block text-center">
                  <img
                    className="auth-title-box-img d-dark-none"
                    src="/assets/img/img7.png"
                    alt="TradeFlow"
                  />
                  <img
                    className="auth-title-box-img d-light-none"
                    src="/assets/img/spot-illustrations/auth-dark.png"
                    alt="TradeFlow"
                  />
                </div>
              </div>

              {/* ── Panneau droit — formulaire ── */}
              <div className="col mx-auto">
                <div className="auth-form-box">
                  {/* Logo + titre */}
                  <div className="text-center mb-5">
                    <Link
                      className="d-flex flex-center text-decoration-none mb-4"
                      to="/"
                    >
                      <img
                        src="/assets/img/logo.png"
                        alt="TradeFlow Africa"
                        width={58}
                      />
                    </Link>
                    <h4 className="text-body-highlight fw-bold mb-1">
                      Créer un compte
                    </h4>
                    <p className="text-body-tertiary fs-9 mb-0">
                      Étape {step} sur {TOTAL_STEPS}
                    </p>
                  </div>

                  {/* Indicateur d'étapes */}
                  <StepIndicator current={step} />

                  {/* Erreur API globale */}
                  {apiError && (
                    <div className="alert alert-danger py-2 px-3 fs-9 mb-3">
                      <span className="fas fa-exclamation-circle me-2" />
                      {apiError}
                    </div>
                  )}

                  {/* Contenu de l'étape courante */}
                  <form
                    onSubmit={
                      step === TOTAL_STEPS
                        ? handleSubmit
                        : (e) => {
                            e.preventDefault();
                            handleNext();
                          }
                    }
                  >
                    {stepComponents[step]}

                    {/* Navigation */}
                    <div
                      className={`d-flex mt-4 ${step > 1 ? "justify-content-between" : "justify-content-end"}`}
                    >
                      {step > 1 && (
                        <button
                          type="button"
                          className="btn btn-phoenix-secondary"
                          onClick={handleBack}
                          disabled={loading}
                        >
                          <span className="fas fa-arrow-left me-2" />
                          Retour
                        </button>
                      )}

                      {step < TOTAL_STEPS ? (
                        <button type="submit" className="btn btn-primary">
                          Continuer
                          <span className="fas fa-arrow-right ms-2" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Création en cours…
                            </>
                          ) : (
                            <>
                              <span className="fas fa-check me-2" />
                              Créer mon compte
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Lien connexion */}
                  <div className="text-center mt-4">
                    <span className="text-body-tertiary fs-9">
                      Déjà inscrit ?{" "}
                    </span>
                    <Link className="fs-9 fw-bold" to="/login">
                      Se connecter
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
