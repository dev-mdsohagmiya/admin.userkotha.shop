import React from "react";

const ProductReportSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-outfit">
      {/* 1. Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-xl border border-gray-100 dark:border-gray-800"
          ></div>
        ))}
      </div>

      {/* 2. Product Performance Section Skeleton */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 p-6 rounded-lg space-y-4">
        <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
        
        {/* Filter Area Skeleton */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="h-9 w-full max-w-md bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          <div className="flex gap-3 items-center">
            <div className="h-9 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
            <div className="h-9 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
            <div className="h-9 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 h-10 w-full animate-pulse"></div>
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="h-16 w-full border-t border-gray-50 dark:border-gray-800 animate-pulse flex items-center px-4 space-x-4"
            >
              <div className="h-4 w-full bg-gray-50 dark:bg-gray-800/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Analysis Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 p-6 rounded-lg min-h-[300px] space-y-6"
          >
            <div className="h-6 w-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((__, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
                      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReportSkeleton;
