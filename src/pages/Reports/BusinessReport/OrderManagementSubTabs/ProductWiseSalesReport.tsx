import { useEffect, useMemo } from "react";
import { useGetProductWiseSalesReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import { FiTrendingUp, FiPackage } from "react-icons/fi";
import CountUp from "react-countup";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";

interface ProductWiseSalesReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const ProductWiseSalesReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: ProductWiseSalesReportProps) => {
  const { data: reportData, isLoading, isFetching } =
    useGetProductWiseSalesReportQuery([
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
      title: "Total Qty Sold",
      value: summary.totalQtySold || 0,
      icon: <FiPackage />,
      color: "blue" as const,
    },
    {
      title: "Total Revenue",
      value: summary.totalRevenue || 0,
      icon: <FiTrendingUp />,
      color: "green" as const,
    },
  ];

  const columns = [
    {
      title: "SL",
      key: "sl",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      className: "font-medium",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
    },
    {
      title: "Qty Sold",
      dataIndex: "qtySold",
      key: "qtySold",
      align: "center" as const,
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
    {
      title: "Avg Price",
      dataIndex: "avgPrice",
      key: "avgPrice",
      render: (amount: number) => `৳${(amount || 0).toLocaleString()}`,
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any, index: number) => ({
        SL: (page - 1) * limit + index + 1,
        "Product Name": item.productName || "-",
        SKU: item.sku || "-",
        Orders: item.orders || 0,
        "Qty Sold": item.qtySold || 0,
        Revenue: `${(item.revenue || 0).toLocaleString()}`,
        "Avg Price": `${(item.avgPrice || 0).toLocaleString()}`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, page, limit, setExportData]);

  return (
    <div className="space-y-4 -mt-2 pb-10">
      <h3 className="text-lg font-bold text-gray-800">Product Wise Sales Report</h3>

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
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ProductWiseSalesReport;
