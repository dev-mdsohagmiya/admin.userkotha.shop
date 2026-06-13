import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessDailyCollectionReportQuery } from "../../../../redux/features/report/reportApi";
import CurrencyIcon from "../../../../components/common/CurrencyIcon";

interface DailyCollectionReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const DailyCollectionReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: DailyCollectionReportProps) => {
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
    useGetBusinessDailyCollectionReportQuery(queryArgs);

  const reportData = useMemo(() => response?.data || [], [response]);

  const columns = [
    { title: "Collection Date", dataIndex: "date", key: "date" },
    { title: "Total Orders", dataIndex: "orders", key: "orders", align: "center" as const },
    { 
        title: "Collected", 
        dataIndex: "collected", 
        key: "collected",
        render: (val: number) => (
          <div className="flex items-center gap-1">
            <CurrencyIcon size={13} className="text-gray-500" />
            <span>{val.toLocaleString()}</span>
          </div>
        )
    },
    { 
        title: "Delivery Charge", 
        dataIndex: "deliveryCharge", 
        key: "deliveryCharge",
        render: (val: number) => (
          <div className="flex items-center gap-1">
            <CurrencyIcon size={13} className="text-gray-500" />
            <span>{val.toLocaleString()}</span>
          </div>
        )
    },
    { 
        title: "Advance", 
        dataIndex: "advance", 
        key: "advance",
        render: (val: number) => (
          <div className="flex items-center gap-1">
            <CurrencyIcon size={13} className="text-gray-500" />
            <span>{val.toLocaleString()}</span>
          </div>
        )
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
        <h3 className="text-lg font-bold text-gray-800">Daily Collection Report</h3>
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

export default DailyCollectionReport;
