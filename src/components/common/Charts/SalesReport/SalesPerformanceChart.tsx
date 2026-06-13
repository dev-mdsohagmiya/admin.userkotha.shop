import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CustomDatePicker from "../../Date/CustomDatePicker";
import { useGetDashboardOrdersReportQuery } from "../../../../redux/features/report/reportApi";
import {
  buildReportDateQueryArgs,
  getThisWeekRange,
  reportDateQueryCacheKey,
} from "../../../../utils/dateRange";

const SalesPerformanceChart: React.FC = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    () => getThisWeekRange(),
  );

  const queryArgs = useMemo(
    () => buildReportDateQueryArgs(dateRange),
    [dateRange],
  );

  const chartCacheKey = reportDateQueryCacheKey(queryArgs);

  const { data: ordersData, isLoading, isFetching } =
    useGetDashboardOrdersReportQuery(queryArgs);

  const showContentSkeleton = isLoading || isFetching;

  const orderStatusByProductChart =
    ordersData?.data?.products?.byOrderSource ?? [];

  const sortedOrderSource = useMemo(() => {
    const safeData = Array.isArray(orderStatusByProductChart)
      ? orderStatusByProductChart
      : [];
    return [...safeData].sort(
      (a: { orderCount?: number }, b: { orderCount?: number }) =>
        (b.orderCount || 0) - (a.orderCount || 0),
    );
  }, [orderStatusByProductChart]);

  const labels = useMemo(() => {
    return sortedOrderSource.map(
      (item: { source?: string }) => item.source || "Unknown",
    );
  }, [sortedOrderSource]);

  const series = useMemo(() => {
    return sortedOrderSource.map(
      (item: { orderCount?: number }) => item.orderCount || 0,
    );
  }, [sortedOrderSource]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "polarArea",
        fontFamily: "inherit",
        animations: {
          enabled: true,
          speed: 800,
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      labels: labels.length > 0 ? labels : ["No Data"],
      colors: ["#ff3d0a"],
      stroke: {
        colors: ["#ffffff"],
        width: 2,
      },
      fill: {
        opacity: 0.8,
      },
      plotOptions: {
        polarArea: {
          rings: {
            strokeWidth: 1,
            strokeColor: "#e2e8f0",
          },
          spokes: {
            strokeWidth: 1,
            connectorColors: "#e2e8f0",
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "13px",
        fontWeight: 500,
        labels: {
          colors: "#475569",
        },
        markers: {
          size: 8,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (val) => `${val} Orders`,
        },
      },
    }),
    [labels],
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Order Sources Distribution
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Analyzing the volume of orders across different sales channels
          </p>
        </div>
        <div>
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </div>
      </div>

      <div
        className="relative flex-1 flex items-center justify-center min-h-[300px] mt-4"
      >
        {showContentSkeleton ? (
          <div className="flex flex-col items-center w-full">
            <Skeleton circle width={220} height={220} />
            <div className="mt-6 flex gap-4 justify-center w-full px-4">
              <Skeleton width={80} height={14} />
              <Skeleton width={80} height={14} />
              <Skeleton width={80} height={14} />
            </div>
          </div>
        ) : sortedOrderSource.length > 0 ? (
          <div className="w-full h-full flex justify-center">
            <Chart
              key={chartCacheKey}
              options={options}
              series={series.length > 0 ? series : [1]}
              type="polarArea"
              width="100%"
              height={320}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              className="w-12 h-12 mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              ></path>
            </svg>
            <span className="font-medium">No order sources available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPerformanceChart;
