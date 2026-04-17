import { useEffect, useRef } from "react";
import * as echarts from "echarts";

// === CONFIGURATION ===
const GAUGE_CONFIG = {
  defaultValue: 70,
  startAngle: 90,
  endAngle: -270,
  radius: "90%",
  progressWidth: 3,
  tooltipPadding: [7, 10],
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
 * Gère la position du tooltip pour éviter les débordements
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
 * Formatte le contenu du tooltip
 */
const formatTooltip = (params) => {
  return `<strong>${params.seriesName}:</strong> ${params.value}%`;
};

// === COMPOSANT PRINCIPAL ===

/**
 * Graphique de type jauge (gauge) pour afficher une commission ou un pourcentage
 *
 * @param {number} value - Valeur à afficher (0-100)
 * @param {string} label - Label de la série
 * @param {string} progressColor - Nom de la couleur de progression
 * @param {string} backgroundColor - Nom de la couleur de fond
 * @param {string} height - Hauteur du graphique
 */
const CommissionChart = ({
  value = GAUGE_CONFIG.defaultValue,
  label = "Commission",
  progressColor = "primary",
  backgroundColor = "secondary-bg",
  height = "200px",
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // === INITIALISATION DU GRAPHIQUE ===

    chartInstanceRef.current = echarts.init(chartRef.current);

    // === CONFIGURATION DU GRAPHIQUE ===

    const option = {
      tooltip: {
        trigger: "item",
        padding: GAUGE_CONFIG.tooltipPadding,
        backgroundColor: getThemeColor("body-highlight-bg"),
        borderColor: getThemeColor("border-color"),
        textStyle: { color: getThemeColor("light-text-emphasis") },
        borderWidth: 1,
        position: handleTooltipPosition,
        transitionDuration: 0,
        formatter: formatTooltip,
        extraCssText: "z-index: 1000",
      },
      series: [
        {
          type: "gauge",
          name: label,
          startAngle: GAUGE_CONFIG.startAngle,
          endAngle: GAUGE_CONFIG.endAngle,
          radius: GAUGE_CONFIG.radius,
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              color: getThemeColor(progressColor),
            },
          },
          axisLine: {
            lineStyle: {
              width: GAUGE_CONFIG.progressWidth,
              color: [[1, getThemeColor(backgroundColor)]],
            },
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: [{ value }],
          detail: { show: false },
        },
      ],
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
  }, [value, label, progressColor, backgroundColor]);

  // === RENDU ===

  return (
    <div
      ref={chartRef}
      className="order-sm-0 order-md-1"
      style={{ height: 54, width: 54 }}
    />
  );
};

export default CommissionChart;
