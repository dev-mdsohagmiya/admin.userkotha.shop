import { useState } from "react";
import { Select, Progress, Tag, Empty } from "antd";
import { ShoppingCart, Package, Clock } from "lucide-react";
import {
  DeliveryReturnTrend,
  ProductSalesChart,
} from "../../../../components/common/Charts/productReport/ProductReportCharts";

import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import {
  useGetProductDetailReportQuery,
  useGetProductSearchReportQuery,
} from "../../../../redux/features/report/reportApi";
import { config } from "../../../../config";

const getStatusInfo = (status: string) => {
  const configs: Record<
    string,
    { color: string; bgColor: string; label: string }
  > = {
    CONFIRM: {
      color: "#10B981",
      bgColor: "bg-emerald-500",
      label: "Confirmed",
    },
    PRINT: { color: "#6366F1", bgColor: "bg-indigo-500", label: "Printed" },
    SHIPPED: { color: "#3B82F6", bgColor: "bg-blue-500", label: "Shipped" },
    GOOD_BUT_NO_RESPONSE: {
      color: "#8B5CF6",
      bgColor: "bg-violet-500",
      label: "Reached (No Response)",
    },
    ADVANCE_REQUIRED: {
      color: "#F97316",
      bgColor: "bg-orange-400",
      label: "Advance Required",
    },
    CANCELLED: {
      color: "#EF4444",
      bgColor: "bg-red-500",
      label: "Cancelled",
    },
    NO_RESPONSE: {
      color: "#64748B",
      bgColor: "bg-slate-500",
      label: "No Response",
    },
    HOLD: { color: "#F43F5E", bgColor: "bg-rose-500", label: "On Hold" },
    PENDING: { color: "#F59E0B", bgColor: "bg-orange-500", label: "Pending" },
    DELIVERED: {
      color: "#1BA143",
      bgColor: "bg-green-600",
      label: "Delivered",
    },
    RTS: {
      color: "#7C3AED",
      bgColor: "bg-purple-600",
      label: "Return to Seller",
    },
    PENDING_RETURN: {
      color: "#F59E0B",
      bgColor: "bg-orange-400",
      label: "Pending Return",
    },
  };

  const key = status.toUpperCase();
  return (
    configs[key] || {
      color: "#94A3B8",
      bgColor: "bg-slate-400",
      label: status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    }
  );
};


