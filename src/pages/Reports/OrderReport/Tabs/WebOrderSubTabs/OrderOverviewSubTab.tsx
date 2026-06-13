import {
  FiGlobe,
  FiRotateCcw,
  FiCheckCircle,
  FiShoppingBag,
} from "react-icons/fi";
import { DataTable } from "../../../../../components/common/Tables";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { useGetOrderOverviewQuery } from "../../../../../redux/features/report/reportApi";

interface OrderOverviewSubTabProps {
  orderStatusData: any[]; // Adjust type if needed
  dateRange: [string | null, string | null];
}

const OrderOverviewSubTab = ({
  dateRange,
}: OrderOverviewSubTabProps) => {
  const {
    data: overviewData,
    isLoading,
    isFetching,
  } = useGetOrderOverviewQuery([
    { name: "startDate", value: dateRange[0] },
    { name: "endDate", value: dateRange[1] },
  ]);

  const data = overviewData?.data;
  const tableStatusData = data?.statusBreakdown || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-amber-500",
      CONFIRM: "bg-primary",
      SHIPPED: "bg-blue-500",
      DELIVERED: "bg-green-500",
      CANCELLED: "bg-rose-500",
      HOLD: "bg-gray-500",
      Incomplete: "bg-gray-800",
    };
    return colors[status] || "bg-gray-400";
  };
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}
          ></div>
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {status}
          </span>
        </div>
      ),
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      align: "center" as const,
      render: (val: number) => (
        <span className="font-bold text-gray-600 dark:text-gray-400">
          {val}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center" as const,
      render: (val: string) => (
        <span className="font-black text-gray-800 dark:text-white tabular-nums">
          {val}
        </span>
      ),
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      align: "right" as const,
      render: (val: number) => (
        <span className="font-bold text-gray-600 dark:text-gray-400">
          {(val || 0).toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-outfit">
      {/* 1. Header Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 gap-y-0">
        <PageHeaderCard
          title="Total Web Orders"
          value={data?.orderSources?.web?.count?.toString() || "0"}
          icon={<FiShoppingBag />}
          color="primary"
        />
        <PageHeaderCard
          title="Total Revenue"
          value={data?.orderSources?.web?.amount?.toLocaleString() || "0"}
          icon={<FaBangladeshiTakaSign />}
          color="green"
        />
        <PageHeaderCard
          title="Incomplete Orders"
          value={data?.orderSources?.incomplete?.count?.toString() || "0"}
          icon={<FiRotateCcw />}
          color="orange"
        />
        <PageHeaderCard
          title="Completion Rate"
          value={`${data?.completionAnalysis?.web?.percentage || 0}%`}
          icon={<FiCheckCircle />}
          color="blue"
        />
      </div>

      {/* 2. Visual Distribution Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Sources Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  Order Sources
                </h3>
              </div>
              <p className="text-[10px] text-gray-400">
                Web vs. Incomplete orders distribution
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">
                  Total
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  ৳ {data?.orderSources?.totalAmount?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                <span className="flex items-center gap-2">
                  <FiGlobe className="text-primary" /> Web Orders
                </span>
                <span className="text-gray-400">
                  {data?.orderSources?.web?.count} / ৳{" "}
                  {data?.orderSources?.web?.amount?.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full shadow-sm transition-all duration-1000"
                  style={{
                    width: `${(data?.orderSources?.web?.amount / data?.orderSources?.totalAmount) * 100 || 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-right text-[10px] font-bold text-gray-400 mt-1">
                {(
                  (data?.orderSources?.web?.amount /
                    data?.orderSources?.totalAmount) *
                    100 || 0
                ).toFixed(1)}
                % of total
              </p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                <span className="flex items-center gap-2 text-amber-500">
                  <FiRotateCcw /> Incomplete Orders
                </span>
                <span className="text-gray-400">
                  {data?.orderSources?.incomplete?.count} / ৳{" "}
                  {data?.orderSources?.incomplete?.amount?.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full shadow-sm transition-all duration-1000"
                  style={{
                    width: `${(data?.orderSources?.incomplete?.amount / data?.orderSources?.totalAmount) * 100 || 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-right text-[10px] font-bold text-gray-400 mt-1">
                {(
                  (data?.orderSources?.incomplete?.amount /
                    data?.orderSources?.totalAmount) *
                    100 || 0
                ).toFixed(1)}
                % of total
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Visualization Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                Order Status Trend
              </h3>
              <p className="text-[10px] text-gray-400">
                Completed vs. Cancelled orders breakdown
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                <span className="flex items-center gap-2 text-primary">
                  <FiCheckCircle /> Completed
                </span>
                <span className="text-gray-400">
                  {data?.orderStatus?.completed?.count} / ৳{" "}
                  {data?.orderStatus?.completed?.amount?.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full shadow-sm transition-all duration-1000"
                  style={{
                    width: `${data?.completionAnalysis?.web?.percentage || 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-right text-[10px] font-bold text-gray-400 mt-1">
                {data?.completionAnalysis?.web?.percentage || 0}% of total
              </p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                <span className="flex items-center gap-2 text-rose-500">
                  <FiRotateCcw /> Cancelled
                </span>
                <span className="text-gray-400">
                  {data?.orderStatus?.cancelled?.count} / ৳{" "}
                  {data?.orderStatus?.cancelled?.amount?.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full shadow-sm transition-all duration-1000"
                  style={{
                    width: `${data?.cancellationAnalysis?.web?.percentage || 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-right text-[10px] font-bold text-gray-400 mt-1">
                {data?.cancellationAnalysis?.web?.percentage || 0}% of total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Breakdown Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-none">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
              Order Status Breakdown
            </h3>
            <p className="text-[10px] text-gray-400">
              Detailed view of orders by status
            </p>
          </div>
        </div>
        <div className="p-0 border-none">
          <DataTable
            columns={columns}
            data={tableStatusData}
            loading={isLoading || isFetching}
            isPaginate={false}
            total={tableStatusData.length}
            className="border-none shadow-none"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderOverviewSubTab;
