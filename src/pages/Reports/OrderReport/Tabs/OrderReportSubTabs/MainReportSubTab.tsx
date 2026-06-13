import React, { useState, useRef } from "react";
import { Input, Tooltip } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables";

import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { useGetOrderMainListQuery } from "../../../../../redux/features/report/reportApi";
import { CurrencyIcon } from "../../../../../utils/currency";
import MainReportSkeleton from "./MainReportSkeleton";
import { debounce } from "../../../../../utils/debounce";

const MainReportSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const searchInput = useRef(null);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  // Debounce search
  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchValue(value);
      setPage(1);
    }, 500)
  ).current;

  const queryParams = [
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(searchValue && [{ name: "search", value: searchValue }] ),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ];

  const {
    data: mainReportData,
    isLoading,
    isFetching,
  } = useGetOrderMainListQuery(queryParams);

  if (isLoading) {
    return <MainReportSkeleton />;
  }

  const mainReportList = mainReportData?.data || [];
  const meta = mainReportData?.meta || { total: 0 };

  const activeTab = "Main Report";

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debounceSearch(e.target.value);
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (invoice: string) => (
        <span className="font-bold text-gray-800">{invoice}</span>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (record: any) => (
        <div>
          <div className="font-semibold text-gray-800 whitespace-nowrap">
            {record.customer?.name}
          </div>
          <div className="text-gray-500 text-xs whitespace-nowrap">
            {record.customer?.phone}
          </div>
        </div>
      ),
    },
    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      render: (products: string[]) => {
        if (!products || products.length === 0) return null;
        const displayLimit = 2;
        const hasMore = products.length > displayLimit;

        return (
          <Tooltip
            title={
              <div className="flex flex-col gap-1.5 p-1 max-h-60 overflow-y-auto">
                {products.map((p, i) => (
                  <div
                    key={i}
                    className="text-[11px] py-1 border-b border-white/10 last:border-0 whitespace-pre-wrap"
                  >
                    {p}
                  </div>
                ))}
              </div>
            }
            overlayInnerStyle={{
              backgroundColor: "#1f2937",
              borderRadius: "8px",
              width: "max-content",
              maxWidth: "400px",
            }}
          >
            <div className="flex flex-col gap-1 text-[11px] max-w-xs cursor-help">
              {products.slice(0, displayLimit).map((p, i) => (
                <span
                  key={i}
                  className="text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 truncate"
                >
                  {p}
                </span>
              ))}
              {hasMore && (
                <span className="text-primary font-bold text-[10px]">
                  + {products.length - displayLimit} more products...
                </span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className="px-2 py-1 rounded-sm text-[10px] font-semibold bg-gray-100 border border-gray-200 text-gray-600 capitalize whitespace-nowrap">
          {status?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      title: "Product Amount",
      dataIndex: "productAmount",
      key: "productAmount",
      render: (val: number) => (
        <span className="flex items-center gap-1">
          <CurrencyIcon />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (val: number) => (
        <span className="flex items-center gap-1">
          <CurrencyIcon />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Collected",
      dataIndex: "collected",
      key: "collected",
      render: (val: number) => (
        <span className="flex items-center gap-1">
          <CurrencyIcon />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Delivery Charge",
      dataIndex: "deliveryCharge",
      key: "deliveryCharge",
      render: (val: number) => (
        <span className="flex items-center gap-1">
          <CurrencyIcon />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (val: number) => (
        <span className="font-bold text-gray-800 flex items-center gap-1">
          <CurrencyIcon />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span className="text-gray-600 whitespace-nowrap">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      render: (val: string) => (
        <span className="text-gray-500 text-xs whitespace-nowrap">{val}</span>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (val: string) => (
        <span className="text-gray-600 uppercase text-[10px] font-semibold tracking-wider whitespace-nowrap">
          {val}
        </span>
      ),
    },
  ];

  const printableData = mainReportList.map((item: any, index: number) => ({
    "#": (page - 1) * limit + index + 1,
    Invoice: item.invoice,
    Customer: item.customer?.name,
    Phone: item.customer?.phone,
    Status: item.status,
    "Product Amount": item.productAmount,
    Discount: item.discount,
    Collected: item.collected,
    "Delivery Charge": item.deliveryCharge,
    Total: item.total,
    Date: new Date(item.date).toLocaleDateString(),
    Method: item.method,
    Source: item.source,
    "Taken By": item.takenBy,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-outfit">
      {/* Filter & Action Bar */}
      <div className="no-print">
        <div className="my-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4 flex-1 min-w-[300px]">
            <Input
              ref={searchInput}
              placeholder={`Search ${activeTab}...`}
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={inputValue}
              onChange={handleSearch}
              allowClear
              className="max-w-md rounded-lg"
              size="middle"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <CustomDatePicker
                onChange={(dates) => {
                  setDateRange(dates);
                  setPage(1);
                }}
                selectedData={dateRange}
              />
            </div>
            <PageListPrint
              tableData={printableData}
              fileName="Main-Order-Report"
            />

            <FilterColumn
              tableName="main_report_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
          </div>
        </div>
      </div>

      <DataTable
        loading={isLoading || isFetching}
        data={mainReportList}
        columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
        rowKey="id"
        isPaginate={meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={meta?.total > 10}
        total={meta?.total || 0}
      />
    </div>
  );
};

export default MainReportSubTab;
