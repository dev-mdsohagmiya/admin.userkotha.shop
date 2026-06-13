import { ApexOptions } from "apexcharts";
import React from "react";
import Chart from "react-apexcharts";

const InterviewSuccessChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 300,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#12b76a", "#ff4778"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 60,
      max: 100,
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
        formatter: (value) => `${value}%`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: 500,
      labels: {
        colors: "#64748b",
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value) => `${value}%`,
      },
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: "#ffffff",
      hover: {
        size: 7,
      },
    },
  };

  const series = [
    {
      name: "Interview Success Rate",
      data: [68, 72, 71, 78, 75, 81, 84, 82, 87, 89, 86, 92],
    },
    {
      name: "Offer Acceptance Rate",
      data: [85, 88, 82, 91, 87, 93, 89, 94, 91, 96, 93, 97],
    },
  ];

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Success Rates
      </h3>
      <Chart options={options} series={series} type="line" height={300} />
    </div>
  );
};

export default InterviewSuccessChart;
