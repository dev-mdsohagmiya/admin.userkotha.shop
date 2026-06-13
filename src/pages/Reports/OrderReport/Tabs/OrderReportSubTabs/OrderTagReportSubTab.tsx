import React, { useState } from "react";
import { DataTable } from "../../../../../components/common/Tables";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { useGetOrderTagReportQuery } from "../../../../../redux/features/report/reportApi";

const OrderTagReportSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
[null, null]  );

  const {
    data: orderTagReportData,
    isLoading: orderTagReportLoading,
    isFetching,
  } = useGetOrderTagReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const orderTagReport = orderTagReportData?.data || [];
  const total = orderTagReportData?.meta?.total || 0;


  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
      render: (tag: string) => (
        <span className="bg-primary text-white font-semibold px-2 py-1 rounded-[4px] text-[9px]">
          {tag}
        </span>
      ),
    },
    {
      title: "Total Orders",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "center" as const,
      render: (val: number) => (
        <span className="text-primary font-bold text-sm">{val}</span>
      ),
    },
    {
      title: "Pending",
      dataIndex: "pending",
      key: "pending",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-sm">{row?.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row?.percentage}
          </span>
        </div>
      ),
    },
    {
      title: "RTS",
      dataIndex: "rts",
      key: "rts",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-sm">{row?.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row?.percentage}
          </span>
        </div>
      ),
    },
    {
      title: "Preorder",
      dataIndex: "preorder",
      key: "preorder",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-sm">{row?.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row?.percentage}
          </span>
        </div>
      ),
    },
    {
      title: "Shipped",
      dataIndex: "shipped",
      key: "shipped",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-sm">{row?.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row?.percentage}
          </span>
        </div>
      ),
    },
    {
      title: "Delivered",
      dataIndex: "delivered",
      key: "delivered",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-sm">{row?.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row?.percentage}
          </span>
        </div>
      ),
    },
    {
      title: "Returned",
      dataIndex: "returned",
      key: "returned",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex flex-col items-center">
          <span className="text-primary font-bold text-sm">{row?.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row?.percentage}
          </span>
        </div>
      ),
    },
    {
      title: "Total Money",
      dataIndex: "totalMoney",
      key: "totalMoney",
      align: "right" as const,
      render: (val: number) => (
        <span className="font-bold text-gray-800 text-sm">
          ৳{val?.toLocaleString()}
        </span>
      ),
    },
  ];

  const printableData = orderTagReport.map((item: any, index: number) => ({
    "#": (page - 1) * limit + index + 1,
    Tag: item.tag,
    "Total Orders": item.totalOrders,
    Pending: `${item.pending?.count} (${item.pending?.percentage})`,
    RTS: `${item.rts?.count} (${item.rts?.percentage})`,
    Preorder: `${item.preorder?.count} (${item.preorder?.percentage})`,
    Shipped: `${item.shipped?.count} (${item.shipped?.percentage})`,
    Delivered: `${item.delivered?.count} (${item.delivered?.percentage})`,
    Returned: `${item.returned?.count} (${item.returned?.percentage})`,
    "Total Money": `৳${item.totalMoney?.toLocaleString()}`,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-outfit">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 rounded-lg shadow-none">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">
            Order Tag Report
          </h3>
          <div className="no-print flex items-center gap-3">
            <CustomDatePicker
              onChange={(dates) => {
                setDateRange(dates);
                setPage(1);
              }}
              selectedData={dateRange}
            />
            <PageListPrint
              tableData={printableData}
              fileName="Order-Tag-Report"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0 bg-transparent border-none">
          <DataTable
            columns={columns}
            data={orderTagReport}
            loading={orderTagReportLoading || isFetching}
            isPaginate={total > 10}
            total={total}
            rowKey="tag"
            currentPage={page}
            limit={limit}
            setCurrentPage={setPage}
            setLimit={setLimit}
            showSizeChanger={total > 10}
            className="border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderTagReportSubTab;
