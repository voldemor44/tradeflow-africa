import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { useTranslation } from "react-i18next";

// === CONFIGURATION ===
const CHART_CONFIG = {
  barWidth: 8,
  barGap: "100%",
  gridPadding: { right: 20, left: 3, bottom: 0, top: 16, containLabel: true },
  tooltipPadding: [7, 10],
  defaultYAxisCategories: [
    "NOV-DEC",
    "SEP-OCT",
    "JUL-AUG",
    "MAY-JUN",
    "MAR-APR",
    "JAN-FEB",
  ],
};

// Données par défaut pour 3 types d'activités (Hotel, Flight, Trip)
const getActivityOptions = (t) => [
  { value: 0, label: t("travelAgency.hotel") },
  { value: 1, label: t("travelAgency.flight") },
  { value: 2, label: t("travelAgency.trip") },
];

const DEFAULT_DATA = {
  profit: [
    [350000, 390000, 410700, 450000, 390000, 410700], // Hotel
    [245000, 310000, 420000, 480000, 530000, 580000], // Flight
    [278450, 513220, 359890, 444567, 201345, 589000], // Trip
  ],
  revenue: [
    [-810000, -640000, -630000, -590000, -620000, -780000], // Hotel
    [-482310, -726590, -589120, -674832, -811245, -455678], // Flight
    [-432567, -688921, -517389, -759234, -601876, -485112], // Trip
  ],
  expenses: [
    [-450000, -250000, -200000, -120000, -230000, -270000], // Hotel
    [-243567, -156789, -398234, -120456, -321890, -465678], // Flight
    [-235678, -142345, -398765, -287456, -173890, -451234], // Trip
  ],
};

// === UTILITAIRES ===

const getThemeColor = (colorName) => {
  return (
    window.phoenix?.utils?.getColor?.(colorName) ||
    getComputedStyle(document.documentElement)
      .getPropertyValue(`--phoenix-${colorName}`)
      .trim()
  );
};

const isDarkTheme = () => {
  return window.config?.config?.phoenixTheme === "dark";
};

const formatXAxis = (value) => {
  return `${Math.abs(Math.round((value / 1000) * 10) / 10)}k`;
};

const handleTooltipPosition = ([mouseX, mouseY, , , size]) => {
  const tooltipWidth = size.contentSize[0];
  const tooltipHeight = size.contentSize[1];
  const position = { top: mouseY - tooltipHeight - 20 };

  if (window.innerWidth > 540) {
    position.left =
      mouseX <= size.viewSize[0] / 2 ? mouseX + 20 : mouseX - tooltipWidth - 20;
  } else {
    position[mouseX < size.viewSize[0] / 2 ? "left" : "right"] = 0;
  }

  return position;
};

const tooltipFormatter = (params) => {
  if (!params || params.length === 0) return "";

  let tooltipHtml = `<div style="margin-bottom: 8px;"><strong>${params[0].name}</strong></div>`;

  params.forEach((p) => {
    const value = Math.abs(p.value).toLocaleString();
    tooltipHtml += `
      <div style="margin-top: 4px; display: flex; align-items: center;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${p.color};margin-right:8px;"></span>
        <span>${p.seriesName}: <strong>${value}</strong></span>
      </div>
    `;
  });

  return tooltipHtml;
};

// === COMPOSANT PRINCIPAL ===

/**
 * Graphique des activités financières avec sessions (Hotel, Flight, Trip)
 *
 * @param {Object} data - Données {profit: [[]], revenue: [[]], expenses: [[]]}
 * @param {Array} yAxisCategories - Catégories de l'axe Y
 * @param {Array} activityOptions - Options d'activité [{value: 0, label: 'Hotel'}, ...]
 * @param {string} title - Titre du graphique
 * @param {string} subtitle - Sous-titre du graphique
 * @param {string} height - Hauteur du graphique
 */
