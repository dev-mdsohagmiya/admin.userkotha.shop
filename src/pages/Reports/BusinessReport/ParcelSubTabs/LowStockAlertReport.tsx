import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessParcelLowStockAlertReportQuery } from "../../../../redux/features/report/reportApi";
import CurrencyIcon from "../../../../components/common/CurrencyIcon";

interface LowStockAlertReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const LowStockAlertReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: LowStockAlertReportProps) => {
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

  const { data: response, isLoading, isFetching } = useGetBusinessParcelLowStockAlertReportQuery(queryArgs);

  const reportList = useMemo(() => response?.data || [], [response]);
  const meta = useMemo(() => response?.meta || { total: 0 }, [response]);

  const columns = [
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { 
      title: "Current", 
      dataIndex: "current", 
      key: "current", 
      align: "center" as const,
      render: (val: number) => <span className="text-red-500 font-medium">{val}</span>
    },
    { 
      title: "Threshold", 
      dataIndex: "threshold", 
      key: "threshold", 
      align: "center" as const,
      render: (val: number) => <span className="font-medium">{val}</span>
    },
    { 
      title: "Deficit", 
      dataIndex: "deficit", 
      key: "deficit", 
      align: "center" as const,
      render: (val: number) => <span className="text-orange-500 font-bold">{val}</span>
    },
    { 
      title: "Price", 
      dataIndex: "price", 
      key: "price", 
      align: "center" as const,
      render: (val: number) => (
        <div className="flex items-center justify-center gap-1 text-primary font-bold">
          <CurrencyIcon size={13} />
          <span>{(val || 0).toLocaleString()}</span>
        </div>
      )
    },
  ];

  useEffect(() => {
    setExportData(reportList);
  }, [reportList, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">Low Stock Alert Report</h3>
      </div>
      <DataTable
        columns={columns}
        data={reportList}
        loading={isLoading || isFetching}
        isPaginate={meta.total > limit}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta.total}
        rowKey="id"
      />
    </div>
  );
};

export default LowStockAlertReport;
