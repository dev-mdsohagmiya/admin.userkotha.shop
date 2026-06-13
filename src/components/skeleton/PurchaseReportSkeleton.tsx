import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PurchaseReportSkeleton = () => {
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
            width={110}
            height={14}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        {/* Title + Subtitle + Button */}
        <div className="flex flex-col w-full md:flex-row sm:items-center justify-between">
          <div>
            <Skeleton
              width={200}
              height={26}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              width={380}
              height={14}
              className="mt-1"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
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

      {/* ===== TOP PURCHASE MATERIAL CHART (Full Width Bar Chart) ===== */}
      <div className="my-4">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton
              width={220}
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
      </div>

      {/* ===== TOP SUPPLIER CHART (Centered) ===== */}
      <div className="mx-auto flex justify-center items-center my-4">
        <div className="bg-white border rounded-lg p-6 w-full min-h-[350px]">
          <Skeleton
            width="40%"
            height={20}
            className="mb-6 mx-auto"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton height={270} baseColor="#e0e0e0" highlightColor="#f5f5f5" />
        </div>
      </div>

      {/* ===== 2 CHARTS SIDE BY SIDE (Payment Distribution + VAT Analysis) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Distribution Chart */}
        <div className="bg-white rounded-md pl-2 pr-4 py-4 border border-gray-200">
          <Skeleton
            width="45%"
            height={20}
            className="mb-4 ml-4"
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
        {/* VAT Analysis Chart */}
        <div className="bg-white rounded-md p-4 border border-gray-200">
          <Skeleton
            width="40%"
            height={20}
            className="mb-4"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton height={250} baseColor="#e0e0e0" highlightColor="#f5f5f5" />
        </div>
      </div>

      {/* ===== DATE-WISE PURCHASE REPORT TABLE ===== */}
      <div className="p-6 rounded-lg border my-4">
        <div className="flex justify-between items-center mb-5">
          <Skeleton
            width={220}
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
              width={85}
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
          {/* Pagination */}
          <div className="p-4 flex justify-end gap-2">
            <Skeleton
              width={100}
              height={32}
              borderRadius={4}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
        </div>
      </div>

      {/* ===== FINANCIAL OVERVIEW CARDS (Purchase Overview + Payment Status) ===== */}
      <div className="p-4 border rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 1: Purchase Overview (Monthly) */}
          <div className="p-4 border rounded-md">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton
                width={40}
                height={40}
                borderRadius={8}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <div>
                <Skeleton
                  width={160}
                  height={20}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={180}
                  height={14}
                  className="mt-1"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            </div>
            {/* Monthly items */}
            <div className="flex flex-col gap-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="border-b border-gray-200 pb-2 mb-3 last:border-0 last:mb-0"
                >
                  <Skeleton
                    width={120}
                    height={14}
                    className="mb-2"
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <div key={row} className="flex justify-between py-1">
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
              ))}
            </div>
          </div>

          {/* CARD 2: Payment Status */}
          <div className="p-4 border rounded-md">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton
                width={40}
                height={40}
                borderRadius={8}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <div>
                <Skeleton
                  width={140}
                  height={20}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={170}
                  height={14}
                  className="mt-1"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            </div>
            {/* Payment summary rows */}
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex justify-between py-1">
                <Skeleton
                  width={110}
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
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <Skeleton
                  width={80}
                  height={12}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={70}
                  height={12}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReportSkeleton;