const ProductReportTab = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const { data: searchData, isFetching: isSearching } =
    useGetProductSearchReportQuery(
      searchTerm ? [{ name: "search", value: searchTerm }] : [],
    );

  const { data: productDetail, isFetching: isDetailLoading } =
    useGetProductDetailReportQuery(
      selectedVariantId ? [{ name: "variantId", value: selectedVariantId }] : [],
      { skip: !selectedVariantId },
    );

  const detail = productDetail?.data;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const statItems = [
    {
      icon: <ShoppingCart />,
      title: "First Purchase",
      value: formatDate(detail?.timeline?.firstPurchase),
      subtitle: detail?.timeline?.firstPurchase ? "Purchased" : "No purchases",
      color: "blue" as const,
    },
    {
      icon: <Package />,
      title: "Stock In",
      value: formatDate(detail?.timeline?.stockIn?.last) || "No data",
      subtitle: `First: ${formatDate(detail?.timeline?.stockIn?.first) || "N/A"}`,
      color: "green" as const,
    },
    {
      icon: <Package />,
      title: "Stock Out",
      value: formatDate(detail?.timeline?.stockOut?.last) || "No data",
      subtitle: `First: ${formatDate(detail?.timeline?.stockOut?.first) || "N/A"}`,
      color: "red" as const,
    },
    {
      icon: <Clock />,
      title: "Last Sold",
      value: formatDate(detail?.timeline?.lastSold),
      subtitle: detail?.timeline?.lastSold ? "Recently sold" : "Never sold",
      color: "purple" as const,
    },
    {
      icon: <Clock />,
      title: "Avg Lead Time",
      value: detail?.timeline?.avgLeadTime || "-",
      subtitle: "Avg delivery time",
      color: "primary" as const,
    },
  ];

  const orderStatusData = detail?.orderStatusDistribution || [
    { status: "Delivered", count: 0, percentage: 0 },
    { status: "Shipped", count: 0, percentage: 0 },
    { status: "Pending", count: 0, percentage: 0 },
    { status: "Cancelled", count: 0, percentage: 0 },
    { status: "RTS", count: 0, percentage: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          Product Report
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Analyze product performance, sales trends, and delivery metrics
        </p>

        <div className="flex justify-between ">
          <div className="flex flex-col justify-baseline md:flex-row gap-4 items-start md:items-center">
            <Select
              className="w-full min-w-[320px] md:min-w-[480px]"
              placeholder="Search and Select Product"
              showSearch
              filterOption={false}
              optionLabelProp="label"
              onSearch={(val) => setSearchTerm(val)}
              value={selectedVariantId}
              onChange={(val) => {
                setSelectedVariantId(val);
             
               
              }}
              loading={isSearching}
              notFoundContent={
                isSearching ? null : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              }
              dropdownStyle={{ minWidth: 450 }}
            >
              {searchData?.data?.map((product: any) => {
                const imageUrl = product.image
                  ? `${config.image_access_url.replace(/\/$/, "")}/${product.image.replace(/^\//, "")}`
                  : null;

                console.log(imageUrl);

                return (
                  <Select.Option
                    key={product.id}
                    value={product.id}
                    label={product.name}
                  >
                    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 dark:border-gray-800">
                      <div className="w-12 h-12 flex-shrink-0 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-white flex items-center justify-center">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-[13px] font-bold text-gray-800 dark:text-gray-200 truncate leading-tight">
                            {product.name}
                          </h4>
                          <span className="text-[12px] font-bold text-primary whitespace-nowrap">
                            ৳ {product.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag
                            color="blue"
                            className="m-0 text-[10px] px-1.5 py-0 leading-normal border-none bg-blue-50 text-blue-600 font-bold"
                          >
                            {product.variantName}
                          </Tag>
                          <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50 px-1 rounded">
                            SKU: {product.sku}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </div>
       
        </div>
      </div>

      {selectedVariantId && (
        <>
          {/* Inventory Timeline - Using PageHeaderCard */}
          <div
            className={`grid grid-cols-1 md:grid-cols-5 gap-4 transition-opacity duration-300 ${isDetailLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
          >
            {statItems.map((item, i) => (
              <PageHeaderCard
                key={i}
                icon={item.icon}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                color={item.color}
              />
            ))}
          </div>

          {/* Product Summary & Stock Info */}
          <div
            className={`transition-opacity duration-300 ${isDetailLoading ? "opacity-50" : "opacity-100"}`}
          >
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white">
                  Product Summary
                </h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64 h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden ">
                  {detail?.summary?.image ? (
                    <img
                      src={`${config.image_access_url.replace(/\/$/, "")}/${detail.summary.image.replace(/^\//, "")}`}
                      alt={detail.summary.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {detail?.summary?.name ||
                        "Search and Select a Product to view details"}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      ID: # {detail?.summary?.sku || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Selling Price</p>
                      <p className="font-bold text-gray-800 dark:text-white">
                        ৳ {detail?.summary?.sellingPrice || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cost Price</p>
                      <p className="font-bold text-gray-800 dark:text-white">
                        ৳ {detail?.summary?.costPrice || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Profit Margin</p>
                      <p
                        className={`font-bold ${detail?.summary?.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {detail?.summary?.profitMargin || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="font-bold text-gray-800 dark:text-white">
                        {detail?.summary?.weight || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="w-full md:w-64 space-y-4 border-l border-gray-100 dark:border-gray-800 pl-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                      Stock Information
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">
                        Current Stock
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {detail?.summary?.stockInfo?.currentStock || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">
                        Low Stock Threshold
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {detail?.summary?.stockInfo?.lowStockThreshold ||
                          0}{" "}
                        Items
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">
                        Stock Status
                      </span>
                      <Tag
                        color={
                          detail?.summary?.stockInfo?.stockStatus === "In Stock"
                            ? "green"
                            : "red"
                        }
                        className="m-0 text-[10px] uppercase font-bold"
                      >
                        {detail?.summary?.stockInfo?.stockStatus || "N/A"}
                      </Tag>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">
                        Stock Management
                      </span>
                      <Tag
                        color={
                          detail?.summary?.stockInfo?.stockManagement ===
                          "Enabled"
                            ? "green"
                            : "orange"
                        }
                        className="m-0 text-[10px] uppercase font-bold"
                      >
                        {detail?.summary?.stockInfo?.stockManagement || "N/A"}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Sales Chart */}
          <ProductSalesChart
            data={{
              series: [
                {
                  name: "Sales",
                  data: detail?.salesHistory?.map((h: any) => h.value) || [],
                },
              ],
              categories: detail?.salesHistory?.map((h: any) => h.date) || [],
            }}
          />

          {/* Delivery & Return Trend & Order Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 -mt-1">
            {/* Delivery & Return Trend */}
            <DeliveryReturnTrend
              data={{
                series: [
                  {
                    name: "Delivery Rate",
                    data:
                      detail?.deliveryTrend?.map((h: any) => h.percentage) || [],
                  },
                  {
                    name: "Return Rate",
                    data:
                      detail?.returnTrend?.map((h: any) => h.percentage) || [],
                  },
                ],
                categories: detail?.deliveryTrend?.map((h: any) => h.date) || [],
                avgDeliveryRate: detail?.stats?.avgDeliveryRate,
                avgReturnRate: detail?.stats?.avgReturnRate,
                bestDeliveryRate: detail?.stats?.bestDeliveryRate,
                worstReturnRate: detail?.stats?.worstReturnRate,
              }}
            />

            {/* Order Status */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 dark:text-white">
                  Order Status
                </h3>
                <Tag className="bg-gray-100 text-gray-600 border-none font-medium">
                  {detail?.statusPeriod || "All Time"}
                </Tag>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {orderStatusData.map((item: any, i: number) => {
                    const statusInfo = getStatusInfo(item.status);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-500 mb-1 capitalize">
                          <span>{statusInfo.label}</span>
                        </div>
                        <Progress
                          percent={item.percentage}
                          size="small"
                          showInfo={false}
                          strokeColor={statusInfo.color}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Count</th>
                        <th className="py-2 px-3">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {orderStatusData.map((item: any, i: number) => {
                        const statusInfo = getStatusInfo(item.status);
                        return (
                          <tr key={i}>
                            <td className="py-2 px-3 flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${statusInfo.bgColor}`}
                              />
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-bold text-gray-800 dark:text-white">
                              {item.count}
                            </td>
                            <td className="py-2 px-3 text-gray-500">
                              {item.percentage?.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50 dark:bg-gray-800 font-bold border-t border-gray-200 dark:border-gray-700">
                        <td className="py-2 px-3">Total</td>
                        <td className="py-2 px-3">
                          {orderStatusData.reduce(
                            (acc: number, curr: any) => acc + curr.count,
                            0,
                          )}
                        </td>
                        <td className="py-2 px-3">100%</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[10px] text-gray-400 mt-4 italic">
                    Showing order status distribution for the selected period
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductReportTab;
