import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, Divider } from "antd";

const OrderDetailsSkeleton = () => {
  return (
    <div className="pb-4 md:pb-10 animate-pulse bg-gray-50/30 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton
            width={200}
            height={32}
            className="rounded-md"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={120}
            height={24}
            borderRadius={20}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton
            width={100}
            height={36}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column (70%) */}
        <div className="lg:w-[70%] w-full">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <Skeleton width={60} height={14} />
                  <div className="flex flex-col items-end">
                    <Skeleton width={40} height={10} className="mb-1" />
                    <Skeleton width={30} height={16} />
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <Skeleton width={70} height={10} />
                    <Skeleton width={20} height={10} />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton width={60} height={10} />
                    <Skeleton width={20} height={10} />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton width={60} height={10} />
                    <Skeleton width={20} height={10} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Info and Form Section Skeleton */}
          <div className="border border-gray-200 rounded-[6px] mb-6 bg-white p-4">
            <div className="space-y-6">
              {/* Row 1: Mobile, Name, Delivery, Payment */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton width={100} height={14} className="mb-2" />
                    <Skeleton height={36} borderRadius={6} />
                  </div>
                ))}
              </div>

              {/* Row 2: Address and Shipping Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <Skeleton width={100} height={14} className="mb-2" />
                    <Skeleton height={80} borderRadius={8} />
                  </div>
                ))}
              </div>

              {/* Row 3: Extra Options */}
              <div className="grid grid-cols-1 md:grid-cols-16 gap-4 pt-4 border-t border-gray-100">
                <div className="md:col-span-4">
                  <Skeleton width={100} height={14} className="mb-2" />
                  <Skeleton height={36} borderRadius={6} />
                </div>
                <div className="md:col-span-6">
                  <Skeleton width={100} height={14} className="mb-2" />
                  <Skeleton height={36} borderRadius={6} />
                </div>
                <div className="md:col-span-6 flex items-end gap-6 pb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton width={60} height={14} />
                    <Skeleton width={30} height={16} borderRadius={10} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton width={60} height={14} />
                    <Skeleton width={30} height={16} borderRadius={10} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Cards and Cart Selection Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 h-[540px] bg-white border rounded-[6px] border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 p-4">
                <Skeleton width={150} height={24} />
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg"
                  >
                    <Skeleton width={44} height={44} borderRadius={6} />
                    <div className="flex-1">
                      <Skeleton width="70%" height={14} className="mb-2" />
                      <Skeleton width="40%" height={12} />
                    </div>
                    <Skeleton width={50} height={14} />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="border border-gray-200 rounded-[6px] mb-6 bg-white overflow-hidden">
                <div className="border-b border-gray-200 p-4">
                  <Skeleton width={180} height={24} />
                </div>
                <div className="p-4">
                  <Skeleton height={36} borderRadius={8} className="mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-2 border border-gray-100 rounded-lg"
                      >
                        <div className="flex gap-3">
                          <Skeleton width={50} height={50} borderRadius={6} />
                          <div className="flex-1">
                            <Skeleton
                              width="60%"
                              height={14}
                              className="mb-1"
                            />
                            <Skeleton width="40%" height={12} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculation row skeleton */}
          <div className="border border-gray-200 rounded-[6px] bg-white p-4 mt-4">
            <div className="flex items-end gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-1">
                  <Skeleton width="100%" height={12} className="mb-1" />
                  <Skeleton height={32} borderRadius={4} />
                </div>
              ))}
            </div>
            <Skeleton height={48} borderRadius={6} className="mt-3" />
          </div>
        </div>

        {/* Right Column (30%) */}
        <div className="lg:w-[30%] w-full space-y-6">
          <Card
            className="rounded-lg border border-gray-300"
            title={<Skeleton width={120} height={18} />}
            styles={{ body: { padding: "0" } }}
          >
            <div className="p-4 flex flex-wrap gap-x-8 gap-y-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[100px]">
                  <Skeleton width={60} height={10} className="mb-1" />
                  <Skeleton width={100} height={16} />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 p-4 bg-gray-50/30 space-y-2">
              <div className="flex justify-between">
                <Skeleton width={60} height={14} />
                <Skeleton width={50} height={14} />
              </div>
              <div className="flex justify-between">
                <Skeleton width={60} height={14} />
                <Skeleton width={50} height={14} />
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Skeleton width={80} height={20} />
                <Skeleton width={70} height={20} />
              </div>
            </div>
          </Card>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <Skeleton width={100} height={18} className="mb-4" />
            <div className="space-y-4">
              <Skeleton height={36} borderRadius={6} />
              <Skeleton height={80} borderRadius={6} />
              <Skeleton height={36} borderRadius={6} />
              <Divider className="my-2" />
              <div className="flex gap-3">
                <Skeleton width="50%" height={32} />
                <Skeleton width="50%" height={32} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200 flex justify-between">
              <Skeleton width={100} height={18} />
              <Skeleton width={60} height={18} borderRadius={12} />
            </div>
            <div className="p-4">
              <div className="space-y-6 m-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton circle width={12} height={12} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <Skeleton width={80} height={14} />
                        <Skeleton width={100} height={12} />
                      </div>
                      <Skeleton width="60%" height={12} className="mb-1" />
                      <Skeleton width="90%" height={10} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSkeleton;
