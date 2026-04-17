import { useEffect, useRef } from "react";

const TotalOrdersChart = ({
  startDate = new Date("5/1/2022"),
  endDate = new Date("5/7/2022"),
  data = [120, 200, 150, 80, 70, 110, 120],
  barWidth = "5px",
  height = "200px",
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

  // Gestion de la position du tooltip
  const handleTooltipPosition = ([pos, params, dom, rect, size]) => {
    const obj = { top: pos[1] };
    obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
    return obj;
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialiser le chart
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
          `<strong>${dayjs(params.name).format("DD MMM")}:</strong> ${params.value}`,
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
      grid: {
        right: 10,
        left: 10,
        bottom: 0,
        top: 0,
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
  }, [startDate, endDate, data, barWidth]);
  return <div ref={chartRef} style={{ height: 85, width: 115 }} />;
};

export default TotalOrdersChart;
