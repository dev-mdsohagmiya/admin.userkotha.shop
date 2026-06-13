import React, { useState, useMemo, useRef } from "react";
import { Input, Select, Tooltip } from "antd";
import type { InputRef } from "antd";
import { Search, ShoppingBag } from "lucide-react";
import { SearchOutlined } from "@ant-design/icons";
import { DataTable } from "../../../../components/common/Tables";
import FilterColumn from "../../../../components/common/FilterColumn/FilterColumn";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import { debounce } from "../../../../utils/debounce";
import { useGetProductCustomerPurchaseHistoryReportQuery } from "../../../../redux/features/report/reportApi";
import { useProductListQuery } from "../../../../redux/features/product/productApi";
import { config } from "../../../../config";
import dayjs from "dayjs";

const PurchaseHistory = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const searchInput = useRef<InputRef | null>(null);

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // Build params for the query
  const queryArgs = useMemo(() => {
    const args = [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
    ];
    if (searchText) args.push({ name: "search", value: searchText });
    if (dateRange[0]) args.push({ name: "startDate", value: dateRange[0] });
    if (dateRange[1]) args.push({ name: "endDate", value: dateRange[1] });
    if (selectedProductIds.length > 0) {
      selectedProductIds.forEach((id) => {
        args.push({ name: "productIds", value: id });
      });
    }
    return args;
  }, [page, limit, searchText, dateRange, selectedProductIds]);

  const { data: reportData, isFetching: isLoading } =
    useGetProductCustomerPurchaseHistoryReportQuery(queryArgs);

  const { data: productsData } = useProductListQuery([
    { name: "limit", value: "1000" },
  ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const meta = useMemo(() => reportData?.meta, [reportData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div className="p-2">
        <Input
          ref={searchInput}
          placeholder="Search customer..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Name/Phone">
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
        title: "Customer Name",
        dataIndex: "customerName",
        key: "customerName",
        ...getNameColumnSearchProps(),
        render: (name: string) => (
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            {name}
          </span>
        ),
      },
      {
        title: "Mobile Number",
        dataIndex: "mobileNumber",
        key: "mobileNumber",
        render: (mobile: string) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {mobile}
          </span>
        ),
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
        render: (address: string) => (
          <Tooltip title={address}>
            <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px] cursor-help">
              {address}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Total Purchases",
        dataIndex: "totalPurchases",
        key: "totalPurchases",
        align: "center" as const,
        sorter: (a: any, b: any) => a.totalPurchases - b.totalPurchases,
        render: (total: number) => (
          <span className="text-xs font-bold text-primary">{total}</span>
        ),
      },
      {
        title: "Products",
        dataIndex: "products",
        key: "products",
        width: 320,
        render: (items: any[]) => {
          if (!items || items.length === 0) return null;
          const firstItem = items[0];
          const remainingItems = items.slice(1);

          const firstImageUrl = firstItem.image
            ? `${config.image_access_url.replace(/\/$/, "")}/${firstItem.image.replace(/^\//, "")}`
            : null;

          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700 flex-1">
                <div className="w-10 h-10 flex-shrink-0 bg-white dark:bg-gray-900 rounded overflow-hidden border border-gray-200 dark:border-gray-700 p-0.5">
                  {firstImageUrl ? (
                    <img
                      src={firstImageUrl}
                      alt={firstItem.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 line-clamp-1">
                    {firstItem.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-medium">
                      Qty:{" "}
                      <span className="text-gray-600 dark:text-gray-400 font-bold">
                        {firstItem.quantity}
                      </span>
                    </span>
                    <span className="text-[10px] text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2 font-medium">
                      {dayjs(firstItem.orderDate).format("DD/MM/YY")}
                    </span>
                  </div>
                </div>
              </div>

              {remainingItems.length > 0 && (
                <Tooltip
                  overlayInnerStyle={{ padding: 0 }}
                  title={
                    <div className="bg-white dark:bg-gray-800 rounded-md overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar shadow-xl border border-gray-100 dark:border-gray-700">
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          +{remainingItems.length} More Products
                        </span>
                      </div>
                      <div className="p-2 space-y-2">
                        {remainingItems.map((item, idx) => {
                          const imgUrl = item.image
                            ? `${config.image_access_url.replace(/\/$/, "")}/${item.image.replace(/^\//, "")}`
                            : null;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                            >
                              <div className="w-8 h-8 flex-shrink-0 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-700 p-0.5">
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-3 h-3 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 line-clamp-1">
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-gray-400">
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="text-[9px] text-gray-400">
                                    • {dayjs(item.orderDate).format("DD/MM/YY")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  }
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-help hover:bg-primary hover:text-white transition-all duration-300 group">
                    <span className="text-[10px] font-bold text-primary group-hover:text-white">
                      +{remainingItems.length}
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        title: "Last Purchase Date",
        dataIndex: "lastPurchaseDate",
        key: "lastPurchaseDate",
        align: "center" as const,
        sorter: (a: any, b: any) =>
          dayjs(a.lastPurchaseDate).unix() - dayjs(b.lastPurchaseDate).unix(),
        render: (date: string) => (
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {dayjs(date).format("DD/MM/YY")}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit, products],
  );

  const printableData = useMemo(() => {
    return reportList.map((item: any, index: number) => ({
      SL: index + 1 + (page - 1) * limit,
      "Customer Name": item.customerName,
      "Mobile Number": item.mobileNumber,
      Address: item.address,
      "Total Purchases": item.totalPurchases,
      Products: item.products
        ?.map((p: any) => `${p.name} (Qty: ${p.quantity})`)
        .join(", "),
      "Last Purchase Date": dayjs(item.lastPurchaseDate).format("DD/MM/YY"),
    }));
  }, [reportList, page, limit]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          {/* Left Side: Product Filter */}
          <div className="w-full lg:max-w-sm">
            <Select
              mode="multiple"
              allowClear
              placeholder="Filter by Products"
              maxTagCount="responsive"
              className="w-full"
              onChange={(val) => {
                setSelectedProductIds(val);
                setPage(1);
              }}
              options={products.map((p: any) => ({
                label: p.name,
                value: p.id,
              }))}
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>

          {/* Right Side: Date Picker, Print, Filter Columns */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <CustomDatePicker
                selectedData={dateRange}
                onChange={(dates) => {
                  setDateRange(dates);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <PageListPrint
                tableData={printableData}
                fileName="customer-purchase-history"
              />
            </div>
            <div>
              <FilterColumn
                tableName="customer_purchase_history"
                columns={columns as any}
                onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns.filter((col) =>
            selectedColumnKeys.includes(col.key),
          )}
          data={reportList}
          loading={isLoading}
          total={meta?.total || 0}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          isPaginate={meta?.total > 10 && true}
          setLimit={setLimit}
          rowKey="id"
          selectRow={false}
        />
      </div>
    </div>
  );
};

export default PurchaseHistory;
