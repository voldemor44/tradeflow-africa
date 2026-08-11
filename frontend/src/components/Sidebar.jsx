import React from "react";
import { NavLink, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

// Hook pour détecter si un groupe de routes est actif
const useIsGroupActive = (paths) => {
  const location = useLocation();
  return paths.some((path) => location.pathname.startsWith(path));
};

// Badge de comptage (alertes urgentes)
const Badge = ({ count, variant = "danger" }) => {
  if (!count || count === 0) return null;
  return (
    <span
      className={`badge ms-2 badge badge-phoenix badge-phoenix-${variant} nav-link-badge`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

// Badge textuel (ex: "V2", "Bientôt")
const TextBadge = ({ label, variant = "warning" }) => (
  <span
    className={`badge ms-2 badge badge-phoenix badge-phoenix-${variant} nav-link-badge`}
  >
    {label}
  </span>
);

// Composant d'un sous-lien simple
const NavSubItem = ({ to, label, badge, textBadge, disabled }) => {
  if (disabled) {
    return (
      <li className="nav-item">
        <span
          className="nav-link disabled"
          style={{ opacity: 0.5, cursor: "not-allowed" }}
        >
          <div className="d-flex align-items-center">
            <span className="nav-link-text">{label}</span>
            {textBadge && <TextBadge label={textBadge} variant="info" />}
          </div>
        </span>
      </li>
    );
  }

  return (
    <li className="nav-item">
      <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        to={to}
      >
        <div className="d-flex align-items-center">
          <span className="nav-link-text">{label}</span>
          {badge !== undefined && <Badge count={badge} />}
          {textBadge && <TextBadge label={textBadge} />}
        </div>
      </NavLink>
    </li>
  );
};

// Composant groupe collapsible niveau 1
const NavGroup = ({
  id,
  icon,
  label,
  children,
  activePaths = [],
  textBadge,
  alertCount,
}) => {
  const isActive = useIsGroupActive(activePaths);

  return (
    <div className="nav-item-wrapper">
      <a
        className="nav-link dropdown-indicator label-1"
        href={`#nv-${id}`}
        role="button"
        data-bs-toggle="collapse"
        aria-expanded={isActive ? "true" : "false"}
        aria-controls={`nv-${id}`}
      >
        <div className="d-flex align-items-center">
          <div className="dropdown-indicator-icon-wrapper">
            <span className="fas fa-caret-right dropdown-indicator-icon" />
          </div>
          <span className="nav-link-icon">
            <span data-feather={icon} className="icon-sm" />
          </span>
          <span className="nav-link-text">{label}</span>
          {alertCount !== undefined && <Badge count={alertCount} />}
          {textBadge && <TextBadge label={textBadge} variant="info" />}
        </div>
      </a>
      <div className="parent-wrapper label-1">
        <ul
          className={`nav collapse parent ${isActive ? "show" : ""}`}
          data-bs-parent="#navbarVerticalCollapse"
          id={`nv-${id}`}
        >
          <li className="collapsed-nav-item-title d-none">{label}</li>
          {children}
        </ul>
      </div>
    </div>
  );
};

// Lien simple niveau 1 (sans sous-menus)
const NavSingleItem = ({ to, icon, label, alertCount, textBadge }) => (
  <div className="nav-item-wrapper">
    <NavLink
      className={({ isActive }) =>
        `nav-link label-1 ${isActive ? "active" : ""}`
      }
      to={to}
    >
      <div className="d-flex align-items-center">
        <span className="nav-link-icon">
          <span data-feather={icon} className="icon-sm" />
        </span>
        <span className="nav-link-text-wrapper">
          <span className="nav-link-text">{label}</span>
        </span>
        {alertCount !== undefined && <Badge count={alertCount} />}
        {textBadge && <TextBadge label={textBadge} />}
      </div>
    </NavLink>
  </div>
);

// Séparateur de section
const SectionLabel = ({ label }) => (
  <li className="nav-item">
    <p className="navbar-vertical-label">{label}</p>
    <hr className="navbar-vertical-line" />
  </li>
);

// ============================================================
// SIDEBAR TRADEFLOW AFRICA
// ============================================================

const Sidebar = ({ alerts = {} }) => {
  const { t } = useTranslation();
  /**
   * alerts = {
   *   shipmentsBlocked: 3,      // expéditions bloquées
   *   documentsToValidate: 5,   // documents à valider
   *   documentsExpiring: 2,     // documents expirant bientôt
   *   paymentsOverdue: 1,       // paiements en retard
   *   notifications: 8,         // notifications non lues
   * }
   */

  return (
    <nav className="navbar navbar-vertical navbar-expand-lg">
      <div className="collapse navbar-collapse" id="navbarVerticalCollapse">
        <div className="navbar-vertical-content">
          <ul className="navbar-nav flex-column" id="navbarVerticalNav">
            {/* ── SECTION PRINCIPALE ─────────────────────── */}
            <SectionLabel label={t("nav.main")} />

            {/* Dashboard */}
            <li className="nav-item">
              <NavSingleItem
                to="/dashboard"
                icon="pie-chart"
                label={t("nav.dashboard")}
                alertCount={alerts.notifications}
              />
            </li>

            {/* ── SECTION OPERATIONS ─────────────────────── */}
            <SectionLabel label={t("nav.operations")} />

            {/* Expéditions */}
            <li className="nav-item">
              <NavSingleItem
                to="/expeditions"
                icon="package"
                label={t("nav.expeditions")}
                alertCount={alerts.shipmentsBlocked}
              />
            </li>

            {/* Carte & Tracking */}
            <li className="nav-item">
              <NavSingleItem
                to="/tracking/carte"
                icon="map"
                label={t("nav.mapTracking")}
              />
            </li>

            {/* Documents */}
            <li className="nav-item">
              <NavSingleItem
                id="documents"
                icon="file-text"
                label={t("nav.documents")}
                to="/documents/list"
                alertCount={
                  (alerts.documentsToValidate || 0) +
                  (alerts.documentsExpiring || 0)
                }
              />
            </li>

            {/* Partenaires */}
            <li className="nav-item">
              <NavGroup
                id="partenaires"
                icon="users"
                label={t("nav.partners")}
                activePaths={["/partenaires"]}
              >
                <NavSubItem to="/partenaires" label={t("nav.allPartners")} />
                <NavSubItem
                  to="/partenaires/transitaires"
                  label={t("nav.forwarders")}
                />
                <NavSubItem
                  to="/partenaires/commissionnaires"
                  label={t("nav.commissionAgents")}
                />
                <NavSubItem
                  to="/partenaires/transporteurs"
                  label={t("nav.carriers")}
                />
                <NavSubItem
                  to="/partenaires/fournisseurs"
                  label={t("nav.suppliersCustomers")}
                />
              </NavGroup>
            </li>

            {/* ── SECTION ANALYTIQUE ──────────────────────── */}
            <SectionLabel label={t("nav.analytics")} />

            {/* Analytics */}
            <li className="nav-item">
              <NavGroup
                id="analytics"
                icon="bar-chart-2"
                label={t("nav.analytics")}
                activePaths={["/analytics"]}
              >
                <NavSubItem to="/analytics" label={t("nav.analyticsOverview")} />
                <NavSubItem
                  to="/analytics/partenaires"
                  label={t("nav.partnerPerformance")}
                />
                <NavSubItem
                  to="/analytics/couts"
                  label={t("nav.costsPerShipment")}
                  disabled
                  textBadge={t("nav.v2")}
                />
                <NavSubItem to="/analytics/delais" label={t("nav.delays")} />
              </NavGroup>
            </li>

            {/* ── SECTION PARAMETRES ──────────────────────── */}
            <SectionLabel label={t("nav.settings")} />

            {/* Paramètres */}
            <li className="nav-item">
              <NavGroup
                id="parametres"
                icon="settings"
                label={t("nav.settingsTitle")}
                activePaths={["/parametres"]}
              >
                <NavSubItem to="/parametres/profil" label={t("nav.myProfile")} />
                <NavSubItem
                  to="/parametres/equipe"
                  label={t("nav.teamUsers")}
                />
                <NavSubItem
                  to="/parametres/organisation"
                  label={t("nav.organisation")}
                />
                <NavSubItem
                  to="/parametres/notifications"
                  label={t("nav.notifications")}
                />
                <NavSubItem
                  to="/parametres/abonnement"
                  label={t("nav.subscriptionBilling")}
                />
              </NavGroup>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer de la sidebar */}
      <div className="navbar-vertical-footer">
        <button className="btn navbar-vertical-toggle border-0 fw-semibold w-100 white-space-nowrap d-flex align-items-center">
          <span className="uil uil-left-arrow-to-left fs-8" />
          <span className="uil uil-arrow-from-right fs-8" />
          <span className="navbar-vertical-footer-text ms-2">{t("nav.collapsedView")}</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
