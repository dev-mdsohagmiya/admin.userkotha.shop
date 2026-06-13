import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card } from "antd";

const PurchaseReturnViewSkeleton = () => {
  return (
    <div className="mx-auto animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>

      {/* Return Summary Skeleton */}
      <Card
        className="mb-4 border rounded-md bg-white"
        title={
          <div className="border-b border-gray-100 bg-white pb-4 -mb-4">
            <Skeleton width={150} height={24} />
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton width="40%" height={12} />
              <Skeleton width="70%" height={16} />
            </div>
          ))}
        </div>
      </Card>

      {/* Returned Item List Skeleton */}
      <Card
        className="mb-4 border rounded-md bg-white"
        title={
          <div className="pb-4 border-b border-gray-100 bg-white -mb-4 flex justify-between items-center">
            <Skeleton width={140} height={24} />
            <Skeleton width={80} height={20} borderRadius={4} />
          </div>
        }
      >
        <div className="pt-4">
          {/* Table Header */}
          <div className="flex justify-between mb-2 bg-gray-50 p-2 rounded">
            <Skeleton width="20%" height={16} />
            <Skeleton width="10%" height={16} />
            <Skeleton width="10%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="15%" height={16} />
          </div>

          {/* Table Rows */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 px-2"
            >
              <Skeleton width="20%" height={16} />
              <Skeleton width="10%" height={16} />
              <Skeleton width="10%" height={16} />
              <Skeleton width="15%" height={16} />
              <Skeleton width="15%" height={16} />
              <Skeleton width="15%" height={16} />
            </div>
          ))}
        </div>
      </Card>

      {/* Financial Summary Skeleton */}
      <Card
        className="mb-6 border rounded-md bg-white"
        title={
          <div className="pb-4 border-b border-gray-100 bg-white -mb-4">
            <Skeleton width={160} height={24} />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Return Calculation */}
          <div className="space-y-3">
            <div className="border-b pb-2 mb-2">
              <Skeleton width="40%" height={16} />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton width="30%" height={14} />
                  <Skeleton width="20%" height={14} />
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <Skeleton width="35%" height={16} />
                  <Skeleton width="25%" height={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-3">
            <div className="border-b pb-2 mb-2">
              <Skeleton width="40%" height={16} />
            </div>
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton width="30%" height={14} />
                  <Skeleton width="20%" height={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseReturnViewSkeleton;
