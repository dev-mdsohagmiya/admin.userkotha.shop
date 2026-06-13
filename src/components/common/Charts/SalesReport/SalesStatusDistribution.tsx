import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Loader } from "../../Loading";

interface StatusDistributionData {
  status: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

interface SalesStatusDistributionProps {
  data: StatusDistributionData[];
  isLoading: boolean;
  isFetching: boolean;
}

interface BarSeries {
  name: string;
  data: number[];
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

const SalesStatusDistribution: React.FC<SalesStatusDistributionProps> = ({
  data,
  isLoading,
  isFetching,
}) => {
  // Bar Chart Configuration with Map-like styling
  const barOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 500,
      toolbar: {
        show: false,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
        },
      },
      background: "transparent",
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
        borderRadiusApplication: "end",
        distributed: false,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => formatNumber(val),
      offsetY: -25,
      style: {
        fontSize: "12px",
        colors: ["#ffffff"],
        fontWeight: "bold",
      },
    },
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    xaxis: {
      categories:
        data?.map(
          (item: StatusDistributionData) =>
            item.status.charAt(0).toUpperCase() +
            item.status.slice(1).toLowerCase(),
        ) || [],
      labels: {
        style: {
          colors: "#374151",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "inherit",
        },
        rotate: 0,
      },
      axisBorder: {
        show: true,
        color: "#D1D5DB",
      },
      axisTicks: {
        show: true,
        color: "#D1D5DB",
      },
      title: {
        text: "Sales Status",
        style: {
          color: "#374151",
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily: "inherit",
        },
      },
    },
    yaxis: {
      title: {
        text: "Transaction Count",
        style: {
          color: "#374151",
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily: "inherit",
        },
      },
      labels: {
        formatter: (val: number) => formatNumber(val),
        style: {
          colors: "#374151",
          fontSize: "11px",
          fontFamily: "inherit",
        },
      },
      axisBorder: {
        show: true,
        color: "#D1D5DB",
      },
    },
    fill: {
      opacity: 1,
      type: "solid",
    },
    colors: ["#009531"], // Single consistent green
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      padding: {
        top: -20,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      custom: function ({ dataPointIndex }: any) {
        const item = data[dataPointIndex];
        const status =
          item.status.charAt(0).toUpperCase() +
          item.status.slice(1).toLowerCase();
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
            ">${status}</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #000000; font-size: 12px; font-weight: 500;">Count:</span>
                <span style="font-weight: 700; color: #000000; font-size: 13px; background: #f3f4f6; padding: 2px 8px; border-radius: 6px;">${item.count.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #000000; font-size: 12px; font-weight: 500;">Total Amount:</span>
                <span style="font-weight: 700; color: #000000; font-size: 13px; background: #f3f4f6; padding: 2px 8px; border-radius: 6px;">TK ${item.totalAmount.toLocaleString()}</span>
              </div>
           
            </div>
            <div style="
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            ">
              <span style="color: #000000; font-size: 11px; font-weight: 600;">📊 Sales Analytics</span>
            </div>
          </div>
        `;
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 400,
          },
          plotOptions: {
            bar: {
              columnWidth: "70%",
              borderRadius: 6,
            },
          },
          dataLabels: {
            style: {
              fontSize: "10px",
            },
          },
        },
      },
    ],
  };

  const barSeries: BarSeries[] = [
    {
      name: "Transaction Count",
      data: data?.map((item: StatusDistributionData) => item.count) || [],
    },
  ];

  if (isLoading || isFetching) {
    return <Loader />;
  }

  return (
    <>
      <div className="rounded-md p-4 border ">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-semibold flex items-center">
            sales status distribution
          </h3>
        </div>

        <ReactApexChart
          options={barOptions}
          series={barSeries}
          type="bar"
          height={300}
        />
      </div>
    </>
  );
};

export default SalesStatusDistribution;
