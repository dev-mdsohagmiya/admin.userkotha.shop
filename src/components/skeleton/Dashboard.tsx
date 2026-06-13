import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DashboardSkeleton = () => {
  return (
    <div className="">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border rounded-lg p-6 border-gray-200 h-[90px] flex items-center justify-between relative overflow-hidden"
          >
            <div className="flex-1">
              {/* Title */}
              <Skeleton width="50%" height={14} className="" />
              {/* Value */}
              <Skeleton width="70%" height={24} />
            </div>
            <div className="ml-4">
              {/* Icon */}
              <Skeleton width={40} height={40} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border rounded-lg p-6  min-h-[350px]">
          <Skeleton width="40%" height={20} className="mb-6" />
          <Skeleton height={250} />
        </div>
        <div className="bg-white border rounded-lg p-6  min-h-[350px]">
          <Skeleton width="40%" height={20} className="mb-6" />
          <div className="flex items-center justify-center h-[250px]">
            <Skeleton circle width={200} height={200} />
          </div>
        </div>
      </div>

      {/* Visitor Analytics Skeleton */}
      <div className="bg-white border rounded-lg p-6  min-h-[400px]">
        <Skeleton width="30%" height={20} className="mb-6" />
        <Skeleton height={300} />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
