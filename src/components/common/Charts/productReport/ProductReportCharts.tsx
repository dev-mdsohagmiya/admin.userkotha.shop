import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { ArrowUpRight } from "lucide-react";
import { Tag } from "antd";

export const ProductSalesChart = ({ data }: { data?: any }) => {
  const salesChartData: { series: any[]; options: ApexOptions } = {
    series: data?.series || [
      {
        name: "Sales",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ["#1BA143"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: data?.categories || [
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
      },
      yaxis: {
        title: { text: "" },
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-green-600" />
          Product Sales
        </h3>
        <Tag className="bg-gray-100 text-gray-600 border-none font-medium">
          {data?.period || "All Time"}
        </Tag>
      </div>
      <ReactApexChart
        options={salesChartData.options}
        series={salesChartData.series}
        type="line"
        height={300}
      />
    </div>
  );
};

export const DeliveryReturnTrend = ({ data }: { data?: any }) => {
  const deliveryTrendData: { series: any[]; options: ApexOptions } = {
    series: data?.series || [
      { name: "Delivery Rate", data: [0] },
      { name: "Return Rate", data: [0] },
    ],
    options: {
      chart: {
        type: "scatter",
        height: 350,
        toolbar: { show: false },
      },
      colors: ["#1BA143", "#EF4444"],
      xaxis: {
        categories: data?.categories || ["No Data"],
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 dark:text-white">
          Delivery & Return Trend
        </h3>
        <Tag className="bg-gray-100 text-gray-600 border-none font-medium">
          {data?.period || "All Time"}
        </Tag>
      </div>

      <div className="flex gap-4 mb-4">
        <button className="bg-green-600 text-white text-xs px-3 py-1 rounded shadow-sm">
          Percentage
        </button>
        <button className="text-gray-500 text-xs font-medium px-3 py-1">
          Count
        </button>
      </div>

      <ReactApexChart
        options={deliveryTrendData.options}
        series={deliveryTrendData.series}
        type="scatter"
        height={300}
      />

      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          {
            label: "Avg. Delivery Rate",
            val: `${data?.avgDeliveryRate || 0}%`,
            color: "text-green-600",
          },
          {
            label: "Avg. Return Rate",
            val: `${data?.avgReturnRate || 0}%`,
            color: "text-red-600",
          },
          {
            label: "Best Delivery Rate",
            val: `${data?.bestDeliveryRate || 0}%`,
            color: "text-green-600",
          },
          {
            label: "Worst Return Rate",
            val: `${data?.worstReturnRate || 0}%`,
            color: "text-red-600",
          },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-[10px] text-gray-400 font-medium mb-1">
              {item.label}
            </p>
            <p className={`text-lg font-bold ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
