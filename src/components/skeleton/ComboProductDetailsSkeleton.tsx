import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Row, Col, Card } from "antd";

const ComboProductDetailsSkeleton = () => {
  return (
    <div className=" animate-pulse bg-gray-50/50 min-h-screen">
      {/* Header Skeleton */}
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
            width={120}
            height={40}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={150}
            height={40}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={150}
            height={40}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>

      {/* Statistics Cards Skeleton - Matches Row with 4 Cols */}
      <Row gutter={[16, 16]} className="mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <div className="bg-white border border-gray-100 rounded-lg p-6 h-[90px] flex items-center justify-between relative overflow-hidden">
              <div className="flex-1">
                {/* Title */}
                <Skeleton width="50%" height={14} className="mb-2" />
                {/* Value */}
                <Skeleton width="70%" height={24} />
              </div>
              <div className="ml-4">
                {/* Icon */}
                <Skeleton width={40} height={40} borderRadius={8} />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Main Content: Gallery + Info */}
      <Row gutter={[24, 24]} className="mb-6">
        {/* Combo Gallery Skeleton (Left) */}
        <Col xs={24} xl={10}>
          <Card
            title={<Skeleton width={150} height={24} />}
            bordered={true}
            className="rounded-xl overflow-hidden h-full border-gray-200"
          >
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <Skeleton
                  height={320}
                  className="rounded-lg"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    width={80}
                    height={80}
                    className="rounded-lg border border-gray-200"
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                ))}
              </div>
            </div>
          </Card>
        </Col>

        {/* Combo Product Info Skeleton (Right) */}
        <Col xs={24} xl={14}>
          <Card className="border border-gray-200 h-full">
            {/* Title */}
            <Skeleton
              width="60%"
              height={28}
              className="mb-1"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />

            {/* Price and Stock Row */}
            <div className="mt-5 mb-2 flex items-center gap-6">
              <Skeleton width={120} height={32} />
              <div className="h-8 w-px bg-gray-200"></div>
              <Skeleton width={100} height={24} />
            </div>

            <div className="my-4 border-t border-gray-100 pt-4"></div>

            {/* Short Description */}
            <div className="mb-6">
              <Skeleton count={2} />
            </div>

            {/* Grid: Category, Brand, Unit */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50/50 rounded-xl p-4 border border-gray-100"
                >
                  <Skeleton width="60%" height={12} className="mb-1" />
                  <Skeleton width="80%" height={16} />
                </div>
              ))}
            </div>

            {/* Variants */}
            <div className="mt-6">
              <Skeleton width="20%" height={16} className="mb-3" />
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    width={100}
                    height={36}
                    borderRadius={6}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Description Skeleton */}
      <Row className="mb-6">
        <Col xs={24}>
          <Card
            title={<Skeleton width={120} height={24} />}
            className="border border-gray-200"
          >
            <div className="space-y-3">
              <Skeleton count={3} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Combo Composition Skeleton (Table) */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24}>
          <Card
            title={<Skeleton width={200} height={24} />}
            className="border border-gray-200"
          >
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex justify-between mb-4 border-b pb-2">
                <Skeleton width="25%" height={20} />
                <Skeleton width="25%" height={20} />
                <Skeleton width="15%" height={20} />
                <Skeleton width="15%" height={20} />
              </div>
              {/* Table Rows */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
                >
                  <Skeleton width="25%" height={20} />
                  <Skeleton width="25%" height={20} />
                  <Skeleton width="15%" height={20} />
                  <Skeleton width="15%" height={20} />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ComboProductDetailsSkeleton;
