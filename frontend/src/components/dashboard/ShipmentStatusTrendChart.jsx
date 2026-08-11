import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTranslation } from "react-i18next";

const getMonths = (t) => [
  t("dashboard.monthJan"), t("dashboard.monthFeb"), t("dashboard.monthMar"), t("dashboard.monthApr"), t("dashboard.monthMay"), t("dashboard.monthJun"),
  t("dashboard.monthJul"), t("dashboard.monthAug"), t("dashboard.monthSep"), t("dashboard.monthOct"), t("dashboard.monthNov"), t("dashboard.monthDec"),
];

const ShipmentStatusTrendChart = ({
  deliveredData    = [62, 70, 75, 80, 72, 84, 78, 65, 70, 74, 82, 88],
  inTransitData    = [50, 55, 48, 62, 58, 70, 65, 60, 68, 72, 66, 70],
  blockedData      = [15, 12, 18, 10, 20, 8,  14, 22, 10, 12, 9,  7 ],
}) => {
  const { t } = useTranslation();
  const months = getMonths(t);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const getColor = (colorName) => {
    return (
      window.phoenix?.utils?.getColor?.(colorName) ||
      getComputedStyle(document.documentElement)
        .getPropertyValue(`--phoenix-${colorName}`)
        .trim()
    );
  };

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstanceRef.current = echarts.init(chartRef.current);

    const option = {
      color: getColor("body-highlight-bg"),
      legend: {
        data: [
          {
            name: t("dashboard.delivered"),
            icon: "roundRect",
            itemStyle: { color: getColor("primary"), borderWidth: 0 },
          },
          {
            name: t("dashboard.inTransit"),
            icon: "roundRect",
            itemStyle: { color: getColor("info-lighter"), borderWidth: 0 },
          },
          {
            name: t("dashboard.blocked"),
            icon: "roundRect",
            itemStyle: { color: getColor("primary-light"), borderWidth: 0 },
          },
        ],
        right: "right",
        width: "100%",
        itemWidth: 16,
        itemHeight: 8,
        itemGap: 20,
        top: 3,
        inactiveColor: getColor("quaternary-color"),
        inactiveBorderWidth: 0,
        textStyle: {
          color: getColor("body-color"),
          fontWeight: 600,
          fontFamily: "Nunito Sans",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "none" },
        padding: [7, 10],
        backgroundColor: getColor("body-highlight-bg"),
        borderColor: getColor("border-color"),
        textStyle: { color: getColor("light-text-emphasis") },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params) => {
          return params
            .map(
              (p) =>
                `<span style="color:${p.color}">●</span> ${p.seriesName}: <strong>${p.value} ${t("dashboard.expAbbrev")}</strong>`
            )
            .join("<br/>");
        },
        extraCssText: "z-index: 1000",
      },
      xAxis: {
        type: "category",
        data: months,
        show: true,
        boundaryGap: false,
        axisLine: { show: true, lineStyle: { color: getColor("tertiary-bg") } },
        axisTick: { show: false },
        axisLabel: {
          showMinLabel: false,
          showMaxLabel: false,
          color: getColor("secondary-color"),
          fontFamily: "Nunito Sans",
          fontWeight: 600,
          fontSize: 12.8,
        },
        splitLine: {
          show: true,
          lineStyle: { color: getColor("secondary-bg"), type: "dashed" },
        },
      },
      yAxis: {
        type: "value",
        boundaryGap: false,
        axisLabel: {
          showMinLabel: true,
          showMaxLabel: true,
          color: getColor("secondary-color"),
          fontFamily: "Nunito Sans",
          fontWeight: 600,
          fontSize: 12.8,
        },
        splitLine: {
          show: true,
          lineStyle: { color: getColor("secondary-bg") },
        },
      },
      series: [
        {
          name: t("dashboard.delivered"),
          type: "line",
          data: deliveredData,
          showSymbol: false,
          symbol: "circle",
          symbolSize: 10,
          emphasis: { lineStyle: { width: 3 } },
          lineStyle: { width: 3, color: getColor("primary") },
          itemStyle: { borderColor: getColor("primary"), borderWidth: 3 },
          zlevel: 3,
        },
        {
          name: t("dashboard.inTransit"),
          type: "line",
          data: inTransitData,
          showSymbol: false,
          symbol: "circle",
          symbolSize: 10,
          emphasis: { lineStyle: { width: 1 } },
          lineStyle: { width: 1, color: getColor("info-lighter") },
          itemStyle: { borderColor: getColor("info-lighter"), borderWidth: 3 },
          zlevel: 2,
        },
        {
          name: t("dashboard.blocked"),
          type: "line",
          data: blockedData,
          showSymbol: false,
          symbol: "circle",
          symbolSize: 10,
          emphasis: { lineStyle: { width: 1 } },
          lineStyle: {
            type: "dashed",
            width: 1,
            color: getColor("primary-light"),
          },
          itemStyle: { borderColor: getColor("primary-light"), borderWidth: 3 },
          zlevel: 1,
        },
      ],
      grid: { left: 0, right: 8, top: "14%", bottom: 0, containLabel: true },
    };

    chartInstanceRef.current.setOption(option);
    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [deliveredData, inTransitData, blockedData, t]);

  return <div ref={chartRef} style={{ height: 300 }} />;
};

export default ShipmentStatusTrendChart;
