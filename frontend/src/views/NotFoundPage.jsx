import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
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
          Page introuvable
        </h4>

        {/* Description */}
        <p className="text-body-tertiary fs-9 mb-5">
          La page que vous tentez d'atteindre n'existe pas ou a été déplacée.
          Vérifiez l'URL ou revenez au tableau de bord.
        </p>

        {/* Actions */}
        <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
          <button
            className="btn btn-phoenix-secondary"
            onClick={() => navigate(-1)}
          >
            <span className="fas fa-arrow-left me-2" />
            Retour
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            <span className="fas fa-gauge me-2" />
            Tableau de bord
          </button>
        </div>

        {/* Lien expéditions */}
        <p className="mt-4 mb-0 fs-10 text-body-tertiary">
          Vous cherchez quelque chose ?{" "}
          <button
            className="btn btn-link p-0 fs-10 fw-semibold"
            onClick={() => navigate("/expeditions")}
          >
            Voir les expéditions
          </button>
        </p>
      </div>
    </div>
  );
}
