import { useEffect, useMemo } from "react";
import { useGetMonthlySalesReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import { FiInbox, FiTrendingUp, FiScissors } from "react-icons/fi";
import CountUp from "react-countup";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { TbCoinTaka } from "react-icons/tb";

interface MonthlySalesReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const MonthlySalesReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: MonthlySalesReportProps) => {
  const { data: reportData, isLoading, isFetching } =
    useGetMonthlySalesReportQuery([
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
      title: "Total Orders",
      value: summary.totalOrders || 0,
      icon: <FiInbox />,
      color: "blue" as const,
    },
    {
      title: "Total Revenue",
      value: summary.totalRevenue || 0,
      icon: <FiTrendingUp />,
      color: "green" as const,
    },
    {
      title: "Total Discount",
      value: summary.totalDiscount || 0,
      icon: <FiScissors />,
      color: "orange" as const,
    },
    {
      title: "Total Advance",
      value: summary.totalAdvance || 0,
      icon: <TbCoinTaka className="h-5 w-5" />,
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
          {status?.toLowerCase()}
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
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (amount: number) => `${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (amount: number) => `${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Advance",
      dataIndex: "advance",
      key: "advance",
      render: (amount: number) => `${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Avg Order",
      dataIndex: "avgOrder",
      key: "avgOrder",
      render: (amount: number) => (
        <span className="font-semibold text-primary">
          ৳{(amount || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any, index: number) => ({
        SL: (page - 1) * limit + index + 1,
        Status: item.status || "-",
        Orders: item.orders || 0,
        Revenue: `${(item.revenue || 0).toLocaleString()}`,
        Discount: `${(item.discount || 0).toLocaleString()}`,
        Advance: `${(item.advance || 0).toLocaleString()}`,
        "Avg Order": `${(item.avgOrder || 0).toLocaleString()}`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, page, limit, setExportData]);

  return (
    <div className="space-y-4 -mt-2 pb-10">
      <h3 className="text-lg font-bold text-gray-800">Monthly Sales Summary</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default MonthlySalesReport;
