import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessCourierPaymentReconciliationReportQuery } from "../../../../redux/features/report/reportApi";
import CurrencyIcon from "../../../../components/common/CurrencyIcon";

interface CourierPaymentReconciliationReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const CourierPaymentReconciliationReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: CourierPaymentReconciliationReportProps) => {
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
    useGetBusinessCourierPaymentReconciliationReportQuery(queryArgs);

  const reportData = useMemo(() => response?.data || [], [response]);
  const meta = useMemo(() => response?.meta || {}, [response]);

  const columns = [
    { title: "Invoice ID", dataIndex: "invoice", key: "invoice" },
    { title: "Courier Name", dataIndex: "courier", key: "courier" },
    {
      title: "Invoiced Amt",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => (
        <div className="flex items-center gap-1">
          <CurrencyIcon size={13} className="text-gray-500" />
          <span>{val.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "Paid Amt",
      dataIndex: "paid",
      key: "paid",
      render: (val: number) => (
        <div className="flex items-center gap-1 text-green-600 font-medium">
          <CurrencyIcon size={13} />
          <span>{val.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "Due Amt",
      dataIndex: "due",
      key: "due",
      render: (val: number) => (
        <div className="flex items-center gap-1 text-red-500 font-medium">
          <CurrencyIcon size={13} />
          <span>{val.toLocaleString()}</span>
        </div>
      ),
    },
    { title: "Status", dataIndex: "status", key: "status" },
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
          Courier Payment Reconciliation Report
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

export default CourierPaymentReconciliationReport;
