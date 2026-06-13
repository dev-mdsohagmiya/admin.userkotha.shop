import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { FiShoppingCart, FiTruck, FiUserCheck } from "react-icons/fi";
import { useGetProfitAndSalesSalesReportQuery } from "../../../../redux/features/report/reportApi";
import ProfitAndSalesSalesSkeleton from "../../../../components/skeleton/ProfitAndSalesSalesSkeleton";
import { DisplayCurrency } from "../../../../utils/currency";

type SalesTabProps = {
  dateRange: [string | null, string | null];
};

const SalesTab = ({ dateRange }: SalesTabProps) => {
  const { data: response, isLoading, isFetching } =
    useGetProfitAndSalesSalesReportQuery([
      { name: "startDate", value: dateRange?.[0] || "" },
      { name: "endDate", value: dateRange?.[1] || "" },
    ]);

  if (isLoading || isFetching) {
    return <ProfitAndSalesSalesSkeleton />;
  }

  const salesData = response?.data || {};
  const cards = salesData?.cards || {};
  const cardList = Array.isArray(cards) ? cards : [];
  const confirmedCard =
    cardList.find((item: any) => item?.key === "confirmed") || cards?.confirmed;
  const partialCard =
    cardList.find((item: any) => item?.key === "partial") || cards?.partial;
  const estimatedPendingCard =
    cardList.find((item: any) => item?.key === "estimatedPending") ||
    cards?.pendingEstimated ||
    cards?.estimated;
  const counts = salesData?.counts || {};
  const confirmedSales = Number(
    cards?.confirmedSales ?? confirmedCard?.amount ?? 0,
  );
  const partialSales = Number(cards?.partialSales ?? partialCard?.amount ?? 0);
  const estimatedPendingSales = Number(
    cards?.estimatedPendingSales ??
      estimatedPendingCard?.amount ??
      0,
  );
  const totalEstimatedSales = Number(
    cards?.totalEstimatedSales ??
      cards?.total?.amount ??
      confirmedSales + partialSales + estimatedPendingSales,
  );

  const confirmedPercent = Number(
    cards?.confirmedSalesPercent ??
      confirmedCard?.percentOfTotalEstimated ??
      confirmedCard?.percent ??
      0,
  );
  const partialPercent = Number(
    cards?.partialSalesPercent ??
      partialCard?.percentOfTotalEstimated ??
      partialCard?.percent ??
      0,
  );
  const estimatedPercent = Number(
    cards?.estimatedPendingSalesPercent ??
      estimatedPendingCard?.percentOfTotalEstimated ??
      estimatedPendingCard?.percent ??
      0,
  );

  const renderCurrency = (amount: number, className: string = "") => (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <DisplayCurrency amount={amount || 0} decimals={2} />
    </span>
  );

  const formatPercent = (value: number) => `${Number(value || 0).toFixed(1)}%`;

  const rawRows =
    salesData?.table?.rows ||
    salesData?.rows ||
    salesData?.breakdown ||
    [];

  const tableRows =
    Array.isArray(rawRows) && rawRows.length > 0
      ? rawRows
      : [
          {
            category: "Confirmed Orders",
            key: "confirmed",
            amount: confirmedSales,
            percentage: confirmedPercent,
            description: "Revenue from fully delivered orders",
          },
          {
            category: "Partial Orders",
            key: "partial",
            amount: partialSales,
            percentage: partialPercent,
            description:
              "Revenue from partial delivery orders (not modeled on Order; extend when available)",
          },
          {
            category: "Estimated Pending Orders",
            key: "pendingEstimated",
            amount: estimatedPendingSales,
            percentage: estimatedPercent,
            description:
              "Estimated amount from open pipeline orders based on assumed confirmation rate",
          },
          {
            category: "Total Estimated Sales",
            key: "total",
            amount: totalEstimatedSales,
            percentage: 100,
            description: "Total revenue from all categories above",
            isTotal: true,
          },
        ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PageHeaderCard
          color="green"
          icon={<FiTruck />}
          title="Confirmed Sales"
          value={renderCurrency(confirmedSales)}
          subtitle={`${confirmedCard?.orderCount ?? counts?.delivered ?? 0} orders • ${formatPercent(confirmedPercent)}`}
        />
        <PageHeaderCard
          color="yellow"
          icon={<FiShoppingCart />}
          title="Partial Sales"
          value={renderCurrency(partialSales)}
          subtitle={`${partialCard?.orderCount ?? counts?.partial ?? 0} orders • ${formatPercent(partialPercent)}`}
        />
        <PageHeaderCard
          color="blue"
          icon={<FiUserCheck />}
          title="Estimated Pending"
          value={renderCurrency(estimatedPendingSales)}
          subtitle={`${estimatedPendingCard?.orderCount ?? counts?.openPipeline ?? 0} orders • ${formatPercent(estimatedPercent)}`}
        />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                Category
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
            {tableRows.map((row: any, idx: number) => {
              const category =
                row?.category || row?.label || row?.description || `Row ${idx + 1}`;
              const amount = Number(row?.amount || row?.value || 0);
              const percent = Number(row?.percentage || row?.percent || 0);
              const details =
                row?.description || row?.details || row?.note || "-";
              const isTotal =
                row?.isTotal ||
                row?.key === "total" ||
                category.toLowerCase().includes("total estimated sales");

              return (
                <tr
                  key={`${category}-${idx}`}
                  className={`border-t border-gray-100 dark:border-gray-800 ${
                    isTotal
                      ? "bg-gray-50/80 dark:bg-gray-800/40 font-semibold"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {category}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-gray-800 dark:text-gray-100">
                    {renderCurrency(amount, "justify-end")}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {isTotal ? "100%" : formatPercent(percent)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-normal break-words">
                    {details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SalesTab;
