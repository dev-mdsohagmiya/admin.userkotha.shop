import React from "react";
import ReactApexChart from "react-apexcharts";
import { Loader } from "../../Loading";

interface CustomerData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  newCustomerPercentage: string;
  returningCustomerPercentage: string;
  newCustomerAmount: number;
  returningCustomerAmount: number;
  averageNewCustomerValue: number;
  averageReturningCustomerValue: number;
}

interface CustomerChartProps {
  data?: CustomerData;
  loading?: boolean;
  fetching?: boolean;
}

export const CustomerChart: React.FC<CustomerChartProps> = ({
  data,
  loading = false,
  fetching = false,
}) => {
  if (loading || fetching || !data) {
    return (
      <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
        <Loader />
      </div>
    );
  }

  const categories = [
    {
      label: "New Customer",
      value: data.newCustomers,
      color: "#009531",
      amount: data.newCustomerAmount,
      percentage: data.newCustomerPercentage,
      averageValue: data.averageNewCustomerValue,
    },
    {
      label: "Old Customer",
      value: data.returningCustomers,
      color: "#009531",
      amount: data.returningCustomerAmount,
      percentage: data.returningCustomerPercentage,
      averageValue: data.averageReturningCustomerValue,
    },
    {
      label: "Total Customer",
      value: data.totalCustomers,
      color: "#009531",
      amount: data.newCustomerAmount + data.returningCustomerAmount,
      percentage: "100",
      averageValue:
        (data.newCustomerAmount + data.returningCustomerAmount) /
        data.totalCustomers,
    },
  ];

  const chartOptions = {
    chart: {
      id: "customer-bar",
      toolbar: { show: false },
      type: "bar" as const,
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: "end" as const,
        columnWidth: "60%",
      },
    },
    xaxis: {
      categories: categories.map((c) => c.label),
      labels: {
        style: {
          colors: "#374151",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },
    colors: categories.map((c) => c.color),
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toString();
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#ffffff"],
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
    },
    tooltip: {
      custom: function ({ dataPointIndex }: any) {
        const cat = categories[dataPointIndex];
        return `
          <div class="apexcharts-tooltip-box" style="
            background: #ffffff;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            min-width: 220px;
          ">
            <div style="
              font-weight: bold; 
              margin-bottom: 12px; 
              color: #000000;
              font-size: 14px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
            ">${cat.label}</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #000000; font-size: 12px; font-weight: 500;">Count:</span>
                <span style="font-weight: 700; color: #000000; font-size: 13px; background: #f3f4f6; padding: 2px 8px; border-radius: 6px;">${cat.value.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #000000; font-size: 12px; font-weight: 500;">Amount:</span>
                <span style="font-weight: 700; color: #000000; font-size: 13px; background: #f3f4f6; padding: 2px 8px; border-radius: 6px;">TK ${cat.amount.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #000000; font-size: 12px; font-weight: 500;">Percentage:</span>
                <span style="font-weight: 700; color: #000000; font-size: 13px; background: #f3f4f6; padding: 2px 8px; border-radius: 6px;">${cat.percentage}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #000000; font-size: 12px; font-weight: 500;">Avg Value:</span>
                <span style="font-weight: 700; color: #000000; font-size: 13px; background: #f3f4f6; padding: 2px 8px; border-radius: 6px;">TK ${cat.averageValue.toFixed(2)}</span>
              </div>
            </div>
            <div style="
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            ">
              <span style="color: #000000; font-size: 11px; font-weight: 600;">📊 Customer Analytics</span>
            </div>
          </div>
        `;
      },
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          return val.toLocaleString();
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="font-semibold mb-3">Customer Overview</h3>
      <ReactApexChart
        options={chartOptions}
        series={[{ name: "Customers", data: categories.map((c) => c.value) }]}
        type="bar"
        height={300}
      />
    </div>
  );
};
