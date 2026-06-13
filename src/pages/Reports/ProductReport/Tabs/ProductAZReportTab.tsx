import React, { useState, useMemo } from "react";
import { Select, Empty, Tag } from "antd";
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Truck,
  RotateCcw,
  BarChart2
} from "lucide-react";
import { TbCoinTaka } from "react-icons/tb";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import { 
  useGetProductAZListReportQuery,
  useGetProductSearchReportQuery 
} from "../../../../redux/features/report/reportApi";
import { formatCurrency } from "../../../../utils/currency";

const ProductAZReportTab = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products for search
  const { data: searchData, isFetching: isSearching } = useGetProductSearchReportQuery(
    searchTerm ? [{ name: "search", value: searchTerm }] : []
  );

  // Main Report Query
  const queryArgs = useMemo(() => {
    const args = [];
    if (dateRange[0]) args.push({ name: "startDate", value: dateRange[0] });
    if (dateRange[1]) args.push({ name: "endDate", value: dateRange[1] });
    if (selectedProductId) args.push({ name: "productId", value: selectedProductId });
    if (selectedVariantId) args.push({ name: "variantId", value: selectedVariantId });
    return args;
  }, [dateRange, selectedProductId, selectedVariantId]);

  const { data: reportData, isFetching: isLoading } = useGetProductAZListReportQuery(queryArgs);

  const data = reportData?.data;
  const summary = data?.summary;
  const charts = data?.charts;

  const statItems = useMemo(() => [
    {
      title: "Total Revenue",
      value: `৳ ${formatCurrency(summary?.totalRevenue || 0)}`,
      icon: <TbCoinTaka className="w-5 h-5" />,
      color: "green" as const,
      subtitle: "Total sales amount"
    },
    {
      title: "Total Orders",
      value: summary?.totalOrders || 0,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "blue" as const,
      subtitle: "Number of orders"
    },
    {
      title: "Total Quantity",
      value: summary?.totalQty || 0,
      icon: <Package className="w-5 h-5" />,
      color: "purple" as const,
      subtitle: "Items sold"
    },
    {
      title: "Total Cost",
      value: `৳ ${formatCurrency(summary?.costPrice || 0)}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "orange" as const,
      subtitle: "Total cost of goods"
    },
    {
      title: "Selling Price",
      value: `৳ ${formatCurrency(summary?.sellingPrice || 0)}`,
      icon: <TbCoinTaka className="w-5 h-5" />,
      color: "primary" as const,
      subtitle: "Unit selling price"
    },
    {
      title: "Current Stock",
      value: summary?.stock || 0,
      icon: <Package className="w-5 h-5" />,
      color: "indigo" as const,
      subtitle: "Available quantity"
    },
    {
      title: "Alert Level",
      value: summary?.alertLevel || 0,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "red" as const,
      subtitle: "Restock threshold"
    },
    {
      title: "Delivery Rate",
      value: `${summary?.deliveryRate || 0}%`,
      icon: <Truck className="w-5 h-5" />,
      color: "cyan" as const,
      subtitle: "Success rate"
    },
    {
      title: "Return Rate",
      value: `${summary?.returnRate || 0}%`,
      icon: <RotateCcw className="w-5 h-5" />,
      color: "pink" as const,
      subtitle: "Return percentage"
    }
  ], [summary]);

  // Order Status Breakdown Chart Options
  const statusChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    labels: charts?.orderStatusBreakdown?.map((item: any) => item.status) || [],
    colors: ["#10B981", "#6366F1", "#3B82F6", "#8B5CF6", "#F97316", "#EF4444", "#64748B", "#F43F5E", "#F59E0B"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => summary?.totalOrders?.toString() || "0"
            }
          }
        }
      }
    },
    stroke: {
      show: false
    }
  };

  const statusChartSeries = charts?.orderStatusBreakdown?.map((item: any) => item.count) || [];

  // Sales Trend Chart Options
  const trendChartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ["#3B82F6", "#10B981"],
    stroke: {
      curve: "smooth",
      width: 2
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    xaxis: {
      categories: charts?.salesTrend?.map((item: any) => item.date) || [],
      labels: {
        style: {
          fontSize: "10px"
        }
      }
    },
    yaxis: [
      {
        title: { text: "Revenue" },
        labels: {
          formatter: (val) => `৳${formatCurrency(val)}`
        }
      },
      {
        opposite: true,
        title: { text: "Quantity" }
      }
    ],
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 4
    },
    tooltip: {
      x: { format: "dd MMM yyyy" }
    }
  };

  const trendChartSeries = [
    {
      name: "Revenue",
      data: charts?.salesTrend?.map((item: any) => item.revenue) || []
    },
    {
      name: "Quantity",
      data: charts?.salesTrend?.map((item: any) => item.quantity) || []
    }
  ];

  const handleProductSelect = (val: string) => {
    setSelectedProductId(val);
    // Reset variant if product changes
    setSelectedVariantId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
           
            <Select
              className="w-sm h-11"
              placeholder="Search and Select Product"
              showSearch
              filterOption={false}
              onSearch={(val) => setSearchTerm(val)}
              value={selectedProductId}
              onChange={handleProductSelect}
              loading={isSearching}
              allowClear
              optionLabelProp="label"
            >
              {searchData?.data?.map((product: any) => (
                <Select.Option key={product.id} value={product.id} label={product.name}>
                  <div className="flex flex-col py-1">
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      {product.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      SKU: {product.sku}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="">
           
            <CustomDatePicker
              selectedData={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </div>

      
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`space-y-4 transition-all duration-500 ${isLoading ? "opacity-50 grayscale" : "opacity-100"}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.slice(0, 4).map((item, i) => (
            <PageHeaderCard
              key={i}
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
              subtitle={item.subtitle}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statItems.slice(4).map((item, i) => (
            <PageHeaderCard
              key={i + 4}
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
              subtitle={item.subtitle}
            />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Sales Trend
              </h3>
              <p className="text-xs text-gray-500">Daily revenue and quantity performance</p>
            </div>
            <Tag className="bg-primary/10 text-primary border-none font-bold">
              {dateRange[0] ? `${dateRange[0]} to ${dateRange[1]}` : "Last 30 Days"}
            </Tag>
          </div>
          {charts?.salesTrend?.length ? (
            <ReactApexChart
              options={trendChartOptions}
              series={trendChartSeries}
              type="area"
              height={350}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center">
              <Empty description="No trend data available" />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Order Distribution
              </h3>
              <p className="text-xs text-gray-500">Breakdown by status</p>
            </div>
          </div>
          {charts?.orderStatusBreakdown?.length ? (
            <div className="relative">
              <ReactApexChart
                options={statusChartOptions}
                series={statusChartSeries}
                type="donut"
                height={350}
              />
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center">
              <Empty description="No status data available" />
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg flex items-start gap-3 border border-blue-100 dark:border-blue-800">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="text-xs text-blue-700 dark:text-blue-300">
          <p className="font-bold mb-1">About Product A-Z Report</p>
          <p>This report provides a comprehensive overview of product performance, including financial metrics, inventory status, and order fulfillment trends. Data is updated in real-time based on system transactions.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductAZReportTab;
