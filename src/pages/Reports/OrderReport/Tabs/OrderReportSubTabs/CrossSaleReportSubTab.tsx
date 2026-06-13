import React, { useState } from "react";
import { DataTable } from "../../../../../components/common/Tables";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { useGetOrderCrossSaleReportQuery } from "../../../../../redux/features/report/reportApi";

const CrossSaleReportSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const {
    data: crossSaleReportData,
    isLoading: crossSaleReportLoading,
    isFetching,
  } = useGetOrderCrossSaleReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const crossSaleReport = crossSaleReportData?.data || [];
  const total = crossSaleReportData?.meta?.total || 0;

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Sale Type",
      dataIndex: "saleType",
      key: "saleType",
      render: (type: string) => (
        <span className="bg-primary/10 text-primary font-semibold px-2 py-1 rounded-[4px] text-[9px]">
          {type}
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
        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          ৳{val?.toLocaleString()}
        </span>
      ),
    },
  ];

  const printableData = crossSaleReport.map((item: any, index: number) => ({
    "#": (page - 1) * limit + index + 1,
    "Sale Type": item.saleType,
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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-none">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">
            Cross Sale Report
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
              fileName="Cross-Sale-Report"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0 bg-transparent border-none">
          <DataTable
            columns={columns}
            data={crossSaleReport}
            loading={crossSaleReportLoading || isFetching}
            isPaginate={total > 10}
            total={total}
            rowKey="saleType"
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

export default CrossSaleReportSubTab;
