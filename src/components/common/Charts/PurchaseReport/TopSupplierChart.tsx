import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface SupplierData {
  supplierName: string;
  totalPurchases: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
}

interface Props {
  data: SupplierData[];
}

const TopSupplierChart: React.FC<Props> = ({ data }) => {
  const [widthClass, setWidthClass] = useState("w-full");

  useEffect(() => {
    if (data.length === 1)
      setWidthClass("w-3/5"); // ~40%
    else if (data.length === 2)
      setWidthClass("w-4/5"); // ~60%
    else if (data.length === 3) setWidthClass("w-5/5");
    else if (data.length === 4)
      setWidthClass("w-5/5"); // ~80%
    else if (data.length >= 5) setWidthClass("w-full");
    else setWidthClass("w-auto");
  }, [data.length]); // update when data changes

  const series = [
    { name: "Total Purchases", data: data.map((item) => item.totalPurchases) },
    { name: "Total Amount", data: data.map((item) => item.totalAmount) },
    { name: "Total Paid", data: data.map((item) => item.totalPaid) },
    { name: "Total Due", data: data.map((item) => item.totalDue) },
  ];

  const categories = data.map((item) => item.supplierName);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      events: {
        mouseLeave: () => {
          const tooltipEl = document.querySelector(".apexcharts-tooltip");
          if (tooltipEl) {
            (tooltipEl as HTMLElement).style.opacity = "0";
            (tooltipEl as HTMLElement).style.pointerEvents = "none";
          }
        },
      },
    },
    title: {
      text: "Top Suppliers Purchase Analysis",
      align: "left",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => Number(val).toLocaleString(),
      },
    },
    colors: ["#009531", "#009531", "#FFA500", "red"],
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "12px", fontWeight: 500, colors: "#009531" },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "dark",
      y: {
        formatter: (val: number) =>
          val >= 1000 ? `TK ${val.toLocaleString()}` : val.toString(),
      },
    },
    legend: { position: "bottom", fontSize: "14px" },
    fill: { opacity: 1 },
  };

  return (
    <div
      className={`mx-auto bg-white rounded-md pl-2  pr-4 py-4 border border-gray-200  items-center ${widthClass}`}
    >
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
};

export default TopSupplierChart;
