import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const { setToken, setRefreshToken, setUser, setUserId } = useStateContext();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      setApiError(t("login.errorRequired"));
      return;
    }

    setLoading(true);
    setApiError("");

    axiosClient
      .post("/auth/login/", {
        username: formData.username.trim(),
        password: formData.password,
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
          setApiError(t("login.errorNetwork"));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="row flex-center position-relative min-vh-100 g-0 py-5">
      <div className="col-11 col-sm-10 col-xl-8">
        <div className="card border border-translucent auth-card">
          <div className="card-body pe-md-0">
            <div className="row align-items-center gx-0 gy-7">
              {/* ── Panneau gauche — Branding ── */}
              <div className="col-auto bg-body-highlight dark__bg-gray-1100 rounded-3 position-relative overflow-hidden auth-title-box">
                <div
                  className="bg-holder"
                  style={{ backgroundImage: "url(/assets/img/bg/38.png)" }}
                />
                <div className="position-relative px-4 px-lg-7 pt-7 pb-7 pb-sm-5 text-center text-md-start pb-lg-7 pb-md-7">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="fw-bold fs-7 text-body-emphasis">
                      TradeFlow
                    </span>
                  </div>
                  <h3 className="mb-3 text-body-emphasis fs-7">
                    {t("login.welcomeTitle")}
                    <br />
                    {t("login.welcomeTitle2")}
                  </h3>
                  <p className="text-body-tertiary mb-4">
                    {t("login.welcomeDesc")}
                  </p>
                  <ul className="list-unstyled mb-0 w-max-content w-md-auto">
                    {[
                      t("login.featureRealTime"),
                      t("login.featureDocs"),
                      t("login.featureCustoms"),
                      t("login.featureMultiPartner"),
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

                <div className="position-relative z-n1 mb-6 d-none d-md-block text-center mt-md-15">
                  <img
                    className="auth-title-box-img d-dark-none"
                    src="/assets/img/img5.png"
                    alt="TradeFlow"
                  />
                  <img
                    className="auth-title-box-img d-light-none"
                    src="/assets/img/spot-illustrations/auth-dark.png"
                    alt="TradeFlow"
                  />
                </div>
              </div>

              {/* ── Panneau droit — Formulaire ── */}
              <div className="col mx-auto">
                <div className="auth-form-box">
                  {/* Header */}
                  <div className="text-center mb-7">
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
                    <h3 className="text-body-highlight fw-bold">{t("login.title")}</h3>
                    <p className="text-body-tertiary fs-9">
                      {t("login.subtitle")}
                    </p>
                  </div>

                  {/* Erreur API */}
                  {apiError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 fs-9 mb-4">
                      <span className="fas fa-exclamation-circle flex-shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* Formulaire */}
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Identifiant */}
                    <div className="mb-3 text-start">
                      <label className="form-label" htmlFor="username">
                        {t("login.username")}
                      </label>
                      <div className="form-icon-container">
                        <input
                          className={`form-control form-icon-input ${apiError ? "is-invalid" : ""}`}
                          id="username"
                          name="username"
                          type="text"
                          placeholder={t("login.usernamePlaceholder")}
                          value={formData.username}
                          onChange={handleChange}
                          autoComplete="username"
                          autoFocus
                          required
                        />
                        <span className="fas fa-user text-body fs-9 form-icon" />
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div className="mb-3 text-start">
                      <label className="form-label" htmlFor="password">
                        {t("login.password")}
                      </label>
                      <div className="form-icon-container position-relative">
                        <input
                          className={`form-control form-icon-input pe-6 ${apiError ? "is-invalid" : ""}`}
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                          required
                        />
                        <span className="fas fa-key text-body fs-9 form-icon" />
                        <button
                          className="btn px-3 py-0 h-100 position-absolute top-0 end-0 fs-7 text-body-tertiary"
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          <span
                            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Se souvenir / Mot de passe oublié */}
                    <div className="row flex-between-center mb-7">
                      <div className="col-auto">
                        <div className="form-check mb-0">
                          <input
                            className="form-check-input"
                            id="rememberMe"
                            name="rememberMe"
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                          />
                          <label
                            className="form-check-label mb-0 fs-9"
                            htmlFor="rememberMe"
                          >
                            {t("login.rememberMe")}
                          </label>
                        </div>
                      </div>
                      <div className="col-auto">
                        <Link
                          className="fs-9 fw-semibold"
                          to="/forgot-password"
                        >
                          {t("login.forgotPassword")}
                        </Link>
                      </div>
                    </div>

                    {/* Bouton connexion */}
                    <button
                      className="btn btn-primary w-100 mb-3"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          {t("login.signingIn")}
                        </>
                      ) : (
                        <>
                          <span className="fas fa-sign-in-alt me-2" />
                          {t("login.signIn")}
                        </>
                      )}
                    </button>

                    {/* Lien inscription */}
                    <div className="text-center">
                      <span className="text-body-tertiary fs-9">
                        {t("login.noAccount")}{" "}
                      </span>
                      <Link className="fs-9 fw-bold" to="/register">
                        {t("login.createAccount")}
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
