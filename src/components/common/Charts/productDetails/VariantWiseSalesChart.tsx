import { Card } from "antd";
import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";

export type Invoice = {
  invoiceNumber: string;
  date: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: "cash" | "card" | "bank" | string;
  customerName: string;
  customerPhone: string;
};

type Props = {
  sales: Invoice[];
};

const VariantWiseSalesChart: React.FC<Props> = ({ sales }) => {
  const [salesPeriod, setSalesPeriod] = useState<
    "yearly" | "weekly" | "hourly"
  >("hourly");

  // Process dynamic data from sales with detailed information for tooltips
  const dynamicSalesData = useMemo(() => {
    if (!sales || sales.length === 0) {
      return {
        yearly: { labels: [], data: [], details: [] },
        weekly: { labels: [], data: [], details: [] },
        daily: { labels: [], data: [], details: [] },
        hourly: { labels: [], data: [], details: [] },
      };
    }

    // Helper function to get month name
    const getMonthName = (month: number) => {
      return new Date(0, month).toLocaleString("en", { month: "short" });
    };

    // Helper function to get day name
    const getDayName = (date: Date) => {
      return date.toLocaleString("en", { weekday: "short" });
    };

    // Helper function to get day label with date

    // Helper function to get hour label
    const getHourLabel = (hour: number) => {
      return `${hour.toString().padStart(2, "0")}:00`;
    };

    // Group sales by period with detailed information
    const yearlyData: {
      [key: string]: { total: number; invoices: Invoice[] };
    } = {};
    const weeklyData: {
      [key: string]: { total: number; invoices: Invoice[] };
    } = {};
    const hourlyData: {
      [key: string]: { total: number; invoices: Invoice[] };
    } = {};

    sales.forEach((invoice) => {
      const date = new Date(invoice.date);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      // Yearly data (by month) - 12 months
      const monthKey = getMonthName(date.getMonth());
      if (!yearlyData[monthKey]) {
        yearlyData[monthKey] = { total: 0, invoices: [] };
      }
      yearlyData[monthKey].total += invoice.totalPrice;
      yearlyData[monthKey].invoices.push(invoice);

      // Weekly data (by day name) - 7 days
      const dayKey = getDayName(date);
      if (!weeklyData[dayKey]) {
        weeklyData[dayKey] = { total: 0, invoices: [] };
      }
      weeklyData[dayKey].total += invoice.totalPrice;
      weeklyData[dayKey].invoices.push(invoice);

      // Hourly data for today only - 24 hours
      if (isToday) {
        const hourKey = getHourLabel(date.getHours());
        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = { total: 0, invoices: [] };
        }
        hourlyData[hourKey].total += invoice.totalPrice;
        hourlyData[hourKey].invoices.push(invoice);
      }
    });

    // Create ordered arrays for each period type
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]; // 12 months
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // 7 days
    const hourOrder = Array.from({ length: 24 }, (_, i) => getHourLabel(i)); // 24 hours

    // Yearly data (all 12 months in order)
    const orderedYearlyData = monthOrder.map((month) => ({
      label: month,
      value: yearlyData[month]?.total || 0,
      details: yearlyData[month]?.invoices || [],
    }));

    // Weekly data (all 7 days in order)
    const orderedWeeklyData = dayOrder.map((day) => ({
      label: day,
      value: weeklyData[day]?.total || 0,
      details: weeklyData[day]?.invoices || [],
    }));

    // Sort daily data by date

    // Hourly data (all 24 hours in order, even empty ones)
    const orderedHourlyData = hourOrder.map((hour) => ({
      label: hour,
      value: hourlyData[hour]?.total || 0,
      details: hourlyData[hour]?.invoices || [],
    }));

    return {
      yearly: {
        labels: orderedYearlyData.map((item) => item.label),
        data: orderedYearlyData.map((item) => item.value),
        details: orderedYearlyData.map((item) => item.details),
      },
      weekly: {
        labels: orderedWeeklyData.map((item) => item.label),
        data: orderedWeeklyData.map((item) => item.value),
        details: orderedWeeklyData.map((item) => item.details),
      },
      hourly: {
        labels: orderedHourlyData.map((item) => item.label),
        data: orderedHourlyData.map((item) => item.value),
        details: orderedHourlyData.map((item) => item.details),
      },
    };
  }, [sales]);

  const salesChartSeries = [
    {
      name: "Sales Amount (TK)",
      data: dynamicSalesData[salesPeriod].data,
    },
  ];

  // Custom tooltip formatter to show all invoice details
  const customTooltip = ({ dataPointIndex }: any) => {
    const currentData = dynamicSalesData[salesPeriod];
    const invoices = currentData.details[dataPointIndex];
    const totalAmount = currentData.data[dataPointIndex];
    const periodLabel = currentData.labels[dataPointIndex];

    if (!invoices || invoices.length === 0) {
      return '<div style="padding: 10px;">No data available</div>';
    }

    // Create a simpler tooltip that works better with ApexCharts
    let tooltipHTML = `
      <div style="
        background: white;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Header -->
        <div style="
          background: #f0f9ff;
          padding: 12px;
          border-bottom: 1px solid #bae6fd;
          border-radius: 6px 6px 0 0;
        ">
          <div style="font-weight: 600; color: #0369a1; font-size: 14px;">
            ${periodLabel}
          </div>
          <div style="color: #059669; font-weight: 600; font-size: 16px; margin-top: 4px;">
            Total: TK ${totalAmount.toFixed(2)}
          </div>
        </div>

        <!-- Invoice List -->
        <div style="
          max-height: 300px;
          overflow-y: auto;
          padding: 8px;
        ">
    `;

    invoices.forEach((invoice: Invoice, index: number) => {
      const invoiceDate = new Date(invoice.date);
      const isLast = index === invoices.length - 1;

      tooltipHTML += `
        <div style="
          padding: 12px;
          border-bottom: ${isLast ? "none" : "1px solid #f1f5f9"};
          background: ${index % 2 === 0 ? "#fafafa" : "white"};
        ">
          <!-- Invoice Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #0c4a6e; font-size: 13px;">
              ${invoice.invoiceNumber}
            </span>
            <span style="color: #059669; font-weight: 600; font-size: 14px;">
              TK ${invoice.totalPrice.toFixed(2)}
            </span>
          </div>
          
          <!-- Invoice Details -->
          <div style="color: #475569; font-size: 12px; line-height: 1.4;">
            <div><strong>Customer:</strong> ${invoice.customerName}</div>
            <div><strong>Phone:</strong> ${invoice.customerPhone}</div>
            <div><strong>Time:</strong> ${invoiceDate.toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              },
            )}</div>
            <div><strong>Items:</strong> ${
              invoice.quantity
            } × TK ${invoice.unitPrice.toFixed(2)}</div>
            <div><strong>Payment:</strong> <span style="text-transform: capitalize; color: #7c3aed;">${
              invoice.paymentMethod
            }</span></div>
          </div>
        </div>
      `;
    });

    tooltipHTML += `
        </div>

        <!-- Footer -->
        <div style="
          background: #f8fafc;
          padding: 12px;
          border-top: 2px solid #e2e8f0;
          border-radius: 0 0 6px 6px;
          font-weight: 600;
          color: #374151;
          font-size: 13px;
        ">
          <div style="display: flex; justify-content: space-between;">
            <span>Total Invoices: ${invoices.length}</span>
            <span>Total Amount: TK ${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;

    return tooltipHTML;
  };

  // Define salesChartOptions for the area chart with custom tooltip
  const salesChartOptions = {
    chart: {
      height: 350,
      type: "area" as const,
      toolbar: {
        show: false,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
      colors: ["#ff3d0a"],
    },
    xaxis: {
      categories: dynamicSalesData[salesPeriod].labels,
      labels: {
        style: {
          colors: "#ff3d0a",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Sales Amount (TK)",
        style: {
          color: "#ff3d0a",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
      labels: {
        formatter: (val: number) => `TK ${val.toFixed(0)}`,
        style: {
          colors: "#475569",
          fontSize: "11px",
        },
      },
    },
    colors: ["#ff3d0a"], // Primary green color
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
        colorStops: [
          [
            {
              offset: 0,
              color: "#0ba24500",
              opacity: 1,
            },
            {
              offset: 100,
              color: "#ff3d0a",
              opacity: 1,
            },
          ],
        ],
      },
    },
    tooltip: {
      custom: customTooltip,
      shared: true,
      intersect: false,
    },
    markers: {
      size: 5,
      colors: ["#ff3d0a"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 5,
    },
  };

  // Calculate today's total sales for hourly view
  // const todayTotal = useMemo(() => {
  //   const today = new Date().toDateString();
  //   return sales
  //     .filter(invoice => new Date(invoice.date).toDateString() === today)
  //     .reduce((sum, invoice) => sum + invoice.totalPrice, 0);
  // }, [sales]);

  // Calculate today's invoice count for hourly view
  // const todayInvoiceCount = useMemo(() => {
  //   const today = new Date().toDateString();
  //   return sales.filter(invoice => new Date(invoice.date).toDateString() === today).length;
  // }, [sales]);

  return (
    <div>
      {/* Sales Analytics Section */}
      <Card
        title={
          <div className="flex items-center gap-2 text-gray-900">
            <span className="font-semibold">Sales Analytics</span>
            <span className="text-sm text-gray-500">
              ({sales?.length} total invoices)
            </span>
          </div>
        }
        className="border border-gray-200"
        extra={
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: "hourly", label: "Today" },
              { key: "weekly", label: "This Weekly" },
              { key: "yearly", label: "This Yearly" },
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSalesPeriod(period.key as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  salesPeriod === period.key
                    ? "bg-white text-green-600 border border-green-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        }
      >
        {dynamicSalesData[salesPeriod].data.length === 0 ? (
          <div className="flex items-center justify-center h-350">
            <p className="text-gray-500">
              No sales data available for the selected period
            </p>
          </div>
        ) : (
          <div>
            {/* <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200"> */}
            {/* <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-green-800">
                    {salesPeriod === 'hourly' ? "Today's Hourly Sales" : 
                   
                     salesPeriod === 'weekly' ? "Weekly Sales Summary" : 
                     "Yearly Sales Summary"}
                  </h3>
                  <p className="text-green-600 text-sm">
                    {salesPeriod === 'hourly' ? `Today (${new Date().toLocaleDateString()}) - 24 Hours` : 
                   
                    salesPeriod === 'weekly' ? '7 Days (Sun - Sat)' :
                    '12 Months (Jan - Dec)'}
                  </p>
                </div>
                <div className="text-right">
TK
                  </p>
                  <p className="text-green-600 text-sm">
                    {salesPeriod === 'hourly' ? todayInvoiceCount : dynamicSalesData[salesPeriod].details.flat().length} invoices
                  </p>
                </div>
              </div> */}
            {/* </div> */}
            <Chart
              options={salesChartOptions}
              series={salesChartSeries}
              type="area"
              height={350}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default VariantWiseSalesChart;
