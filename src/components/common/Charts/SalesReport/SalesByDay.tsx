import React, { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useGetSalesDayPatternQuery } from "../../../../redux/features/sales/salesApi";
import { Loader } from "../../Loading";
import CustomDatePicker from "../../Date/CustomDatePicker";
import { getDefaultDateRange } from "../../../../utils/dateRange";

interface SalesByDayProps {
  dateRange?: [string | null, string | null];
  setDateRange?: (dates: [string | null, string | null]) => void;
}

const SalesByDay: React.FC<SalesByDayProps> = ({
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
  ].filter(Boolean);

  const { data: dayData, isLoading } = useGetSalesDayPatternQuery(queryArgs);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 h-[450px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const processData = () => {
    if (!dayData?.data) return { categories: [], values: [] };
    const sorted = [...dayData.data].sort(
      (a: any, b: any) => a.dayOfWeek - b.dayOfWeek,
    );
    return {
      categories: sorted.map((item: any) => item.dayName),
      values: sorted.map((item: any) => item.totalSales || 0),
    };
  };

  const { categories, values } = processData();

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    colors: ["#ff3d0a"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories:
        categories.length > 0
          ? categories
          : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
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
  };

  const series = [
    {
      name: "Sales",
      data:
        values.length > 0
          ? values
          : Array(7)
              .fill(0)
              .map(() => Math.floor(Math.random() * 100)),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
            Sales by Day
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
        <Chart options={options} series={series} type="bar" height={300} />
      </div>
    </div>
  );
};

export default SalesByDay;
