import { useEffect, useMemo } from "react";
import { useGetBusinessOrderSourcePerformanceReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import { FiTrendingUp, FiBarChart2, FiCheckCircle, FiXCircle, FiShoppingBag } from "react-icons/fi";
import CountUp from "react-countup";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { TbCoinTaka } from "react-icons/tb";

interface OrderSourcePerformanceReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const OrderSourcePerformanceReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: OrderSourcePerformanceReportProps) => {
  const { data: reportData, isLoading, isFetching } =
    useGetBusinessOrderSourcePerformanceReportQuery([
      { name: "startDate", value: dateRange?.[0] || "" },
      { name: "endDate", value: dateRange?.[1] || "" },
      { name: "search", value: search },
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
    ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const meta = reportData?.meta || {};
  const summary = reportData?.summary || {};

  console.log(reportData);

  const stats = [
    {
      title: "Total Orders",
      value: summary.totalOrderCount || 0,
      icon: <FiBarChart2 />,
      color: "blue" as const,
    },
    {
      title: "Delivered",
      value: summary.totalDeliveredCount || 0,
      icon: <FiCheckCircle />,
      color: "green" as const,
    },
    {
      title: "Cancelled",
      value: summary.totalCancelledCount || 0,
      icon: <FiXCircle />,
      color: "red" as const,
    },
    {
      title: "Net Product Sale",
      value: summary.totalNetProductSale || 0,
      icon: <FiShoppingBag />,
      color: "green" as const,
    },
    {
      title: "Delivery Charge",
      value: summary.totalDeliveryCharge || 0,
      icon: <TbCoinTaka className="h-5 w-5" />,
      color: "orange" as const,
    },
    {
      title: "Gross Sale",
      value: summary.totalGrossSale || 0,
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
      title: "Order Source",
      dataIndex: "source",
      key: "source",
      render: (text: string) => (
        <span className="font-semibold text-gray-700">
          {text}
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
      title: "Delivered",
      dataIndex: "delivered",
      key: "delivered",
      align: "center" as const,
    },
    {
      title: "Cancelled",
      dataIndex: "cancelled",
      key: "cancelled",
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
        "Order Source": item.source || "-",
        Orders: item.orders || 0,
        Delivered: item.delivered || 0,
        Cancelled: item.cancelled || 0,
        "Net Product Sale": `৳${(item.netProductSale || 0).toLocaleString()}`,
        "Delivery Charge": `৳${(item.deliveryCharge || 0).toLocaleString()}`,
        "Gross Sale": `৳${(item.grossSale || 0).toLocaleString()}`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, page, limit, setExportData]);

  return (
    <div className="space-y-4 -mt-2 pb-10">
      <h3 className="text-lg font-bold text-gray-800">Order Source Performance (Net Product)</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <PageHeaderCard
            key={idx}
            title={stat.title}
            color={stat.color}
            icon={stat.icon}
            value={
              <div className="flex items-center">
                <CountUp 
                  end={stat.value} 
                  duration={2} 
                  separator="," 
                  prefix={stat.title.includes("Sale") ? "৳" : ""} 
                />
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

export default OrderSourcePerformanceReport;
