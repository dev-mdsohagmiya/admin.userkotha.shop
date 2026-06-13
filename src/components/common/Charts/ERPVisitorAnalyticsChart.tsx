import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import Chart from "react-apexcharts";
import {
  useGetSalesDayPatternQuery,
  useGetSalesHourlyPatternQuery,
  useGetSalesMonthlyComparisonQuery,
} from "../../../redux/features/sales/salesApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface MonthlyData {
  month: string;
  totalSales: number;
  totalAmount: number;
  totalDiscount: number;
  totalFinalAmount: number;
  totalPaid: number;
  totalDue: number;
  averageOrderValue: number;
}

interface DayData {
  dayOfWeek: number;
  dayName: string;
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
}

interface HourlyData {
  hour: number;
  hourLabel: string;
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
  displayHour: number;
  displayHourLabel: string;
}

interface ERPVisitorAnalyticsChartProps {
  dateRange?: [string | null, string | null];
}

const ERPVisitorAnalyticsChart: React.FC<ERPVisitorAnalyticsChartProps> = ({
  dateRange,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    "12 months" | "7 days" | "24 hours"
  >("12 months");

  const queryArgs = [
    dateRange?.[0] && { name: "startDate", value: dateRange[0] },
    dateRange?.[1] && { name: "endDate", value: dateRange[1] },
  ].filter(Boolean);

  // Hourly Pattern
  const { data: hourlyPatternData, isLoading: hourlyPatternLoading } =
    useGetSalesHourlyPatternQuery(queryArgs);

  const hourlyPattern = hourlyPatternData?.data || [];

  // Day Pattern
  const { data: dayPatternData, isLoading: dayPatternLoading } =
    useGetSalesDayPatternQuery(queryArgs);

  const dayPattern = dayPatternData?.data || [];

  // Monthly Comparison
  const { data: monthlyComparisonData, isLoading: monthlyComparisonLoading } =
    useGetSalesMonthlyComparisonQuery(queryArgs);

  const monthlyComparison = monthlyComparisonData?.data || [];

  // Helper function to convert 24-hour to 12-hour format

  // Helper function to get detailed time information
  const getTimeDetails = (hour24: number) => {
    const period = hour24 < 12 ? "AM" : "PM";
    const hour12 = hour24 % 12 || 12;
    const timeOfDay =
      hour24 < 6
        ? "Late Night"
        : hour24 < 12
          ? "Morning"
          : hour24 < 17
            ? "Afternoon"
            : hour24 < 21
              ? "Evening"
              : "Night";

    return {
      hour12: hour12,
      period: period,
      timeOfDay: timeOfDay,
      display12Hour: `${hour12} ${period}`,
      displayFull: `${hour12}:00 ${period} (${timeOfDay})`,
    };
  };

  // Process data from APIs
  const processChartData = () => {
    switch (activeFilter) {
      case "12 months": {
        const monthlyData = monthlyComparison.map(
          (item: MonthlyData) => item.totalSales || 0,
        );
        const monthlyLabels = monthlyComparison.map((item: MonthlyData) => {
          const date = new Date(item.month);
          return date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        });
        return {
          data: monthlyData,
          labels: monthlyLabels,
          originalData: monthlyComparison,
        };
      }

      case "7 days": {
        const dayData = [0, 0, 0, 0, 0, 0, 0];
        const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOriginalData: (DayData | null)[] = Array(7).fill(null);

        dayPattern.forEach((item: DayData) => {
          dayData[item.dayOfWeek] = item.totalSales || 0;
          dayOriginalData[item.dayOfWeek] = item;
        });
        return {
          data: dayData,
          labels: dayLabels,
          originalData: dayOriginalData,
        };
      }

      case "24 hours": {
        // Convert UTC to Bangladesh time (UTC+6) and use 12-hour format
        const hourData = Array(24).fill(0);
        // Show all 24 hour labels: 12 AM, 1 AM, 2 AM, ..., 11 PM
        const hourLabels = Array.from({ length: 24 }, (_, i) => {
          return getTimeDetails(i).display12Hour; // e.g. "12 AM", "1 AM", "6 PM"
        });

        const hourOriginalData: (HourlyData | null)[] = Array(24).fill(null);

        hourlyPattern.forEach((item: HourlyData) => {
          // Convert UTC hour to Bangladesh hour (UTC+6)
          const bangladeshHour = (item.hour + 6) % 24;

          if (bangladeshHour >= 0 && bangladeshHour < 24) {
            hourData[bangladeshHour] = item.totalSales || 0;
            const timeDetails = getTimeDetails(bangladeshHour);
            hourOriginalData[bangladeshHour] = {
              ...item,
              displayHour: bangladeshHour,
              displayHourLabel: timeDetails.displayFull,
            };
          }
        });
        return {
          data: hourData,
          labels: hourLabels,
          originalData: hourOriginalData,
        };
      }
    }
  };

  const {
    data: chartData,
    labels: categories,
    originalData,
  } = processChartData();

  const chartType = activeFilter === "24 hours" ? "area" : "bar";

  const options: ApexOptions = {
    chart: {
      type: chartType,
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#ff3d0a"],
    stroke: {
      curve: "smooth",
      width: activeFilter === "24 hours" ? 2 : 0,
    },
    fill: {
      type: activeFilter === "24 hours" ? "gradient" : "solid",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: "end",
        columnWidth: "50%",
      },
    },
    markers: {
      size: activeFilter === "24 hours" ? 4 : 0,
      colors: ["#ff3d0a"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    dataLabels: {
      enabled: activeFilter !== "24 hours",
      formatter: (val: number) => (val > 0 ? val.toString() : ""),
      style: {
        fontSize: "11px",
        fontWeight: "700",
        colors: ["#ff3d0a"],
      },
      offsetY: -6,
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: 10,
        bottom: activeFilter === "24 hours" ? 40 : 0,
      },
    },
    xaxis: {
      categories: categories,
      ...(activeFilter !== "24 hours" && { tickPlacement: "between" }),
      labels: {
        style: {
          colors: "#64748b",
          fontSize: activeFilter === "24 hours" ? "10px" : "11px",
        },
        rotate: activeFilter === "24 hours" ? -45 : 0,
        rotateAlways: activeFilter === "24 hours",
        hideOverlappingLabels: false,
        trim: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
        formatter: (value: number) => value.toFixed(0),
      },
    },
    tooltip: {
      custom: function ({
        seriesIndex,
        dataPointIndex,
      }: {
        seriesIndex: number;
        dataPointIndex: number;
      }) {
        if (seriesIndex === undefined || dataPointIndex === undefined)
          return "";

        const currentData = originalData[dataPointIndex];
        const salesCount = chartData[dataPointIndex];
        const periodLabel = categories[dataPointIndex];

        // Format currency
        const formatCurrency = (amount: number | undefined) => {
          return (
            amount?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0"
          );
        };

        // Format numbers
        const formatNumber = (num: number | undefined) => {
          return num?.toLocaleString() || "0";
        };

        let tooltipContent = "";

        switch (activeFilter) {
          case "12 months": {
            const monthlyData = currentData as MonthlyData;
            tooltipContent = `
              <div style="padding: 16px; min-width: 280px; font-family: Inter, sans-serif;">
                <div style="font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #ff3d0a; padding-bottom: 8px;">
                  ${periodLabel}
                </div>
                <div style="display: grid; gap: 8px; font-size: 13px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📊 Sales Count:</span>
                    <span style="color: #ff3d0a; font-weight: 700; font-size: 14px;">${formatNumber(
                      salesCount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">💰 Total Amount:</span>
                    <span style="color: #ff3d0a; font-weight: 700;">TK ${formatCurrency(
                      monthlyData?.totalAmount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">🎁 Discount:</span>
                    <span style="color: #ef4444; font-weight: 700;">TK ${formatCurrency(
                      monthlyData?.totalDiscount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">✅ Final Amount:</span>
                    <span style="color: #10b981; font-weight: 700;">TK ${formatCurrency(
                      monthlyData?.totalFinalAmount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">💳 Paid:</span>
                    <span style="color: #10b981; font-weight: 700;">TK ${formatCurrency(
                      monthlyData?.totalPaid,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📝 Due:</span>
                    <span style="color: #ef4444; font-weight: 700;">TK ${formatCurrency(
                      monthlyData?.totalDue,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📦 Avg Order Value:</span>
                    <span style="color: #8b5cf6; font-weight: 700;">TK ${formatCurrency(
                      monthlyData?.averageOrderValue,
                    )}</span>
                  </div>
                </div>
              </div>
            `;
            break;
          }

          case "7 days": {
            const dayData = currentData as DayData;
            const dayNames = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            const fullDayName = dayNames[dataPointIndex];

            tooltipContent = `
              <div style="padding: 16px; min-width: 260px; font-family: Inter, sans-serif;">
                <div style="font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #ff3d0a; padding-bottom: 8px;">
                  ${fullDayName}
                </div>
                <div style="display: grid; gap: 8px; font-size: 13px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📊 Sales Count:</span>
                    <span style="color: #ff3d0a; font-weight: 700; font-size: 14px;">${formatNumber(
                      salesCount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">💰 Total Amount:</span>
                    <span style="color: #ff3d0a; font-weight: 700;">TK ${formatCurrency(
                      dayData?.totalAmount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📈 Avg Amount:</span>
                    <span style="color: #8b5cf6; font-weight: 700;">TK ${formatCurrency(
                      dayData?.averageAmount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📅 Day:</span>
                    <span style="color: #6b7280; font-weight: 600; background: #f3f4f6; padding: 2px 8px; border-radius: 12px;">${
                      dayData?.dayName || periodLabel
                    }</span>
                  </div>
                </div>
              </div>
            `;
            break;
          }

          case "24 hours": {
            const hourlyData = currentData as HourlyData;
            const timeDetails = getTimeDetails(dataPointIndex);

            tooltipContent = `
              <div style="padding: 16px; min-width: 280px; font-family: Inter, sans-serif;">
                <div style="font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #ff3d0a; padding-bottom: 8px;">
                  ${timeDetails.displayFull}
                </div>
                <div style="display: grid; gap: 8px; font-size: 13px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📊 Sales Count:</span>
                    <span style="color: #ff3d0a; font-weight: 700; font-size: 14px;">${formatNumber(
                      salesCount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">💰 Total Amount:</span>
                    <span style="color: #ff3d0a; font-weight: 700;">TK ${formatCurrency(
                      hourlyData?.totalAmount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">📈 Avg Amount:</span>
                    <span style="color: #8b5cf6; font-weight: 700;">TK ${formatCurrency(
                      hourlyData?.averageAmount,
                    )}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">⏰ Time Period:</span>
                    <span style="color: #6b7280; font-weight: 600; background: #f3f4f6; padding: 2px 8px; border-radius: 12px;">${
                      timeDetails.timeOfDay
                    }</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280;">🕒 Format:</span>
                    <span style="color: #6b7280; font-weight: 500;">${
                      timeDetails.hour12
                    } ${timeDetails.period} (${dataPointIndex}:00)</span>
                  </div>
                </div>
              </div>
            `;
            break;
          }
        }

        return `
          <div style="
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
            overflow: hidden;
          ">
            ${tooltipContent}
          </div>
        `;
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: chartData,
    },
  ];

  // Show loading state if any API is loading
  const isLoading =
    hourlyPatternLoading || dayPatternLoading || monthlyComparisonLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-6 h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <Skeleton width="30%" height={24} className="mb-2" />
            <Skeleton width="20%" height={16} />
          </div>
          <div className="flex gap-4">
            <Skeleton width={120} height={32} borderRadius={8} />
            <Skeleton width={200} height={32} borderRadius={8} />
          </div>
        </div>
        <Skeleton height={350} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sales Analytics
          </h3>
          <p className="text-sm text-gray-500">
            Sales performance for {activeFilter}
          </p>
        </div>
        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-md border">
          {["12 months", "7 days", "24 hours"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-white text-green-600 border border-green-200 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Chart options={options} series={series} type={chartType} height={400} />
    </div>
  );
};

export default ERPVisitorAnalyticsChart;
