import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";

const NewCustomersChart = ({
  startDate = new Date("5/1/2022"),
  endDate = new Date("5/7/2022"),
  currentMonthData = [200, 150, 250, 100, 500, 400, 600],
  previousMonthData = [150, 100, 300, 200, 250, 180, 250],
  height = "250px",
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Utilitaire pour obtenir les couleurs du thème
  const getColor = (colorName) => {
    return (
      window.phoenix?.utils?.getColor?.(colorName) ||
      getComputedStyle(document.documentElement)
        .getPropertyValue(`--phoenix-${colorName}`)
        .trim()
    );
  };

  // Générer les dates entre startDate et endDate
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

  // Formatter pour le tooltip
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
          ${item.date.format("MMM DD")} : ${item.value}
        </h6>
      `;
    });

    return `<div class='ms-1'>${html}</div>`;
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialiser le chart
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
          data: previousMonthData,
          showSymbol: false,
          symbol: "circle",
          lineStyle: {
            width: 2,
            color: getColor("secondary-bg"),
          },
          emphasis: {
            lineStyle: { color: getColor("secondary-bg") },
          },
          zlevel: 2,
        },
        {
          type: "line",
          data: currentMonthData,
          lineStyle: {
            width: 2,
            color: getColor("primary"),
          },
          showSymbol: false,
          symbol: "circle",
          zlevel: 2,
        },
      ],
      grid: {
        left: 0,
        right: 0,
        top: 5,
        bottom: 20,
      },
    };

    chartInstanceRef.current.setOption(option);

    // Gestion du resize
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [startDate, endDate, currentMonthData, previousMonthData]);

  return <div ref={chartRef} style={{ height: 180, width: "100%" }} />;
};

export default NewCustomersChart;
