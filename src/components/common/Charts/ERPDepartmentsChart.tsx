import { ApexOptions } from "apexcharts";
import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CustomDatePicker from "../Date/CustomDatePicker";
import { useGetSalesCategoryPerformanceQuery } from "../../../redux/features/sales/salesApi";
import {
  buildReportDateQueryArgs,
  reportDateQueryCacheKey,
} from "../../../utils/dateRange";

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
  salesCount: number;
}

interface ERPDepartmentsChartProps {
  data?: CategoryPerformance[];
  loading?: boolean;
  dateRange?: [string | null, string | null];
  setDateRange?: (dates: [string | null, string | null]) => void;
}

const ERPDepartmentsChart: React.FC<ERPDepartmentsChartProps> = ({
  data: initialData,
  loading: initialLoading,
  dateRange: externalDateRange,
  setDateRange: setExternalDateRange,
}) => {
  const [internalDateRange, setInternalDateRange] =
    useState<[string | null, string | null]>([null, null]);

  const dateRange = externalDateRange || internalDateRange;
  const setDateRange = setExternalDateRange || setInternalDateRange;

  const queryArgs = useMemo(
    () => buildReportDateQueryArgs(dateRange),
    [dateRange],
  );

  const chartCacheKey = reportDateQueryCacheKey(queryArgs);

  const {
    data: fetchedData,
    isLoading: fetchLoading,
    isFetching,
  } = useGetSalesCategoryPerformanceQuery(queryArgs);

  const data = useMemo(
    () => initialData || fetchedData?.data || [],
    [initialData, fetchedData],
  );
  const loading = initialLoading || (fetchLoading && !fetchedData);
  const chartBusy = loading || isFetching;

  // Process the data for the chart - show top 10 categories
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ["No Data"],
        series: [100],
        colors: ["#6B7280"],
        totalSales: 0,
        totalAmount: 0,
      };
    }

    // Sort by total amount descending and take top 10
    const sortedData = [...data].sort((a, b) => b.totalAmount - a.totalAmount);
    const topCategories = sortedData.slice(0, 10);

    const labels = topCategories.map((item) => item.categoryName);
    const series = topCategories.map((item) => item.totalAmount);
    const totalSales = topCategories.reduce(
      (sum, item) => sum + item.salesCount,
      0,
    );
    const totalAmount = topCategories.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );

    // Color palette with green, orange, purple, cyan
    const colors = [
      "#ff3d0a", // Green
      "#F59E0B", // Orange
      "#10B981", // Emerald
      "#8B5CF6", // Purple
      "#059669", // Green Dark
      "#06D6A0", // Mint Green
      "#0D9488", // Teal
      "#7C3AED", // Purple Dark
      "#6D28D9", // Violet
      "#06B6D4", // Cyan
    ];

    return {
      labels,
      series,
      totalSales,
      totalAmount,
      colors: colors.slice(0, topCategories.length),
    };
  }, [data]);

  const options: ApexOptions = useMemo(
    () => ({
    chart: {
      type: "donut",
      height: 350,
    },
    colors: chartData.colors,
    labels: chartData.labels,
    dataLabels: {
      enabled: true,
      formatter: (val: string | number) => `${Math.round(Number(val))}%`,
      style: {
        colors: ["#fff"],
        fontSize: "11px",
        fontWeight: 600,
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.45,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Amount",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              formatter: () =>
                `TK ${chartData.totalAmount?.toLocaleString() || "0"}`,
            },
            value: {
              fontSize: "20px",
              fontWeight: 700,
              color: "#ff3d0a",
              formatter: (val: string) => `${Math.round(Number(val))}%`,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontWeight: 500,
      labels: {
        colors: "#64748b",
      },
      itemMargin: {
        horizontal: 6,
        vertical: 3,
      },
      formatter: function (seriesName: string, opts: any) {
        const amount = chartData.series[opts.seriesIndex];
        const percentage = ((amount / chartData.totalAmount) * 100).toFixed(1);
        return `${seriesName} (${percentage}%)`;
      },
    },
    tooltip: {
      custom: function ({ seriesIndex }: { seriesIndex: number; w: any }) {
        if (seriesIndex === undefined) return "";

        const category = chartData.labels[seriesIndex];
        const amount = chartData.series[seriesIndex];
        const percentage = ((amount / chartData.totalAmount) * 100).toFixed(1);
        const originalData = data.find(
          (item: CategoryPerformance) => item.categoryName === category,
        );

        return `
          <div style="
            background: white;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
           
            font-family: Inter, sans-serif;
            min-width: 220px;
          ">
            <div style="font-weight: 600; color: #111827; margin-bottom: 6px; font-size: 14px;">
              ${category}
            </div>
            <div style="color: #ff3d0a; font-weight: 700; font-size: 16px; margin-bottom: 6px;">
              TK ${amount.toLocaleString()}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div style="color: #6b7280;">
                <div style="font-weight: 500;">Percentage</div>
                <div>${percentage}%</div>
              </div>
              <div style="color: #6b7280;">
                <div style="font-weight: 500;">Sales Count</div>
                <div>${originalData?.salesCount || 0}</div>
              </div>
              <div style="color: #6b7280;">
                <div style="font-weight: 500;">Quantity</div>
                <div>${originalData?.totalQuantity || 0}</div>
              </div>
              <div style="color: #6b7280;">
                <div style="font-weight: 500;">Avg/Unit</div>
                <div>${
                  originalData
                    ? Math.round(
                        originalData.totalAmount / originalData.totalQuantity,
                      )
                    : 0
                } TK</div>
              </div>
            </div>
          </div>
        `;
      },
    },
  }),
    [chartData, data],
  );

  if (loading && !fetchedData && !initialData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 ">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <Skeleton width="60%" height={24} className="mb-2" />
            <Skeleton width="40%" height={16} />
          </div>
          <Skeleton width={120} height={32} borderRadius={8} />
        </div>
        <div className="flex items-center justify-center p-8">
          <Skeleton circle width={220} height={220} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 ">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Top 10 Categories Performance
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-600">Based on total sales amount</p>
            <div className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {chartData.totalSales || 0} Total Sales
            </div>
          </div>
        </div>
        <div className="w-auto">
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </div>
      </div>

      <div
        className={`relative ${chartBusy ? "opacity-60 pointer-events-none" : ""}`}
      >
        <Chart
          key={chartCacheKey}
          options={options}
          series={chartData.series}
          type="donut"
          height={300}
        />
      </div>
    </div>
  );
};

export default ERPDepartmentsChart;
