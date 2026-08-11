import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const ActiveShipmentsChart = ({
  startDate = new Date("1/1/2025"),
  endDate = new Date("1/7/2025"),
  data = [4, 7, 5, 9, 6, 8, 11],
  barWidth = "5px",
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

  const handleTooltipPosition = ([pos, params, dom, rect, size]) => {
    const obj = { top: pos[1] };
    obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
    return obj;
  };

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstanceRef.current = echarts.init(chartRef.current);
    const dates = getDates(startDate, endDate);

    const option = {
      color: getColor("primary"),
      tooltip: {
        trigger: "item",
        padding: [7, 10],
        backgroundColor: getColor("body-highlight-bg"),
        borderColor: getColor("border-color"),
        textStyle: { color: getColor("light-text-emphasis") },
        position: (...args) => handleTooltipPosition(args),
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params) =>
          `<strong>${dayjs(params.name).format("DD MMM")}:</strong> ${params.value} ${t("dashboard.shipment")}${params.value > 1 ? "s" : ""}`,
        extraCssText: "z-index: 1000",
      },
      xAxis: {
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
          interval: 6,
          showMinLabel: true,
          showMaxLabel: true,
          color: getColor("secondary-color"),
        },
      },
      yAxis: {
        show: false,
        type: "value",
        boundaryGap: false,
      },
      series: [
        {
          type: "bar",
          barWidth: barWidth,
          data: data,
          showBackground: true,
          symbol: "none",
          itemStyle: { borderRadius: 10 },
          backgroundStyle: {
            borderRadius: 10,
            color: getColor("primary-bg-subtle"),
          },
        },
      ],
      grid: { right: 10, left: 10, bottom: 0, top: 0 },
    };

    chartInstanceRef.current.setOption(option);
    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [startDate, endDate, data, barWidth, t]);

  return <div ref={chartRef} style={{ height: 85, width: 115 }} />;
};

export default ActiveShipmentsChart;
