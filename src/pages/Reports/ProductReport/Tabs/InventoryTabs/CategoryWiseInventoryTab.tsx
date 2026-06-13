import React, { useState, useMemo, useRef, useEffect } from "react";
import { Input, Tooltip } from "antd";
import type { InputRef } from "antd";
import { Search } from "lucide-react";
import { FiFolder, FiPackage, FiShoppingBag } from "react-icons/fi";
import { TbCoinTaka } from "react-icons/tb";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { DataTable } from "../../../../../components/common/Tables";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "../../../../../utils/debounce";
import { useGetProductInventoryCategoryWiseReportQuery } from "../../../../../redux/features/report/reportApi";
import { formatCurrency } from "../../../../../utils/currency";

const CategoryWiseInventoryTab = () => {
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

  // Fetch Category Wise Inventory Data
  const { data: reportData, isFetching: isLoading } = useGetProductInventoryCategoryWiseReportQuery([
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
      "Category Name": item.categoryName,
      "Products Count": item.productsCount,
      "Total Stock": item.totalStock,
      "Total Cost Value": `৳ ${formatCurrency(item.totalCostValue)}`,
      "Total Sell Value": `৳ ${formatCurrency(item.totalSellValue)}`,
      "Avg Stock/Product": item.avgStockPerProduct,
    }));
  }, [reportList, page, limit]);

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div className="p-2">
        <Input
          ref={searchInput}
          placeholder="Search category..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Category">
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
        title: "Category Name",
        dataIndex: "categoryName",
        key: "categoryName",
        ...getNameColumnSearchProps(),
        render: (name: string) => (
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {name}
          </span>
        ),
      },
      {
        title: "Products Count",
        dataIndex: "productsCount",
        key: "productsCount",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
            {val}
          </span>
        ),
      },
      {
        title: "Total Stock",
        dataIndex: "totalStock",
        key: "totalStock",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
            {val.toLocaleString()}
          </span>
        ),
      },
      {
        title: "Total Cost Value",
        dataIndex: "totalCostValue",
        key: "totalCostValue",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            ৳ {formatCurrency(val)}
          </span>
        ),
      },
      {
        title: "Total Sell Value",
        dataIndex: "totalSellValue",
        key: "totalSellValue",
        align: "center" as const,
        sorter: true,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            ৳ {formatCurrency(val)}
          </span>
        ),
      },
      {
        title: "Avg Stock/Product",
        dataIndex: "avgStockPerProduct",
        key: "avgStockPerProduct",
        align: "center" as const,
        render: (val: number) => (
          <span className="text-xs font-bold text-gray-500">
            {val?.toFixed(1) || 0}
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
              Category-wise Inventory Breakdown
            </h2>
            <p className="text-xs text-gray-500">
              Inventory analysis grouped by product categories.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-xs">
              <Input
                placeholder="Search category.."
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                onChange={(e) => debounceSearch(e.target.value)}
                size="middle"
                allowClear
                className="w-full"
              />
            </div>
            <PageListPrint
              tableData={printableData}
              fileName="Category-Wise-Inventory"
            />
            <FilterColumn
              tableName="category_wise_inventory"
              columns={columns as any}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <PageHeaderCard
            title="Total Categories"
            value={summary?.totalCategories?.toString() || "0"}
            color="purple"
            icon={<FiFolder className="w-5 h-5" />}
          />
          <PageHeaderCard
            title="Total Products"
            value={summary?.totalProducts?.toString() || "0"}
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
            title="Total Sell Value"
            value={`৳ ${formatCurrency(summary?.totalSellValue || 0)}`}
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
          isPaginate={meta?.total > limit}
          total={meta?.total || 0}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          setLimit={setLimit}
          rowKey="id"
        />
      </div>
    </>
  );
};

export default CategoryWiseInventoryTab;
