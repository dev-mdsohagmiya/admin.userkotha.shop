import React, { useState, useRef } from "react";
import { Input, Tag } from "antd";
import { Search } from "lucide-react";
import { FiLayers } from "react-icons/fi";
import { TbCoinTaka } from "react-icons/tb";
import { DataTable } from "../../../../../components/common/Tables";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { useGetOrderAdvanceListQuery } from "../../../../../redux/features/report/reportApi";
import { CurrencyIcon } from "../../../../../utils/currency";
import { debounce } from "../../../../../utils/debounce";
import AdvanceReportSkeleton from "./AdvanceReportSkeleton";

const AdvanceReportSubTab = () => {
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
    ...(searchValue ? [{ name: "search", value: searchValue }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ];

  const {
    data: advanceData,
    isLoading,
    isFetching,
  } = useGetOrderAdvanceListQuery(queryParams);

  if (isLoading) {
    return <AdvanceReportSkeleton />;
  }

  const advanceList = advanceData?.data || [];
  const meta = advanceData?.meta || { total: 0 };
  const summary = advanceData?.summary;

  // Summary cards
  const stats = [
    {
      title: "Total Rows",
      value: summary?.totalRows?.toLocaleString() || "0",
      color: "cyan" as const,
      icon: <FiLayers />,
      subtitle: "Total advance entries",
    },
    {
      title: "Total Advance",
      value: (
        <span className="flex items-center gap-1">
          {summary?.totalAdvance?.toLocaleString() || "0"}
        </span>
      ),
      color: "green" as const,
      icon: <TbCoinTaka />,
      subtitle: "Total advance collected",
    },
    {
      title: "Total Order Amount",
      value: (
        <span className="flex items-center gap-1">
          {summary?.totalOrderAmount?.toLocaleString() || "0"}
        </span>
      ),
      color: "purple" as const,
      icon: <CurrencyIcon />,
      subtitle: "Total order value",
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debounceSearch(e.target.value);
  };

  const columns = [
    {
      title: "SL",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      width: 120,
      render: (invoice: string) => (
        <span className="font-bold text-primary dark:text-blue-400">
          {invoice}
        </span>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      width: 130,
      render: (orderId: string) => (
        <span className="text-gray-500 text-xs font-mono">{orderId?.slice(-8).toUpperCase()}</span>
      ),
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customerName",
      width: 150,
      render: (name: string) => (
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {name}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: ["customer", "phone"],
      key: "customerPhone",
      width: 130,
      render: (phone: string) => (
        <span className="text-gray-600 dark:text-gray-400">
          {phone}
        </span>
      ),
    },
    {
      title: "Advance",
      dataIndex: "advance",
      key: "advance",
      width: 120,
      render: (val: number) => (
        <span className="font-bold text-green-600 flex items-center gap-1">
          <CurrencyIcon />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Order Amount",
      dataIndex: "orderAmount",
      key: "orderAmount",
      width: 130,
      render: (val: number) => (
        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
          <CurrencyIcon />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Payment Source",
      dataIndex: "paymentSource",
      key: "paymentSource",
      width: 140,
      render: (val: string) => (
        <Tag color="#ff3d0a" className="rounded-full px-3 py-0 text-[10px] font-bold">
          {val?.replace(/_/g, " ")?.replace(/-/g, " ")}
        </Tag>
      ),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 150,
      render: (val: string) => (
        <span className="text-gray-500 text-xs font-mono bg-gray-50 dark:bg-gray-800 px-1 rounded border">
          {val || "-"}
        </span>
      ),
    },
    {
      title: "Collected By",
      dataIndex: "collectedBy",
      key: "collectedBy",
      width: 140,
      render: (val: string) => (
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap italic text-xs">
          {val}
        </span>
      ),
    },
    {
      title: "Collection Date",
      dataIndex: "collectionDate",
      key: "collectionDate",
      width: 160,
      render: (date: string) => (
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <br />
          <span className="text-[10px] text-gray-400 font-mono">
            {new Date(date).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </span>
      ),
    },
    {
      title: "Order Source",
      dataIndex: "orderSource",
      key: "orderSource",
      width: 120,
      render: (val: string) => (
        <span className="text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          {val}
        </span>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 120,
      render: (status: string) => {
        const color = status === "CONFIRM" ? "success" : status === "CANCEL" ? "error" : "processing";
        return (
          <Tag color={color} className="capitalize text-[10px] font-bold">
            {status?.toLowerCase()?.replace(/_/g, " ")}
          </Tag>
        );
      }
    },
    {
      title: "Taken By",
      dataIndex: "takenBy",
      key: "takenBy",
      width: 130,
      render: (val: string) => (
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
          {val}
        </span>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date: string) => (
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  const printableData = advanceList.map((item: any, index: number) => ({
    "SL": (page - 1) * limit + index + 1,
    Invoice: item.invoice,
    "Order ID": item.orderId,
    Customer: item.customer?.name,
    Phone: item.customer?.phone,
    Advance: item.advance,
    "Order Amount": item.orderAmount,
    "Payment Source": item.paymentSource,
    "Transaction ID": item.transactionId,
    "Collected By": item.collectedBy,
    "Collection Date": new Date(item.collectionDate).toLocaleString(),
    "Order Source": item.orderSource,
    "Order Status": item.orderStatus,
    "Taken By": item.takenBy,
    "Order Date": new Date(item.orderDate).toLocaleDateString(),
  }));

  return (
    <div className="space-y-4 animate-in fade-in duration-700 font-outfit">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <PageHeaderCard
            key={idx}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            icon={stat.icon}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* 2. Filter & Action Bar */}
      <div className="no-print">
        <div className="my-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4 flex-1 min-w-[300px]">
            <Input
              ref={searchInput}
              placeholder="Search by invoice, customer name or phone..."
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
              fileName="Advance-Report"
            />

            <FilterColumn
              tableName="advance_report_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
          </div>
        </div>
      </div>

      {/* 3. Data Table */}
      <DataTable
        loading={isLoading || isFetching}
        data={advanceList}
        columns={columns.filter((c) => selectedColumnKeys.length === 0 || selectedColumnKeys.includes(c.key))}
        rowKey="id"
        isPaginate={meta?.total > limit}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={meta?.total > limit}
        total={meta?.total || 0}
      />
    </div>
  );
};

export default AdvanceReportSubTab;