const FinancialActivitySessions = ({
  data = DEFAULT_DATA,
  yAxisCategories = CHART_CONFIG.defaultYAxisCategories,
  activityOptions,
  title,
  subtitle,
  height = "700px",
}) => {
  const { t } = useTranslation();
  const resolvedActivityOptions =
    activityOptions ?? getActivityOptions(t);
  const resolvedTitle = title ?? t("travelAgency.financialActivities");
  const resolvedSubtitle = subtitle ?? t("travelAgency.yearlyBalance");
  const profitName = t("travelAgency.profit");
  const revenueName = t("travelAgency.revenue");
  const expensesName = t("travelAgency.expenses");
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [selectedActivity, setSelectedActivity] = useState(0);
  const [toggledLegends, setToggledLegends] = useState({
    [profitName]: true,
    [revenueName]: true,
    [expensesName]: true,
  });

  // === INITIALISATION DU GRAPHIQUE ===
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstanceRef.current = echarts.init(chartRef.current);

    const updateChart = () => {
      const option = {
        color: [getThemeColor("primary"), getThemeColor("tertiary-bg")],
        tooltip: {
          trigger: "axis",
          padding: CHART_CONFIG.tooltipPadding,
          backgroundColor: getThemeColor("body-highlight-bg"),
          borderColor: getThemeColor("border-color"),
          textStyle: { color: getThemeColor("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          position: handleTooltipPosition,
          formatter: tooltipFormatter,
          extraCssText: "z-index: 1000",
        },
        legend: {
          data: [profitName, revenueName, expensesName],
          show: false,
        },
        xAxis: {
          axisLabel: {
            show: true,
            margin: 12,
            color: getThemeColor("secondary-text-emphasis"),
            formatter: formatXAxis,
            fontFamily: "Nunito Sans",
            fontWeight: 700,
          },
          splitLine: {
            lineStyle: { color: getThemeColor("border-color-translucent") },
          },
        },
        yAxis: {
          axisTick: { show: false },
          data: yAxisCategories,
          axisLabel: {
            color: getThemeColor("secondary-text-emphasis"),
            margin: 8,
            fontFamily: "Nunito Sans",
            fontWeight: 700,
          },
          axisLine: {
            lineStyle: { color: getThemeColor("border-color-translucent") },
          },
        },
        series: [
          {
            name: profitName,
            stack: "Total",
            type: "bar",
            barWidth: CHART_CONFIG.barWidth,
            emphasis: { focus: "series" },
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              color: isDarkTheme()
                ? getThemeColor("primary")
                : getThemeColor("primary-light"),
            },
            data: data.profit[selectedActivity],
          },
          {
            name: revenueName,
            type: "bar",
            barWidth: CHART_CONFIG.barWidth,
            barGap: CHART_CONFIG.barGap,
            stack: "Total",
            emphasis: { focus: "series" },
            itemStyle: {
              borderRadius: [4, 0, 0, 4],
              color: isDarkTheme()
                ? getThemeColor("success")
                : getThemeColor("success-light"),
            },
            data: data.revenue[selectedActivity],
          },
          {
            name: expensesName,
            type: "bar",
            barWidth: CHART_CONFIG.barWidth,
            emphasis: { focus: "series" },
            itemStyle: {
              borderRadius: [4, 0, 0, 4],
              color: isDarkTheme()
                ? getThemeColor("info")
                : getThemeColor("info-light"),
            },
            data: data.expenses[selectedActivity],
          },
        ],
        grid: CHART_CONFIG.gridPadding,
        animation: false,
      };

      chartInstanceRef.current.setOption(option);
    };

    updateChart();

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [data, yAxisCategories, selectedActivity, profitName, revenueName, expensesName]);

  // === GESTION DES CLICS SUR LA LÉGENDE ===
  const handleLegendToggle = (legendName) => {
    setToggledLegends((prev) => ({ ...prev, [legendName]: !prev[legendName] }));
    chartInstanceRef.current?.dispatchAction({
      type: "legendToggleSelect",
      name: legendName,
    });
  };

  // === GESTION DU CHANGEMENT D'ACTIVITÉ ===
  const handleActivityChange = (e) => {
    setSelectedActivity(Number(e.target.value));
  };

  // === RENDU ===
  return (
    <div className="col-12 col-xl-7 col-xxl-12">
      <div className="mt-5 mt-xl-0 mt-xxl-5 mb-5 mb-xxl-0">
        {/* Header */}
        <div className="row flex-between-end gy-3 gx-2">
          {/* Titre */}
          <div className="col-auto">
            <h3 className="text-body-highlight">{resolvedTitle}</h3>
            <p className="mb-0 text-body-tertiary">{resolvedSubtitle}</p>
          </div>

          {/* Sélecteur d'activité */}
          <div className="col-12 col-sm-auto ms-auto order-1 order-sm-0 order-md-1 order-lg-0 order-xxl-1">
            <select
              className="form-select form-select-sm pe-9 w-auto"
              value={selectedActivity}
              onChange={handleActivityChange}
              data-activities-options="data-activities-options"
            >
              {resolvedActivityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Menu actions */}
          <div className="col-auto order-md-1 order-lg-0 order-xxl-1">
            <div className="dropdown">
              <button
                className="btn btn-sm btn-phoenix-secondary bg-body-emphasis bg-body-hover action-btn"
                type="button"
                data-bs-toggle="dropdown"
                data-boundary="window"
                aria-haspopup="true"
                aria-expanded="false"
                data-bs-reference="parent"
              >
                <span
                  className="fas fa-ellipsis-h"
                  data-fa-transform="shrink-2"
                />
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <a className="dropdown-item" href="#">
                  {t("travelAgency.action")}
                </a>
                <a className="dropdown-item" href="#">
                  {t("travelAgency.anotherAction")}
                </a>
                <a className="dropdown-item" href="#">
                  {t("travelAgency.somethingElse")}
                </a>
              </div>
            </div>
          </div>

          {/* Légendes cliquables */}
          <div className="col-12 col-md-auto col-lg-12 col-xxl-auto mx-auto order-1 order-sm-0">
            <div className="d-flex justify-content-center gap-6 gap-xxl-4">
              <button
                className={`btn d-flex align-items-center p-0 shadow-none fw-semibold ${!toggledLegends[profitName] ? "opacity-50" : ""}`}
                id="profit"
                onClick={() => handleLegendToggle(profitName)}
              >
                <span
                  className="bg-primary-light me-2"
                  style={{ width: 16, height: 6, borderRadius: 1 }}
                  data-bs-theme="light"
                />
                <span className="text-body-secondary">{profitName}</span>
              </button>
              <button
                className={`btn d-flex align-items-center p-0 shadow-none fw-semibold ${!toggledLegends[revenueName] ? "opacity-50" : ""}`}
                id="revenue"
                onClick={() => handleLegendToggle(revenueName)}
              >
                <span
                  className="bg-success-light me-2"
                  style={{ width: 16, height: 6, borderRadius: 1 }}
                  data-bs-theme="light"
                />
                <span className="text-body-secondary">{revenueName}</span>
              </button>
              <button
                className={`btn d-flex align-items-center p-0 shadow-none fw-semibold ${!toggledLegends[expensesName] ? "opacity-50" : ""}`}
                id="expanses"
                onClick={() => handleLegendToggle(expensesName)}
              >
                <span
                  className="bg-info-light me-2"
                  style={{ width: 16, height: 6, borderRadius: 1 }}
                  data-bs-theme="light"
                />
                <span className="text-body-secondary">{expensesName}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Graphique */}
        <div
          ref={chartRef}
          className="echart-financial-Activities"
          style={{ width: "100%", height }}
        />
      </div>
    </div>
  );
};

export default FinancialActivitySessions;
