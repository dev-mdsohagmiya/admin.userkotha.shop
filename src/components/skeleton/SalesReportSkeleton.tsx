import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SalesReportSkeleton = () => {
  return (
    <div className="">
      {/* ===== PAGE HEADER SKELETON ===== */}
      <div className="mb-4">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-2">
          <Skeleton
            width={70}
            height={14}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={10}
            height={14}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={60}
            height={14}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={10}
            height={14}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={90}
            height={14}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        {/* Title + Subtitle + Buttons */}
        <div className="flex flex-col w-full md:flex-row sm:items-center justify-between">
          <div>
            <Skeleton
              width={250}
              height={26}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={350}
              height={14}
              className="mt-1"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Skeleton
              width={90}
              height={36}
              borderRadius={6}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={100}
              height={36}
              borderRadius={6}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
        </div>
        {/* Divider */}
        <div className="my-4 border-b border-gray-200"></div>
      </div>

      {/* ===== 4 SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border rounded-lg p-6 border-gray-200 h-[90px] flex items-center justify-between relative overflow-hidden"
          >
            <div className="flex-1">
              <Skeleton
                width="50%"
                height={14}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width="70%"
                height={24}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
            <div className="ml-4">
              <Skeleton
                width={40}
                height={40}
                borderRadius={8}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ===== PRODUCT ORDER OVERVIEW CHART (Full Width Bar Chart) ===== */}
      <div className="bg-white mb-4 border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton
            width={200}
            height={20}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={120}
            height={32}
            borderRadius={6}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        <Skeleton height={280} baseColor="#e0e0e0" highlightColor="#f5f5f5" />
      </div>

      {/* ===== SALES STATUS DISTRIBUTION (Centered Donut Chart) ===== */}
      <div className="max-w-xl pb-4 mx-auto">
        <div className="bg-white border rounded-lg p-6 min-h-[300px]">
          <Skeleton
            width="50%"
            height={20}
            className="mb-6 mx-auto"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <div className="flex items-center justify-center h-[220px]">
            <Skeleton
              circle
              width={200}
              height={200}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
        </div>
      </div>

      {/* ===== 2 CHARTS SIDE BY SIDE (Customer + Payment) ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
        {/* Customer Chart */}
        <div className="bg-white border rounded-lg p-6 min-h-[350px]">
          <Skeleton
            width="40%"
            height={20}
            className="mb-6"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton height={250} baseColor="#e0e0e0" highlightColor="#f5f5f5" />
        </div>
        {/* Payment Chart */}
        <div className="bg-white border rounded-lg p-6 min-h-[350px]">
          <Skeleton
            width="40%"
            height={20}
            className="mb-6"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <div className="flex items-center justify-center h-[250px]">
            <Skeleton
              circle
              width={200}
              height={200}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
        </div>
      </div>

      {/* ===== SALES TRANS TABLE SECTION ===== */}
      <div className="p-6 rounded-lg border my-4">
        <div className="flex justify-between items-center mb-5">
          <Skeleton
            width={200}
            height={18}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              width={80}
              height={32}
              borderRadius={6}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          ))}
        </div>
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                height={18}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            ))}
          </div>
          {[...Array(5)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="p-4 border-b border-gray-100 grid grid-cols-5 gap-4 items-center"
            >
              {[...Array(5)].map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  height={16}
                  width="80%"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ===== TOP CUSTOMER TABLE SECTION ===== */}
      <div className="p-6 rounded-lg border my-4">
        <div className="flex justify-between items-center mb-5">
          <Skeleton
            width={140}
            height={18}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                height={18}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            ))}
          </div>
          {[...Array(5)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="p-4 border-b border-gray-100 grid grid-cols-5 gap-4 items-center"
            >
              {[...Array(5)].map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  height={16}
                  width="80%"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ===== HOURLY/WEEKLY/YEARLY FILTER + TABLE ===== */}
      <div className="bg-white p-6 rounded-lg border mb-4">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width={90}
              height={32}
              borderRadius={6}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          ))}
        </div>
        <div className="overflow-x-auto">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  height={18}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              ))}
            </div>
            {[...Array(6)].map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="p-4 border-b border-gray-100 grid grid-cols-4 gap-4 items-center"
              >
                {[...Array(4)].map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    height={16}
                    width="75%"
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CATEGORY PERFORMANCE TABLE ===== */}
      <div className="p-6 rounded-lg border my-4">
        <div className="flex justify-between items-center mb-5">
          <Skeleton
            width={170}
            height={18}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={110}
            height={28}
            borderRadius={16}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                height={18}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            ))}
          </div>
          {[...Array(5)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="p-4 border-b border-gray-100 grid grid-cols-4 gap-4 items-center"
            >
              {[...Array(4)].map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  height={16}
                  width="75%"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              ))}
            </div>
          ))}
        </div>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <Skeleton
                width={100}
                height={22}
                className="mx-auto"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width={80}
                height={12}
                className="mx-auto mt-1"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== REVENUE BREAKDOWN + DISCOUNT ANALYSIS (2 Column Bottom Cards) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Breakdown Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex justify-between items-center mb-4">
            <Skeleton
              width={140}
              height={18}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={140}
              height={26}
              borderRadius={16}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
          {/* Total Amount */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <Skeleton
              width={90}
              height={12}
              className="mb-1"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={150}
              height={22}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
          {/* Adjustments */}
          <div className="space-y-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton
                  width={100}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={80}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            ))}
          </div>
          {/* Payment Status */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton
                  width={60}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={90}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            ))}
          </div>
          {/* Final Amount */}
          <div className="flex justify-between items-center py-3 mt-4 border-t border-gray-100">
            <Skeleton
              width={100}
              height={14}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={120}
              height={18}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
        </div>

        {/* Discount Analysis Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex justify-between items-center mb-4">
            <Skeleton
              width={140}
              height={18}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={100}
              height={26}
              borderRadius={16}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
          {/* Total Sales */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <Skeleton
              width={80}
              height={12}
              className="mb-1"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={120}
              height={22}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
          {/* Amount Breakdown */}
          <div className="space-y-2 mb-4">
            <Skeleton
              width={130}
              height={14}
              className="mb-2"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton
                  width={110}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={80}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            ))}
          </div>
          {/* Discount Statistics */}
          <div className="space-y-2 mb-4">
            <Skeleton
              width={140}
              height={14}
              className="mb-2"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton
                  width={110}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={70}
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            ))}
          </div>
          {/* Sales Distribution - Progress Bars */}
          <div className="mb-4">
            <Skeleton
              width={130}
              height={14}
              className="mb-2"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            {[1, 2].map((i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between mb-1">
                  <Skeleton
                    width={100}
                    height={14}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                  <Skeleton
                    width={80}
                    height={14}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                </div>
                <Skeleton
                  height={8}
                  borderRadius={4}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportSkeleton;
