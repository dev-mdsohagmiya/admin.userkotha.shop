import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessCurrentStockReportQuery } from "../../../../redux/features/report/reportApi";
import CurrencyIcon from "../../../../components/common/CurrencyIcon";

interface CurrentStockReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const CurrentStockReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: CurrentStockReportProps) => {
  const queryArgs = useMemo(() => {
    const args = [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      { name: "search", value: search },
      { name: "startDate", value: dateRange[0] || "" },
      { name: "endDate", value: dateRange[1] || "" },
    ];
    return args;
  }, [page, limit, search, dateRange]);

  const { data: response, isLoading } =
    useGetBusinessCurrentStockReportQuery(queryArgs);

  const reportData = useMemo(() => response?.data || [], [response]);

  const columns = [
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Current Qty", dataIndex: "qty", key: "qty", align: "center" as const },
    { 
        title: "Cost Price", 
        dataIndex: "costPrice", 
        key: "costPrice", 
        render: (val: number) => (
          <div className="flex items-center gap-1">
            <CurrencyIcon size={13} className="text-gray-500" />
            <span>{val.toLocaleString()}</span>
          </div>
        ) 
    },
    { 
        title: "Sell Price", 
        dataIndex: "sellPrice", 
        key: "sellPrice", 
        render: (val: number) => (
          <div className="flex items-center gap-1">
            <CurrencyIcon size={13} className="text-gray-500" />
            <span>{val.toLocaleString()}</span>
          </div>
        ) 
    },
    { 
        title: "Stock Value", 
        dataIndex: "stockValue", 
        key: "stockValue", 
        render: (val: number) => (
          <div className="flex items-center gap-1 text-primary font-bold">
            <CurrencyIcon size={13} />
            <span>{val.toLocaleString()}</span>
          </div>
        ) 
    },
    { 
        title: "Status", 
        key: "status",
        render: (record: any) => {
            const isLow = record.qty <= record.alertAt && record.alertAt > 0;
            return (
                <span className={isLow ? "text-red-500 font-medium" : "text-green-500"}>
                    {isLow ? "Low Stock" : "Sufficient"}
                </span>
            )
        }
    },
  ];

  useEffect(() => {
    if (reportData.length > 0) {
      setExportData(reportData);
    }
  }, [reportData, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">Current Stock Report</h3>
      </div>

      <DataTable
        columns={columns}
        data={reportData}
        loading={isLoading}
        isPaginate={response?.meta?.total > limit}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={response?.meta?.total || 0}
      />
    </div>
  );
};

export default CurrentStockReport;
