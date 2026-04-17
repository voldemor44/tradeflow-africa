import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";

// === CONFIGURATION ===
const CHART_CONFIG = {
  defaultDateRange: {
    start: "2023-11-01",
    end: "2023-11-07",
  },
  defaultData: [150, 100, 300, 200, 250, 180, 250],
  dateInterval: 86400000, // 1 jour en millisecondes
  gridPadding: { left: 5, right: 5, top: 5, bottom: 0 },
  lineWidth: 2,
  tooltipPadding: 10,
};

// === UTILITAIRES ===

/**
 * Récupère une couleur du thème Phoenix
 */
const getThemeColor = (colorName) => {
  return (
    window.phoenix?.utils?.getColor?.(colorName) ||
    getComputedStyle(document.documentElement)
      .getPropertyValue(`--phoenix-${colorName}`)
      .trim()
  );
};

/**
 * Génère une plage de dates
 */
const generateDateRange = (
  startDate,
  endDate,
  interval = CHART_CONFIG.dateInterval,
) => {
  const dates = [];
  let currentDate = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();

  while (currentDate <= endTime) {
    dates.push(new Date(currentDate));
    currentDate += interval;
  }

  return dates;
};

/**
 * Formatte le tooltip avec les données de deux périodes
 */
const formatTooltip = (params) => {
  if (!params || params.length === 0) return "";

  const currentDate = dayjs(params[0].axisValue);
  const previousDate = currentDate.subtract(1, "month");

  const tooltipData = params.map((item, index) => ({
    value: item.value,
    date: index > 0 ? previousDate : currentDate,
    color: item.color,
  }));

  const tooltipItems = tooltipData
    .map(
      (item, index) => `
      <h6 class="fs-9 ${index > 0 ? "mb-0" : ""}">
        <span class="fas fa-circle me-2" style="color:${item.color}"></span>
        ${item.date.format("MMM DD")}: <span class="fw-normal">${item.value}</span>
      </h6>
    `,
    )
    .join("");

  return `<div class='ms-1'>${tooltipItems}</div>`;
};

// === COMPOSANT PRINCIPAL ===

/**
 * Graphique de valeur de réservation avec ligne temporelle
 *
 * @param {Array} data - Données du graphique
 * @param {Object} dateRange - Plage de dates {start, end}
 * @param {string} lineColor - Nom de la couleur de la ligne (ex: 'warning', 'primary')
 * @param {string} height - Hauteur du graphique
 */
const BookingValueChart = ({
  data = CHART_CONFIG.defaultData,
  dateRange = CHART_CONFIG.defaultDateRange,
  lineColor = "warning",
  height = "300px",
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // === INITIALISATION DU GRAPHIQUE ===

    chartInstanceRef.current = echarts.init(chartRef.current);

    // Générer les dates pour l'axe X
    const dates = generateDateRange(dateRange.start, dateRange.end);

    // === CONFIGURATION DU GRAPHIQUE ===

    const option = {
      tooltip: {
        trigger: "axis",
        padding: CHART_CONFIG.tooltipPadding,
        backgroundColor: getThemeColor("body-highlight-bg"),
        borderColor: getThemeColor("border-color"),
        textStyle: { color: getThemeColor("light-text-emphasis") },
        borderWidth: 1,
        transitionDuration: 0,
        axisPointer: { type: "none" },
        formatter: formatTooltip,
        extraCssText: "z-index: 1000",
      },
      xAxis: [
        {
          type: "category",
          data: dates,
          show: false,
          boundaryGap: false,
          axisLine: {
            show: true,
            lineStyle: { color: getThemeColor("secondary-bg") },
          },
          axisTick: { show: false },
          axisLabel: {
            formatter: (value) => dayjs(value).format("DD MMM"),
            showMinLabel: true,
            showMaxLabel: false,
            color: getThemeColor("secondary-color"),
            align: "left",
            interval: 5,
            fontFamily: "Nunito Sans",
            fontWeight: 600,
            fontSize: 12.8,
          },
        },
      ],
      yAxis: {
        show: false,
        type: "value",
        boundaryGap: false,
      },
      series: [
        {
          type: "line",
          data: data,
          showSymbol: false,
          symbol: "circle",
          lineStyle: {
            width: CHART_CONFIG.lineWidth,
            color: getThemeColor(lineColor),
          },
          emphasis: {
            lineStyle: { color: getThemeColor(lineColor) },
          },
          itemStyle: {
            color: getThemeColor(lineColor),
          },
          zlevel: 1,
        },
      ],
      grid: CHART_CONFIG.gridPadding,
    };

    chartInstanceRef.current.setOption(option);

    // === RESPONSIVE ===

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);

    // === NETTOYAGE ===

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [data, dateRange, lineColor]);

  // === RENDU ===

  return (
    <div
      ref={chartRef}
      className="order-1 order-sm-0 order-md-1"
      style={{ height: 54, width: 90 }}
    />
  );
};

export default BookingValueChart;
