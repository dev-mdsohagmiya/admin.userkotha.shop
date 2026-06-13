import React, { useState } from "react";
import { DataTable } from "../../../../../components/common/Tables";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { getDefaultDateRange } from "../../../../../utils/dateRange";

const UserTagReportSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    getDefaultDateRange(),
  );

  const columns = [
    {
      title: "User Tag",
      dataIndex: "tag",
      key: "tag",
      render: (tag: string) => (
        <span className="bg-blue-100 text-blue-600 font-semibold px-2 py-1 rounded-[4px] text-[9px]">
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
          <span className="text-primary font-bold text-sm">{row.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.percent}%
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
          <span className="text-primary font-bold text-sm">{row.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.percent}%
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
          <span className="text-primary font-bold text-sm">{row.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.percent}%
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
          <span className="text-primary font-bold text-sm">{row.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.percent}%
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
          <span className="text-primary font-bold text-sm">{row.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.percent}%
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
          <span className="text-primary font-bold text-sm">{row.count}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.percent}%
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
        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          ৳{val.toLocaleString()}
        </span>
      ),
    },
  ];

  const dummyData = [
    {
      key: "1",
      tag: "Repeat Customer",
      totalOrders: 181,
      pending: { count: 178, percent: 98.34 },
      rts: { count: 2, percent: 1.1 },
      preorder: { count: 0, percent: 0 },
      shipped: { count: 1, percent: 0.55 },
      delivered: { count: 0, percent: 0 },
      returned: { count: 0, percent: 0 },
      totalMoney: 209280,
    },
  ];

  const printableData = dummyData.map((item) => ({
    "User Tag": item.tag,
    "Total Orders": item.totalOrders,
    Pending: `${item.pending.count} (${item.pending.percent}%)`,
    RTS: `${item.rts.count} (${item.rts.percent}%)`,
    Preorder: `${item.preorder.count} (${item.preorder.percent}%)`,
    Shipped: `${item.shipped.count} (${item.shipped.percent}%)`,
    Delivered: `${item.delivered.count} (${item.delivered.percent}%)`,
    Returned: `${item.returned.count} (${item.returned.percent}%)`,
    "Total Money": `৳${item.totalMoney.toLocaleString()}`,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-outfit">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-none">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">
            User Tag Report
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
              fileName="User-Tag-Report"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0 bg-transparent border-none">
          <DataTable
            columns={columns}
            data={dummyData}
            loading={false}
            isPaginate={false}
            total={dummyData.length}
            currentPage={page}
            limit={limit}
            setCurrentPage={setPage}
            setLimit={setLimit}
            className="border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default UserTagReportSubTab;
