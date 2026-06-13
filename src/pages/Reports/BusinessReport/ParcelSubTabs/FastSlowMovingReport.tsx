import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessParcelFastSlowMovingProductsReportQuery } from "../../../../redux/features/report/reportApi";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import CountUp from "react-countup";
import { FiBox, FiTrendingUp } from "react-icons/fi";
import { TableIcon } from "lucide-react";


interface FastSlowMovingReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const FastSlowMovingReport = ({
  search,
  page,
  limit,
  dateRange,
  setPage,
  setLimit,
  setExportData,
}: FastSlowMovingReportProps) => {
  const queryArgs = useMemo(() => {
    const args = [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      { name: "search", value: search },
      { name: "startDate", value: dateRange?.[0] || "" },
      { name: "endDate", value: dateRange?.[1] || "" },
    ];
    return args;
  }, [page, limit, search, dateRange]);

  const { data: response, isLoading ,isFetching} =
  useGetBusinessParcelFastSlowMovingProductsReportQuery(queryArgs);

  const meta = useMemo(() => response?.meta || { total: 0 }, [response]);

  const reportList = useMemo(() => {
    const items = response?.data || [];

    // Backend-এ যদি `class`/`classification` না থাকে, তখন একটি fallback classification দিচ্ছি  
    const qtySoldNums = items
      .map((it: any) => Number(it.qtySold ?? it.sold ?? 0))
      .filter((n: number) => !Number.isNaN(n));
    const maxQtySold = qtySoldNums.length ? Math.max(...qtySoldNums) : 0;
    const threshold = maxQtySold > 0 ? maxQtySold / 2 : 0;

    return items.map((item: any) => {
      const qtySold = Number(item.qtySold ?? item.sold ?? 0);
      const classValue: string =
        item.class ??
        item.classification ??
        (qtySold >= threshold ? "Fast" : "Slow");

      return {
        id: item.id ?? item._id,
        product: item.productName ?? item.product ?? "",
        sku: item.sku ?? "",
        sold: qtySold,
        class: String(classValue),
        revenue: Number(item.revenue ?? 0),
        orders: Number(item.orders ?? 0),
        stock: Number(item.stock ?? 0),
      };
    });
  }, [response]);

  const summary = response?.summary || {};
  const totalQtySold = Number(summary.totalQtySold ?? 0);
  const totalRevenue = Number(summary.totalRevenue ?? 0);
  const distinctProducts = Number(summary.distinctProducts ?? 0);

  useEffect(() => {
    if (reportList.length > 0) setExportData(reportList);
    else setExportData([]);
  }, [reportList, setExportData]);

  const columns = [
    { title: "Product Name", dataIndex: "product", key: "product" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Sold Quantity",
      dataIndex: "sold",
      key: "sold",
      align: "center" as const,
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      align: "center" as const,
      render: (val: number) => `৳${(val || 0).toLocaleString()}`,
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      align: "center" as const,
    },
  ];

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">Fast & Slow Moving Products</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PageHeaderCard
          title="Total Qty Sold"
          color="green"
          icon={<FiTrendingUp />}
          value={<CountUp end={totalQtySold} duration={1.5} separator="," />}
        />
        <PageHeaderCard
          title="Total Revenue"
          color="orange"
          icon={<TableIcon />}
          value={
            <CountUp
              end={totalRevenue}
              duration={1.5}
              separator=","
              prefix="৳"
            />
          }
        />
        <PageHeaderCard
          title="Distinct Products"
          color="blue"
          icon={<FiBox />}
          value={
            <CountUp
              end={distinctProducts}
              duration={1.5}
              separator=","
            />
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={reportList}
        loading={isLoading || isFetching}
        rowKey="id"
        isPaginate={meta.total > limit}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta.total}
      />
    </div>
  );
};

export default FastSlowMovingReport;
