import React, { useState, useMemo, useRef, useEffect } from "react";
import { Input, Tooltip } from "antd";
import type { InputRef } from "antd";
import { Search, Info } from "lucide-react";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { TbCoinTaka } from "react-icons/tb";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { DataTable } from "../../../../../components/common/Tables";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "../../../../../utils/debounce";
import { useGetProductInventoryListReportQuery } from "../../../../../redux/features/report/reportApi";
import { config } from "../../../../../config";
import { formatCurrency } from "../../../../../utils/currency";

const ProductInventoryTab = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  const searchInput = useRef<InputRef | null>(null);

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // Fetch Inventory Data
  const { data: reportData, isFetching: isLoading } = useGetProductInventoryListReportQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    searchText && { name: "search", value: searchText },
  ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const summary = useMemo(() => reportData?.summary, [reportData]);
  const meta = useMemo(() => reportData?.meta, [reportData]);

  const printableData = useMemo(() => {
    return reportList.map((item: any, index: number) => ({
      SL: index + 1 + (page - 1) * limit,
      SKU: item.sku,
      "Product Name": item.productName,
      "Stock Quantity": item.stockQuantity,
      "Cost Price": `৳ ${formatCurrency(item.costPrice)}`,
      "Selling Price": `৳ ${formatCurrency(item.sellingPrice)}`,
      "Total Cost Value": `৳ ${formatCurrency(item.totalCostValue)}`,
    }));
  }, [reportList, page, limit]);

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div className="p-2">
        <Input
          ref={searchInput}
          placeholder="Search product..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
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

  const columns = useMemo(
    () => [
      {
        title: "SL",
        key: "id",
        width: 50,
        render: (_: any, __: any, index: number) => (
          <span className="text-[11px] font-medium text-gray-400">
            {index + 1 + (page - 1) * limit}
          </span>
        ),
      },
      {
        title: "Image",
        dataIndex: "image",
        key: "image",
        width: 70,
        render: (img: string) => {
          const imageUrl = img
            ? `${config.image_access_url.replace(/\/$/, "")}/${img.replace(/^\//, "")}`
            : null;
          return (
            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800/50 rounded flex items-center justify-center border border-gray-100 dark:border-gray-700 p-1 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="product"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <FiPackage className="text-gray-300 w-5 h-5" />
              )}
            </div>
          );
        },
      },
      {
        title: "SKU",
        dataIndex: "sku",
        key: "sku",
        width: 120,
        render: (sku: string) => (
          <span className="text-[11px] font-bold text-gray-400 uppercase">
            {sku}
          </span>
        ),
      },
      {
        title: "Product Name",
        dataIndex: "productName",
        key: "productName",
        ...getNameColumnSearchProps(),
        render: (name: string) => (
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
            {name}
          </span>
        ),
      },
      {
        title: "Stock Quantity",
        dataIndex: "stockQuantity",
        key: "stockQuantity",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className={`text-xs font-bold ${val <= 10 ? "text-red-500" : "text-gray-600 dark:text-gray-400"}`}>
            {val}
          </span>
        ),
      },
      {
        title: "Cost Price",
        dataIndex: "costPrice",
        key: "costPrice",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            ৳ {formatCurrency(val)}
          </span>
        ),
      },
      {
        title: "Selling Price",
        dataIndex: "sellingPrice",
        key: "sellingPrice",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            ৳ {formatCurrency(val)}
          </span>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-1">
            Total Cost Value
            <Tooltip title="Total stock quantity * cost price">
              <Info className="w-3 h-3 text-gray-400" />
            </Tooltip>
          </div>
        ),
        dataIndex: "totalCostValue",
        key: "totalCostValue",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            ৳ {formatCurrency(val)}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit],
  );

  useEffect(() => {
    setSelectedColumnKeys(columns.map((col) => col.key as string));
  }, [columns]);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Inventory Report
            </h2>
            <p className="text-xs text-gray-500">
              Total summary of your product stock and values.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-xs">
              <Input
                placeholder="Search product.."
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                onChange={(e) => debounceSearch(e.target.value)}
                size="middle"
                allowClear
                className="w-full"
              />
            </div>
            <PageListPrint
              tableData={printableData}
              fileName="Inventory-Report"
            />
            <FilterColumn
              tableName="inventory_report"
              columns={columns as any}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <PageHeaderCard
            title="Total In-Stock Products"
            value={summary?.totalInStockProducts?.toLocaleString() || "0"}
            color="blue"
            icon={<FiPackage className="w-5 h-5" />}
          />
          <PageHeaderCard
            title="Total Cost Value"
            value={`৳ ${formatCurrency(summary?.totalCostValue || 0)}`}
            color="green"
            icon={<TbCoinTaka className="w-5 h-5" />}
          />
          <PageHeaderCard
            title="Total Selling Value"
            value={`৳ ${formatCurrency(summary?.totalSellingValue || 0)}`}
            color="yellow"
            icon={<FiShoppingBag className="w-5 h-5" />}
          />
        </div>
      </div>

      <div>
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
          rowKey="sku"
        />
      </div>
    </>
  );
};

export default ProductInventoryTab;
