import { ApexOptions } from "apexcharts";
import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import CustomDatePicker from "../Date/CustomDatePicker";
import { useGetPurchaseMonthlyComparisonQuery } from "../../../redux/features/purchases-management/purchasesManagementApi";
import {
  buildReportDateQueryArgs,
  reportDateQueryCacheKey,
} from "../../../utils/dateRange";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface PurchaseData {
  month: string;
  totalPurchases: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  totalDiscount: number;
  totalVAT: number;
}

interface PurchaseOrdersChartProps {
  data?: PurchaseData[];
  dateRange?: [string | null, string | null];
  setDateRange?: (dates: [string | null, string | null]) => void;
}

const PurchaseOrdersChart: React.FC<PurchaseOrdersChartProps> = ({
  data: initialData,
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
    isLoading,
    isFetching,
  } = useGetPurchaseMonthlyComparisonQuery(queryArgs);

  const data = useMemo(
    () => initialData || fetchedData?.data || [],
    [initialData, fetchedData],
  );
  // Format month names (YYYY-MM string -> "Jan 2025")
  const categories = useMemo(
    () =>
      data.map((item: PurchaseData) =>
        new Date(item.month).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      ),
    [data],
  );

  // Tooltip data reference (needed in custom tooltip)
  const fullData = data;

  // Extract series data
  const seriesData = data.map((item: PurchaseData) => item.totalPurchases);

  // Extract unique years
  const years = [
    ...new Set(
      data.map((item: PurchaseData) => new Date(item.month).getFullYear()),
    ),
  ];

  // Format amount with commas
  const formatAmount = (amount: number): string =>
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const chartBusy = (isLoading && !fetchedData && !initialData) || isFetching;

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: "area",
      height: 400,
      toolbar: {
        show: false,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
        },
      },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 800 },
    },
    colors: ["#ff3d0a"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 6, hover: { size: 9, sizeOffset: 3 } },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    xaxis: {
      categories,
      labels: {
        rotate: categories.length > 6 ? -45 : 0,
      },
    },
    yaxis: {
      labels: { formatter: (value) => value.toFixed(0) },
      min: 0,
    },
    tooltip: {
      custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
        const item = fullData[dataPointIndex];
        if (!item) return "";

        const monthYear = new Date(item.month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        const paidPercentage = (
          (item.totalPaid / item.totalAmount) *
          100
        ).toFixed(1);
        const duePercentage = (
          (item.totalDue / item.totalAmount) *
          100
        ).toFixed(1);

        return `
  <div style="
    width: 280px;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    font-family: Inter, sans-serif;
  ">

    <!-- Header -->
    <div style="
      background: #ff3d0a;
      padding: 12px 16px;
      color: white;
    ">
      <div style="font-size: 16px; font-weight: 600;">${monthYear}</div>
      <div style="font-size: 12px; opacity: .9;">${item.totalPurchases} Purchase Orders</div>
    </div>

    <!-- Main Amount -->
    <div style="padding: 16px; border-bottom: 1px solid #f3f4f6;">
      <div style="font-size: 20px; font-weight: 700; color: #111827;">
        TK ${formatAmount(item.totalAmount)}
      </div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Total Amount</div>
    </div>

    <!-- Stats Section -->
    <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
      
      <!-- Paid -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; color: #111827; font-weight: 500;">Paid</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: #ff3d0a; font-weight: 600;">
            TK ${formatAmount(item.totalPaid)}
          </span>
          <span style="font-size: 11px; color: #ff3d0a; background: #ecfdf5; padding: 2px 6px; border-radius: 8px;">
            ${paidPercentage}%
          </span>
        </div>
      </div>

      <!-- Due -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; color: #111827; font-weight: 500;">Due</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: #111827; font-weight: 600;">
            TK ${formatAmount(item.totalDue)}
          </span>
          <span style="font-size: 11px; color: #111827; background: #f3f4f6; padding: 2px 6px; border-radius: 8px;">
            ${duePercentage}%
          </span>
        </div>
      </div>

      <!-- Discount -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; color: #111827; font-weight: 500;">Discount</span>
        <span style="font-size: 13px; color: #ff3d0a; font-weight: 600;">
          TK ${formatAmount(item.totalDiscount)}
        </span>
      </div>

      <!-- VAT -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; color: #111827; font-weight: 500;">VAT</span>
        <span style="font-size: 13px; color: #ff3d0a; font-weight: 600;">
          TK ${formatAmount(item.totalVAT)}
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div style="
      background: #f9fafb;
      font-size: 11px;
      padding: 10px 16px;
      text-align: center;
      border-top: 1px solid #f3f4f6;
      color: #6b7280;
    ">
      Average per order: <strong style="color: #111827;">TK ${formatAmount(
        item.totalAmount / item.totalPurchases,
      )}</strong>
    </div>
  </div>
`;
      },
    },
  }), [categories, seriesData, fullData, years]);

  const series = [
    {
      name: "Purchase Orders",
      data: seriesData,
    },
  ];

  if (isLoading && !initialData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <Skeleton width="40%" height={24} className="mb-2" />
            <Skeleton width="20%" height={16} />
          </div>
          <Skeleton width={120} height={32} borderRadius={8} />
        </div>
        <Skeleton height={280} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 ">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Purchase Analytics</h3>
          <p className="text-sm text-gray-600">
            {years.length === 1
              ? `${years[0]} Purchase Report`
              : `${years.length} Years Comparison`}
          </p>
        </div>
        <div className="w-auto">
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </div>
      </div>

      {data.length === 0 && !chartBusy ? (
        <p className="text-center text-gray-500 py-16 text-sm">
          No purchase data for the selected date range.
        </p>
      ) : (
        <div
          className={`relative ${chartBusy ? "opacity-60 pointer-events-none" : ""}`}
        >
          <Chart
            key={chartCacheKey}
            options={options}
            series={series}
            type="area"
            height={300}
          />
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersChart;
