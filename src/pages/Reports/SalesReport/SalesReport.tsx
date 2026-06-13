import { Alert, Button } from "antd";
import { CheckCheck, Printer, RefreshCw, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { MdOutlineUnpublished } from "react-icons/md";
import PageHeaderCard from "../../../components/common/Card/PageHeaderCard";
import { CustomerChart } from "../../../components/common/Charts/SalesReport/CustomerChart";
import ProductOrderOverviewChart from "../../../components/common/Charts/SalesReport/ProductOrderOverviewChart";
import PaymentChart from "../../../components/common/Charts/SalesReport/SalesPaymentChart";
import SalesStatusDistribution from "../../../components/common/Charts/SalesReport/SalesStatusDistribution";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import {
  useGetSalesCategoryPerformanceQuery,
  useGetSalesCustomerLoyaltyQuery,
  useGetSalesDayPatternQuery,
  useGetSalesDiscountAnalysisQuery,
  useGetSalesHourlyPatternQuery,
  useGetSalesMonthlyComparisonQuery,
  useGetSalesPaymentMethodsQuery,
  useGetSalesRevenueBreakdownQuery,
  useGetSalesStatusDistributionQuery,
  useGetSalesSummaryQuery,
  useGetSalesTopProductsQuery,
} from "../../../redux/features/sales/salesApi";
import { DisplayCurrency } from "../../../utils/currency";
import { moduleHasAction } from "../../../utils/permissions";
import CategoryPerformanceTable from "./CategoryPerformanceTable";
import DiscountAnalysis from "./DiscountAnalysis";
import HourlySalesPattern from "./HourlySalesPattern";
import MonthlySalesPattern from "./MonthlySalesPattern";
import RevenueBreakdown from "./RevenueBreakdown";
import SalesTrans from "./SalesTrans";
import TopCustomer from "./TopCustomer";
import WeaklySalesPattern from "./WeaklySalesPattern";
import { TbCoinTaka } from "react-icons/tb";
import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import SalesReportSkeleton from "../../../components/skeleton/SalesReportSkeleton";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { getDefaultDateRange } from "../../../utils/dateRange";

const SalesReport: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"day" | "weekly" | "yearly">(
    "day",
  );
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    getDefaultDateRange(),
  );

  const { allActions, isSuperAdmin } = useModulePermissions("Sales Report");

  const perm = useMemo(() => {
    const allow = (action: string) =>
      isSuperAdmin || moduleHasAction(allActions, action);
    return {
      filter: allow("view_filter"),
      summary: allow("view_summary"),
      productOverview: allow("view_product_overview"),
      statusDistribution: allow("view_status_distribution"),
      customerLoyalty: allow("view_customer_loyalty"),
      paymentMethods: allow("view_payment_methods"),
      salesTransactions: allow("view_sales_transactions"),
      topCustomers: allow("view_top_customers"),
      categoryPerformance: allow("view_category_performance"),
      revenueBreakdown: allow("view_revenue_breakdown"),
      discountAnalysis: allow("view_discount_analysis"),
    };
  }, [allActions, isSuperAdmin]);

  const hasAnySection =
    perm.summary ||
    perm.productOverview ||
    perm.statusDistribution ||
    perm.customerLoyalty ||
    perm.paymentMethods ||
    perm.salesTransactions ||
    perm.topCustomers ||
    perm.categoryPerformance ||
    perm.revenueBreakdown ||
    perm.discountAnalysis;

  const showTimePatternSection = isSuperAdmin || hasAnySection;
  const skipTimePatternQueries = !showTimePatternSection;

  const skipSummary = !perm.summary;
  const skipProductOverview = !perm.productOverview;
  const skipCustomerLoyalty = !perm.customerLoyalty;
  const skipPaymentMethods = !perm.paymentMethods;
  const skipDiscountAnalysis = !perm.discountAnalysis;
  const skipRevenueBreakdown = !perm.revenueBreakdown;
  const skipCategoryPerformance = !perm.categoryPerformance;
  const skipStatusDistribution = !perm.statusDistribution;

  const queryArgs = useMemo(
    () => [
      { name: "startDate", value: dateRange[0] },
      { name: "endDate", value: dateRange[1] },
    ],
    [dateRange],
  );

  const handleFilterChange = (filter: "day" | "weekly" | "yearly") => {
    setActiveFilter(filter);
  };

  const {
    data: salesSummery,
    isLoading: salesSummeryLoading,
    isFetching: salesSummeryFetching,
    refetch: summeryRefetch,
  } = useGetSalesSummaryQuery(queryArgs, { skip: skipSummary });

  const summery = salesSummery?.data || {};

  const {
    data: topSalesProductsData,
    isLoading: salesTopSalesProductLoading,
    isFetching: salesTopSalesProductFetching,
    refetch: topSalesProductsRefetch,
  } = useGetSalesTopProductsQuery(queryArgs, { skip: skipProductOverview });

  const topSalesProducts = topSalesProductsData?.data || {};

  const {
    data: salesCustomerLoyaltyData,
    isLoading: salesCustomerLoyaltyLoading,
    isFetching: salesCustomerLoyaltyFetching,
    refetch: customerRefetch,
  } = useGetSalesCustomerLoyaltyQuery(undefined, {
    skip: skipCustomerLoyalty,
  });

  const salesCustomerLoyalty = salesCustomerLoyaltyData?.data || {};

  const {
    data: SalesPaymentMethodData,
    isLoading: SalesPaymentMethodLoading,
    isFetching: SalesPaymentMethodFetching,
    refetch: paymentRefetch,
  } = useGetSalesPaymentMethodsQuery(queryArgs, {
    skip: skipPaymentMethods,
  });

  const salesPaymentMethod = SalesPaymentMethodData?.data || {};

  const {
    data: SalesDiscountAnalysisData,
    isLoading: SalesDiscountAnalysisLoading,
    isFetching: SalesDiscountAnalysisFetching,
    refetch: discountRefetch,
  } = useGetSalesDiscountAnalysisQuery(undefined, {
    skip: skipDiscountAnalysis,
  });

  const discountAnalysis = SalesDiscountAnalysisData?.data || {};

  const {
    data: SalesRevenueBreakdownData,
    isLoading: SalesRevenueBreakdownLoading,
    isFetching: SalesRevenueBreakdownFetching,
    refetch: salesBreakDownRefetch,
  } = useGetSalesRevenueBreakdownQuery(queryArgs, {
    skip: skipRevenueBreakdown,
  });

  const revenueBreakdown = SalesRevenueBreakdownData?.data || {};

  const {
    data: categoryPerformanceData,
    isLoading: categoryPerformanceLoading,
    isFetching: categoryPerformanceFetching,
    refetch: cateforyPerfomanceRefetch,
  } = useGetSalesCategoryPerformanceQuery(queryArgs, {
    skip: skipCategoryPerformance,
  });

  const categoryPerformance = categoryPerformanceData?.data || [];

  const {
    data: hourlyPatternData,
    isLoading: hourlyPatternLoading,
    isFetching: hourlyPatternFetching,
    refetch: hourlyPatternRefetch,
  } = useGetSalesHourlyPatternQuery(queryArgs, {
    skip: skipTimePatternQueries,
  });

  const hourlyPattern = hourlyPatternData?.data || [];

  const {
    data: dayPatternData,
    isLoading: dayPatternLoading,
    isFetching: dayPatternFetching,
    refetch: dayPatternRefetch,
  } = useGetSalesDayPatternQuery(queryArgs, {
    skip: skipTimePatternQueries,
  });

  const dayPattern = dayPatternData?.data || [];

  const {
    data: monthlyComparisonData,
    isLoading: monthlyComparisonLoading,
    isFetching: monthlyComparisonFetching,
    refetch: monthlyComparisonRefetch,
  } = useGetSalesMonthlyComparisonQuery(queryArgs, {
    skip: skipTimePatternQueries,
  });

  const monthlyComparison = monthlyComparisonData?.data || [];

  const {
    data: statusDistributionData,
    isLoading: statusDistributionLoading,
    isFetching: statusDistributionFetching,
    refetch: statusDistributionRefetch,
  } = useGetSalesStatusDistributionQuery(queryArgs, {
    skip: skipStatusDistribution,
  });

  const statusDistribution = statusDistributionData?.data || [];

  const showInitialSkeleton =
    (!skipSummary && (salesSummeryLoading || salesSummeryFetching)) ||
    (!skipCustomerLoyalty &&
      (salesCustomerLoyaltyLoading || salesCustomerLoyaltyFetching)) ||
    (!skipDiscountAnalysis &&
      (SalesDiscountAnalysisLoading || SalesDiscountAnalysisFetching)) ||
    (!skipPaymentMethods && SalesPaymentMethodLoading) ||
    (!skipRevenueBreakdown &&
      (SalesRevenueBreakdownLoading || SalesRevenueBreakdownFetching));

  const headerExtras = useMemo(() => {
    const items: ReactNode[] = [];
    if (perm.filter) {
      items.push(
        <CustomDatePicker
          key="date-picker"
          selectedData={dateRange}
          onChange={(dates) => setDateRange(dates)}
        />,
      );
    }
    items.push(
      <Button
        key="print"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        onClick={() => window.print()}
      >
        <Printer className="w-4 h-4" /> Print
      </Button>,
    );
    items.push(
      <Button
        key="refresh"
        onClick={() => {
          if (!skipSummary) summeryRefetch();
          if (!skipProductOverview) topSalesProductsRefetch();
          if (!skipCustomerLoyalty) customerRefetch();
          if (!skipPaymentMethods) paymentRefetch();
          if (!skipDiscountAnalysis) discountRefetch();
          if (!skipRevenueBreakdown) salesBreakDownRefetch();
          if (!skipCategoryPerformance) cateforyPerfomanceRefetch();
          if (!skipTimePatternQueries) {
            hourlyPatternRefetch();
            dayPatternRefetch();
            monthlyComparisonRefetch();
          }
          if (!skipStatusDistribution) statusDistributionRefetch();
        }}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
      >
        <RefreshCw className="w-4 h-4" /> Refresh
      </Button>,
    );
    return items;
  }, [
    perm.filter,
    dateRange,
    skipSummary,
    skipProductOverview,
    skipCustomerLoyalty,
    skipPaymentMethods,
    skipDiscountAnalysis,
    skipRevenueBreakdown,
    skipCategoryPerformance,
    skipStatusDistribution,
    skipTimePatternQueries,
    summeryRefetch,
    topSalesProductsRefetch,
    customerRefetch,
    paymentRefetch,
    discountRefetch,
    salesBreakDownRefetch,
    cateforyPerfomanceRefetch,
    hourlyPatternRefetch,
    dayPatternRefetch,
    monthlyComparisonRefetch,
    statusDistributionRefetch,
  ]);

  if (showInitialSkeleton) {
    return <SalesReportSkeleton />;
  }

  return (
    <div className="">
      <PageHeader
        title="Sales Report Details"
        subtitle="View and manage your sales performance and product data"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Reports", path: "/reports" },
          { title: "Sales Report", path: "/reports/sales" },
        ]}
        extra={headerExtras}
      />

      {!isSuperAdmin && !hasAnySection ? (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="No report sections enabled"
          description="Your designation does not include any Sales Report section permissions. Ask an administrator to grant the relevant actions (summary, charts, tables, etc.)."
        />
      ) : null}

      {perm.summary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4  mb-4">
          <PageHeaderCard
            icon={<ShoppingCart />}
            color="blue"
            title="Total Sales"
            value={`${summery.totalSales}`}
          />
          <PageHeaderCard
            icon={<TbCoinTaka className="h-7 w-7" />}
            color="purple"
            title="Total Amount"
            value={<DisplayCurrency amount={summery.totalFinalAmount} />}
          />
          <PageHeaderCard
            icon={<CheckCheck className="" />}
            color="green"
            title="Total Paid"
            value={<DisplayCurrency amount={summery.totalPaid} />}
          />
          <PageHeaderCard
            icon={<MdOutlineUnpublished className="h-6 w-6" />}
            color="red"
            title="Total Due"
            value={<DisplayCurrency amount={summery?.totalDue} />}
          />
        </div>
      ) : null}

      {perm.productOverview ? (
        <div className="bg-white mb-4 ">
          <ProductOrderOverviewChart
            topProducts={topSalesProducts}
            loading={salesTopSalesProductLoading}
            fetching={salesTopSalesProductFetching}
          />
        </div>
      ) : null}

      {perm.statusDistribution ? (
        <div className=" pb-4 mx-auto">
          <SalesStatusDistribution
            data={statusDistribution}
            isLoading={statusDistributionLoading}
            isFetching={statusDistributionFetching}
          />
        </div>
      ) : null}

      {perm.customerLoyalty || perm.paymentMethods ? (
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
          {perm.customerLoyalty ? (
            <CustomerChart
              data={salesCustomerLoyalty}
              loading={salesCustomerLoyaltyLoading}
              fetching={salesCustomerLoyaltyFetching}
            />
          ) : null}
          {perm.paymentMethods ? (
            <PaymentChart
              data={salesPaymentMethod}
              loading={SalesPaymentMethodLoading}
              fetching={SalesPaymentMethodFetching}
            />
          ) : null}
        </div>
      ) : null}

      {perm.salesTransactions ? <SalesTrans /> : null}

      {perm.topCustomers ? <TopCustomer /> : null}

      {showTimePatternSection ? (
        <div className=" mt-7 mb-4">
          <div className="">
            <div className="flex gap-2 mb-4">
              <Button
                size="middle"
                type={activeFilter === "day" ? "primary" : "default"}
                onClick={() => handleFilterChange("day")}
              >
                Today
              </Button>
              <Button
                size="middle"
                type={activeFilter === "weekly" ? "primary" : "default"}
                onClick={() => handleFilterChange("weekly")}
              >
                This Week
              </Button>
              <Button
                size="middle"
                type={activeFilter === "yearly" ? "primary" : "default"}
                onClick={() => handleFilterChange("yearly")}
              >
                This Year
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeFilter === "day" && (
              <HourlySalesPattern
                data={hourlyPattern}
                isLoading={hourlyPatternLoading}
                isFetching={hourlyPatternFetching}
              />
            )}
            {activeFilter === "weekly" && (
              <WeaklySalesPattern
                data={dayPattern}
                isLoading={dayPatternLoading}
                isFetching={dayPatternFetching}
              />
            )}
            {activeFilter === "yearly" && (
              <MonthlySalesPattern
                data={monthlyComparison}
                isLoading={monthlyComparisonLoading}
                isFetching={monthlyComparisonFetching}
              />
            )}
          </div>
        </div>
      ) : null}

      {perm.categoryPerformance ? (
        <CategoryPerformanceTable
          data={categoryPerformance}
          loading={categoryPerformanceLoading}
          fetching={categoryPerformanceFetching}
        />
      ) : null}

      {perm.revenueBreakdown || perm.discountAnalysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perm.revenueBreakdown ? (
            <RevenueBreakdown data={revenueBreakdown} />
          ) : null}
          {perm.discountAnalysis ? (
            <DiscountAnalysis data={discountAnalysis} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SalesReport;
