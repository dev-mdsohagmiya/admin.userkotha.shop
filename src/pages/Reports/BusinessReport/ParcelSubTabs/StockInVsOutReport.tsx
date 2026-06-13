import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessParcelStockInVsOutReportQuery } from "../../../../redux/features/report/reportApi";

interface StockInVsOutReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const StockInVsOutReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: StockInVsOutReportProps) => {
  const queryArgs = useMemo(() => {
    const args = [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      ...(search ? [{ name: "search", value: search }] : []),
    ];
    if (dateRange?.[0]) {
      args.push({ name: "startDate", value: dateRange[0] });
    }
    if (dateRange?.[1]) {
      args.push({ name: "endDate", value: dateRange[1] });
    }
    return args;
  }, [page, limit, search, dateRange]);

  const { data:businessData, isLoading, isFetching } = useGetBusinessParcelStockInVsOutReportQuery(queryArgs);

  const reportData = useMemo(() => businessData?.data || [], [businessData?.data]);
  const meta = useMemo(() => businessData?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 }, [businessData?.meta]);

  console.log("reportData", reportData);

  const columns = [
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { 
        title: "Stock In", 
        dataIndex: "stockIn", 
        key: "stockIn", 
        align: "center" as const,
        render: (val: number) => <span className="text-green-600 font-medium">{val}</span>
    },
    { 
        title: "Stock Out", 
        dataIndex: "stockOut", 
        key: "stockOut", 
        align: "center" as const,
        render: (val: number) => <span className="text-red-600 font-medium">{val}</span>
    },
    { 
        title: "Net", 
        dataIndex: "net", 
        key: "net",
        render: (val: number) => <span className={val < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>{val}</span>
    },
  ];

  useEffect(() => {
    setExportData(reportData);
  }, [reportData, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
     
        <h3 className="text-lg font-bold text-gray-800">Stock In vs Out Report</h3>
      </div>

   

      <DataTable
        columns={columns}
        data={reportData}
        isPaginate={meta.total > limit}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta.total}
        loading={isLoading || isFetching}
      />
    </div>
  );
};

export default StockInVsOutReport;
