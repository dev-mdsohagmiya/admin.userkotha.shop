import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessDailyCashVsBankCodReportQuery } from "../../../../redux/features/report/reportApi";
import CurrencyIcon from "../../../../components/common/CurrencyIcon";

interface DailyCashVsBankCODReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const DailyCashVsBankCODReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: DailyCashVsBankCODReportProps) => {
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
    useGetBusinessDailyCashVsBankCodReportQuery(queryArgs);

  const reportData = useMemo(() => response?.data || [], [response]);
  const meta = useMemo(() => response?.meta || {}, [response]);

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
    },
    {
      title: "Total Revenue",
      dataIndex: "total",
      key: "total",
      render: (val: number) => (
        <div className="flex items-center gap-1">
          <CurrencyIcon size={13} className="text-gray-500" />
          <span>{val.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "Bank Advance",
      dataIndex: "bankAdvance",
      key: "bankAdvance",
      render: (val: number) => (
        <div className="flex items-center gap-1">
          <CurrencyIcon size={13} className="text-gray-500" />
          <span>{val.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "COD",
      dataIndex: "cod",
      key: "cod",
      render: (val: number) => (
        <div className="flex items-center gap-1 text-primary font-bold">
          <CurrencyIcon size={13} />
          <span>{val.toLocaleString()}</span>
        </div>
      ),
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
        <h3 className="text-lg font-bold text-gray-800">
          Daily Cash vs Bank COD Report
        </h3>
      </div>

      <DataTable
        columns={columns}
        data={reportData}
        loading={isLoading}
        isPaginate={meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta?.total || 0}
      />
    </div>
  );
};

export default DailyCashVsBankCODReport;
