import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import {
  FiCheckCircle,
  FiTruck,
  FiTrendingUp,
  FiClock,
  FiInfo,
} from "react-icons/fi";
import { useGetProfitAndSalesDeliveredOrdersReportQuery } from "../../../../redux/features/report/reportApi";
import DeliveredOrdersReportSkeleton from "../../../../components/skeleton/DeliveredOrdersReportSkeleton";
import { DisplayCurrency } from "../../../../utils/currency";

type DeliveredOrdersTabProps = {
  dateRange: [string | null, string | null];
};

const DeliveredOrdersTab = ({ dateRange }: DeliveredOrdersTabProps) => {
  const { data: response, isLoading, isFetching } =
    useGetProfitAndSalesDeliveredOrdersReportQuery([
      { name: "startDate", value: dateRange?.[0] || "" },
      { name: "endDate", value: dateRange?.[1] || "" },
    ]);

  if (isLoading || isFetching) {
    return <DeliveredOrdersReportSkeleton />;
  }

  const deliveredData = response?.data || {};
  const cards = Array.isArray(deliveredData?.cards) ? deliveredData.cards : [];
  const info = deliveredData?.info;

  const cardMap: Record<string, any> = {};
  cards.forEach((card: any) => {
    cardMap[card.key] = card;
  });

  const incomeCard = cardMap.confirmedRevenue || {};
  const expenseCard = cardMap.totalExpense || {};
  const netProfitCard = cardMap.netProfit || {};
  const orderStatusCard = cardMap.orderStatus || {};

  const revenueAllocation = deliveredData?.revenueAllocation || [];
  const incomeRows = deliveredData?.table?.income || [];
  const expenseRows = deliveredData?.table?.expenses || [];
  const footerRow = deliveredData?.table?.footer;

  const renderCurrency = (amount: number | null, className: string = "") => {
    const value = Number(amount || 0);
    const isNegative = value < 0;
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {isNegative && <span>-</span>}
        <DisplayCurrency amount={Math.abs(value)} decimals={2} />
      </span>
    );
  };

  const formatPercent = (value: number | null) =>
    `${Number(value || 0).toFixed(1)}%`;

  return (
    <div className="space-y-5">
      {info && (
        <div className="rounded-lg border border-gray-200 bg-primary/5 px-4 py-3 text-xs text-primary/70 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
          <span className="inline-flex items-center gap-2">
            <FiInfo />
            {info}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PageHeaderCard
          color="green"
          icon={<FiCheckCircle />}
          title={incomeCard?.title || "Total Income"}
          value={renderCurrency(incomeCard?.amount)}
          subtitle={incomeCard?.subtitle || "Delivered/Returned income"}
        />
        <PageHeaderCard
          color="red"
          icon={<FiTruck />}
          title={expenseCard?.title || "Total Expense"}
          value={renderCurrency(expenseCard?.amount)}
          subtitle={
            expenseCard?.subtitle ||
            `${formatPercent(expenseCard?.secondaryPercent)} of income`
          }
        />
        <PageHeaderCard
          color="primary"
          icon={<FiTrendingUp />}
          title={netProfitCard?.title || "Net Profit"}
          value={renderCurrency(netProfitCard?.amount)}
          subtitle={
            netProfitCard?.subtitle ||
            `${formatPercent(netProfitCard?.secondaryPercent)} margin`
          }
        />
        <PageHeaderCard
          color="indigo"
          icon={<FiClock />}
          title={orderStatusCard?.title || "Order Status"}
          value={`${deliveredData?.counts?.delivered || 0} / ${deliveredData?.counts?.returned || 0}`}
          subtitle={orderStatusCard?.subtitle || "Delivered vs returned"}
        />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
          Revenue Allocation
        </h3>
        <div className="space-y-2">
          {revenueAllocation.map((item: any) => (
            <div key={item.key} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
              <div className="text-right">
                <span className="text-gray-700 dark:text-gray-200 mr-4">
                  {renderCurrency(item.amount)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatPercent(item.percentOfIncome)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                Description
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">
                Amount
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">
                Percent
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {[...incomeRows, ...expenseRows].map((row: any) => (
              <tr key={row.key} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {row.description}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-gray-800 dark:text-gray-100">
                  {renderCurrency(row.amount, "justify-end")}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {formatPercent(row.percent)}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-normal break-words">
                  {row.details}
                </td>
              </tr>
            ))}
            {footerRow && (
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                  {footerRow.description}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-primary">
                  {renderCurrency(footerRow.amount, "justify-end")}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">
                  {formatPercent(footerRow.percent)}
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

export default DeliveredOrdersTab;
