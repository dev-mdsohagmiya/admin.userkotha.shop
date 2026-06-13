import { ApexOptions } from "apexcharts";
import React from "react";
import Chart from "react-apexcharts";

interface MaterialData {
  materialId: string;
  materialName: string;
  totalQuantity: number;
  totalAmount: number;
  purchaseCount: number;
}

interface Props {
  materialsData: MaterialData[];
}

const TopPurchaseMaterialChart: React.FC<Props> = ({ materialsData }) => {
  const data = [...materialsData].sort(
    (a, b) => b.totalQuantity - a.totalQuantity,
  );

  // Totals
  const totalQuantity = data.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalPurchases = data.reduce(
    (sum, item) => sum + item.purchaseCount,
    0,
  );
  // Chart data
  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      toolbar: { show: false },
      events: {
        mouseLeave: (
          _event: MouseEvent,
          _chartContext: unknown,
          config: { globals: { tooltipOpts: { enabled: boolean } } },
        ) => {
          if (config?.globals?.tooltipOpts) {
            config.globals.tooltipOpts.enabled = false;
          }
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        borderRadiusApplication: "end",
        barHeight: "50%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString(),
      style: { colors: ["#fff"] },
    },
    xaxis: { categories: data.map((d) => d.materialName) },
    colors: ["#009531"],
    tooltip: {
      y: {
        formatter: (
          val: number,
          { dataPointIndex }: { dataPointIndex: number },
        ) => {
          const item = data[dataPointIndex];
          return `Quantity: ${item.totalQuantity.toLocaleString()} | Amount: TK ${item.totalAmount.toLocaleString()} | Purchases: ${item.purchaseCount.toLocaleString()}`;
        },
      },
      style: {
        fontSize: "14px",
        fontFamily: "Arial, sans-serif",
      },
      marker: { fillColors: ["#009531"] },
      theme: "dark",
      fixed: {
        enabled: false,
      },
    },
    legend: { show: false },
  };

  const chartSeries = [{ name: "", data: data.map((d) => d.totalQuantity) }];

  return (
    <div className="bg-white rounded-md border p-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900">
            Top Purchased Materials
          </h3>
          <p className="text-xs text-gray-500">
            {data.length} materials • {totalPurchases} total purchases
          </p>
        </div>
        <div className="flex gap-4 mt-4 lg:mt-0">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              TK {totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Amount</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {totalQuantity.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Quantity</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={400}
        />
      </div>
    </div>
  );
};

export default TopPurchaseMaterialChart;
