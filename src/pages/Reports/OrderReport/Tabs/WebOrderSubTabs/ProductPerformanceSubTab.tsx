import { useState, useRef, useMemo } from "react";
import { FiBox, FiShoppingBag, FiSearch, FiChevronDown } from "react-icons/fi";
import { DataTable } from "../../../../../components/common/Tables";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { Dropdown, Menu, Input, Badge } from "antd";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn";
import { debounce } from "../../../../../utils/debounce";
import CustomActionButton from "../../../../../components/common/Button/CustomActionButton";
import { Tabs } from "antd";

import { useGetProductPerformanceQuery } from "../../../../../redux/features/report/reportApi";

interface ProductPerformanceSubTabProps {
  dateRange: [string | null, string | null];
}

const ProductPerformanceSubTab = ({
  dateRange,
}: ProductPerformanceSubTabProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState("TOTAL");

  const {
    data: performanceData,
    isLoading,
    isFetching,
  } = useGetProductPerformanceQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    { name: "startDate", value: dateRange[0] },
    { name: "endDate", value: dateRange[1] },
    { name: "status", value: activeStatus !== "ALL" ? activeStatus : "" },
    { name: "search", value: searchText },
  ]);

  const productsData = useMemo(
    () => performanceData?.data?.products || [],
    [performanceData],
  );
  const confirmedProducts = useMemo(
    () => performanceData?.data?.confirmedProducts || [],
    [performanceData],
  );
  const cancelledProducts = useMemo(
    () => performanceData?.data?.cancelledProducts || [],
    [performanceData],
  );

  const totalProducts =
    performanceData?.meta?.total || performanceData?.data?.totalProducts || 0;
  const totalOrders = performanceData?.data?.totalOrders || 0;
  const totalRevenue = performanceData?.data?.totalRevenue || 0;

  const currentTableData = useMemo(() => {
    if (activeTab === "CONFIRMED") return confirmedProducts;
    if (activeTab === "CANCELLED") return cancelledProducts;
    return productsData;
  }, [activeTab, productsData, confirmedProducts, cancelledProducts]);

  const currentTotal = useMemo(() => {
    if (activeTab === "CONFIRMED") return confirmedProducts.length;
    if (activeTab === "CANCELLED") return cancelledProducts.length;
    return totalProducts;
  }, [activeTab, totalProducts, confirmedProducts, cancelledProducts]);

  const statusOptions = [
    { key: "ALL", label: "All Status" },
    { key: "PENDING", label: "Pending" },
    { key: "PROCESSING", label: "Processing" },
    { key: "HOLD", label: "Hold" },
    { key: "GOOD_BUT_NO_RESPONSE", label: "Good But No Response" },
    { key: "NO_RESPONSE", label: "No Response" },
    { key: "ADVANCE_REQUIRED", label: "Advance Payment" },
    { key: "CONFIRM", label: "Approved" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value);
  };

  const statusMenu = (
    <Menu
      onClick={({ key }) => setActiveStatus(key)}
      selectedKeys={[activeStatus]}
    >
      {statusOptions.map((opt) => (
        <Menu.Item key={opt.key}>{opt.label}</Menu.Item>
      ))}
    </Menu>
  );

  const allColumns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {name}
          </span>
          {record.top && (
            <span className="text-[9px] font-bold text-primary uppercase mt-0.5">
              {record.top}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      align: "center" as const,
      render: (val: string) => (
        <span className="text-xs font-medium text-gray-400">{val}</span>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
      render: (val: number) => (
        <div className="flex items-center justify-center gap-1">
          <span className="font-bold text-gray-800 dark:text-white">{val}</span>
          <span className="text-[10px] text-gray-400">orders</span>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (val: number) => (
        <div className="flex items-center justify-center gap-1">
          <span className="font-bold text-gray-800 dark:text-white">{val}</span>
          <span className="text-[10px] text-gray-400">items</span>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (val: string) => (
        <span className="font-black text-gray-900 dark:text-white">{val}</span>
      ),
    },
  ];

  const columns = allColumns.filter(
    (col) =>
      selectedColumnKeys.length === 0 || selectedColumnKeys.includes(col.key),
  );

  return (
    <div className="space-y-4 font-outfit">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-3 gap-y-0">
        <PageHeaderCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={<FiBox />}
          color="primary"
        />
        <PageHeaderCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<FiShoppingBag />}
          color="green"
        />
        <PageHeaderCard
          title="Total Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          icon={<span className="text-xl">৳</span>}
          color="blue"
        />
      </div>

      {/* Product Table Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-none overflow-hidden">
        {/* Tabs Section */}
        <div className="px-4 border-b border-gray-100 dark:border-gray-800">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="product-performance-tabs"
            items={[
              {
                key: "TOTAL",
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <span>Total Orders</span>
                    <Badge
                      count={totalProducts}
                      showZero
                      overflowCount={9999}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-500"
                      style={{
                        backgroundColor:
                          activeTab === "TOTAL" ? "#1BA143" : "#f5f5f5",
                        color: activeTab === "TOTAL" ? "#fff" : "#999",
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "CONFIRMED",
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <span>Confirmed Orders</span>
                    <Badge
                      count={confirmedProducts.length}
                      showZero
                      style={{
                        backgroundColor:
                          activeTab === "CONFIRMED" ? "#1BA143" : "#f5f5f5",
                        color: activeTab === "CONFIRMED" ? "#fff" : "#999",
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "CANCELLED",
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <span>Cancelled Orders</span>
                    <Badge
                      count={cancelledProducts.length}
                      showZero
                      style={{
                        backgroundColor:
                          activeTab === "CANCELLED" ? "#ff4d4f" : "#f5f5f5",
                        color: activeTab === "CANCELLED" ? "#fff" : "#999",
                      }}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Table Filter Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 flex-1 min-w-[300px]">
            <Input
              placeholder="Search products..."
              prefix={<FiSearch className="text-gray-400 text-xs" />}
              onChange={handleSearch}
              allowClear
              className="max-w-md rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3">
            <Dropdown overlay={statusMenu} trigger={["click"]}>
              <CustomActionButton
                text={
                  statusOptions.find((opt) => opt.key === activeStatus)?.label
                }
                icon2={<FiChevronDown />}
              />
            </Dropdown>

            <FilterColumn
              tableName="product_performance_table"
              columns={allColumns.map((col) => ({
                key: col.key,
                title: col.title,
              }))}
              onChangeSelectedKeys={setSelectedColumnKeys}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="p-0 border-none">
          <DataTable
            columns={columns}
            data={currentTableData}
            loading={isLoading || isFetching}
            isPaginate={activeTab === "TOTAL"}
            total={currentTotal}
            currentPage={page}
            limit={limit}
            setCurrentPage={setPage}
            setLimit={setLimit}
            className="border-none shadow-none"
            showSizeChanger={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceSubTab;
