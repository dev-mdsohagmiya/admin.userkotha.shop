import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface DiscountVatData {
  totalPurchases: number;
  totalSubTotal: number;
  totalDiscount: number;
  totalVAT: number;
  totalAmount: number;
  averageDiscount: number;
  averageVAT: number;
  discountPercentage: number;
  vatPercentage: number;
}

interface Props {
  disCountAndVatData: DiscountVatData;
}

const FullPurchaseAnalysisChart: React.FC<Props> = ({ disCountAndVatData }) => {
  const {
    totalPurchases,
    totalSubTotal,
    totalDiscount,
    totalVAT,
    totalAmount,
    averageDiscount,
    averageVAT,
    discountPercentage,
    vatPercentage,
  } = disCountAndVatData;

  const options: ApexOptions = {
    chart: {
      type: "radar",
      height: 450,
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
      text: "Purchase Discount and VAT Analysis",
      align: "left",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    xaxis: {
      categories: [
        "Total Purchases",
        "SubTotal",
        "Discount",
        "VAT",
        "Total Amount",
        "Avg Discount",
        "Avg VAT",
        "Discount %",
        "VAT %",
      ],
    },
    yaxis: {
      labels: {
        formatter: (val: any) => {
          const num = Array.isArray(val) ? val[0] : Number(val);
          return num > 1000 ? `TK ${Math.round(num / 1000)}k` : `${num}`;
        },
      },
    },
    stroke: { width: 3, curve: "smooth" },
    markers: { size: 6, colors: ["#009531"], strokeWidth: 2 },
    colors: ["#009531"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#009531"],
        opacityFrom: 0.6,
        opacityTo: 0.2,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => {
        const value = Array.isArray(val) ? val[0] : Number(val);
        return value > 1 ? `TK ${value.toLocaleString()}` : `${value}%`;
      },
    },
    tooltip: {
      style: { fontSize: "14px", fontFamily: "Arial" },
      theme: "dark",
      marker: { fillColors: ["#009531"] },
      y: {
        formatter: (val: any) => {
          const value = Array.isArray(val) ? val[0] : Number(val);
          return value > 1 ? `TK ${value.toLocaleString()}` : `${value}%`;
        },
      },
    },
  };

  const series = [
    {
      name: "Purchase Metrics",
      data: [
        totalPurchases,
        totalSubTotal,
        totalDiscount,
        totalVAT,
        totalAmount,
        averageDiscount,
        averageVAT,
        discountPercentage * 100,
        vatPercentage,
      ],
    },
  ];

  return (
    <div className="bg-white p-6 rounded-md border">
      <Chart options={options} series={series} type="radar" height={400} />
    </div>
  );
};

export default FullPurchaseAnalysisChart;
