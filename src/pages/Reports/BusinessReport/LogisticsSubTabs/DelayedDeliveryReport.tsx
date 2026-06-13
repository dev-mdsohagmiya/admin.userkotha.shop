import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessDelayedDeliveryReportQuery } from "../../../../redux/features/report/reportApi";
import CurrencyIcon from "../../../../components/common/CurrencyIcon";
import { format } from "date-fns";

interface DelayedDeliveryReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const DelayedDeliveryReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: DelayedDeliveryReportProps) => {
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
    useGetBusinessDelayedDeliveryReportQuery(queryArgs);

  const reportData = useMemo(() => response?.data || [], [response]);
  const meta = useMemo(() => response?.meta || {}, [response]);

  const columns = [
    { title: "Invoice", dataIndex: "invoice", key: "invoice" },
    { 
        title: "Customer", 
        key: "customer",
        render: (record: any) => (
            <div className="flex flex-col">
                <span className="font-medium text-gray-800">{record.customerName}</span>
                <span className="text-xs text-gray-500">{record.customerPhone}</span>
            </div>
        )
    },
    { title: "Courier", dataIndex: "courier", key: "courier" },
    { 
        title: "Amount", 
        dataIndex: "amount", 
        key: "amount",
        render: (val: number) => (
            <div className="flex items-center gap-1">
                <CurrencyIcon size={13} className="text-gray-500" />
                <span>{val.toLocaleString()}</span>
            </div>
        )
    },
    { 
        title: "Sent Date", 
        dataIndex: "sentDate", 
        key: "sentDate",
        render: (date: string) => format(new Date(date), "dd MMM yyyy")
    },
    { 
        title: "Days Delayed", 
        dataIndex: "daysDelayed", 
        key: "daysDelayed",
        render: (days: number) => (
            <span className="text-red-500 font-bold">{days} Days</span>
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
        <h3 className="text-lg font-bold text-gray-800">Delayed Delivery Report</h3>
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

export default DelayedDeliveryReport;
