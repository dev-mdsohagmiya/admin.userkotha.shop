import React, { useState } from "react";
import { FiMapPin, FiBarChart2 } from "react-icons/fi";
import { DataTable } from "../../../../../components/common/Tables";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { getDefaultDateRange } from "../../../../../utils/dateRange";

const DistrictWiseSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    getDefaultDateRange(),
  );

  const columns = [
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      render: (text: string) => (
        <span className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">
          {text}
        </span>
      ),
    },
    {
      title: "Total Orders",
      dataIndex: "orders",
      key: "orders",
      align: "center" as const,
      sorter: (a: any, b: any) => a.orders - b.orders,
    },
    {
      title: "Success Rate",
      dataIndex: "successRate",
      key: "successRate",
      align: "center" as const,
      render: (rate: number) => (
        <div className="flex items-center gap-2 justify-center">
          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${rate}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-bold">{rate}%</span>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (val: number) => (
        <span className="font-black text-primary">৳{val.toLocaleString()}</span>
      ),
    },
    {
      title: "Last Delivery",
      dataIndex: "lastDelivery",
      key: "lastDelivery",
      render: (date: string) => (
        <span className="text-[10px] text-gray-400 font-medium italic">
          {date}
        </span>
      ),
    },
  ];

  const dummyData = [
    {
      key: 1,
      district: "Dhaka",
      orders: 1250,
      successRate: 92,
      revenue: 850000,
      lastDelivery: "2 hours ago",
    },
    {
      key: 2,
      district: "Chattogram",
      orders: 840,
      successRate: 88,
      revenue: 420000,
      lastDelivery: "5 hours ago",
    },
    {
      key: 3,
      district: "Sylhet",
      orders: 450,
      successRate: 95,
      revenue: 210000,
      lastDelivery: "1 day ago",
    },
    {
      key: 4,
      district: "Rajshahi",
      orders: 320,
      successRate: 85,
      revenue: 150000,
      lastDelivery: "12 hours ago",
    },
    {
      key: 5,
      district: "Khulna",
      orders: 280,
      successRate: 82,
      revenue: 120000,
      lastDelivery: "3 hours ago",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-none flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl">
            <FiMapPin />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
              Geographical Insights
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Order distribution across different districts of Bangladesh.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CustomDatePicker
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
            selectedData={dateRange}
          />
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <FiBarChart2 className="text-primary" />
            <span className="text-xs font-black uppercase text-gray-800 dark:text-white">
              Active Zones: 64
            </span>
          </div>
        </div>
      </div>

      <div className="">
        <DataTable
          columns={columns}
          data={dummyData}
          loading={false}
          isPaginate={true}
          total={5}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};

export default DistrictWiseSubTab;
