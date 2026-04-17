import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

// Notification individuelle
const NotificationItem = ({
  avatar,
  initials,
  name,
  message,
  emoji,
  time,
  date,
  isRead,
}) => (
  <div
    className={`px-2 px-sm-3 py-3 notification-card position-relative ${isRead ? "read" : "unread"} border-bottom`}
  >
    <div className="d-flex align-items-center justify-content-between position-relative">
      <div className="d-flex">
        <div className="avatar avatar-m status-online me-3">
          {avatar ? (
            <img className="rounded-circle" src={avatar} alt={name} />
          ) : (
            <div className="avatar-name rounded-circle">
              <span>{initials}</span>
            </div>
          )}
        </div>
        <div className="flex-1 me-sm-3">
          <h4 className="fs-9 text-body-emphasis">{name}</h4>
          <p className="fs-9 text-body-highlight mb-2 mb-sm-3 fw-normal">
            {emoji && <span className="me-1 fs-10">{emoji}</span>}
            {message}
            <span className="ms-2 text-body-quaternary text-opacity-75 fw-bold fs-10">
              {time}
            </span>
          </p>
          <p className="text-body-secondary fs-9 mb-0">
            <span className="me-1 fas fa-clock" />
            <span className="fw-bold">{date}</span>
          </p>
        </div>
      </div>
      <div className="dropdown notification-dropdown">
        <button
          className="btn fs-10 btn-sm dropdown-toggle dropdown-caret-none transition-none"
          type="button"
          data-bs-toggle="dropdown"
          data-boundary="window"
          aria-haspopup="true"
          aria-expanded="false"
          data-bs-reference="parent"
        >
          <span className="fas fa-ellipsis-h fs-10 text-body" />
        </button>
        <div className="dropdown-menu py-2">
          <a className="dropdown-item" href="#!">
            {isRead ? "Marquer comme non lu" : "Marquer comme lu"}
          </a>
        </div>
      </div>
    </div>
  </div>
);

