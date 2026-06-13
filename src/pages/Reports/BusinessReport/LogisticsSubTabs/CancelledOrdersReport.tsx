import { useEffect, useMemo } from "react";
import { useGetBusinessCancelledOrdersReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";

interface CancelledOrdersReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const CancelledOrdersReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: CancelledOrdersReportProps) => {
  const {
    data: reportData,
    isLoading,
    isFetching,
  } =   useGetBusinessCancelledOrdersReportQuery([
    { name: "startDate", value: dateRange?.[0] || "" },
    { name: "endDate", value: dateRange?.[1] || "" },
    { name: "search", value: search },
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const meta = reportData?.meta || {};

  // Calculate totals if summary is missing from API
  const columns = [
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => (
        <span className="font-medium text-gray-700 px-3 py-1 rounded-md text-xs">
          {text}
        </span>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
      className: "font-medium",
    },
    {
      title: "Total Value",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (val: number) => `৳${(val || 0).toLocaleString()}`,
    },
    {
      title: "Avg Value",
      dataIndex: "avgValue",
      key: "avgValue",
      render: (val: number) => `৳${(val || 0).toLocaleString()}`,
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any) => ({
        Reason: item.reason || "-",
        Orders: item.orders || 0,
        "Total Value": `৳${(item.totalValue || 0).toLocaleString()}`,
        "Avg Value": `৳${(item.avgValue || 0).toLocaleString()}`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">Cancelled Orders Report</h3>
      </div>

      <div className="">
        <DataTable
          columns={columns}
          data={reportList}
          loading={isLoading || isFetching}
          isPaginate={meta?.total > limit}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={meta?.total || 0}
        />
      </div>
    </div>
  );
};

export default CancelledOrdersReport;
