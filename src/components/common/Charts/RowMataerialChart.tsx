import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import Chart from "react-apexcharts";

const RowMaterialChart: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("Monthly");

  // Chart data
  const chartData: Record<string, number[]> = {
    Yearly: [450, 380, 500, 420, 610, 700, 650, 500, 720, 600, 780, 690],
    Monthly: [
      160, 380, 195, 290, 180, 190, 280, 105, 210, 390, 270, 110, 120, 210,
      260, 185, 305, 115, 85, 375, 105, 220, 285, 160, 285, 100, 110, 285, 365,
      310,
    ],
    Weekly: [180, 220, 150, 310, 270, 190, 250],
  };

  // X-axis labels
  const categories: Record<string, string[]> = {
    Yearly: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    Monthly: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    Weekly: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  };

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#ff3d0a"], // green tone
    plotOptions: {
      bar: { horizontal: false, borderRadius: 4, columnWidth: "50%" },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f1f5f9" },
    xaxis: {
      categories: categories[activeFilter],
      labels: { style: { colors: "#64748b", fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#64748b", fontSize: "12px" } } },
    tooltip: { theme: "light" },
  };

  const series = [{ name: "Visitors", data: chartData[activeFilter] }];

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Purchase Chart</h3>
          <p className="text-sm text-gray-500">
            Visitor analytics of last {activeFilter}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-md border">
          {["Yearly", "Monthly", "Weekly"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeFilter === filter ? "bg-white text-black" : ""
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default RowMaterialChart;
