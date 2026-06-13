import { useEffect, useMemo } from "react";
import { useGetBusinessOrderFinancialsReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import { FiTrendingUp, FiPieChart, FiBarChart2 } from "react-icons/fi";
import CountUp from "react-countup";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { TbCoinTaka } from "react-icons/tb";

interface OrderFinancialsNetReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const OrderFinancialsNetReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: OrderFinancialsNetReportProps) => {
  const { data: reportData, isLoading, isFetching } =
    useGetBusinessOrderFinancialsReportQuery([
      { name: "startDate", value: dateRange?.[0] || "" },
      { name: "endDate", value: dateRange?.[1] || "" },
      { name: "search", value: search },
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
    ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const meta = reportData?.meta || {};
  const summary = reportData?.summary || {};

  const stats = [
    {
      title: "Gross Sale",
      value: summary.totalGrossSale || 0,
      icon: <FiBarChart2 />,
      color: "blue" as const,
    },
    {
      title: "Net Sale",
      value: summary.totalNetProductSale || 0,
      icon: <FiTrendingUp />,
      color: "green" as const,
    },
    {
      title: "Delivery cha...",
      value: summary.totalDeliveryCharge || 0,
      icon: <TbCoinTaka className="h-5 w-5" />,
      color: "orange" as const,
    },
    {
      title: "All Expenses",
      value: summary.totalExpenses || 0,
      icon: <FiPieChart />,
      color: "red" as const,
    },
    {
      title: "Net Profit",
      value: summary.totalNetProfit || 0,
      icon: <FiTrendingUp />,
      color: "purple" as const,
    },
  ];

  const columns = [
    {
      title: "SL",
      key: "sl",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className="font-semibold text-gray-700 capitalize">
          {status?.replace(/_/g, " ").toLowerCase()}
        </span>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
    },
    {
      title: "Net Product Sale",
      dataIndex: "netProductSale",
      key: "netProductSale",
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Delivery Charge",
      dataIndex: "deliveryCharge",
      key: "deliveryCharge",
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Gross Sale",
      dataIndex: "grossSale",
      key: "grossSale",
      render: (amount: number) => (
        <span className="font-semibold">
          ৳{(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Product Cost",
      dataIndex: "productCost",
      key: "productCost",
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Estimated Profit",
      dataIndex: "estimatedProfit",
      key: "estimatedProfit",
      render: (amount: number) => (
        <span className="font-bold text-primary">
          ৳{(amount || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any, index: number) => ({
        SL: (page - 1) * limit + index + 1,
        Status: item.status?.replace(/_/g, " ") || "-",
        Orders: item.orders || 0,
        "Net Product Sale": `৳${(item.netProductSale || 0).toLocaleString()}`,
        "Delivery Charge": `৳${(item.deliveryCharge || 0).toLocaleString()}`,
        "Gross Sale": `৳${(item.grossSale || 0).toLocaleString()}`,
        "Product Cost": `৳${(item.productCost || 0).toLocaleString()}`,
        "Estimated Profit": `৳${(item.estimatedProfit || 0).toLocaleString()}`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, page, limit, setExportData]);

  return (
    <div className="space-y-4 -mt-2 pb-10">
      <h3 className="text-lg font-bold text-gray-800">Order Financials (Net Product)</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <PageHeaderCard
            key={idx}
            title={stat.title}
            color={stat.color}
            icon={stat.icon}
            value={
              <div className="flex items-center">
                <CountUp end={stat.value} duration={2} separator="," />
              </div>
            }
          />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={reportList}
        loading={isLoading || isFetching}
        isPaginate={meta?.total > limit}
        total={meta?.total || 0}
        currentPage={page}
        limit={limit}
        setCurrentPage={setPage}
        setLimit={setLimit}
        showSizeChanger={true}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default OrderFinancialsNetReport;
