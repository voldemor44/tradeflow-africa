import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary">
      <div className="text-center px-4" style={{ maxWidth: 520 }}>
        {/* Icône */}
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle mb-4"
          style={{ width: 96, height: 96 }}
        >
          <span className="fas fa-ship text-danger" style={{ fontSize: 40 }} />
        </div>

        {/* Code erreur */}
        <h1
          className="fw-black text-danger mb-0"
          style={{ fontSize: "clamp(80px, 20vw, 140px)", lineHeight: 1 }}
        >
          404
        </h1>

        {/* Titre */}
        <h4 className="fw-bold text-body-highlight mt-2 mb-3">
          {t("notFound.title")}
        </h4>

        {/* Description */}
        <p className="text-body-tertiary fs-9 mb-5">
          {t("notFound.description")}
        </p>

        {/* Actions */}
        <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
          <button
            className="btn btn-phoenix-secondary"
            onClick={() => navigate(-1)}
          >
            <span className="fas fa-arrow-left me-2" />
            {t("notFound.back")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            <span className="fas fa-gauge me-2" />
            {t("notFound.dashboard")}
          </button>
        </div>

        {/* Lien expéditions */}
        <p className="mt-4 mb-0 fs-10 text-body-tertiary">
          {t("notFound.lookingFor")}{" "}
          <button
            className="btn btn-link p-0 fs-10 fw-semibold"
            onClick={() => navigate("/expeditions")}
          >
            {t("notFound.viewExpeditions")}
          </button>
        </p>
      </div>
    </div>
  );
}
