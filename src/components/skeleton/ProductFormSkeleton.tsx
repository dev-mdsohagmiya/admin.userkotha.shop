import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, Divider } from "antd";

const ProductFormSkeleton = () => {
  return (
    <div className="animate-pulse p-4 bg-white rounded-lg">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Skeleton width={240} height={32} className="mb-2" />
          <Skeleton width={380} height={18} />
        </div>
        <div className="flex gap-3">
          <Skeleton width={130} height={42} borderRadius={8} />
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. Product Name, Slug, Type - grid-cols-3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col">
              <Skeleton width={110} height={16} className="mb-2" />
              <Skeleton height={42} borderRadius={8} />
            </div>
          ))}
        </div>

        {/* 2. Category, Brand, Unit - flex-wrap gap-4 */}
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 min-w-[240px] flex flex-col">
              <Skeleton width={90} height={16} className="mb-2" />
              <Skeleton height={42} borderRadius={8} />
            </div>
          ))}
        </div>

        {/* 3. Thumbnail */}
        <div className="flex flex-col">
          <Skeleton width={100} height={16} className="mb-2" />
          <Skeleton width={140} height={140} borderRadius={12} />
        </div>

        {/* 4. Descriptions */}
        <div className="space-y-6">
          <div className="flex flex-col">
            <Skeleton width={140} height={16} className="mb-2" />
            <Skeleton height={180} borderRadius={8} />
          </div>
          <div className="flex flex-col">
            <Skeleton width={160} height={16} className="mb-2" />
            <Skeleton height={240} borderRadius={8} />
          </div>
        </div>

        {/* 5. Variants Section */}
        <Card
          title={<Skeleton width={200} height={22} />}
          className="border border-gray-200 shadow-sm"
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
        >
          <div className="space-y-6">
            {[1].map((i) => (
              <Card
                key={i}
                className="bg-gray-50/20"
                title={<Skeleton width={120} height={20} />}
                extra={<Skeleton width={32} height={32} borderRadius={6} />}
              >
                <div className="space-y-6">
                  {/* Variant Name */}
                  <div className="flex flex-col max-w-sm">
                    <Skeleton width={110} height={14} className="mb-2" />
                    <Skeleton height={38} borderRadius={6} />
                  </div>

                  {/* Combo specific: Products Card Skeleton */}
                  <Card
                    title={<Skeleton width={100} height={18} />}
                    extra={
                      <Skeleton width={110} height={32} borderRadius={6} />
                    }
                    className="mb-4 bg-white"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="p-3 border border-gray-100 rounded-lg"
                        >
                          <Skeleton width="40%" height={12} className="mb-3" />
                          <Skeleton height={32} className="mb-2" />
                          <Skeleton height={32} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Pricing & Stock Grids */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex flex-col">
                        <Skeleton width={80} height={14} className="mb-2" />
                        <Skeleton height={38} borderRadius={6} />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex flex-col">
                        <Skeleton width={90} height={14} className="mb-2" />
                        <Skeleton height={38} borderRadius={6} />
                      </div>
                    ))}
                  </div>

                  {/* Switches Section */}
                  <div className="flex gap-6 items-center py-2">
                    <div className="flex items-center gap-3">
                      <Skeleton width={80} height={14} />
                      <Skeleton width={45} height={22} borderRadius={11} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton width={90} height={14} />
                      <Skeleton width={45} height={22} borderRadius={11} />
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="flex flex-col md:flex-row gap-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <Skeleton width={90} height={14} className="mb-2" />
                      <Skeleton width={120} height={120} borderRadius={10} />
                    </div>
                    <Divider
                      type="vertical"
                      className="hidden md:block"
                      style={{ height: "140px" }}
                    />
                    <div className="flex-1 flex flex-col">
                      <Skeleton width={110} height={14} className="mb-2" />
                      <div className="flex gap-3 flex-wrap">
                        {[1, 2, 3].map((k) => (
                          <Skeleton
                            key={k}
                            width={100}
                            height={100}
                            borderRadius={10}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Skeleton height={42} borderRadius={8} className="w-full" />
          </div>
        </Card>

        {/* 6. Featured Switch Area */}
        <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100 flex items-center justify-between">
          <Skeleton width={140} height={18} />
          <Skeleton width={50} height={26} borderRadius={13} />
        </div>

        {/* 7. Action Buttons */}
        <div className="flex justify-end gap-3 mt-12 py-6 border-t border-gray-100">
          <Skeleton width={110} height={42} borderRadius={8} />
          <Skeleton width={160} height={42} borderRadius={8} />
        </div>
      </div>
    </div>
  );
};

export default ProductFormSkeleton;
