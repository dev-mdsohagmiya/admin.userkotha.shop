import { Card, Row, Col, Progress, Tag, Tooltip } from "antd";
import React from "react";
import Chart from "react-apexcharts";
import { CrownFilled, FallOutlined } from "@ant-design/icons";
import { DisplayCurrency } from "../../utils/currency";

interface ProductPerformance {
  product: {
    id: string;
    name: string;
    categoryName: string;
  };
  summary: {
    totalVariantsCompared: number;
    totalRevenue: number;
    totalQuantitySold: number;
    totalSales: number;
    averageRevenuePerVariant: number;
  };
  bestPerformer: {
    variantName: string;
    sku: string;
    totalRevenue: number;
    marketShare: string;
  };
  worstPerformer: {
    variantName: string;
    sku: string;
    totalRevenue: number;
    marketShare: string;
  };
  comparison: Array<{
    variantId: string;
    variantName: string;
    sku: string;
    sellingPrice: number;
    currentStock: number;
    minStock: number;
    maxStock: number;
    stockStatus: string;
    totalQuantitySold: number;
    totalRevenue: number;
    totalSales: number;
    averagePrice: number;
    averageQuantityPerSale: number;
    marketShare: number;
    lastSaleDate: string;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

type Props = {
  data: ProductPerformance;
};

const ProductVariantComparison: React.FC<Props> = ({ data }) => {
  const { bestPerformer, worstPerformer, comparison } = data;

  // Market Share Pie Chart Data
  const marketShareSeries = comparison?.map((item) => item.marketShare);
  const marketShareLabels = comparison?.map((item) => `${item.variantName}`);

  const marketShareChartOptions = {
    chart: {
      type: "donut" as const,
      height: 200,
    },
    colors: ["#ff3d0a", "#FD8000", "#fff"],
    labels: marketShareLabels,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        colors: ["#fff"],
        fontSize: "10px",
        fontWeight: "bold",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Market Share",
              fontSize: "12px",
              fontWeight: 600,
              color: "#000000",
            },
          },
        },
      },
    },
    legend: {
      position: "bottom" as const,
      fontSize: "10px",
      fontWeight: 500,
      labels: {
        colors: "#000000",
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toFixed(1)}% Market Share`,
      },
    },
  };

  const getStockStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "low":
        return "#000000";
      case "normal":
        return "#ff3d0a";
      case "high":
        return "#ff3d0a";
      case "critical":
        return "#000000";
      default:
        return "default";
    }
  };

  const calculateStockPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Main Comparison Grid */}
      <Row gutter={[16, 16]}>
        {/* Best Performer */}
        <Col xs={24} md={8}>
          <Card className="border border-gray-200 bg-gradient-to-br from-[#ff3d0a]/10 to-[#ff3d0a]/5 h-full">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-[#ff3d0a] p-2 rounded-full">
                  <CrownFilled className="!text-white text-lg" />
                </div>
              </div>
              <h3 className="font-bold text-black text-sm mb-1">
                Best Performer
              </h3>
              <div className="text-lg font-bold text-black mb-1">
                {bestPerformer?.variantName}
              </div>
              <div className="text-xs text-gray-700 mb-2">
                {bestPerformer?.sku}
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#ff3d0a]">
                  <DisplayCurrency amount={bestPerformer?.totalRevenue} />
                </div>
                <Tag color="#ff3d0a" className="font-bold text-xs text-white">
                  {bestPerformer?.marketShare}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>

        {/* Market Share Chart */}
        <Col xs={24} md={8}>
          <Card
            className="border border-gray-200 h-full"
            bodyStyle={{ padding: "16px" }}
          >
            <div className="text-center mb-2">
              <h3 className="font-semibold text-black text-sm">Market Share</h3>
            </div>
            <Chart
              options={marketShareChartOptions}
              series={marketShareSeries}
              type="donut"
              height={200}
            />
          </Card>
        </Col>

        {/* Worst Performer */}
        <Col xs={24} md={8}>
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 h-full">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-orange-500 p-2 rounded-full">
                  <FallOutlined className="!text-white text-lg" />
                </div>
              </div>
              <h3 className="font-bold text-black text-sm mb-1">
                Needs Improvement
              </h3>
              <div className="text-lg font-bold text-black mb-1">
                {worstPerformer?.variantName}
              </div>
              <div className="text-xs text-gray-700 mb-2">
                {worstPerformer?.sku}
              </div>

              <div className="space-y-2 ">
                <div className="text-2xl font-bold text-black">
                  <DisplayCurrency amount={worstPerformer?.totalRevenue} />
                </div>
                <Tag color="#FD8000" className="font-bold text-xs text-white">
                  {worstPerformer?.marketShare}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed Variant Cards */}
      <Row gutter={[12, 12]}>
        {comparison?.map((variant, index) => (
          <Col xs={24} lg={12} key={variant?.variantId}>
            <Card
              className={`border-l-4 ${
                index === 0 ? "border-l-[#ff3d0a]" : "border-l-black"
              } h-full border border-gray-200`}
              bodyStyle={{ padding: "16px" }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div>
                    <h4 className="font-bold text-black text-base">
                      {variant?.variantName}
                    </h4>
                    <p className="text-gray-600 text-xs">{variant?.sku}</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <Row gutter={[8, 8]} className="mb-3">
                <Col span={8}>
                  <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-sm font-bold text-[#ff3d0a]">
                      <DisplayCurrency amount={variant?.totalRevenue} />
                    </div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-sm font-bold text-black">
                      {variant?.totalQuantitySold}
                    </div>
                    <div className="text-xs text-gray-600">Sales Product</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-sm font-bold text-[#ff3d0a]">
                      <DisplayCurrency amount={variant?.totalSales} />
                    </div>
                    <div className="text-xs text-gray-600">Order</div>
                  </div>
                </Col>
              </Row>

              {/* Stock & Additional Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Stock</span>
                    <Tag
                      color={getStockStatusColor(variant?.stockStatus)}
                      className="text-white"
                    >
                      {variant?.stockStatus}
                    </Tag>
                  </div>
                  <Progress
                    percent={calculateStockPercentage(
                      variant?.currentStock,
                      variant?.maxStock,
                    )}
                    size="small"
                    showInfo={false}
                    strokeColor={(() => {
                      const currentStock = variant?.currentStock || 0;

                      if (currentStock >= 30) {
                        return "#ff3d0a"; // green
                      } else if (currentStock >= 5) {
                        return "#FFA500"; // orange
                      } else if (currentStock >= 1) {
                        return "#FF0000"; // red
                      } else {
                        return "#CCCCCC"; // gray for 0 stock
                      }
                    })()}
                  />
                  <div className="text-gray-600 text-xs mt-1">
                    {variant?.currentStock}/{variant?.maxStock}
                  </div>
                </div>

                <div className="space-y-2">
                  <Tooltip title="Price">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Price:</span>
                      <span className="font-semibold text-black">
                        <DisplayCurrency amount={variant?.sellingPrice} />
                      </span>
                    </div>
                  </Tooltip>
                  <Tooltip title="Avg Qty per Sale">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Avg Qty:</span>
                      <span className="font-semibold text-black">
                        {variant?.averageQuantityPerSale.toFixed(1)}
                      </span>
                    </div>
                  </Tooltip>
                  <Tooltip title="Last Sale">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Last Sale:</span>
                      <span className="font-semibold text-[#ff3d0a]">
                        {formatDate(variant?.lastSaleDate)}
                      </span>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductVariantComparison;
