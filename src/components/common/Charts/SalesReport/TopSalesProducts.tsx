import React, { useState } from "react";
import { Tag } from "antd";
import { useGetSalesTopProductsQuery } from "../../../../redux/features/sales/salesApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CustomDatePicker from "../../Date/CustomDatePicker";

interface TopSalesProductsProps {
  dateRange?: [string | null, string | null];
  setDateRange?: (dates: [string | null, string | null]) => void;
}

const TopSalesProducts: React.FC<TopSalesProductsProps> = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const queryArgs = [
    dateRange[0] && { name: "startDate", value: dateRange[0] },
    dateRange[1] && { name: "endDate", value: dateRange[1] },
  ].filter(Boolean);

  const { data: topProductsData, isLoading } =
    useGetSalesTopProductsQuery(queryArgs);

  const products = topProductsData?.data || [];
  const maxSales =
    products.length > 0
      ? Math.max(...products.map((p: any) => p.salesCount || 0))
      : 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
            Top Sales Products ({products.length})
          </h3>
        </div>

        <div className="w-auto">
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase mb-4 px-2 tracking-wider">
        <span>Product</span>
        <span className="pr-2">Sales</span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 scrollbar-hide">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton width={40} height={16} />
                  <Skeleton width="60%" height={16} />
                </div>
                <Skeleton width={30} height={16} />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          products.slice(0, 10).map((product: any, index: number) => {
            const percentage =
              ((product.salesCount || 0) / (maxSales || 1)) * 100;
            return (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg overflow-hidden"
              >
                {/* Progress Background - neutral gray */}
                <div
                  className="absolute inset-y-0 left-0  dark:bg-gray-700/50 rounded-lg transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Tag className="m-0 border-none bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 font-bold text-[10px] px-2 min-w-fit rounded-md">
                      {product.sku || "N/A"}
                    </Tag>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {product.productName}
                      {product.variantName ? (
                        <span className="text-gray-400 ml-1">
                          - {product.variantName}
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white pl-4">
                    {product.salesCount || 0}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 font-medium">
            No products found
          </div>
        )}
      </div>
    </div>
  );
};

export default TopSalesProducts;
