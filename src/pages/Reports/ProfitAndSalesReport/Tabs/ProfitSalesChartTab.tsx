import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useGetProfitAndSalesChartReportQuery } from "../../../../redux/features/report/reportApi";
import ProfitAndSalesChartSkeleton from "../../../../components/skeleton/ProfitAndSalesChartSkeleton";
import { DisplayCurrency } from "../../../../utils/currency";

type ProfitSalesChartTabProps = {
  dateRange: [string | null, string | null];
};

const ProfitSalesChartTab: React.FC<ProfitSalesChartTabProps> = ({
  dateRange,
}) => {
  const { data: response, isLoading, isFetching } =
    useGetProfitAndSalesChartReportQuery([
      { name: "startDate", value: dateRange?.[0] || "" },
      { name: "endDate", value: dateRange?.[1] || "" },
    ]);

  const chartData = response?.data || {};
  const kpis = chartData?.kpis || {};
  const averages = chartData?.averages || {};
  const seriesData = useMemo(
    () => chartData?.series || [],
    [chartData?.series],
  );

  const labels = useMemo(
    () => seriesData.map((item: any) => item.date?.slice(5) || ""),
    [seriesData],
  );
  const salesSeries = useMemo(
    () => seriesData.map((item: any) => Number(item.sales || 0)),
    [seriesData],
  );
  const profitSeries = useMemo(
    () => seriesData.map((item: any) => Number(item.profit || 0)),
    [seriesData],
  );
  const adsSeries = useMemo(
    () => seriesData.map((item: any) => Number(item.adsCost || 0)),
    [seriesData],
  );

  const formatCurrency = (value: number) =>
    `৳ ${Math.abs(Number(value || 0)).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  const renderCurrency = (value: number, className: string = "") => (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <DisplayCurrency amount={Math.abs(value || 0)} decimals={2} />
    </span>
  );
  const formatPercent = (value: number) => `${Number(value || 0).toFixed(1)}%`;

  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    stroke: {
      width: [3, 3, 2],
      curve: "smooth",
    },
    colors: ["#ff3d0a", "#2563EB", "#F97316"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: labels,
      labels: {
        style: { colors: "#64748b", fontSize: "11px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: "11px" },
        formatter: (val) => `${Math.round(val)}`,
      },
    },
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 4,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => formatCurrency(val || 0),
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#64748b" },
    },
  };

  const series = [
    { name: "Profit", data: profitSeries },
    { name: "Sales", data: salesSeries },
    { name: "Ads Cost", data: adsSeries },
  ];

  if (isLoading || isFetching) {
    return <ProfitAndSalesChartSkeleton />;
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
              Daily Profit, Sales & Ads Cost
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Date range comparison of profit, sales revenue and advertising costs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-[11px] text-gray-500">Total Profit</p>
            <p className="text-xl font-bold text-emerald-600">
              {renderCurrency(kpis.totalProfit || 0)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Total Sales</p>
            <p className="text-xl font-bold text-blue-600">
              {renderCurrency(kpis.totalSales || 0)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Total Ads Cost</p>
            <p className="text-xl font-bold text-orange-500">
              {renderCurrency(kpis.totalAdsCost || 0)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">ROI</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatPercent(kpis.roiPercent || 0)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Avg Profit ROAS</p>
            <p className="text-2xl font-bold text-purple-600">
              {Number(kpis.avgProfitRoas || 0).toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <Chart options={options} series={series} type="line" height={360} />
        <div className="mt-3 flex flex-wrap gap-5 text-xs text-gray-500 dark:text-gray-400">
          <span>Avg Daily Profit: {renderCurrency(averages.dailyProfit || 0)}</span>
          <span>Avg Daily Sales: {renderCurrency(averages.dailySales || 0)}</span>
          <span>Avg Daily Ads: {renderCurrency(averages.dailyAds || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitSalesChartTab;
