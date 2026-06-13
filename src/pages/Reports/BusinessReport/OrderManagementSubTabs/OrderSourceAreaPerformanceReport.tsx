import { useEffect, useMemo } from "react";
import { useGetBusinessOrderSourceAreaPerformanceReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import { FiBarChart2, FiShoppingBag, FiMapPin, FiMap } from "react-icons/fi";
import CountUp from "react-countup";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";

interface OrderSourceAreaPerformanceReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const OrderSourceAreaPerformanceReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: OrderSourceAreaPerformanceReportProps) => {
  const {
    data: reportData,
    isLoading,
    isFetching,
  } = useGetBusinessOrderSourceAreaPerformanceReportQuery([
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
      title: "All Orders",
      value: summary.totalOrders || 0,
      icon: <FiBarChart2 />,
      color: "blue" as const,
    },
    {
      title: "Total ",
      value: summary.totalNetProductAmount || 0,
      icon: <FiShoppingBag />,
      color: "purple" as const,
    },
    {
      title: "Inside ",
      value: summary.insideNetProductAmount || 0,
      icon: <FiMapPin />,
      color: "green" as const,
    },
    {
      title: "Outside ",
      value: summary.outsideNetProductAmount || 0,
      icon: <FiMap />,
      color: "orange" as const,
    },
    {
      title: "Unknown ",
      value: summary.unknownNetProductAmount || 0,
      icon: <FiShoppingBag />,
      color: "red" as const,
    },
  ];

  const columns = [
    {
      title: "SL",
      key: "sl",
      width: 70,
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 150,
      render: (text: string) => (
        <span className="font-semibold text-gray-700">{text}</span>
      ),
    },
    {
      title: "Inside Orders",
      dataIndex: "insideOrders",
      key: "insideOrders",
      width: 120,
      align: "center" as const,
    },
    {
      title: "Inside Amount",
      dataIndex: "insideAmount",
      key: "insideAmount",
      width: 150,
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Outside Orders",
      dataIndex: "outsideOrders",
      key: "outsideOrders",
      width: 120,
      align: "center" as const,
    },
    {
      title: "Outside Amount",
      dataIndex: "outsideAmount",
      key: "outsideAmount",
      width: 150,
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Unknown Orders",
      dataIndex: "unknownOrders",
      key: "unknownOrders",
      width: 120,
      align: "center" as const,
    },
    {
      title: "Unknown Amount",
      dataIndex: "unknownAmount",
      key: "unknownAmount",
      width: 150,
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Total Orders",
      dataIndex: "totalOrders",
      key: "totalOrders",
      width: 120,
      align: "center" as const,
      className: "font-semibold",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
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
        Source: item.source || "-",
        "Inside Orders": item.insideOrders || 0,
        "Inside Amount": `৳${(item.insideAmount || 0).toLocaleString()}`,
        "Outside Orders": item.outsideOrders || 0,
        "Outside Amount": `৳${(item.outsideAmount || 0).toLocaleString()}`,
        "Unknown Orders": item.unknownOrders || 0,
        "Unknown Amount": `৳${(item.unknownAmount || 0).toLocaleString()}`,
        "Total Orders": item.totalOrders || 0,
        "Total Amount": `৳${(item.totalAmount || 0).toLocaleString()}`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, page, limit, setExportData]);

  return (
    <div className="space-y-4 -mt-2 pb-10">
      <h3 className="text-lg font-bold text-gray-800">
        Order Source Area Performance
      </h3>

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
                <CountUp
                  end={stat.value}
                  duration={2}
                  separator=","
                  prefix={stat.title.includes("Amount") ? "৳" : ""}
                />
              </div>
            }
          />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          loading={isLoading || isFetching}
          data={reportList}
          columns={columns}
          rowKey="id"
          isPaginate={meta?.total > limit}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > limit}
          total={meta?.total || 0}
         
        />
      </div>
    </div>
  );
};

export default OrderSourceAreaPerformanceReport;
