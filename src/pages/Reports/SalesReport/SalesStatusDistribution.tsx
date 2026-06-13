import React from 'react';
import { DataTable } from '../../../components/common/Tables';

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

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatPercentage = (percentage: number) => {
  return `${percentage.toFixed(1)}%`;
};

const StatusDistributionColumns = [
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <span className="font-medium text-black capitalize">
        {status.toLowerCase()}
      </span>
    ),
  },
  {
    title: "Count",
    dataIndex: "count",
    key: "count",
    render: (count: number) => (
      <span className="text-black font-medium">
        {formatNumber(count)}
      </span>
    ),
  },
  {
    title: "Percentage",
    dataIndex: "percentage",
    key: "percentage",
    render: (percentage: number) => (
      <span className="text-primary font-semibold">
        {formatPercentage(percentage)}
      </span>
    ),
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (totalAmount: number) => (
      <span className="text-primary">
        {formatNumber(totalAmount)}
      </span>
    ),
  },
];

const SalesStatusDistribution: React.FC<SalesStatusDistributionProps> = ({
  data,
  isLoading,
  isFetching
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading status distribution...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">No status distribution data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Sales Status Distribution</h2>
        {isFetching && (
          <div className="flex items-center text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Updating...
          </div>
        )}
      </div>

      <DataTable
        columns={StatusDistributionColumns}
        loading={isLoading || isFetching}
        data={data}
        scroll={{ x: true }}
        className="rounded-lg shadow-sm"
      />
    </div>
  );
};

export default SalesStatusDistribution;