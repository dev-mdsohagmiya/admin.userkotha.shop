import { useEffect, useMemo } from "react";
import { useGetCustomerWiseOrderReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import dayjs from "dayjs";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import CountUp from "react-countup";
import { FiUsers, FiTrendingUp, FiInbox } from "react-icons/fi";

interface CustomerWiseSalesReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const CustomerWiseSalesReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: CustomerWiseSalesReportProps) => {
  const { data: reportData, isLoading, isFetching } =
    useGetCustomerWiseOrderReportQuery([
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
      title: "Total Customers",
      value: summary.totalCustomers || 0,
      icon: <FiUsers />,
      color: "blue" as const,
    },
    {
      title: "Total Revenue",
      value: summary.totalRevenue || 0,
      prefix: "৳",
      icon: <FiTrendingUp />,
      color: "green" as const,
    },
    {
      title: "Total Orders",
      value: summary.totalOrders || 0,
      icon: <FiInbox />,
      color: "orange" as const,
    },
  ];

  const columns = [
    {
      title: "SL",
      key: "sl",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      className: "font-medium",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
    },
    {
      title: "Total Spent",
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Avg Order",
      dataIndex: "avgOrder",
      key: "avgOrder",
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Last Order",
      dataIndex: "lastOrderDate",
      key: "lastOrderDate",
      render: (date: string) => (date ? dayjs(date).format("DD MMM YYYY") : "-"),
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any, index: number) => ({
        SL: (page - 1) * limit + index + 1,
        "Customer Name": item.customerName || "-",
        Phone: item.phone || "-",
        Orders: item.orders || 0,
        "Total Spent": `${(item.totalSpent || 0).toLocaleString()}`,
        "Avg Order": `${(item.avgOrder || 0).toLocaleString()}`,
        "Last Order": item.lastOrderDate ? dayjs(item.lastOrderDate).format("DD MMM YYYY") : "-",
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, page, limit, setExportData]);

  return (
    <div className="space-y-4 -mt-2 pb-10">
      {/* Summary Cards */}
      <h3 className="text-lg font-bold text-gray-800">Customer Wise Order Report</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

export default CustomerWiseSalesReport;
