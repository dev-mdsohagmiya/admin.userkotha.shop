import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Package, DollarSign, TrendingUp } from "lucide-react";

const rawMaterialData = {
  weekly: [
    {
      material: "Chicken Breast",
      quantity: 500,
      price: 45000,
      category: "Meat",
    },
    { material: "Beef Mince", quantity: 300, price: 66000, category: "Meat" },
    {
      material: "Fresh Vegetables",
      quantity: 800,
      price: 24000,
      category: "Produce",
    },
    {
      material: "Cooking Oil",
      quantity: 200,
      price: 56000,
      category: "Essentials",
    },
    {
      material: "Spices & Herbs",
      quantity: 150,
      price: 30000,
      category: "Essentials",
    },
    { material: "Flour", quantity: 400, price: 20000, category: "Grains" },
  ],
  monthly: [
    {
      material: "Chicken Breast",
      quantity: 2500,
      price: 225000,
      category: "Meat",
    },
    { material: "Beef Mince", quantity: 1500, price: 330000, category: "Meat" },
    {
      material: "Fresh Vegetables",
      quantity: 4000,
      price: 120000,
      category: "Produce",
    },
    {
      material: "Cooking Oil",
      quantity: 1000,
      price: 280000,
      category: "Essentials",
    },
    {
      material: "Spices & Herbs",
      quantity: 750,
      price: 150000,
      category: "Essentials",
    },
    { material: "Flour", quantity: 2000, price: 100000, category: "Grains" },
  ],
  yearly: [
    {
      material: "Chicken Breast",
      quantity: 30000,
      price: 2700000,
      category: "Meat",
    },
    {
      material: "Beef Mince",
      quantity: 18000,
      price: 3960000,
      category: "Meat",
    },
    {
      material: "Fresh Vegetables",
      quantity: 48000,
      price: 1440000,
      category: "Produce",
    },
    {
      material: "Cooking Oil",
      quantity: 12000,
      price: 3360000,
      category: "Essentials",
    },
    {
      material: "Spices & Herbs",
      quantity: 9000,
      price: 1800000,
      category: "Essentials",
    },
    { material: "Flour", quantity: 24000, price: 1200000, category: "Grains" },
  ],
};

const RawMaterialPurchaseDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">(
    "monthly",
  );

  const data = rawMaterialData[timeframe];
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = data.reduce((sum, item) => sum + item.price, 0);
  const totalItems = data.length;

  const chartData = [...data].sort((a, b) => b.quantity - a.quantity);

  // --- Line Chart Options ---
  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 400,
      toolbar: { show: true },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: chartData.map((d) => d.material),
      labels: { rotate: -45, style: { fontSize: "12px" } },
    },
    yaxis: {
      title: { text: "Quantity (kg)" },
      labels: { formatter: (val) => val.toLocaleString() },
    },
    colors: ["#16a34a"],
    dataLabels: { enabled: true },
    grid: { borderColor: "#f1f5f9" },
    tooltip: {
      y: {
        formatter: (val: number, { dataPointIndex }) => {
          const item = chartData[dataPointIndex];
          return `${item.quantity.toLocaleString()} kg | TK ${item.price.toLocaleString()}`;
        },
      },
    },
    legend: { show: false },
  };

  const chartSeries = [
    {
      name: "Quantity Purchased",
      data: chartData.map((d) => d.quantity),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Raw Materials</h3>
          <p className="text-xs text-gray-500">
            Food raw materials purchase overview
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          {(["weekly", "monthly", "yearly"] as const).map((time) => (
            <button
              key={time}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                timeframe === time
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-green-600"
              }`}
              onClick={() => setTimeframe(time)}
            >
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-md p-3 border border-green-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Total Quantity
            </p>
            <p className="text-lg font-bold">
              {totalQuantity.toLocaleString()} kg
            </p>
          </div>
          <Package className="w-6 h-6 text-green-600" />
        </div>
        <div className="bg-white rounded-md p-3 border border-green-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Total Cost
            </p>
            <p className="text-lg font-bold">
              TK ${totalPrice.toLocaleString()}
            </p>
          </div>
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
        <div className="bg-white rounded-md p-3 border border-green-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Avg per Material
            </p>
            <p className="text-lg font-bold">
              {Math.round(totalQuantity / totalItems).toLocaleString()} kg
            </p>
          </div>
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-gray-50 rounded-md p-4 border border-green-100">
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={400}
        />
      </div>
    </div>
  );
};

export default RawMaterialPurchaseDashboard;
