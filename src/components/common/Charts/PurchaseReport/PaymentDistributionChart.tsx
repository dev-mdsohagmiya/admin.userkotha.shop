import { ApexOptions } from "apexcharts";
import React from "react";
import Chart from "react-apexcharts";
import { useGetPurchasePaymentStatusDistributionsQuery } from "../../../../redux/features/purchases-management/purchasesManagementApi";
import { Loader } from "../../Loading";

const PaymentDistributionChart: React.FC = () => {
  const { data: payment, isLoading } =
    useGetPurchasePaymentStatusDistributionsQuery(undefined); // Replace with actual data fetching logic

  const paymentData = payment?.data || [];

  // Conditional colors based on status
  const getColors = () => {
    return paymentData.map((item: { status: string }) => {
      switch (item.status) {
        case "Paid":
          return "#009531";
        case "Partial":
          return "#F59E0B";
        case "Due":
          return "red";
        default:
          return "#6b7280";
      }
    });
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 350,
      toolbar: {
        show: false,
      },
      events: {
        mouseLeave: () => {
          const tooltipEl = document.querySelector(".apexcharts-tooltip");
          if (tooltipEl) {
            (tooltipEl as HTMLElement).style.opacity = "0";
            (tooltipEl as HTMLElement).style.pointerEvents = "none";
          }
        },
      },
    },
    labels: paymentData.map((d: { status: string }) => d.status),
    colors: getColors(),
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { fontSize: "12px", fontWeight: "bold", colors: ["#fff"] },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Payments",
              formatter: () =>
                paymentData
                  .reduce(
                    (sum: number, item: { count: number }) => sum + item.count,
                    0,
                  )
                  .toString(),
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    tooltip: {
      y: {
        formatter: (val: number, { seriesIndex }) => {
          const item = paymentData[seriesIndex];
          return `Count: ${
            item.count
          } | Amount: TK ${item.totalAmount.toLocaleString()}`;
        },
      },
    },
  };

  const chartSeries = paymentData.map((d: { count: string }) => d.count);

  return (
    <div className="bg-white mt-2 px-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Status Distribution
            </h3>
            <p className="text-xs text-gray-500">Payment status breakdown</p>
          </div>
        </div>
      </div>

      <div>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="flex justify-center">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={300}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDistributionChart;
