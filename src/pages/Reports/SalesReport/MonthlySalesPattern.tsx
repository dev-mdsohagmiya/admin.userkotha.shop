import React from 'react';
import { DataTable } from '../../../components/common/Tables';

interface MonthlySalesData {
  month: string;
  totalSales: number;
  totalAmount: number;
  totalDiscount: number;
  totalFinalAmount: number;
  totalPaid: number;
  totalDue: number;
  averageOrderValue: number;
}

interface MonthlySalesComparisonProps {
  data: MonthlySalesData[];
  isLoading: boolean;
  isFetching: boolean;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatMonth = (monthString: string) => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const MonthlyColumns = [
  {
    title: "Month",
    dataIndex: "month",
    key: "month",
    render: (month: string) => (
      <span className="font-medium text-black">
        {formatMonth(month)}
      </span>
    ),
  },
  {
    title: "Total Sales",
    dataIndex: "totalSales",
    key: "totalSales",
    render: (totalSales: number) => (
      <span className="text-black font-medium">
        {formatNumber(totalSales)}
      </span>
    ),
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (totalAmount: number) => (
      <span className="font-semibold text-primary">
        {formatNumber(totalAmount)}
      </span>
    ),
  },
  {
    title: "Total Discount",
    dataIndex: "totalDiscount",
    key: "totalDiscount",
    render: (totalDiscount: number) => (
      <span className="text-black">
        {formatNumber(totalDiscount)}
      </span>
    ),
  },
  {
    title: "Final Amount",
    dataIndex: "totalFinalAmount",
    key: "totalFinalAmount",
    render: (totalFinalAmount: number) => (
      <span className="font-semibold text-primary">
        {formatNumber(totalFinalAmount)}
      </span>
    ),
  },
  {
    title: "Total Paid",
    dataIndex: "totalPaid",
    key: "totalPaid",
    render: (totalPaid: number) => (
      <span className="text-primary">
        {formatNumber(totalPaid)}
      </span>
    ),
  },
  {
    title: "Total Due",
    dataIndex: "totalDue",
    key: "totalDue",
    render: (totalDue: number) => (
      <span className="text-black">
        {formatNumber(totalDue)}
      </span>
    ),
  },
  {
    title: "Avg Order Value",
    dataIndex: "averageOrderValue",
    key: "averageOrderValue",
    render: (averageOrderValue: number) => (
      <span className="font-semibold text-primary">
        {formatNumber(Math.round(averageOrderValue))}
      </span>
    ),
  },
];

const MonthlySalesComparison: React.FC<MonthlySalesComparisonProps> = ({
  data,
  isLoading,
  isFetching
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading monthly sales data...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">No monthly sales data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-semibold text-black">Monthly Sales Comparison</h2>
        {isFetching && (
          <div className="flex items-center text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Updating...
          </div>
        )}
      </div>

      <DataTable
        columns={MonthlyColumns}
        loading={isLoading || isFetching}
        data={data}
        scroll={{ x: true }}
        className="rounded-lg shadow-sm"
      />
    </div>
  );
};

export default MonthlySalesComparison;