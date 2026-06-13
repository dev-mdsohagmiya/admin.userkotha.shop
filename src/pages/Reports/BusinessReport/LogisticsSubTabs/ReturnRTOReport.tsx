import { useEffect, useMemo } from "react";
import { useGetBusinessReturnRTOReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";

interface ReturnRTOReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const ReturnRTOReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: ReturnRTOReportProps) => {
  const {
    data: reportData,
    isLoading,
    isFetching,
  } = useGetBusinessReturnRTOReportQuery([
    { name: "startDate", value: dateRange?.[0] || "" },
    { name: "endDate", value: dateRange?.[1] || "" },
    { name: "search", value: search },
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const meta = reportData?.meta || {};

  const columns = [
    {
      title: "Courier Name",
      dataIndex: "courier",
      key: "courier",
      render: (text: string) => (
        <span className="font-medium text-gray-700 px-3 py-1 rounded-md text-xs">
          {text?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      title: "Total Shipments",
      dataIndex: "total",
      key: "total",
      align: "center" as const,
      className: "font-medium",
    },
    {
      title: "Delivered",
      dataIndex: "delivered",
      key: "delivered",
      align: "center" as const,
    },
    {
      title: "Returned (RTO)",
      dataIndex: "returned",
      key: "returned",
      align: "center" as const,
      render: (val: number) => (
        <span className={val > 0 ? "text-red-500 font-bold" : ""}>{val}</span>
      ),
    },
    {
      title: "RTO Rate",
      dataIndex: "deliveryRate",
      key: "deliveryRate",
      render: (rate: number) => (
        <span className="text-red-500 font-bold">{rate || 0}%</span>
      ),
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any) => ({
        "Courier Name": item.courier || "-",
        "Total Shipments": item.total || 0,
        Delivered: item.delivered || 0,
        "Returned (RTO)": item.returned || 0,
        "RTO Rate": `${item.deliveryRate || 0}%`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">Return / RTO Report</h3>
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

export default ReturnRTOReport;
