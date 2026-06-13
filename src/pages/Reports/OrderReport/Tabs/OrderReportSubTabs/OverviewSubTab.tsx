import {
  FiTrendingUp,
  FiShoppingBag,
  FiTruck,
  FiRotateCcw,
  FiAlertCircle,
  FiActivity,
  FiPercent,
} from "react-icons/fi";
import { TbCoinTaka } from "react-icons/tb";
import {
  OrdersStatusChart,
  SourceDistributionChart,
} from "./Charts/OverviewCharts";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { useState } from "react";
import RevenueByStatus from "../OverviewSubTabs/RevenueByStatus";
import RevenueBySource from "../OverviewSubTabs/RevenueBySource";
import PerformanceBySource from "../OverviewSubTabs/PerformanceBySource";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { CurrencyIcon } from "../../../../../utils/currency";
import { useGetOrderDashboardQuery } from "../../../../../redux/features/report/reportApi";
import OverviewSkeleton from "./OverviewSkeleton";

const OverviewSubTab = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const queryParams = [
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ];

  const {
    data: orderDashboardData,
    isLoading,
    isFetching,
  } = useGetOrderDashboardQuery(queryParams);

  if (isLoading || isFetching) {
    return <OverviewSkeleton />;
  }
  const data = orderDashboardData?.data;
  const summeryData = data?.summary || {};
  const revenueByStatusData = data?.revenueByStatus || [];
  const revenueBySourceData = data?.revenueBySource || [];
  const performanceBySourceData = data?.performanceBySource || [];
  const ordersByStatusData = data?.ordersByStatus || [];
  const orderSourcesDistributionData = data?.orderSourcesDistribution || [];
  const stats = [
    {
      title: "Total Orders",
      value: summeryData?.totalOrders ?? 0,
      color: "cyan" as const,
      icon: <FiShoppingBag />,
    },
    {
      title: "Total Revenue",
      value: (
        <span className="flex items-center">
          <CurrencyIcon />
          {summeryData?.totalRevenue?.toLocaleString() ?? 0}
        </span>
      ),
      color: "green" as const,
      icon: <TbCoinTaka />,
    },
    {
      title: "Delivered Orders",
      value: summeryData?.deliveredOrders ?? 0,
      color: "blue" as const,
      icon: <FiTruck />,
    },
    {
      title: "Return Orders",
      value: summeryData?.returnOrders ?? 0,
      color: "orange" as const,
      icon: <FiRotateCcw />,
    },
    // {
    //   title: "Product Cost",
    //   value: (
    //     <span className="flex items-center">
    //       <CurrencyIcon />
    //       {summeryData?.productCost?.toLocaleString() ?? 0}
    //     </span>
    //   ),
    //   color: "purple" as const,
    //   icon: <FiPieChart />,
    // },
    {
      title: "Gross Profit",
      value: (
        <span className="flex items-center">
          <CurrencyIcon />
          {summeryData?.grossProfit?.toLocaleString() ?? 0}
        </span>
      ),
      color: "indigo" as const,
      icon: <FiTrendingUp />,
    },
    {
      title: "Incom Orders",
      value: summeryData?.incompleteOrders ?? 0,
      color: "red" as const,
      icon: <FiAlertCircle />,
    },
    {
      title: "Avg Revenue",
      value: (
        <span className="flex items-center">
          <CurrencyIcon />
          {summeryData?.avgRevenue?.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          }) ?? 0}
        </span>
      ),
      color: "yellow" as const,
      icon: <FiActivity />,
    },
    {
      title: "Delivery Rate",
      value: `${summeryData?.deliveryRate?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 0}%`,
      color: "blue" as const,
      icon: <FiPercent />,
    },
    {
      title: "Return Rate",
      value: `${summeryData?.returnRate?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 0}%`,
      color: "orange" as const,
      icon: <FiPercent />,
    },
    {
      title: "Profit Margin",
      value: `${summeryData?.profitMargin?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 0}%`,
      color: "green" as const,
      icon: <FiPercent />,
    },
  ];
  return (
    <div className="space-y-4 animate-in fade-in duration-700 font-outfit">
      {/* 0. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 px-4 py-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight leading-none mb-1">
            Overview Report
          </h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Summary & Analytics
          </p>
        </div>
        <div>
          <CustomDatePicker
            onChange={(dates) => setDateRange(dates)}
            selectedData={dateRange}
          />
        </div>
      </div>

      {/* 1. Summary Cards using PageHeaderCard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 !important">
        {stats.map((stat, idx) => (
          <PageHeaderCard
            key={idx}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* 2. Revenue by Order Status */}
      <RevenueByStatus data={revenueByStatusData || []} />

      {/* 3. Performance by Source */}
      <PerformanceBySource data={performanceBySourceData || []} />

      {/* 4. Revenue by Order Source */}
      <RevenueBySource data={revenueBySourceData || []} />

      {/* 5. Charts Section - Using External Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            Orders By Status
          </h3>
          <OrdersStatusChart data={ordersByStatusData || []} />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            Source Distribution
          </h3>
          <SourceDistributionChart data={orderSourcesDistributionData || []} />
        </div>
      </div>
    </div>
  );
};

export default OverviewSubTab;
