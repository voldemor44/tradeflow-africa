import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const ShipmentsVolumeChart = ({
  startDate = new Date("1/1/2025"),
  endDate = new Date("1/31/2025"),
  currentMonthData = [
    2, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3, 6, 6, 6, 7,
    8, 9, 10, 11, 12, 9, 7, 7, 7, 5, 3, 3, 4, 4, 4,
  ],
  previousMonthData = [
    3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3,
    5, 7, 7, 7, 9, 11, 8, 5, 5, 6, 7, 8, 7, 6, 5,
  ],
}) => {
  const { t } = useTranslation();
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

  const getDates = (start, end, interval = 86400000) => {
    const dates = [];
    let current = new Date(start);
    const endTime = new Date(end).getTime();
    while (current.getTime() <= endTime) {
      dates.push(new Date(current));
      current = new Date(current.getTime() + interval);
    }
    return dates;
  };

  const tooltipFormatter = (params) => {
    const currentDate = dayjs(params[0].axisValue);
    const previousDate = dayjs(params[0].axisValue).subtract(1, "month");
    const data = params.map((param, index) => ({
      value: param.value,
      date: index > 0 ? previousDate : currentDate,
      color: param.color,
    }));
    let html = "";
    data.forEach((item, index) => {
      html += `
        <h6 class="fs-9 text-body-tertiary ${index > 0 ? "mb-0" : ""}">
          <span class="fas fa-circle me-2" style="color:${item.color}"></span>
          ${item.date.format("DD MMM")} : ${item.value} ${t("dashboard.shipment")}${item.value > 1 ? "s" : ""}
        </h6>
      `;
    });
    return `<div class='ms-1'>${html}</div>`;
  };

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstanceRef.current = echarts.init(chartRef.current);
    const dates = getDates(startDate, endDate);
    const isDark = window.config?.config?.phoenixTheme === "dark";

    const option = {
      color: [getColor("primary"), getColor("info")],
      tooltip: {
        trigger: "axis",
        padding: 10,
        backgroundColor: getColor("body-highlight-bg"),
        borderColor: getColor("border-color"),
        textStyle: { color: getColor("light-text-emphasis") },
        borderWidth: 1,
        transitionDuration: 0,
        axisPointer: { type: "none" },
        formatter: tooltipFormatter,
        extraCssText: "z-index: 1000",
      },
      xAxis: [
        {
          type: "category",
          data: dates,
          axisLabel: {
            formatter: (value) => dayjs(value).format("DD MMM"),
            interval: 13,
            showMinLabel: true,
            showMaxLabel: false,
            color: getColor("secondary-color"),
            align: "left",
            fontFamily: "Nunito Sans",
            fontWeight: 600,
            fontSize: 12.8,
          },
          axisLine: {
            show: true,
            lineStyle: { color: getColor("secondary-bg") },
          },
          axisTick: { show: false },
          splitLine: {
            show: true,
            interval: 0,
            lineStyle: {
              color: isDark
                ? getColor("body-highlight-bg")
                : getColor("secondary-bg"),
            },
          },
          boundaryGap: false,
        },
        {
          type: "category",
          position: "bottom",
          data: dates,
          axisLabel: {
            formatter: (value) => dayjs(value).format("DD MMM"),
            interval: 130,
            showMaxLabel: true,
            showMinLabel: false,
            color: getColor("secondary-color"),
            align: "right",
            fontFamily: "Nunito Sans",
            fontWeight: 600,
            fontSize: 12.8,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          boundaryGap: false,
        },
      ],
      yAxis: {
        position: "right",
        axisPointer: { type: "none" },
        axisTick: "none",
        splitLine: { show: false },
        axisLine: { show: false },
        axisLabel: { show: false },
      },
      series: [
        {
          name: t("dashboard.currentMonth"),
          type: "line",
          data: currentMonthData,
          showSymbol: false,
          symbol: "circle",
          zlevel: 2,
        },
        {
          name: t("dashboard.previousMonth"),
          type: "line",
          data: previousMonthData,
          lineStyle: { type: "dashed", width: 1, color: getColor("info") },
          showSymbol: false,
          symbol: "circle",
          zlevel: 1,
        },
      ],
      grid: {
        right: 2,
        left: 5,
        bottom: "20px",
        top: "2%",
        containLabel: false,
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
  }, [startDate, endDate, currentMonthData, previousMonthData, t]);

  return <div ref={chartRef} style={{ minHeight: 320, width: "100%" }} />;
};

export default ShipmentsVolumeChart;
