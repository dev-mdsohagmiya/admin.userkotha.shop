import React from "react";

const OverviewSkeleton = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-700 font-outfit">
      {/* 0. Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 px-4 py-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
          <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
        </div>
        <div className="h-10 w-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
      </div>

      {/* 1. Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">
        {Array.from({ length: 11 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>

      {/* 2-4. Sections Skeleton */}
      <div className="space-y-4">
        <div className="h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse"></div>
      </div>

      {/* 5. Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse"></div>
        <div className="h-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

export default OverviewSkeleton;
