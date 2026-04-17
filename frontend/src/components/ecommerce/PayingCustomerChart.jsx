import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const PayingCustomerChart = ({ value = 30, height = "300px" }) => {
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
      tooltip: {
        trigger: "item",
        padding: [7, 10],
        backgroundColor: getColor("body-highlight-bg"),
        borderColor: getColor("border-color"),
        textStyle: { color: getColor("light-text-emphasis") },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params) =>
          `<strong>${params.seriesName}:</strong> ${params.value}%`,
        extraCssText: "z-index: 1000",
      },
      legend: { show: false },
      series: [
        {
          type: "gauge",
          center: ["50%", "60%"],
          name: "Paying customer",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 12,
          itemStyle: { color: getColor("primary") },
          progress: {
            show: true,
            roundCap: true,
            width: 12,
            itemStyle: { shadowBlur: 0, shadowColor: "#0000" },
          },
          pointer: { show: false },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 12,
              color: [[1, getColor("primary-bg-subtle")]],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          title: { show: false },
          detail: { show: false },
          data: [{ value }],
        },
      ],
    };

    chartInstanceRef.current.setOption(option);

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [value]);

  return <div ref={chartRef} style={{ height: "100%", width: "100%" }} />;
};

export default PayingCustomerChart;
