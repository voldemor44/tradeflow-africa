import React from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import ShipmentsVolumeChart from "../components/dashboard/ShipmentsVolumeChart";
import ActiveShipmentsChart from "../components/dashboard/ActiveShipmentsChart";
import NewShipmentsChart from "../components/dashboard/NewShipmentsChart";
import TopRoutesTable from "../components/dashboard/TopRoutesTable";
import CostProjectionChart from "../components/dashboard/CostProjectionChart";
import ShipmentStatusTrendChart from "../components/dashboard/ShipmentStatusTrendChart";
import RecentShipmentsTable from "../components/dashboard/RecentShipmentsTable";
import WorldMap from "../components/dashboard/WorldMap";

const TradeFlowDashboard = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="pb-5">
        <div className="row g-4">
          {/* ── COLONNE GAUCHE : Header + Graphique principal ── */}
          <div className="col-12 col-xxl-6">
            {/* En-tête */}
            <div className="mb-8">
              <h2 className="mb-2">{t("dashboard.title")}</h2>
              <h5 className="text-body-tertiary fw-semibold">
                {t("dashboard.subtitle")}
              </h5>
            </div>

            {/* Alertes métier rapides */}
            <div className="row align-items-center g-4">
              <div className="col-12 col-md-auto">
                <NavLink
                  to="/expeditions?status=blocked"
                  className="d-flex align-items-center text-decoration-none"
                >
                  <span
                    className="fa-stack"
                    style={{ minHeight: 46, minWidth: 46 }}
                  >
                    <span
                      className="fa-solid fa-square fa-stack-2x dark__text-opacity-50 text-danger-light"
                      data-fa-transform="down-4 rotate--10 left-4"
                    />
                    <span
                      className="fa-solid fa-circle fa-stack-2x stack-circle text-stats-circle-danger"
                      data-fa-transform="up-4 right-3 grow-2"
                    />
                    <span
                      className="fa-stack-1x fa-solid fa-xmark text-danger"
                      data-fa-transform="shrink-2 up-8 right-6"
                    />
                  </span>
                  <div className="ms-3">
                    <h4 className="mb-0">{t("dashboard.expeditionsBlocked")}</h4>
                    <p className="text-body-secondary fs-9 mb-0">
                      {t("dashboard.blockedCustoms")}
                    </p>
                  </div>
                </NavLink>
              </div>
              <div className="col-12 col-md-auto">
                <NavLink
                  to="/documents?filter=expiring"
                  className="d-flex align-items-center text-decoration-none"
                >
                  <span
                    className="fa-stack"
                    style={{ minHeight: 46, minWidth: 46 }}
                  >
                    <span
                      className="fa-solid fa-square fa-stack-2x dark__text-opacity-50 text-warning-light"
                      data-fa-transform="down-4 rotate--10 left-4"
                    />
                    <span
                      className="fa-solid fa-circle fa-stack-2x stack-circle text-stats-circle-warning"
                      data-fa-transform="up-4 right-3 grow-2"
                    />
                    <span
                      className="fa-stack-1x fa-solid fa-file-circle-exclamation text-warning"
                      data-fa-transform="shrink-2 up-8 right-6"
                    />
                  </span>
                  <div className="ms-3">
                    <h4 className="mb-0">{t("dashboard.documentsExpiring")}</h4>
                    <p className="text-body-secondary fs-9 mb-0">
                      {t("dashboard.expireWithin7")}
                    </p>
                  </div>
                </NavLink>
              </div>
              <div className="col-12 col-md-auto">
                <NavLink
                  to="/expeditions?status=active"
                  className="d-flex align-items-center text-decoration-none"
                >
                  <span
                    className="fa-stack"
                    style={{ minHeight: 46, minWidth: 46 }}
                  >
                    <span
                      className="fa-solid fa-square fa-stack-2x dark__text-opacity-50 text-success-light"
                      data-fa-transform="down-4 rotate--10 left-4"
                    />
                    <span
                      className="fa-solid fa-circle fa-stack-2x stack-circle text-stats-circle-success"
                      data-fa-transform="up-4 right-3 grow-2"
                    />
                    <span
                      className="fa-stack-1x fa-solid fa-ship text-success"
                      data-fa-transform="shrink-2 up-8 right-6"
                    />
                  </span>
                  <div className="ms-3">
                    <h4 className="mb-0">{t("dashboard.vesselsActive")}</h4>
                    <p className="text-body-secondary fs-9 mb-0">
                      {t("dashboard.atSeaNow")}
                    </p>
                  </div>
                </NavLink>
              </div>
            </div>

            <hr className="bg-body-secondary mb-6 mt-4" />

            {/* Sélecteur de période */}
            <div className="row flex-between-center mb-4 g-3">
              <div className="col-auto">
                <h3>{t("dashboard.shipmentVolume")}</h3>
                <p className="text-body-tertiary lh-sm mb-0">
                  {t("dashboard.shipmentVolumeDesc")}
                </p>
              </div>
              <div className="col-8 col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="select-shipments-month"
                >
                  <option>Janv 1 - 31, 2025</option>
                  <option>Févr 1 - 28, 2025</option>
                  <option>Mars 1 - 31, 2025</option>
                </select>
              </div>
            </div>

            {/* Légende du graphique */}
            <div className="d-flex gap-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="d-block rounded-pill bg-primary"
                  style={{ width: 16, height: 3 }}
                />
                <span className="fs-10 text-body-tertiary fw-semibold">
                  {t("dashboard.currentMonth")}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="d-block rounded-pill bg-info"
                  style={{ width: 16, height: 3, borderTop: "2px dashed" }}
                />
                <span className="fs-10 text-body-tertiary fw-semibold">
                  {t("dashboard.previousMonth")}
                </span>
              </div>
            </div>

            <ShipmentsVolumeChart />
          </div>

          {/* ── COLONNE DROITE : Cards KPI ── */}
          <div className="col-12 col-xxl-6">
            <div className="row g-3">
              {/* Card : Expéditions actives */}
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-1">
                          {t("dashboard.activeShipments")}
                          <span className="badge badge-phoenix badge-phoenix-success rounded-pill fs-9 ms-2">
                            <span className="badge-label">+12.4%</span>
                          </span>
                        </h5>
                        <h6 className="text-body-tertiary">{t("dashboard.last7Days")}</h6>
                      </div>
                      <h4>47</h4>
                    </div>

                    <div className="d-flex justify-content-center px-4 py-6">
                      <ActiveShipmentsChart />
                    </div>

                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-2">
                        <div className="bullet-item bg-primary me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          {t("dashboard.import")}
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">68%</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="bullet-item bg-primary-subtle me-2" />
                        <h6 className="text-body fw-semibold flex-1 mb-0">
                          {t("dashboard.export")}
                        </h6>
                        <h6 className="text-body fw-semibold mb-0">32%</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card : Nouveaux dossiers */}
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-1">
                          {t("dashboard.newCases")}
                          <span className="badge badge-phoenix badge-phoenix-warning rounded-pill fs-9 ms-2">
                            <span className="badge-label">-4.2%</span>
                          </span>
                        </h5>
                        <h6 className="text-body-tertiary">{t("dashboard.last7Days")}</h6>
                      </div>
                      <h4>12</h4>
                    </div>
                    <div className="pb-0 pt-4">
                      <NewShipmentsChart />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card : Documents à valider */}
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-2">{t("dashboard.documentsPending")}</h5>
                        <h6 className="text-body-tertiary">
                          {t("dashboard.toProcessToday")}
                        </h6>
                      </div>
                      <NavLink
                        to="/documents?filter=pending"
                        className="btn btn-sm btn-phoenix-primary"
                      >
                        {t("common.viewAll")}
                      </NavLink>
                    </div>
                    <div className="mt-3">
                      {[
                        { label: t("dashboard.toValidate"), count: 5, badge: "warning" },
                        { label: t("dashboard.missing"), count: 3, badge: "danger" },
                        { label: t("dashboard.expiring7d"), count: 7, badge: "warning" },
                        {
                          label: t("dashboard.validatedThisMonth"),
                          count: 42,
                          badge: "success",
                        },
                      ].map(({ label, count, badge }) => (
                        <div
                          key={label}
                          className="d-flex align-items-center justify-content-between mb-3"
                        >
                          <div className="d-flex align-items-center">
                            <div className={`bullet-item bg-${badge} me-2`} />
                            <h6 className="text-body fw-semibold mb-0">
                              {label}
                            </h6>
                          </div>
                          <span
                            className={`badge badge-phoenix badge-phoenix-${badge} fs-10`}
                          >
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card : Paiements */}
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-2">{t("dashboard.payments")}</h5>
                        <h6 className="text-body-tertiary">{t("dashboard.financialTracking")}</h6>
                      </div>
                      <NavLink
                        to="/finances/paiements"
                        className="btn btn-sm btn-phoenix-primary"
                      >
                        {t("common.viewAll")}
                      </NavLink>
                    </div>
                    <div className="mt-3 flex-1">
                      {[
                        {
                          label: t("dashboard.pending"),
                          amount: "4 200 000",
                          badge: "warning",
                        },
                        {
                          label: t("dashboard.overdue"),
                          amount: "1 850 000",
                          badge: "danger",
                        },
                        {
                          label: t("dashboard.paidThisMonth"),
                          amount: "12 400 000",
                          badge: "success",
                        },
                      ].map(({ label, amount, badge }) => (
                        <div
                          key={label}
                          className="d-flex align-items-center justify-content-between mb-3"
                        >
                          <div className="d-flex align-items-center">
                            <div className={`bullet-item bg-${badge} me-2`} />
                            <h6 className="text-body fw-semibold mb-0">
                              {label}
                            </h6>
                          </div>
                          <h6 className="text-body fw-semibold mb-0 text-end">
                            {amount}
                            <span className="text-body-tertiary fw-normal ms-1 fs-10">
                              FCFA
                            </span>
                          </h6>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2 : Expéditions récentes ── */}
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis pt-7 border-y">
        <div data-list='{"valueNames":["id","description","partner","status","eta"],"page":5}'>
          <div className="row align-items-end justify-content-between pb-5 g-3">
            <div className="col-auto">
              <h3>{t("dashboard.recentShipments")}</h3>
              <p className="text-body-tertiary lh-sm mb-0">
                {t("dashboard.recentShipmentsDesc")}
              </p>
            </div>
          </div>
          <RecentShipmentsTable />
        </div>
      </div>

      {/* ── SECTION 3 : Top routes + Carte mondiale ── */}
      <div className="row gx-6">
        <div className="col-12 col-xl-6">
          <TopRoutesTable />
        </div>
        <WorldMap />
      </div>

      {/* ── SECTION 4 : Graphiques analytiques ── */}
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis pt-6 pb-9 border-top">
        <div className="row g-6">
          <div className="col-12 col-xl-6">
            <div className="me-xl-4">
              <div>
                <h3>{t("dashboard.costsEstimated")}</h3>
                <p className="mb-1 text-body-tertiary">
                  {t("dashboard.costsEstimatedDesc")}
                </p>
              </div>
              <CostProjectionChart />
            </div>
          </div>
          <div className="col-12 col-xl-6">
            <div>
              <h3>{t("dashboard.statusTrend")}</h3>
              <p className="mb-1 text-body-tertiary">
                {t("dashboard.statusTrendDesc")}
              </p>
            </div>
            <ShipmentStatusTrendChart />
          </div>
        </div>
      </div>
    </>
  );
};

export default TradeFlowDashboard;
