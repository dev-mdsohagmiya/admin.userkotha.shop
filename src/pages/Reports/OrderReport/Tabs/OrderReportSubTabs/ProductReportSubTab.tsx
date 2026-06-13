import React, { useState, useRef } from "react";
import { Input } from "antd";
import {
  FiShoppingBag,
  FiTruck,
  FiTrendingUp,
  FiPieChart,
  FiXCircle,
} from "react-icons/fi";
import { Search, ShoppingCart } from "lucide-react";
import { TbCoinTaka } from "react-icons/tb";
import { DataTable } from "../../../../../components/common/Tables";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { useGetOrderListQuery } from "../../../../../redux/features/report/reportApi";
import { debounce } from "../../../../../utils/debounce";
import ProductReportSkeleton from "./ProductReportSkeleton";

const ProductReportSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Debounce search
  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchValue(value);
      setPage(1);
    }, 500),
  ).current;

  // Build query params
  const queryParams = [
    { name: "page", value: String(page) },
    { name: "limit", value: String(limit) },
    ...(searchValue && [{ name: "search", value: searchValue }]),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ];

  const { data: orderListData, isLoading } = useGetOrderListQuery(queryParams);

  if (isLoading) {
    return <ProductReportSkeleton />;
  }

  const orderList = orderListData?.data || [];
  const orderMeta = orderListData?.meta;
  const orderSummery = orderListData?.summary;
  const topBestSellers = orderSummery?.topBestSellers || [];
  const highestReturnProducts = orderSummery?.highestReturnProducts || [];

  // Dynamic summary cards from API
  const stats = [
    {
      title: "Total Products",
      value: orderSummery?.totalProducts?.toLocaleString() || "0",
      color: "cyan" as const,
      icon: <FiShoppingBag />,
      subtitle: "Active products",
    },
    {
      title: "Total Revenue",
      value: `৳${orderSummery?.totalRevenue?.toLocaleString() || "0"}`,
      color: "green" as const,
      icon: <TbCoinTaka />,
      subtitle: `Total earned revenue`,
    },
    {
      title: "Cancelled",
      value: orderSummery?.cancelledOrders?.count?.toLocaleString() || "0",
      color: "red" as const,
      icon: <FiXCircle />,
      subtitle: `৳${orderSummery?.cancelledOrders?.amount?.toLocaleString() || "0"} cancelled amount`,
    },
    {
      title: "Units Sold",
      value: orderSummery?.unitsSold?.total?.toLocaleString() || "0",
      color: "purple" as const,
      icon: <ShoppingCart className="w-4 h-4" />,
      subtitle: `${orderSummery?.unitsSold?.delivered || 0} delivered`,
    },
    {
      title: "Delivery Rate",
      value: `${orderSummery?.delivery?.rate || 0}%`,
      color: "orange" as const,
      icon: <FiTruck />,
      subtitle: `${orderSummery?.delivery?.pending || 0} pending`,
    },
  ];

  // Map API data to table format
  const tableData = orderList.map((item: any, index: number) => ({
    rank: (page - 1) * limit + index + 1,
    id: item.id,
    name: item.name?.trim(),
    sku: item.sku,
    orders: item.orderCount || 0,
    qty: item.qty || 0,
    revenue: item.revenue || 0,
    delivery: `${item.deliveryRate || 0}%`,
    image: item.image,
    deliveredOrders: item.deliveredOrders || 0,
    returns: item.returns || 0,
  }));

  // Printable data from real API data
  const printableData = tableData.map((item: any) => ({
    Rank: item.rank,
    Product: item.name,
    SKU: item.sku,
    Orders: item.orders,
    Qty: item.qty,
    Revenue: `৳${item.revenue.toLocaleString()}`,
    Delivery: item.delivery,
  }));

  const columns = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 50,
      render: (rank: number) => (
        <span className="text-gray-400 font-medium">{rank}</span>
      ),
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center p-1 border border-gray-100">
            <img
              src={record.image}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
              {name}
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              {record.sku}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
      render: (o: number) => (
        <span className="text-[12px] font-semibold">{o}</span>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      align: "center" as const,
      render: (q: number) => (
        <span className="text-[12px] font-semibold">{q}</span>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (val: number) => (
        <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200">
          ৳{val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "statuses",
      key: "statuses",
      width: 200,
      render: (_: any, record: any) => {
        const deliveryRate = parseInt(record.delivery) || 0;
        const isFull = deliveryRate === 100;
        return (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full ${isFull ? "bg-primary" : "bg-primary"} transition-all duration-500`}
                style={{ width: `${deliveryRate}%` }}
              ></div>
              {!isFull && (
                <div
                  className="h-full bg-secondary opacity-20 transition-all duration-500"
                  style={{ width: `${100 - deliveryRate}%` }}
                ></div>
              )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
              <span className="dark:text-gray-400">{record.orders} total</span>
              <span
                className={`${isFull ? "text-primary" : "text-gray-700 dark:text-gray-300"} font-bold`}
              >
                {deliveryRate}% delivered
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Delivery",
      dataIndex: "delivery",
      key: "delivery",
      align: "right" as const,
      render: (d: string) => (
        <span className="text-[12px] font-bold text-gray-400">{d}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-700 font-outfit">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* 2. Product Performance Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 p-6 rounded-lg shadow-none">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">
              Product Performance
            </h3>
          </div>
        </div>

        {/* Filter Area */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 no-print">
          <div className="flex gap-4 flex-1">
            <Input
              placeholder="Search by product name or SKU..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                debounceSearch(e.target.value);
              }}
              className="max-w-md rounded-lg h-9 text-xs"
              allowClear
            />
          </div>
          <div className="flex gap-3 items-center">
            <CustomDatePicker
              onChange={(dates) => setDateRange(dates)}
              selectedData={dateRange}
            />

            <PageListPrint
              tableData={printableData}
              fileName="Product-Performance-Report"
            />

            <FilterColumn
              tableName="product_performance_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
          </div>
        </div>

        <DataTable
          columns={columns.filter(
            (c) =>
              selectedColumnKeys.length === 0 ||
              selectedColumnKeys.includes(c.key as string),
          )}
          data={tableData}
          loading={isLoading}
          isPaginate={true}
          total={orderMeta?.total || 0}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          setLimit={setLimit}
          rowKey="id"
        />
      </div>

      {/* 3. Analysis Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Best Sellers */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 p-6 rounded-lg shadow-none">
          <h3 className="text-[13px] font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
            Top 5 Best Sellers
          </h3>
          <div className="space-y-4">
            {topBestSellers.length > 0 ? (
              topBestSellers.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-gray-700 dark:text-gray-200">
                        {item.name?.trim()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {item.orders} orders - {item.units} units
                      </span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-gray-800 dark:text-white">
                    ৳{item.revenue?.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-8">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <FiTrendingUp className="text-gray-300 text-2xl" />
                </div>
                <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">
                  No best sellers found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Highest Return Products */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 p-6 rounded-lg shadow-none flex flex-col min-h-[300px]">
          <h3 className="text-[13px] font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
            <FiPieChart className="text-rose-500" /> Highest Return Products
          </h3>
          {highestReturnProducts.length > 0 ? (
            <div className="space-y-4">
              {highestReturnProducts.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 text-[11px] font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-gray-700 dark:text-gray-200">
                        {item.name?.trim()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {item.returns} returns
                      </span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-rose-500">
                    {item.returns} returns
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <FiPieChart className="text-gray-300 text-2xl" />
              </div>
              <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">
                No returns found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReportSubTab;
