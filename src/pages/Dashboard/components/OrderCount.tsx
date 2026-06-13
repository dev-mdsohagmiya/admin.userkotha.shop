import React, { useMemo, useState } from "react";
import { Tag, Select } from "antd";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { config } from "../../../config";
import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import { useGetDashboardOrdersReportQuery } from "../../../redux/features/report/reportApi";
import {
  buildReportDateQueryArgs,
  getThisWeekRange,
} from "../../../utils/dateRange";

const allowedStatuses = ["PENDING", "CONFIRM", "SHIPPED", "DELIVERED"];

const OrderCount: React.FC = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    () => getThisWeekRange(),
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");

  const queryArgs = useMemo(
    () => buildReportDateQueryArgs(dateRange),
    [dateRange],
  );

  const { data: ordersData, isLoading, isFetching } =
    useGetDashboardOrdersReportQuery(queryArgs);

  const showListSkeleton = isLoading || isFetching;

  const orderStatusByProduct =
    ordersData?.data?.products?.byOrderStatus ?? [];

  const filteredOrderStatusByProduct = orderStatusByProduct.filter(
    (s: { status?: string }) =>
      s.status && allowedStatuses.includes(s.status),
  );

  const currentStatusData = filteredOrderStatusByProduct?.find(
    (s: { status?: string }) => s.status === selectedStatus,
  );

  const items = currentStatusData?.items || [];

  const sortedItems = [...items].sort(
    (a: { orderCount?: number }, b: { orderCount?: number }) =>
      (b.orderCount || 0) - (a.orderCount || 0),
  );

  const maxOrderCount =
    sortedItems.length > 0
      ? Math.max(...sortedItems.map((p: { orderCount?: number }) => p.orderCount || 0))
      : 100;

  const statusOptions = (filteredOrderStatusByProduct || []).map(
    (s: { status?: string; orderCount?: number }) => ({
      label: `${(s.status || "").replace(/_/g, " ")} (${s.orderCount || 0})`,
      value: s.status,
    }),
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            Order
            <span className="text-primary font-bold px-2 py-1 text-sm bg-[#ff3d0a]/10 rounded-lg">
              {showListSkeleton ? (
                <Skeleton width={20} height={18} />
              ) : (
                sortedItems.length
              )}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 w-auto">
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          <Select
            value={selectedStatus || undefined}
            onChange={(val) => setSelectedStatus(val)}
            options={statusOptions}
            className="min-w-[120px]"
            placeholder="Select Status"
            size="middle"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase mb-4 px-2 tracking-wider">
        <span>Product</span>
        <span className="pr-2">Orders</span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
        {showListSkeleton ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-50 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton width={20} height={20} borderRadius={6} />
                  <Skeleton width={48} height={20} borderRadius={6} />
                  <Skeleton width="55%" height={16} />
                </div>
                <Skeleton width={24} height={16} />
              </div>
            ))}
          </>
        ) : sortedItems.length > 0 ? (
          sortedItems.map((product: any, index: number) => {
            const percentage =
              ((product.orderCount || 0) / (maxOrderCount || 1)) * 100;
            return (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-50 dark:border-gray-700/50"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[#A5D6C9]/40 dark:bg-emerald-900/30 rounded-lg transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <img
                      className="w-[20px] h-[20px] object-cover rounded-md"
                      src={config.image_access_url + product.image}
                      alt={product.name}
                    />
                    <Tag className="m-0 border-none bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 font-bold text-[10px] px-2 min-w-fit rounded-md shadow-sm">
                      {product.sku || "N/A"}
                    </Tag>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 pl-4">
                    {product.orderCount || 0}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 font-medium bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            No products found for this status
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCount;