// Dropdown notifications
const NotificationsDropdown = ({ alerts = {} }) => {
  const unreadCount = alerts.notifications || 0;

  // Données de notifications métier TradeFlow
  const notifications = [
    {
      id: 1,
      name: "Expédition TFA-2025-0042",
      message: "Navire MV EVER GIVEN arrivé au Port de Cotonou.",
      emoji: "🚢",
      time: "10m",
      date: "Aujourd'hui, 10:41",
      isRead: false,
      initials: "EX",
    },
    {
      id: 2,
      name: "Document expirant",
      message: "Le certificat d'origine de TFA-2025-0039 expire dans 3 jours.",
      emoji: "⚠️",
      time: "1h",
      date: "Aujourd'hui, 09:30",
      isRead: false,
      initials: "DO",
    },
    {
      id: 3,
      name: "Expédition bloquée",
      message: "TFA-2025-0038 est bloquée en douane — document manquant.",
      emoji: "🔴",
      time: "2h",
      date: "Aujourd'hui, 08:15",
      isRead: false,
      initials: "EX",
    },
    {
      id: 4,
      name: "Paiement en retard",
      message: "Échéance dépassée pour le transitaire BESCO Cotonou.",
      emoji: "💳",
      time: "hier",
      date: "Hier, 17:00",
      isRead: true,
      initials: "FI",
    },
    {
      id: 5,
      name: "Nouveau dossier assigné",
      message: "Le dossier TFA-2025-0045 vous a été assigné par l'admin.",
      emoji: "📋",
      time: "hier",
      date: "Hier, 14:22",
      isRead: true,
      initials: "EQ",
    },
  ];

  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link position-relative"
        href="#"
        style={{ minWidth: "2.25rem" }}
        role="button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        data-bs-auto-close="outside"
      >
        <span className="d-block" style={{ height: 20, width: 20 }}>
          <span data-feather="bell" style={{ height: 20, width: 20 }} />
        </span>
        {unreadCount > 0 && (
          <span
            className="badge badge-phoenix badge-phoenix-danger position-absolute"
            style={{ top: 2, right: 2, fontSize: 9, padding: "2px 5px" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </a>
      <div
        className="dropdown-menu dropdown-menu-end notification-dropdown-menu py-0 shadow border navbar-dropdown-caret"
        aria-labelledby="navbarDropdownNotfication"
      >
        <div className="card position-relative border-0">
          <div className="card-header p-2">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="text-body-emphasis mb-0">Notifications</h5>
              {unreadCount > 0 && (
                <button
                  className="btn btn-link p-0 fs-9 fw-normal"
                  type="button"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>
          <div className="card-body p-0">
            <div className="scrollbar-overlay" style={{ height: "27rem" }}>
              {notifications.map((notif) => (
                <NotificationItem key={notif.id} {...notif} />
              ))}
            </div>
          </div>
          <div className="card-footer p-0 border-top border-translucent border-0">
            <div className="my-2 text-center fw-bold fs-10 text-body-tertiary">
              <NavLink className="fw-bolder" to="/parametres/notifications">
                Voir tout l'historique
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

// Dropdown profil utilisateur
const UserDropdown = ({ user = {} }) => {
  const navigate = useNavigate();
  const { refreshToken } = useStateContext();
  const { name = "Utilisateur", role = "Opérateur", avatar = null } = user;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    // appel API logout + clear tokens

    const payload = {
      refresh: refreshToken,
    };

    axiosClient
      .post("/auth/logout/", payload)
      .then(() => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link lh-1 pe-0"
        id="navbarDropdownUser"
        href="#!"
        role="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <div className="avatar avatar-l">
          {avatar ? (
            <img className="rounded-circle" src={avatar} alt={name} />
          ) : (
            <div className="avatar-name rounded-circle bg-primary">
              <span className="text-white">{initials}</span>
            </div>
          )}
        </div>
      </a>
      <div
        className="dropdown-menu dropdown-menu-end navbar-dropdown-caret py-0 dropdown-profile shadow border"
        aria-labelledby="navbarDropdownUser"
      >
        <div className="card position-relative border-0">
          <div className="card-body p-0">
            <div className="text-center pt-4 pb-3">
              <div className="avatar avatar-xl">
                {avatar ? (
                  <img className="rounded-circle" src={avatar} alt={name} />
                ) : (
                  <div className="avatar-name rounded-circle bg-primary">
                    <span className="fs-5 text-white">{initials}</span>
                  </div>
                )}
              </div>
              <h6 className="mt-2 text-body-emphasis">{name}</h6>
              <p className="fs-10 text-body-tertiary mb-0">{role}</p>
            </div>
          </div>
          <div className="overflow-auto scrollbar" style={{ height: "10rem" }}>
            <ul className="nav d-flex flex-column mb-2 pb-1">
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3 d-block"
                  to="/parametres/profil"
                >
                  <span
                    className="me-2 text-body align-bottom"
                    data-feather="user"
                  />
                  Mon profil
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 d-block" to="/dashboard">
                  <span
                    className="me-2 text-body align-bottom"
                    data-feather="pie-chart"
                  />
                  Tableau de bord
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3 d-block"
                  to="/parametres/organisation"
                >
                  <span
                    className="me-2 text-body align-bottom"
                    data-feather="briefcase"
                  />
                  Mon organisation
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 d-block" to="/parametres">
                  <span
                    className="me-2 text-body align-bottom"
                    data-feather="settings"
                  />
                  Paramètres
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 d-block" to="/aide">
                  <span
                    className="me-2 text-body align-bottom"
                    data-feather="help-circle"
                  />
                  Centre d'aide
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3 d-block"
                  to="/parametres/abonnement"
                >
                  <span
                    className="me-2 text-body align-bottom"
                    data-feather="credit-card"
                  />
                  Abonnement
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="card-footer p-0 border-top border-translucent">
            <div className="px-3 my-3">
              <button
                className="btn btn-phoenix-secondary d-flex flex-center w-100"
                onClick={handleLogout}
              >
                <span className="me-2" data-feather="log-out" />
                Se déconnecter
              </button>
            </div>
            <div className="mb-2 text-center fw-bold fs-10 text-body-quaternary">
              <a className="text-body-quaternary me-1" href="#!">
                Confidentialité
              </a>
              •
              <a className="text-body-quaternary mx-1" href="#!">
                CGU
              </a>
              •
              <a className="text-body-quaternary ms-1" href="#!">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

// ============================================================
// NAVBAR TRADEFLOW AFRICA
// ============================================================

const Navbar = ({ alerts = {}, user = {} }) => {
  // Déclenche feather.replace() après chaque render pour activer les icônes
  useEffect(() => {
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  });

  return (
    <>
      {/* Sidebar incluse ici comme dans le template original */}
      <Sidebar alerts={alerts} />

      <nav
        className="navbar navbar-top fixed-top navbar-expand"
        id="navbarDefault"
      >
        <div className="collapse navbar-collapse justify-content-between">
          {/* ── GAUCHE : Logo + Hamburger ─────────────── */}
          <div className="navbar-logo">
            <button
              className="btn navbar-toggler navbar-toggler-humburger-icon hover-bg-transparent"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarVerticalCollapse"
              aria-controls="navbarVerticalCollapse"
              aria-expanded="false"
              aria-label="Ouvrir la navigation"
            >
              <span className="navbar-toggle-icon">
                <span className="toggle-line" />
              </span>
            </button>
            <NavLink className="navbar-brand me-1 me-sm-3" to="/dashboard">
              <div className="d-flex align-items-center">
                {/* <span
                  data-feather="globe"
                  className="text-warning me-2"
                  style={{ width: 27, height: 27 }}
                /> */}
                <img
                  src="/assets/img/logo.png"
                  alt="TradeFlow Africa"
                  width={45}
                  height={45}
                />
                <h5 className="logo-text ms-1 d-none d-sm-block text-primary fw-bold">
                  TradeFlow
                </h5>
              </div>
            </NavLink>
          </div>

          {/* ── CENTRE : Barre de recherche ───────────── */}
          <div
            className="search-box navbar-top-search-box d-none d-lg-block"
            data-list='{"valueNames":["title"]}'
            style={{ width: "25rem" }}
          >
            <form
              className="position-relative"
              data-bs-toggle="search"
              data-bs-display="static"
            >
              <input
                className="form-control search-input fuzzy-search rounded-pill form-control-sm"
                type="search"
                placeholder="Rechercher une expédition, un document, un partenaire..."
                aria-label="Rechercher"
              />
              <span className="fas fa-search search-box-icon" />
            </form>
            <div
              className="btn-close position-absolute end-0 top-50 translate-middle cursor-pointer shadow-none"
              data-bs-dismiss="search"
            >
              <button className="btn btn-link p-0" aria-label="Fermer" />
            </div>
            <div className="dropdown-menu border start-0 py-0 overflow-hidden w-100">
              <div className="scrollbar-overlay" style={{ maxHeight: "30rem" }}>
                <div className="list pb-3">
                  <h6 className="dropdown-header text-body-highlight fs-9 border-bottom border-translucent py-2 lh-sm">
                    Recherches récentes
                  </h6>
                  <div className="py-2">
                    <a className="dropdown-item" href="#!">
                      <div className="d-flex align-items-center">
                        <div className="fw-normal text-body-highlight title">
                          <span
                            className="fa-solid fa-clock-rotate-left me-2"
                            data-fa-transform="shrink-2"
                          />
                          TFA-2025-0042
                        </div>
                      </div>
                    </a>
                    <a className="dropdown-item" href="#!">
                      <div className="d-flex align-items-center">
                        <div className="fw-normal text-body-highlight title">
                          <span
                            className="fa-solid fa-clock-rotate-left me-2"
                            data-fa-transform="shrink-2"
                          />
                          BESCO Transitaires
                        </div>
                      </div>
                    </a>
                  </div>
                  <hr className="my-0" />
                  <h6 className="dropdown-header text-body-highlight fs-9 border-bottom border-translucent py-2 lh-sm">
                    Expéditions récentes
                  </h6>
                  <div className="py-2">
                    <a
                      className="dropdown-item py-2 d-flex align-items-center"
                      href="#!"
                    >
                      <div className="flex-1">
                        <h6 className="mb-0 text-body-highlight title">
                          TFA-2025-0042
                        </h6>
                        <p className="fs-10 mb-0 text-body-tertiary">
                          <span className="fw-medium">
                            Shanghai → Cotonou • En mer
                          </span>
                        </p>
                      </div>
                    </a>
                    <a
                      className="dropdown-item py-2 d-flex align-items-center"
                      href="#!"
                    >
                      <div className="flex-1">
                        <h6 className="mb-0 text-body-highlight title">
                          TFA-2025-0041
                        </h6>
                        <p className="fs-10 mb-0 text-body-tertiary">
                          <span className="fw-medium">
                            Hambourg → Cotonou • En dédouanement
                          </span>
                        </p>
                      </div>
                    </a>
                  </div>
                  <hr className="my-0" />
                  <h6 className="dropdown-header text-body-highlight fs-9 border-bottom border-translucent py-2 lh-sm">
                    Partenaires
                  </h6>
                  <div className="py-2">
                    <a className="dropdown-item" href="#!">
                      <div className="fw-normal text-body-highlight title">
                        <span
                          className="fa-solid fa-link me-2 text-body"
                          data-fa-transform="shrink-2"
                        />
                        BESCO Cotonou — Transitaire
                      </div>
                    </a>
                    <a className="dropdown-item" href="#!">
                      <div className="fw-normal text-body-highlight title">
                        <span
                          className="fa-solid fa-link me-2 text-body"
                          data-fa-transform="shrink-2"
                        />
                        DHL Express Bénin — Transporteur
                      </div>
                    </a>
                  </div>
                  <hr className="my-0" />
                  <div className="text-center py-2">
                    <p className="fallback fw-bold fs-7 d-none">
                      Aucun résultat trouvé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── DROITE : Actions + Profil ─────────────── */}
          <ul className="navbar-nav navbar-nav-icons flex-row">
            {/* Toggle Dark/Light mode */}
            <li className="nav-item">
              <div className="theme-control-toggle fa-icon-wait px-2">
                <input
                  className="form-check-input ms-0 theme-control-toggle-input"
                  type="checkbox"
                  data-theme-control="phoenixTheme"
                  defaultValue="dark"
                  id="themeControlToggle"
                />
                <label
                  className="mb-0 theme-control-toggle-label theme-control-toggle-light"
                  htmlFor="themeControlToggle"
                  data-bs-toggle="tooltip"
                  data-bs-placement="left"
                  data-bs-title="Mode sombre"
                  style={{ height: 32, width: 32 }}
                >
                  <span className="icon" data-feather="moon" />
                </label>
                <label
                  className="mb-0 theme-control-toggle-label theme-control-toggle-dark"
                  htmlFor="themeControlToggle"
                  data-bs-toggle="tooltip"
                  data-bs-placement="left"
                  data-bs-title="Mode clair"
                  style={{ height: 32, width: 32 }}
                >
                  <span className="icon" data-feather="sun" />
                </label>
              </div>
            </li>

            {/* Recherche mobile */}
            <li className="nav-item d-lg-none">
              <a
                className="nav-link"
                href="#"
                data-bs-toggle="modal"
                data-bs-target="#searchBoxModal"
              >
                <span className="d-block" style={{ height: 20, width: 20 }}>
                  <span
                    data-feather="search"
                    style={{ height: 19, width: 19, marginBottom: 2 }}
                  />
                </span>
              </a>
            </li>

            {/* Notifications */}
            <NotificationsDropdown alerts={alerts} />

            {/* Raccourci : Nouvelle expédition */}
            <li className="nav-item d-none d-sm-flex align-items-center">
              <NavLink
                className="nav-link d-flex align-items-center"
                to="/expeditions/nouvelle"
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                data-bs-title="Nouvelle expédition"
              >
                <span data-feather="plus-circle" className="icon-sm" />
              </NavLink>
            </li>

            {/* Profil utilisateur */}
            <UserDropdown user={user} />
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
