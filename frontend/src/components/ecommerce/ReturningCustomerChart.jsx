import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ReturningCustomerChart = ({
  fourthTimeData = [62, 90, 90, 90, 78, 84, 17, 17, 17, 17, 82, 95],
  thirdTimeData = [50, 50, 30, 62, 18, 70, 70, 22, 70, 70, 70, 70],
  secondTimeData = [40, 78, 60, 78, 60, 20, 60, 40, 60, 40, 20, 78],
  height = "300px",
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

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstanceRef.current = echarts.init(chartRef.current);

    const option = {
      color: getColor("body-highlight-bg"),
      legend: {
        data: [
          {
            name: "Fourth time",
            icon: "roundRect",
            itemStyle: { color: getColor("primary-light"), borderWidth: 0 },
          },
          {
            name: "Third time",
            icon: "roundRect",
            itemStyle: { color: getColor("info-lighter"), borderWidth: 0 },
          },
          {
            name: "Second time",
            icon: "roundRect",
            itemStyle: { color: getColor("primary"), borderWidth: 0 },
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
                `<span style="color:${p.color}">●</span> ${p.seriesName}: <strong>${p.value}%</strong>`,
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
          formatter: (value) => value.slice(0, 3),
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
          formatter: (value) => `${value}%`,
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
          name: "Fourth time",
          type: "line",
          data: fourthTimeData,
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
          zlevel: 3,
        },
        {
          name: "Third time",
          type: "line",
          data: thirdTimeData,
          showSymbol: false,
          symbol: "circle",
          symbolSize: 10,
          emphasis: { lineStyle: { width: 1 } },
          lineStyle: { width: 1, color: getColor("info-lighter") },
          itemStyle: { borderColor: getColor("info-lighter"), borderWidth: 3 },
          zlevel: 2,
        },
        {
          name: "Second time",
          type: "line",
          data: secondTimeData,
          showSymbol: false,
          symbol: "circle",
          symbolSize: 10,
          emphasis: { lineStyle: { width: 3 } },
          lineStyle: { width: 3, color: getColor("primary") },
          itemStyle: { borderColor: getColor("primary"), borderWidth: 3 },
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
  }, [fourthTimeData, thirdTimeData, secondTimeData]);

  return <div ref={chartRef} style={{ height: 300 }} />;
};

export default ReturningCustomerChart;
