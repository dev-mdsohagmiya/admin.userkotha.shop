import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card } from "antd";

const RequisitionDetailsSkeleton = () => {
  return (
    <div className="space-y-6 pb-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <Skeleton
            width="60%"
            height={28}
            className="mb-2 rounded-md"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width="40%"
            height={16}
            borderRadius={4}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        <div className="flex gap-3">
          <Skeleton
            width={100}
            height={32}
            borderRadius={20}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>

      {/* Main Info Card Skeleton */}
      <Card className="rounded-2xl border border-gray-300 shadow-none overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Req Info */}
          <div className="p-5 flex flex-col gap-2">
            <Skeleton width="40%" height={10} />
            <Skeleton width="70%" height={24} />
            <Skeleton width="30%" height={16} borderRadius={4} />
          </div>

          {/* Product Info */}
          <div className="p-5 flex flex-col gap-2 col-span-2">
            <Skeleton width="20%" height={10} />
            <Skeleton width="60%" height={24} />
            <div className="flex gap-2">
              <Skeleton width="30%" height={12} />
              <Skeleton width="30%" height={12} />
            </div>
          </div>

          {/* Batch Size Info */}
          <div className="p-5 flex flex-col gap-2 border-l border-gray-300">
            <Skeleton width="40%" height={10} />
            <div className="flex items-baseline gap-2">
              <Skeleton width="50%" height={32} />
              <Skeleton width="20%" height={12} />
            </div>
          </div>
        </div>

        {/* Notes Section Skeleton */}
        <div className="px-6 py-4 border-t border-gray-300 flex gap-4">
          <div className="flex-1">
            <Skeleton width="15%" height={10} className="mb-1" />
            <Skeleton width="90%" height={14} />
          </div>
          <div className="flex-1 border-l border-gray-300 pl-4">
            <Skeleton width="15%" height={10} className="mb-1" />
            <Skeleton width="90%" height={14} />
          </div>
        </div>
      </Card>

      {/* Table Section Skeleton */}
      <Card
        className="rounded-2xl !mt-4 border border-gray-300 shadow-none bg-white overflow-hidden"
        title={
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2">
              <Skeleton circle width={20} height={20} />
              <Skeleton width={200} height={20} />
            </div>
            <Skeleton width={80} height={24} borderRadius={12} />
          </div>
        }
      >
        <div className="">
          {/* Table Header */}
          <div className="flex justify-between mb-4 border-b border-gray-100 pb-3 px-4">
            <Skeleton width="5%" height={16} />
            <Skeleton width="30%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="25%" height={16} />
            <Skeleton width="15%" height={16} />
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 px-4"
            >
              <Skeleton width="5%" height={16} />
              <div className="w-[30%]">
                <Skeleton width="80%" height={16} />
              </div>
              <Skeleton width="15%" height={20} borderRadius={12} />
              <div className="w-[25%]">
                <div className="flex justify-between mb-1">
                  <Skeleton width="20%" height={10} />
                </div>
                <Skeleton width="100%" height={6} borderRadius={4} />
              </div>
              <Skeleton width="15%" height={32} borderRadius={8} />
            </div>
          ))}
        </div>

        {/* Footer Summary Skeleton */}
        <div className="mt-8 pt-6 border-t border-gray-300 px-6 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            {/* Cumulative Input */}
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-300 w-full md:w-[400px]">
                <div className="flex flex-col flex-1">
                  <Skeleton width="60%" height={10} className="mb-1" />
                  <Skeleton width="80%" height={24} />
                </div>
                <div className="w-px h-10 bg-gray-200 mx-2" />
                <div className="flex flex-col flex-1">
                  <Skeleton width="60%" height={10} className="mb-1" />
                  <Skeleton width="80%" height={24} />
                </div>
              </div>
            </div>

            {/* Check Box */}
            <div className="rounded-xl px-5 py-4 border border-gray-300 w-full md:w-72">
              <div className="flex justify-between items-center mb-2">
                <Skeleton width="40%" height={10} />
                <Skeleton width="30%" height={16} borderRadius={12} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton width="30%" height={10} />
                  <Skeleton width="20%" height={10} />
                </div>
                <div className="flex justify-between">
                  <Skeleton width="30%" height={10} />
                  <Skeleton width="20%" height={10} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RequisitionDetailsSkeleton;
