import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Loader } from "../../Loading";

export interface ITopSalesProduct {
  productName: string;
  variantName: string;
  sku: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
  salesCount: number;
}

interface ProductOrderOverviewChartProps {
  topProducts: ITopSalesProduct[];
  loading?: boolean;
  fetching?: boolean;
}

const ProductOrderOverviewChart: React.FC<ProductOrderOverviewChartProps> = ({
  topProducts,
  loading = false,
  fetching = false,
}) => {
  // Show loading if data is not ready
  if (loading || fetching || !topProducts || topProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-gray-500">
        <Loader />
      </div>
    );
  }

  const options: ApexOptions = {
    chart: { type: "area", height: 300, toolbar: { show: false } },
    colors: ["#009531", "#f59e0b"], // green + orange
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    xaxis: {
      categories: topProducts?.slice(0, 20)?.map((p) => p.productName),
      labels: { style: { colors: "#4b5563", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#4b5563", fontSize: "12px" } } },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "light",
      custom: ({ dataPointIndex }) => {
        const product = topProducts[dataPointIndex];
        return `
          <div style="padding:8px">
            <strong>${product.productName}</strong><br/>
            Variant: ${product.variantName}<br/>
            SKU: ${product.sku}<br/>
            Category: ${product.categoryName}<br/>
            Quantity: ${product.totalQuantity}<br/>
            Amount: TK ${product.totalAmount}<br/>
            Sales Count: ${product.salesCount}
          </div>
        `;
      },
    },
  };

  const series = [
    {
      name: "Total Amount",
      data: topProducts.map((p) => p.totalAmount),
    },
    {
      name: "Sales Count",
      data: topProducts.map((p) => p.salesCount),
    },
  ];

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Selling Products Overview
      </h3>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default ProductOrderOverviewChart;
