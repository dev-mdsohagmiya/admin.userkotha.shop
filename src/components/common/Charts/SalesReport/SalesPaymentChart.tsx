import { ApexOptions } from "apexcharts";
import React from "react";
import Chart from "react-apexcharts";
import { Loader } from "../../Loading";

interface PaymentApiData {
  paymentMethod: string;
  count: number;
  totalAmount: number;
}

interface SalesPaymentChartProps {
  data: PaymentApiData[];
  loading?: boolean;
  fetching?: boolean;
}

const defaultColors = ["#ff3d0a", "#10B981", "#8B5CF6", "#F59E0B", "#6B7280"];

const SalesPaymentChart: React.FC<SalesPaymentChartProps> = ({
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

  if (data.length === 0 || data.length === undefined) {
    return <>Data not found</>;
  }

  const chartLabels = data?.map(
    (d) => d.paymentMethod.charAt(0).toUpperCase() + d.paymentMethod.slice(1),
  );
  const chartSeries = data?.map((d) => d.count); // using count for slice size
  const chartColors = data?.map(
    (d, i) => defaultColors[i % defaultColors.length],
  );

  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 300,
    },
    labels: chartLabels,
    colors: chartColors,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
      style: {
        colors: ["#fff"],
        fontSize: "12px",
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
              label: "Total Orders",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              formatter: () =>
                data.reduce((sum, d) => sum + d.count, 0).toString(),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val, { dataPointIndex }: any) => {
          const d = data[dataPointIndex];
          return `
            Count: ${d.count}
            <br/>Total Amount: TK ${d.totalAmount}
            <br/>Percentage: ${(
              (d.count / data.reduce((s, item) => s + item.count, 0)) *
              100
            ).toFixed(1)}%
          `;
        },
      },
    },
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontWeight: 500,
      labels: { colors: "#64748b" },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 300 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sales Payment Method Distribution
      </h3>
      <Chart options={options} series={chartSeries} type="donut" height={300} />
    </div>
  );
};

export default SalesPaymentChart;

// import { ApexOptions } from "apexcharts";
// import React from "react";
// import Chart from "react-apexcharts";

// interface PaymentApiData {
//   paymentMethod: string;
//   count: number;
//   totalAmount: number;
// }

// interface SalesPaymentChartProps {
//   data: PaymentApiData[];
//   loading?: boolean;
//   fetching?: boolean;
// }

// const defaultColors = ["#ff3d0a", "#10B981", "#8B5CF6", "#F59E0B", "#6B7280"];
// const defaultMethods = [
//   { paymentMethod: "Cash", count: 5, totalAmount: 100000 },
//   { paymentMethod: "Card", count: 5, totalAmount: 10000 },
//   { paymentMethod: "Bank", count: 0, totalAmount: 0 },
//   { paymentMethod: "SSL", count: 0, totalAmount: 0 },
//   { paymentMethod: "Other", count: 0, totalAmount: 0 },
// ];

// const SalesPaymentChart: React.FC<SalesPaymentChartProps> = ({
//   data,
//   loading = false,
//   fetching = false,
// }) => {
//   if (loading || fetching || !data) {
//     return (
//       <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
//         Loading Payment Method Data...
//       </div>
//     );
//   }

//   // Merge API data with default methods
//   const mergedData = defaultMethods.map((method) => {
//     const apiItem = data.find(
//       (d) =>
//         d.paymentMethod.toLowerCase() === method.paymentMethod.toLowerCase()
//     );
//     return apiItem || method;
//   });

//   const chartLabels = mergedData.map((d) => d.paymentMethod);
//   const chartSeries = mergedData.map((d) => d.count);
//   const chartColors = mergedData.map(
//     (d, i) => defaultColors[i % defaultColors.length]
//   );

//   const totalCount = mergedData.reduce((sum, d) => sum + d.count, 0);

//   const options: ApexOptions = {
//     chart: { type: "donut", height: 300 },
//     labels: chartLabels,
//     colors: chartColors,
//     dataLabels: {
//       enabled: true,
//       formatter: (val) => `${Math.round(val)}%`,
//       style: { colors: ["#fff"], fontSize: "12px" },
//     },
//     plotOptions: {
//       pie: {
//         donut: {
//           size: "70%",
//           labels: {
//             show: true,
//             total: {
//               show: true,
//               label: "Total Orders",
//               fontSize: "14px",
//               fontWeight: 600,
//               color: "#374151",
//               formatter: () => totalCount.toString(),
//             },
//           },
//         },
//       },
//     },
//     tooltip: {
//       y: {
//         formatter: (val, { dataPointIndex }: any) => {
//           const d = mergedData[dataPointIndex];
//           return `
//             Count: ${d.count}
//             <br/>Total Amount: TK ${d.totalAmount}
//             <br/>Percentage: ${
//               totalCount ? ((d.count / totalCount) * 100).toFixed(1) : 0
//             }%
//           `;
//         },
//       },
//     },
//     legend: {
//       position: "bottom",
//       fontSize: "12px",
//       fontWeight: 500,
//       labels: { colors: "#64748b" },
//     },
//     responsive: [
//       {
//         breakpoint: 480,
//         options: { chart: { width: 300 }, legend: { position: "bottom" } },
//       },
//     ],
//   };

//   return (
//     <div className="bg-white rounded-xl border p-6">
//       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//         Sales Payment Method Distribution
//       </h3>
//       <Chart options={options} series={chartSeries} type="donut" height={300} />
//     </div>
//   );
// };

// export default SalesPaymentChart;
