import { ApexOptions } from "apexcharts";
import { Pagination } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import { useGetDashboardWebOrderTrackingQuery } from "../../../redux/features/report/reportApi";
import {
  buildReportDateQueryArgs,
  getThisWeekRange,
  reportDateQueryCacheKey,
} from "../../../utils/dateRange";

interface TrackingProduct {
  id: string;
  name: string;
  sku: string;
  incoming: number;
  confirmed: number;
  cancelled: number;
  quantity: number;
}

interface TrackingByDay {
  date: string;
  incoming: number;
  confirmed: number;
  cancelled: number;
}

const toChartTimestamp = (date: string) =>
  dayjs(date).startOf("day").valueOf();

const TABLE_PREVIEW_LIMIT = 10;
const TABLE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface WebOrderTrackingProps {
  embedded?: boolean;
}

const WebOrderTracking: React.FC<WebOrderTrackingProps> = ({
  embedded = false,
}) => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    () => getThisWeekRange(),
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(TABLE_PREVIEW_LIMIT);

  const queryArgs = useMemo(() => {
    const args = buildReportDateQueryArgs(dateRange);
    args.push(
      { name: "page", value: showAllProducts ? String(tablePage) : "1" },
      {
        name: "limit",
        value: showAllProducts
          ? String(tableLimit)
          : String(TABLE_PREVIEW_LIMIT),
      },
    );
    return args;
  }, [dateRange, showAllProducts, tablePage, tableLimit]);

  const chartCacheKey = reportDateQueryCacheKey(queryArgs);

  const { data, isLoading, isFetching } =
    useGetDashboardWebOrderTrackingQuery(queryArgs);

  useEffect(() => {
    if (data && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [data, hasLoadedOnce]);

  const showSkeleton = (isLoading || isFetching) && !hasLoadedOnce;

  const summary = data?.data?.summary;
  const products: TrackingProduct[] = data?.data?.products ?? [];
  const chartProducts: TrackingProduct[] = data?.data?.topProducts ?? [];
  const byDay: TrackingByDay[] = data?.data?.byDay ?? [];
  const productsMeta = data?.data?.meta;
  const totalProducts = productsMeta?.total ?? products.length;

  useEffect(() => {
    setTablePage(1);
    setShowAllProducts(false);
  }, [dateRange]);

  const productChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        stacked: true,
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "70%",
          borderRadius: 4,
        },
      },
      colors: ["#ff3d0a", "#3B82F6", "#EF4444"],
      xaxis: {
        categories: chartProducts.map((p) =>
          p.name.length > 28 ? `${p.name.slice(0, 28)}…` : p.name,
        ),
        labels: { style: { fontSize: "11px" } },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
      },
      dataLabels: { enabled: false },
      tooltip: {
        y: { formatter: (val) => `${val} orders` },
      },
    }),
    [chartProducts],
  );

  const productChartSeries = useMemo(
    () => [
      { name: "Incoming", data: chartProducts.map((p) => p.incoming) },
      { name: "Confirmed", data: chartProducts.map((p) => p.confirmed) },
      { name: "Cancelled", data: chartProducts.map((p) => p.cancelled) },
    ],
    [chartProducts],
  );

  const trendTickAmount = useMemo(() => {
    const n = byDay.length;
    if (n <= 7) return Math.max(n, 2);
    if (n <= 14) return 7;
    if (n <= 31) return 8;
    if (n <= 90) return 10;
    return 12;
  }, [byDay.length]);

  const trendChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        fontFamily: "inherit",
        zoom: { enabled: false },
      },
      stroke: { curve: "smooth", width: 2 },
      colors: ["#ff3d0a", "#3B82F6", "#EF4444"],
      fill: {
        type: "gradient",
        gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
      },
      xaxis: {
        type: "datetime",
        tickAmount: trendTickAmount,
        labels: {
          datetimeUTC: false,
          hideOverlappingLabels: true,
          style: { fontSize: "11px", colors: "#64748b" },
          datetimeFormatter: {
            year: "yyyy",
            month: "MMM yyyy",
            day: "dd MMM",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
      },
      dataLabels: { enabled: false },
      tooltip: {
        x: { format: "dd MMM yyyy" },
        y: { formatter: (val) => `${val} orders` },
      },
    }),
    [trendTickAmount],
  );

  const trendChartSeries = useMemo(
    () => [
      {
        name: "Incoming",
        data: byDay.map((d) => ({
          x: toChartTimestamp(d.date),
          y: d.incoming,
        })),
      },
      {
        name: "Confirmed",
        data: byDay.map((d) => ({
          x: toChartTimestamp(d.date),
          y: d.confirmed,
        })),
      },
      {
        name: "Cancelled",
        data: byDay.map((d) => ({
          x: toChartTimestamp(d.date),
          y: d.cancelled,
        })),
      },
    ],
    [byDay],
  );

  const statCards = [
    {
      label: "Total Web Orders",
      value: summary?.totalOrders ?? 0,
      color: "text-primary",
      bg: "bg-[#ff3d0a]/10",
    },
    {
      label: "Confirmed",
      value: summary?.confirmedOrders ?? 0,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Cancelled",
      value: summary?.cancelledOrders ?? 0,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Pending / Other",
      value: summary?.pendingOrders ?? 0,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const hasTrendData = byDay.some(
    (d) => d.incoming > 0 || d.confirmed > 0 || d.cancelled > 0,
  );

  const content = (
    <>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div>
          {!embedded && (
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Web Order Tracking
            </h3>
          )}
          <p
            className={`text-xs text-gray-500 font-medium max-w-xl ${
              embedded ? "" : "mt-1"
            }`}
          >
            Daily web orders by product — how many came in, how many were
            confirmed, and how many were cancelled.
          </p>
        </div>
        <CustomDatePicker
          selectedData={dateRange}
          onChange={(dates) => {
            setDateRange(dates);
            setTablePage(1);
            setShowAllProducts(false);
          }}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg px-4 py-3 ${card.bg}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
              {card.label}
            </p>
            {showSkeleton ? (
              <Skeleton width={48} height={24} />
            ) : (
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[320px]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
            Daily trend
          </h4>
          {showSkeleton ? (
            <Skeleton height={280} />
          ) : hasTrendData ? (
            <Chart
              key={`trend-${chartCacheKey}`}
              options={trendChartOptions}
              series={trendChartSeries}
              type="area"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              No web orders in this period
            </div>
          )}
        </div>

        <div className="min-h-[320px]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
            Top 5 products
          </h4>
          {showSkeleton ? (
            <Skeleton height={280} />
          ) : chartProducts.length > 0 ? (
            <Chart
              key={`products-${chartCacheKey}`}
              options={productChartOptions}
              series={productChartSeries}
              type="bar"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              No product data
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Product breakdown
            {!showAllProducts && totalProducts > 0 && (
              <span className="ml-2 font-normal normal-case text-gray-400">
                (Top {Math.min(TABLE_PREVIEW_LIMIT, totalProducts)})
              </span>
            )}
          </h4>
          {totalProducts > TABLE_PREVIEW_LIMIT && (
            <button
              type="button"
              onClick={() => {
                if (showAllProducts) {
                  setShowAllProducts(false);
                  setTablePage(1);
                  setTableLimit(TABLE_PREVIEW_LIMIT);
                } else {
                  setShowAllProducts(true);
                  setTablePage(1);
                }
              }}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              {showAllProducts ? "Show less" : "View all"}
            </button>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wide text-gray-400">
              <th className="py-2 pr-4 font-semibold">Product</th>
              <th className="py-2 pr-4 font-semibold">SKU</th>
              <th className="py-2 pr-4 font-semibold text-center">Incoming</th>
              <th className="py-2 pr-4 font-semibold text-center">Confirmed</th>
              <th className="py-2 pr-4 font-semibold text-center">Cancelled</th>
              <th className="py-2 font-semibold text-center">Qty</th>
            </tr>
          </thead>
          <tbody>
            {showSkeleton
              ? Array.from({
                  length: showAllProducts ? tableLimit : TABLE_PREVIEW_LIMIT,
                }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-2">
                      <Skeleton height={20} />
                    </td>
                  </tr>
                ))
              : products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50/80"
                  >
                    <td className="py-2.5 pr-4 font-medium text-gray-800 dark:text-gray-200 max-w-[200px] truncate">
                      {p.name}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">
                      {p.sku}
                    </td>
                    <td className="py-2.5 pr-4 text-center font-semibold text-primary">
                      {p.incoming}
                    </td>
                    <td className="py-2.5 pr-4 text-center font-semibold text-blue-600">
                      {p.confirmed}
                    </td>
                    <td className="py-2.5 pr-4 text-center font-semibold text-red-600">
                      {p.cancelled}
                    </td>
                    <td className="py-2.5 text-center text-gray-600">
                      {p.quantity}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!showSkeleton && products.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            No web orders for selected dates
          </p>
        )}

        {showAllProducts && !showSkeleton && totalProducts > 0 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              current={productsMeta?.page ?? tablePage}
              pageSize={productsMeta?.limit ?? tableLimit}
              total={totalProducts}
              showSizeChanger
              pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} products`
              }
              onChange={(page, pageSize) => {
                setTablePage(page);
                setTableLimit(pageSize);
              }}
            />
          </div>
        )}
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      {content}
    </div>
  );
};

export default WebOrderTracking;
