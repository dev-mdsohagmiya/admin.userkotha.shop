import React, { useState, useMemo, useRef, useEffect } from "react";
import { Input, Tooltip } from "antd";
import type { InputRef } from "antd";
import { Search, ShoppingCart } from "lucide-react";
import {
  FiShoppingBag,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiRotateCcw,
  FiTrendingUp,
} from "react-icons/fi";
import { TbCoinTaka } from "react-icons/tb";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { DataTable } from "../../../../components/common/Tables";
import FilterColumn from "../../../../components/common/FilterColumn/FilterColumn";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "../../../../utils/debounce";
import {
  useGetProductListReportQuery,
} from "../../../../redux/features/report/reportApi";
import { config } from "../../../../config";
import { formatCurrency } from "../../../../utils/currency";

const ProductStatusTab = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
   [null, null]
  );
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);

  const searchInput = useRef<InputRef | null>(null);

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const { data: reportData, isFetching: isLoading } = useGetProductListReportQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    dateRange[0] && { name: "startDate", value: dateRange[0]  },
   dateRange[1] && { name: "endDate", value: dateRange[1]  },
   searchText && { name: "search", value: searchText },
  ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const reportSummary = useMemo(() => reportData?.summary, [reportData]);
  const meta = useMemo(() => reportData?.meta, [reportData]);

  const printableProductStatus = useMemo(() => {
    return reportList.map((item: any, index: number) => ({
      SL: index + 1 + (page - 1) * limit,
      Name: item.name,
      SKU: item.sku,
      "Total Money": item.totalMoney,
      Discount: item.discountGiven,
      Profit: item.profit,
      "Current Stock": item.currentStock,
      Total: item.totalOrders,
      Delivered: `${item.delivered.count} (${item.delivered.percentage})`,
      Returned: `${item.returned.count} (${item.returned.percentage})`,
      Pending: `${item.pending.count} (${item.pending.percentage})`,
      RTS: `${item.rts.count} (${item.rts.percentage})`,
      Shipped: `${item.shipped.count} (${item.shipped.percentage})`,
      Preorder: `${item.preorder.count} (${item.preorder.percentage})`,
    }));
  }, [reportList, page, limit]);

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div>
        <Input
          ref={searchInput}
          placeholder="Search product by name..."
          prefix={<Search className="w-4 h-4  text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Name">
        <SearchOutlined
          className={`!rounded-full !bg-transparent 
          ${
            filtered ? "!bg-green-100 !text-green-600" : "!bg-gray-100 "
          } cursor-pointer`}
        />
      </Tooltip>
    ),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
  });

  const summaryCards = useMemo(() => [
    {
      label: "TOTAL ORDERS",
      value: reportSummary?.totalOrders || 0,
      color: "purple",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: "TOTAL MONEY",
      value: `৳ ${formatCurrency(reportSummary?.totalMoney || 0)}`,
      color: "indigo",
      icon: <TbCoinTaka className="w-5 h-5" />,
    },
    {
      label: "DISCOUNT GIVEN",
      value: `৳ ${formatCurrency(reportSummary?.webDiscount || 0)}`,
      color: "orange",
      icon: <FiTrendingUp className="w-5 h-5" />,
    },
    {
      label: "PENDING",
      value: `${reportSummary?.pending?.count || 0} (${reportSummary?.pending?.percentage || "0.0%"})`,
      color: "blue",
      icon: <FiClock className="w-5 h-5" />,
    },
    {
      label: "RTS",
      value: `${reportSummary?.rts?.count || 0} (${reportSummary?.rts?.percentage || "0.0%"})`,
      color: "cyan",
      icon: <FiTruck className="w-5 h-5" />,
    },
    {
      label: "SHIPPED",
      value: `${reportSummary?.shipped?.count || 0} (${reportSummary?.shipped?.percentage || "0.0%"})`,
      color: "yellow",
      icon: <FiTruck className="w-5 h-5" />,
    },
    {
      label: "DELIVERED",
      value: `${reportSummary?.delivered?.count || 0} (${reportSummary?.delivered?.percentage || "0.0%"})`,
      color: "green",
      icon: <FiCheckCircle className="w-5 h-5" />,
    },
    {
      label: "RETURNED",
      value: `${reportSummary?.returned?.count || 0} (${reportSummary?.returned?.percentage || "0.0%"})`,
      color: "red",
      icon: <FiRotateCcw className="w-5 h-5" />,
    },
    {
      label: "PREORDER",
      value: `${reportSummary?.preorder?.count || 0} (${reportSummary?.preorder?.percentage || "0.0%"})`,
      color: "primary",
      icon: <FiShoppingBag className="w-5 h-5" />,
    },
  ], [reportSummary]);

  const columns = useMemo(
    () => [
      {
        title: "SL",
        dataIndex: "id",
        key: "id",
        width: 50,
        render: (_: string, __: any, index: number) => (
          <span className="text-[11px] font-medium text-gray-400">
            {index + 1 + (page - 1) * limit}
          </span>
        ),
      },
      {
        title: "IMAGE",
        dataIndex: "image",
        key: "image",
        width: 70,
        render: (img: string) => {
          const imageUrl = img
            ? `${config.image_access_url.replace(/\/$/, "")}/${img.replace(/^\//, "")}`
            : null;
          return (
            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center border border-gray-100 p-1 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="product"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <ShoppingCart className="w-5 h-5 text-gray-300" />
              )}
            </div>
          );
        },
      },
      {
        title: "NAME",
        key: "name_sku",
        ...getNameColumnSearchProps(),
        render: (_: any, record: any) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
              {record.name}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase transition-all">
              {record.sku}
            </span>
          </div>
        ),
      },
      {
        title: "TOTAL MONEY",
        dataIndex: "totalMoney",
        key: "totalMoney",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold font-outfit">
            ৳ {formatCurrency(val)}
          </span>
        ),
      },
      {
        title: "DISCOUNT",
        dataIndex: "discountGiven",
        key: "discountGiven",
        align: "center" as const,
        render: (val: number) => (
          <span className="text-xs text-gray-400 font-medium">
            ৳ {formatCurrency(val)}
          </span>
        ),
      },
      {
        title: "CURRENT STOCK",
        dataIndex: "currentStock",
        key: "currentStock",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span
            className={`text-xs font-bold ${val < 0 ? "text-red-500" : "text-gray-800"}`}
          >
            {val}
          </span>
        ),
      },
      {
        title: "TOTAL",
        dataIndex: "totalOrders",
        key: "totalOrders",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold">{val}</span>
        ),
      },
      {
        title: "DELIVERED",
        key: "delivered",
        align: "center" as const,
        sorter: true,
        render: (_: any, record: any) => (
          <span className="text-xs font-bold text-green-600">
            {record.delivered.count} ({record.delivered.percentage})
          </span>
        ),
      },
      {
        title: "RETURNED",
        key: "returned",
        align: "center" as const,
        sorter: true,
        render: (_: any, record: any) => (
          <span className="text-xs font-bold text-rose-600">
            {record.returned.count} ({record.returned.percentage})
          </span>
        ),
      },
      {
        title: "PENDING",
        key: "pending",
        align: "center" as const,
        sorter: true,
        render: (_: any, record: any) => (
          <span className="text-xs font-bold text-blue-600">
            {record.pending.count} ({record.pending.percentage})
          </span>
        ),
      },
      {
        title: "RTS",
        key: "rts",
        align: "center" as const,
        sorter: true,
        render: (_: any, record: any) => (
          <span className="text-xs font-bold text-cyan-600">
            {record.rts.count} ({record.rts.percentage})
          </span>
        ),
      },
      {
        title: "SHIPPED",
        key: "shipped",
        align: "center" as const,
        sorter: true,
        render: (_: any, record: any) => (
          <span className="text-xs font-bold text-amber-600">
            {record.shipped.count} ({record.shipped.percentage})
          </span>
        ),
      },
      {
        title: "PREORDER",
        key: "preorder",
        align: "center" as const,
        sorter: true,
        render: (_: any, record: any) => (
          <span className="text-xs font-bold text-gray-400">
            {record.preorder.count} ({record.preorder.percentage})
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit],
  );

  // Initialize selectedColumnKeys with all column keys on mount
  useEffect(() => {
    setSelectedColumnKeys(columns.map((col) => col.key as string));
  }, [columns]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Product Status Report
            </h2>
            <p className="text-xs text-gray-500">
              This report shows the status of the products in the system.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <CustomDatePicker
                selectedData={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </div>
            <div>
              <PageListPrint
                tableData={printableProductStatus}
                fileName="Product-status-list"
              />
            </div>
            <div>
              <FilterColumn
                tableName="product_status_report"
                columns={columns}
                onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 space-y-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {summaryCards.slice(0, 4).map((card, i) => (
              <PageHeaderCard
                key={i}
                title={card.label}
                value={card.value}
                color={card.color as any}
                icon={card.icon}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 mt-4 lg:grid-cols-5 gap-4">
            {summaryCards.slice(4).map((card, i) => (
              <PageHeaderCard
                key={i}
                title={card.label}
                value={card.value}
                color={card.color as any}
                icon={card.icon}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div>
        {/* Data Table */}
        <DataTable
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key as string))}
          data={reportList}
          loading={isLoading}
          isPaginate={true}
          total={meta?.total || 0}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          setLimit={setLimit}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default ProductStatusTab;
