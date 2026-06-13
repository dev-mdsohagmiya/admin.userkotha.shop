import React, { useState } from "react";
import { DataTable } from "../../../../../components/common/Tables";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { useGetOrderReturnReportQuery } from "../../../../../redux/features/report/reportApi";

const ReturnsSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const {
    data: returnReportData,
    isLoading: returnReportLoading,
    isFetching,
  } = useGetOrderReturnReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const returnReportList = returnReportData?.data || [];
  const meta = returnReportData?.meta || { total: 0 };
  const summary = returnReportData?.summary || {
    returnRate: 0,
    totalRefundValue: 0,
    totalReturnedOrders: 0,
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id: string, record: any) => (
        <span className="font-bold">#{record?.invoice || id}</span>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (record: any) => (
        <div>
          <div className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
            {record.customer?.name || record?.customerName}
          </div>
          <div className="text-gray-500 text-xs whitespace-nowrap">
            {record.customer?.phone || record?.customerPhone}
          </div>
        </div>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => (
        <span className="text-xs text-rose-500 font-medium">{text}</span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => (
        <span className="font-semibold">৳{val?.toLocaleString()}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-[4px] text-[9px] font-semibold capitalize ${
            status === "processed" || status === "Processed"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {status?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      title: "Return Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span className="text-[10px] text-gray-600 dark:text-gray-400">
          {date ? new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) : "--"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-outfit">
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-none flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 dark:text-white tracking-tight">
              Return Management
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Tracking and processing order returns with transparency.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-center">
          <div>
            <CustomDatePicker
              onChange={(dates) => {
                setDateRange(dates);
                setPage(1);
              }}
              selectedData={dateRange}
            />
          </div>
          <div>
            <p className="text-lg font-bold text-rose-500">
              {summary?.returnRate || 0}%
            </p>
            <p className="text-[9px] font-bold text-gray-400">Return Rate</p>
          </div>
          <div className="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
          <div>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              ৳{summary?.totalRefundValue?.toLocaleString() || 0}
            </p>
            <p className="text-[9px] font-bold text-gray-400">Refund value</p>
          </div>
        </div>
      </div>

      <div className="">
        <DataTable
          columns={columns}
          data={returnReportList}
          loading={returnReportLoading || isFetching}
          isPaginate={meta?.total > 10}
          total={meta?.total || 0}
          rowKey="id"
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10}
        />
      </div>
    </div>
  );
};

export default ReturnsSubTab;
