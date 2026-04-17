import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const TopCouponsChart = ({
  data = [
    { value: 7200000, name: "Percentage discount" },
    { value: 1800000, name: "Fixed card discount" },
    { value: 1000000, name: "Fixed product discount" },
  ],
  centerLabel = "72%",
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

  const handleTooltipPosition = (point, params, dom, rect, size) => {
    const pos = { top: point[1] - 35 };
    if (window.innerWidth > 540) {
      if (point[0] <= size.viewSize[0] / 2) {
        pos.left = point[0] + 20;
      } else {
        pos.left = point[0] - size.contentSize[0] - 20;
      }
    } else {
      pos[point[0] < size.viewSize[0] / 2 ? "left" : "right"] = 0;
    }
    return pos;
  };

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstanceRef.current = echarts.init(chartRef.current);

    const option = {
      color: [
        getColor("primary"),
        getColor("primary-lighter"),
        getColor("info-dark"),
      ],
      tooltip: {
        trigger: "item",
        padding: [7, 10],
        backgroundColor: getColor("body-highlight-bg"),
        borderColor: getColor("border-color"),
        textStyle: { color: getColor("light-text-emphasis") },
        borderWidth: 1,
        transitionDuration: 0,
        position: handleTooltipPosition,
        formatter: (params) =>
          `<strong>${params.data.name}:</strong> ${params.percent}%`,
        extraCssText: "z-index: 1000",
      },
      legend: { show: false },
      series: [
        {
          name: centerLabel,
          type: "pie",
          radius: ["100%", "87%"],
          avoidLabelOverlap: false,
          emphasis: { scale: false, itemStyle: { color: "inherit" } },
          itemStyle: { borderWidth: 2, borderColor: getColor("body-bg") },
          label: {
            show: true,
            position: "center",
            formatter: "{a}",
            fontSize: 23,
            color: getColor("light-text-emphasis"),
          },
          data,
        },
      ],
      grid: { containLabel: true },
    };

    chartInstanceRef.current.setOption(option);

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [data, centerLabel]);

  return <div ref={chartRef} style={{ height: 115, width: "100%" }} />;
};

export default TopCouponsChart;
