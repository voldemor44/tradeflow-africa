import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";

const NewShipmentsChart = ({
  startDate = new Date("1/1/2025"),
  endDate = new Date("1/7/2025"),
  currentWeekData = [3, 5, 2, 7, 4, 6, 8],
  previousWeekData = [2, 4, 3, 5, 3, 4, 6],
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
    const previousDate = dayjs(params[0].axisValue).subtract(1, "week");
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
          ${item.date.format("DD MMM")} : ${item.value} dossier${item.value > 1 ? "s" : ""}
        </h6>
      `;
    });
    return `<div class='ms-1'>${html}</div>`;
  };

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstanceRef.current = echarts.init(chartRef.current);
    const dates = getDates(startDate, endDate);

    const option = {
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
          show: true,
          boundaryGap: false,
          axisLine: {
            show: true,
            lineStyle: { color: getColor("secondary-bg") },
          },
          axisTick: { show: false },
          axisLabel: {
            formatter: (value) => dayjs(value).format("DD MMM"),
            showMinLabel: true,
            showMaxLabel: false,
            color: getColor("secondary-color"),
            align: "left",
            interval: 5,
            fontFamily: "Nunito Sans",
            fontWeight: 600,
            fontSize: 12.8,
          },
        },
        {
          type: "category",
          position: "bottom",
          show: true,
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
        show: false,
        type: "value",
        boundaryGap: false,
      },
      series: [
        {
          type: "line",
          data: previousWeekData,
          showSymbol: false,
          symbol: "circle",
          lineStyle: { width: 2, color: getColor("secondary-bg") },
          emphasis: { lineStyle: { color: getColor("secondary-bg") } },
          zlevel: 2,
        },
        {
          type: "line",
          data: currentWeekData,
          lineStyle: { width: 2, color: getColor("primary") },
          showSymbol: false,
          symbol: "circle",
          zlevel: 2,
        },
      ],
      grid: { left: 0, right: 0, top: 5, bottom: 20 },
    };

    chartInstanceRef.current.setOption(option);
    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [startDate, endDate, currentWeekData, previousWeekData]);

  return <div ref={chartRef} style={{ height: 180, width: "100%" }} />;
};

export default NewShipmentsChart;
