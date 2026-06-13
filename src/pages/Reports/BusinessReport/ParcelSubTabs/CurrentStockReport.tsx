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
    return [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      { name: "search", value: search },
      { name: "startDate", value: dateRange[0] || "" },
      { name: "endDate", value: dateRange[1] || "" },
    ];
  }, [page, limit, search, dateRange]);

  const { data: response, isLoading, isFetching } = useGetBusinessCurrentStockReportQuery(
    queryArgs,
  );

  const reportData = useMemo(() => response?.data || [], [response]);

  const printableData = useMemo(
    () =>
      reportData.map((item: any) => ({
        "Product Name": item.productName ?? "",
        SKU: item.sku ?? "",
        "Current Stock": Number(item.qty ?? 0),
        "Alert At": Number(item.alertAt ?? 0),
        "Cost Price": `৳${Number(item.costPrice ?? 0).toLocaleString()}`,
        "Sell Price": `৳${Number(item.sellPrice ?? 0).toLocaleString()}`,
        "Stock Value": `৳${Number(item.stockValue ?? 0).toLocaleString()}`,
      })),
    [reportData],
  );

  const columns = [
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Current Stock",
      dataIndex: "qty",
      key: "qty",
      align: "center" as const,
    },
    {
      title: "Alert At",
      dataIndex: "alertAt",
      key: "alertAt",
      align: "center" as const,
    },
    {
      title: "Cost Price",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (val: number) => (
        <div className="flex items-center gap-1 text-primary font-bold">
          <CurrencyIcon size={13} />
          <span>{(val || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "Sell Price",
      dataIndex: "sellPrice",
      key: "sellPrice",
      render: (val: number) => (
        <div className="flex items-center gap-1 text-primary font-bold">
          <CurrencyIcon size={13} />
          <span>{(val || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "Stock Value",
      dataIndex: "stockValue",
      key: "stockValue",
      render: (val: number) => (
        <div className="flex items-center gap-1 text-primary font-bold">
          <CurrencyIcon size={13} />
          <span>{(val || 0).toLocaleString()}</span>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setExportData(printableData);
  }, [printableData, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">Current Stock Report</h3>
      </div>
      <DataTable
        columns={columns}
        data={reportData}
        loading={isLoading || isFetching}
        rowKey="id"
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
