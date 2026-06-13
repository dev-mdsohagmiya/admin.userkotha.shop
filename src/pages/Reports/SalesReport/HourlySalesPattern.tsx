import { DataTable } from "../../../components/common/Tables";
import { DisplayCurrency } from "../../../utils/currency";

interface HourlySalesData {
  averageAmount: number;
  hour: number;
  hourLabel: string;
  totalAmount: number;
  totalSales: number;
}

interface HourlySalesPatternProps {
  data: HourlySalesData[];
  isLoading: boolean;
  isFetching: boolean;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Convert UTC hour to Bangladesh time starting from 1 PM (13:00)
const convertToBangladeshTime = (utcHour: number) => {
  // Add 6 hours for UTC+6 and adjust to start from 1 PM
  const bangladeshHour = (utcHour + 6) % 24;

  // Format for display
  let period = "";
  let displayHour = bangladeshHour;

  if (bangladeshHour === 0) {
    period = "12 AM";
  } else if (bangladeshHour === 12) {
    period = "12 PM";
  } else if (bangladeshHour < 12) {
    period = `${bangladeshHour} AM`;
  } else {
    displayHour = bangladeshHour - 12;
    period = `${displayHour === 0 ? 12 : displayHour} PM`;
  }

  return {
    hour: bangladeshHour,
    hourLabel: `${bangladeshHour.toString().padStart(2, "0")}:00`,
    period: period,
    // For sorting - rearrange hours to start from 1 PM (13:00)
    sortOrder: (bangladeshHour + 11) % 24, // This will make 13:00 become 0 for sorting
  };
};

// Sort data to start from 1 PM Bangladesh time
const sortBangladeshData = (data: HourlySalesData[]) => {
  return [...data].sort((a, b) => {
    const bangladeshTimeA = convertToBangladeshTime(a.hour);
    const bangladeshTimeB = convertToBangladeshTime(b.hour);
    return bangladeshTimeA.sortOrder - bangladeshTimeB.sortOrder;
  });
};

const HourlyColumns = [
  {
    title: "Bangladesh Time",
    dataIndex: "hour",
    key: "bangladeshTime",
    render: (hour: number) => {
      const bangladeshTime = convertToBangladeshTime(hour);
      return (
        <div>
          <span className="font-medium text-black block">
            {bangladeshTime.period}
          </span>
          <span className="text-xs text-gray-500">
            {bangladeshTime.hourLabel}
          </span>
        </div>
      );
    },
    sorter: (a: HourlySalesData, b: HourlySalesData) => {
      const bangladeshTimeA = convertToBangladeshTime(a.hour);
      const bangladeshTimeB = convertToBangladeshTime(b.hour);
      return bangladeshTimeA.sortOrder - bangladeshTimeB.sortOrder;
    },
    defaultSortOrder: "ascend" as const,
  },

  {
    title: "Total Sales",
    dataIndex: "totalSales",
    key: "totalSales",
    render: (totalSales: number) => (
      <span className="text-black font-medium">{formatNumber(totalSales)}</span>
    ),
    sorter: (a: HourlySalesData, b: HourlySalesData) =>
      a.totalSales - b.totalSales,
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (totalAmount: number) => (
      <span className="font-semibold text-primary">
        <DisplayCurrency amount={totalAmount} />
      </span>
    ),
    sorter: (a: HourlySalesData, b: HourlySalesData) =>
      a.totalAmount - b.totalAmount,
  },
  {
    title: "Average Amount",
    dataIndex: "averageAmount",
    key: "averageAmount",
    render: (averageAmount: number) => (
      <span className="font-semibold text-primary">
        <DisplayCurrency amount={averageAmount} />
      </span>
    ),
    sorter: (a: HourlySalesData, b: HourlySalesData) =>
      a.averageAmount - b.averageAmount,
  },
];

const HourlySalesPattern: React.FC<HourlySalesPatternProps> = ({
  data,
  isLoading,
  isFetching,
}) => {
  // Sort data to start from 1 PM Bangladesh time
  const sortedData = data ? sortBangladeshData(data) : [];

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">
            Loading hourly sales data...
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">
            No hourly sales data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg ">
      <div className="flex items-center justify-between mb-6 ">
        <h2 className="text-[16px] font-semibold text-gray-800">
          Hourly Sales Pattern (Bangladesh Time - Starting from 1 PM)
        </h2>
        {isFetching && (
          <div className="flex items-center text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Updating...
          </div>
        )}
      </div>

      <div className="">
        <DataTable
          columns={HourlyColumns}
          loading={isLoading || isFetching}
          data={sortedData}
          scroll={{ x: true }}
          className="rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
};

export default HourlySalesPattern;
