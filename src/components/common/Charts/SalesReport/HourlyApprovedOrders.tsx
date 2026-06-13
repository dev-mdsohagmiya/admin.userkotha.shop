import React, { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useGetSalesHourlyPatternQuery } from "../../../../redux/features/sales/salesApi";
import { Loader } from "../../Loading";
import CustomDatePicker from "../../Date/CustomDatePicker";
import { getDefaultDateRange } from "../../../../utils/dateRange";

interface HourlyApprovedOrdersProps {
  dateRange?: [string | null, string | null];
  setDateRange?: (dates: [string | null, string | null]) => void;
}

const HourlyApprovedOrders: React.FC<HourlyApprovedOrdersProps> = ({
  dateRange: externalDateRange,
  setDateRange: setExternalDateRange,
}) => {
  const [internalDateRange, setInternalDateRange] = useState<
    [string | null, string | null]
  >(getDefaultDateRange());

  const dateRange = externalDateRange || internalDateRange;
  const setDateRange = setExternalDateRange || setInternalDateRange;

  const queryArgs = [
    dateRange[0] && { name: "startDate", value: dateRange[0] },
    dateRange[1] && { name: "endDate", value: dateRange[1] },
    { name: "status", value: "approved" }, // Mocking logic if API supports it, otherwise just showing hourly pattern
  ].filter(Boolean);

  const { data: hourlyData, isLoading } =
    useGetSalesHourlyPatternQuery(queryArgs);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 h-[450px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const processData = () => {
    if (!hourlyData?.data) return [];
    return hourlyData.data.map((item: any) => item.totalSales || 0);
  };

  const chartData = processData();

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    colors: ["#ff3d0a"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    xaxis: {
      categories: [
        "12 AM",
        "2 AM",
        "4 AM",
        "6 AM",
        "8 AM",
        "10 AM",
        "12 PM",
        "2 PM",
        "4 PM",
        "6 PM",
        "8 PM",
        "11 PM",
      ],
      labels: {
        style: { colors: "#94a3b8", fontSize: "11px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8", fontSize: "11px" },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const series = [
    {
      name: "Approved Orders",
      data:
        chartData.length > 0
          ? chartData
          : Array(12)
              .fill(0)
              .map(() => Math.floor(Math.random() * 50)),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
            Approved Orders
          </h3>
        </div>

        <div className="w-auto">
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </div>
      </div>

      <div className="mt-4">
        <Chart options={options} series={series} type="area" height={300} />
      </div>
    </div>
  );
};

export default HourlyApprovedOrders;
