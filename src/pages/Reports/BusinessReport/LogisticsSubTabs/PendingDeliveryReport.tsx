import { useEffect, useMemo } from "react";
import { useGetBusinessPendingDeliveryReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import moment from "moment";

interface PendingDeliveryReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const PendingDeliveryReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: PendingDeliveryReportProps) => {
  const {
    data: reportData,
    isLoading,
    isFetching,
  } = useGetBusinessPendingDeliveryReportQuery([
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
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Customer",
      key: "customer",
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 text-xs">
            {item.customerName}
          </span>
          <span className="text-gray-400 text-[10px]">
            {item.customerPhone}
          </span>
        </div>
      ),
    },
    {
      title: "Courier",
      dataIndex: "courier",
      key: "courier",
      render: (text: string) => (
        <span className="text-xs text-gray-600">{text}</span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `৳${(val || 0).toLocaleString()}`,
    },
    {
      title: "Sent Date",
      dataIndex: "sentDate",
      key: "sentDate",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Age (Days)",
      dataIndex: "days",
      key: "days",
      align: "center" as const,
      render: (days: number) => (
        <span
          className={`font-bold ${days > 15 ? "text-red-500" : "text-orange-500"}`}
        >
          {days} Days
        </span>
      ),
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any) => ({
        Invoice: item.invoice || "-",
        Customer: item.customerName || "-",
        Phone: item.customerPhone || "-",
        Courier: item.courier || "-",
        Amount: `৳${(item.amount || 0).toLocaleString()}`,
        "Sent Date": moment(item.sentDate).format("DD MMM YYYY"),
        Age: `${item.days || 0} Days`,
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          Pending Delivery Report
        </h3>
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

export default PendingDeliveryReport;
