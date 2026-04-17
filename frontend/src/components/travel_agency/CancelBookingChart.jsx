import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";

// === CONFIGURATION ===
const CHART_CONFIG = {
  defaultDateRange: {
    start: "2023-11-01",
    end: "2023-11-06",
  },
  defaultData: [120, 150, 100, 120, 110, 160],
  barWidth: 3,
  borderRadius: [0.5, 0.5, 0, 0],
  tooltipPadding: [7, 10],
  gridPadding: { right: 5, left: 0, bottom: 0, top: 0 },
  dateInterval: 86400000, // 1 jour en millisecondes
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
 * Vérifie si le thème actuel est sombre
 */
const isDarkTheme = () => {
  return window.config?.config?.phoenixTheme === "dark";
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
 * Gère la position du tooltip
 */
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

/**
 * Formatte le tooltip avec date et valeur
 */
const formatTooltip = (params) => {
  const formattedDate = dayjs(params.name).format("DD MMM");
  return `<strong>${formattedDate}:</strong> ${params.value}`;
};

// === COMPOSANT PRINCIPAL ===

/**
 * Graphique à barres pour les annulations de réservation
 *
 * @param {Array} data - Données des annulations
 * @param {Object} dateRange - Plage de dates {start, end}
 * @param {string} barColor - Nom de la couleur des barres (ex: 'info', 'primary')
 * @param {number} barWidth - Largeur des barres
 * @param {string} height - Hauteur du graphique
 */
const CancelBookingChart = ({
  data = CHART_CONFIG.defaultData,
  dateRange = CHART_CONFIG.defaultDateRange,
  barColor = "blue",
  barWidth = CHART_CONFIG.barWidth,
  height = "200px",
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // === INITIALISATION DU GRAPHIQUE ===

    chartInstanceRef.current = echarts.init(chartRef.current);

    // Générer les dates pour l'axe X
    const dates = generateDateRange(dateRange.start, dateRange.end);

    // Déterminer la couleur selon le thème
    const finalBarColor = isDarkTheme()
      ? getThemeColor(barColor)
      : getThemeColor(`${barColor}-light`);

    // === CONFIGURATION DU GRAPHIQUE ===

    const option = {
      color: getThemeColor("primary"),
      tooltip: {
        trigger: "item",
        padding: CHART_CONFIG.tooltipPadding,
        backgroundColor: getThemeColor("body-highlight-bg"),
        borderColor: getThemeColor("border-color"),
        textStyle: { color: getThemeColor("light-text-emphasis") },
        position: handleTooltipPosition,
        borderWidth: 1,
        transitionDuration: 0,
        formatter: formatTooltip,
        extraCssText: "z-index: 1000",
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: { show: false },
      series: [
        {
          type: "bar",
          barWidth: barWidth,
          data: data,
          symbol: "none",
          itemStyle: {
            borderRadius: CHART_CONFIG.borderRadius,
            color: finalBarColor,
          },
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
  }, [data, dateRange, barColor, barWidth]);

  // === RENDU ===

  return (
    <div
      ref={chartRef}
      className="order-sm-0 order-md-1"
      style={{ height: 54, width: 78 }}
    />
  );
};

export default CancelBookingChart;
