import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";

const CostProjectionChart = ({
  projectedData = [
    1850000, 2200000, 1950000, 2800000, 2100000, 1750000, 2400000, 2050000, 1900000, 2300000,
  ],
  actualData = [
    2100000, 1800000, 2350000, 2600000, 1950000, 2450000, 2150000, 2300000, 2050000, 2500000,
  ],
}) => {
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

  const getPastDates = (days) => {
    return Array.from({ length: days }, (_, i) => {
      return dayjs()
        .subtract(days - i - 1, "day")
        .toDate();
    });
  };

  const formatFCFA = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstanceRef.current = echarts.init(chartRef.current);
    const dates = getPastDates(10);

    const option = {
      color: [getColor("primary"), getColor("tertiary-bg")],
      tooltip: {
        trigger: "axis",
        padding: [7, 10],
        backgroundColor: getColor("body-highlight-bg"),
        borderColor: getColor("border-color"),
        textStyle: { color: getColor("light-text-emphasis") },
        borderWidth: 1,
        transitionDuration: 0,
        axisPointer: { type: "none" },
        formatter: (params) => {
          return params
            .map(
              (p) =>
                `<span style="color:${p.color}">●</span> ${p.seriesName}: <strong>${formatFCFA(p.value)} FCFA</strong>`
            )
            .join("<br/>");
        },
        extraCssText: "z-index: 1000",
      },
      legend: {
        data: ["Coût estimé", "Coût réel"],
        right: "right",
        width: "100%",
        itemWidth: 16,
        itemHeight: 8,
        itemGap: 20,
        top: 3,
        inactiveColor: getColor("quaternary-color"),
        textStyle: {
          color: getColor("body-color"),
          fontWeight: 600,
          fontFamily: "Nunito Sans",
        },
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          color: getColor("secondary-color"),
          formatter: (value) => dayjs(value).format("DD MMM"),
          interval: 3,
          fontFamily: "Nunito Sans",
          fontWeight: 600,
          fontSize: 12.8,
        },
        axisLine: { lineStyle: { color: getColor("tertiary-bg") } },
        axisTick: false,
      },
      yAxis: {
        axisPointer: { type: "none" },
        axisTick: "none",
        splitLine: {
          interval: 5,
          lineStyle: { color: getColor("secondary-bg") },
        },
        axisLine: { show: false },
        axisLabel: {
          fontFamily: "Nunito Sans",
          fontWeight: 600,
          fontSize: 12.8,
          color: getColor("secondary-color"),
          margin: 20,
          verticalAlign: "bottom",
          formatter: (value) => `${formatFCFA(value)}`,
        },
      },
      series: [
        {
          name: "Coût estimé",
          type: "bar",
          barWidth: "6px",
          data: projectedData,
          barGap: "30%",
          label: { show: false },
          itemStyle: {
            borderRadius: [2, 2, 0, 0],
            color: getColor("primary"),
          },
        },
        {
          name: "Coût réel",
          type: "bar",
          data: actualData,
          barWidth: "6px",
          barGap: "30%",
          label: { show: false },
          z: 10,
          itemStyle: {
            borderRadius: [2, 2, 0, 0],
            color: getColor("info-bg-subtle"),
          },
        },
      ],
      grid: {
        right: 0,
        left: 3,
        bottom: 0,
        top: "15%",
        containLabel: true,
      },
      animation: false,
    };

    chartInstanceRef.current.setOption(option);
    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [projectedData, actualData]);

  return <div ref={chartRef} style={{ height: 300, width: "100%" }} />;
};

export default CostProjectionChart;
