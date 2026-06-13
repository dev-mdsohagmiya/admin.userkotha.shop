import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { FiBarChart2, FiTrendingUp, FiTruck } from "react-icons/fi";
import { useGetSalesAndProfitFinancialSummaryReportQuery } from "../../../../redux/features/report/reportApi";
import ProfitAndSalesSummarySkeleton from "../../../../components/skeleton/ProfitAndSalesSummarySkeleton";
import { TbCoinTaka } from "react-icons/tb";
import { DisplayCurrency } from "../../../../utils/currency";

type SummaryTabProps = {
  dateRange: [string | null, string | null];
};

const SummaryTab = ({ dateRange }: SummaryTabProps) => {
  const { data: response, isLoading, isFetching } =
    useGetSalesAndProfitFinancialSummaryReportQuery([
      { name: "startDate", value: dateRange?.[0] || "" },
      { name: "endDate", value: dateRange?.[1] || "" },
    ]);

  if (isLoading || isFetching) {
    return <ProfitAndSalesSummarySkeleton />;
  }

  const summaryData = response?.data || {};
  const cards = summaryData?.cards || response?.summary || {};
  const revenueAllocation = summaryData?.revenueAllocation || [];
  const revenueRows = summaryData?.table?.revenue || [];
  const expenseRows = summaryData?.table?.expenses || [];
  const footerRow = summaryData?.table?.footer;

  const renderCurrency = (amount: number, className: string = "") => {
    const value = Number(amount || 0);
    const isNegative = value < 0;
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {isNegative && <span>-</span>}
        <DisplayCurrency amount={Math.abs(value)} decimals={2} />
      </span>
    );
  };

  const formatCount = (count: number | null) => {
    if (count === null || count === undefined) return "-";
    return count.toLocaleString();
  };
  const formatRate = (value: number | null | undefined) => {
    const safeValue = Number(value ?? 0);
    if (!Number.isFinite(safeValue)) return "0.0%";
    return `${safeValue.toFixed(1)}%`;
  };

  const positiveAllocation = revenueAllocation.filter(
    (item: any) => (item?.percentOfSales || 0) > 0,
  );
  const totalPositivePercent = positiveAllocation.reduce(
    (sum: number, item: any) => sum + (item?.percentOfSales || 0),
    0,
  );
  const allocationColorMap: Record<string, string> = {
    profit: "bg-emerald-500",
    productCost: "bg-primary",
    deliveryCost: "bg-amber-500",
    adsExpense: "bg-violet-500",
    otherExpense: "bg-pink-500",
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PageHeaderCard
          color="green"
          icon={<TbCoinTaka size={23} />}
          title="Total Sales"
          value={renderCurrency(cards?.totalSales || 0)}
          subtitle={`+ ${formatCount(cards?.orderCount || 0)} Orders`}
        />
        <PageHeaderCard
          color="primary"
          icon={<FiTrendingUp />}
          title="Estimated Profit"
          value={renderCurrency(cards?.estimatedProfit || 0)}
          subtitle={`Margin ${formatRate(cards?.profitMarginPercent)}`}
        />
        <PageHeaderCard
          color="cyan"
          icon={<FiTruck />}
          title="Order Statistics"
          value={`${formatCount(cards?.orderStats?.total || 0)} Total`}
          subtitle={
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                D: {cards?.orderStats?.delivered || 0}
              </span>
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                P: {cards?.orderStats?.pending || 0}
              </span>
              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700">
                R: {cards?.orderStats?.returned || 0}
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                O: {cards?.orderStats?.other || 0}
              </span>
            </div>
          }
        />
        <PageHeaderCard
          color="purple"
          icon={<FiBarChart2 />}
          title="Expenses"
          value={renderCurrency(cards?.expenseTotal || 0)}
          subtitle={
            <span className="inline-flex items-center gap-2">
              {renderCurrency(cards?.adsExpense || 0)} Ads +{" "}
              {renderCurrency(cards?.otherExpense || 0)} Other
            </span>
          }
        />
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Revenue Allocation</h3>
        <div className="space-y-2">
          {revenueAllocation.map((item: any) => (
            <div key={item.key} className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${allocationColorMap[item.key] || "bg-gray-400"}`}
                />
                {item.label}
              </span>
              <div className="text-right">
                <span className="text-gray-700 dark:text-gray-200 mr-4">
                  {renderCurrency(item.amount || 0)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {Number(item.percentOfSales || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-2">
            <div className="h-full flex">
              {positiveAllocation.map((item: any) => {
                const width =
                  totalPositivePercent > 0
                    ? ((item.percentOfSales || 0) / totalPositivePercent) * 100
                    : 0;
                return (
                  <div
                    key={item.key}
                    className={allocationColorMap[item.key] || "bg-gray-400"}
                    style={{ width: `${width}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Description</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Count</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody>
            {[...revenueRows, ...expenseRows].map((row: any) => (
              <tr key={row.description} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.description}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  {renderCurrency(row.amount || 0, "justify-end")}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                  {formatCount(row.count)}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-normal break-words">
                  {row.details}
                </td>
              </tr>
            ))}
            {footerRow && (
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                  <span className="whitespace-nowrap">
                    {footerRow.description}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-primary whitespace-nowrap">
                  {renderCurrency(footerRow.amount || 0, "justify-end")}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                  {formatCount(footerRow.count)}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-normal break-words">
                  {footerRow.details}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryTab;
