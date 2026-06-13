import React from 'react';
import { DataTable } from '../../../components/common/Tables';

interface WeeklySalesData {
  dayOfWeek: number;
  dayName: string;
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
}

interface WeeklySalesPatternProps {
  data: WeeklySalesData[];
  isLoading: boolean;
  isFetching: boolean;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Order days from Sunday to Saturday

const WeeklyColumns = [
  {
    title: "Day",
    dataIndex: "dayName",
    key: "dayName",
    render: (dayName: string) => (
      <span className="font-medium text-black">{dayName}</span>
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
    title: "Average Amount",
    dataIndex: "averageAmount",
    key: "averageAmount",
    render: (averageAmount: number) => (
      <span className="font-semibold text-primary">
        {formatNumber(Math.round(averageAmount))}
      </span>
    ),
  },
];

const WeeklySalesPattern: React.FC<WeeklySalesPatternProps> = ({
  data,
  isLoading,
  isFetching
}) => {
  // Sort data by day of week (Sunday to Saturday)
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading weekly sales data...</div>
        </div>
      </div>
    );
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">No weekly sales data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-semibold text-gray-800">Weekly Sales Pattern</h2>
        {isFetching && (
          <div className="flex items-center text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Updating...
          </div>
        )}
      </div>

      <DataTable
        columns={WeeklyColumns}
        loading={isLoading || isFetching}
        data={sortedData}
        scroll={{ x: true }}
        className="rounded-lg shadow-sm"
      />
    </div>
  );
};

export default WeeklySalesPattern;
