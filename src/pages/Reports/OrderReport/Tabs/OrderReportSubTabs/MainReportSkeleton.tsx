import React from "react";

const MainReportSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-outfit">
      {/* Search & Filter Bar Skeleton */}
      <div className="flex flex-wrap justify-between items-center gap-4 my-4">
        <div className="h-10 w-full max-w-md bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="h-10 w-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-800 h-10 w-full animate-pulse"></div>
        {/* Table Rows */}
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className="h-16 w-full border-t border-gray-50 dark:border-gray-800 animate-pulse flex items-center px-4 space-x-4"
          >
            <div className="h-4 w-full bg-gray-50 dark:bg-gray-800/50 rounded"></div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-end gap-2 mt-4">
        <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
        <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
        <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
        <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
      </div>
    </div>
  );
};

export default MainReportSkeleton;
