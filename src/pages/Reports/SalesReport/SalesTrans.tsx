import React, { useState } from "react";
import { Button } from "antd";
import { DataTable } from "../../../components/common/Tables";
import { useGetSalesTrendsQuery } from "../../../redux/features/sales/salesApi";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  subDays,
} from "date-fns";
import { DisplayCurrency } from "../../../utils/currency";

const SalesTrans = () => {
  const today = new Date();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "day" | "week" | "month" | "year" | "lastYear"
  >("all");

  let startDate: string | undefined;
  let endDate: string | undefined;

  if (selectedFilter !== "all") {
    switch (selectedFilter) {
      case "day":
        startDate = format(today, "yyyy-MM-dd");
        endDate = format(addDays(today, 1), "yyyy-MM-dd");
        break;

      case "week": {
        const day = today.getDay(); // 0=Sunday, 6=Saturday
        const daysSinceSaturday = (day + 1) % 7; // Saturday as week start
        const startOfWeekDate = subDays(today, daysSinceSaturday);
        const endOfWeekDate = addDays(startOfWeekDate, 6); // Friday
        startDate = format(startOfWeekDate, "yyyy-MM-dd");
        endDate = format(addDays(endOfWeekDate, 1), "yyyy-MM-dd"); // next day after Friday
        break;
      }

      case "month":
        startDate = format(startOfMonth(today), "yyyy-MM-dd");
        endDate = format(addDays(endOfMonth(today), 1), "yyyy-MM-dd");
        break;

      case "year":
        startDate = format(startOfYear(today), "yyyy-MM-dd");
        endDate = format(addDays(endOfYear(today), 1), "yyyy-MM-dd");
        break;

      default:
        startDate = undefined;
        endDate = undefined;
        break;
    }
  }

  // Fetch sales trends
  const {
    data: salesTrends,
    isLoading: trendsLoading,
    isFetching: trendSFetching,
  } = useGetSalesTrendsQuery(
    selectedFilter === "all"
      ? []
      : [
          { name: "startDate", value: startDate },
          { name: "endDate", value: endDate },
        ],
  );

  const trends = salesTrends?.data || [];

  // Table columns
  const trendsColumn = [
    {
      title: "Date",
      dataIndex: "period",
      key: "period",
      sorter: (
        a: { period: string | number | Date },
        b: { period: string | number | Date },
      ) => new Date(a.period).getTime() - new Date(b.period).getTime(),
      render: (text: string) =>
        new Date(text).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      title: "Total Sales",
      dataIndex: "totalSales",
      key: "totalSales",
    },
    {
      title: "Total Amount",
      dataIndex: "totalFinalAmount",
      key: "totalFinalAmount",
      render: (totalFinalAmount: number) => (
        <DisplayCurrency amount={totalFinalAmount} />
      ),
    },
    {
      title: "Total Paid",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (totalPaid: number) => <DisplayCurrency amount={totalPaid} />,
    },
    {
      title: "Total Due",
      dataIndex: "totalDue",
      key: "totalDue",
      render: (totalDue: number) => (
        <span className="font-semibold text-red-700">
          <DisplayCurrency amount={totalDue} />
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className=" mt-7 mb-4">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-[16px] text-gray-800">
            Date-Wise Sales Report
          </h3>
        </div>

        <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="middle"
              type={selectedFilter === "all" ? "primary" : "default"}
              onClick={() => setSelectedFilter("all")}
            >
              All
            </Button>
            <Button
              size="middle"
              type={selectedFilter === "day" ? "primary" : "default"}
              onClick={() => setSelectedFilter("day")}
            >
              Today
            </Button>
            <Button
              size="middle"
              type={selectedFilter === "week" ? "primary" : "default"}
              onClick={() => setSelectedFilter("week")}
            >
              This Week
            </Button>
            <Button
              size="middle"
              type={selectedFilter === "month" ? "primary" : "default"}
              onClick={() => setSelectedFilter("month")}
            >
              This Month
            </Button>
            <Button
              size="middle"
              type={selectedFilter === "year" ? "primary" : "default"}
              onClick={() => setSelectedFilter("year")}
            >
              This Year
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[1000px] overflow-y-auto">
          <DataTable
            columns={trendsColumn}
            rowKey="id"
            loading={trendsLoading || trendSFetching}
            data={trends}
            scroll={{ x: true }}
            className="rounded-lg shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default SalesTrans;
