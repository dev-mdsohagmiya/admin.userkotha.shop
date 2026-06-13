import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
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
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
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

      {/* Table Mockup */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Table Head */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              height={20}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          ))}
        </div>
        {/* Table Body Rows */}
        {[...Array(8)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="p-4 border-b border-gray-100 grid grid-cols-6 gap-4 items-center"
          >
            {/* Image Column */}
            <div className="w-10 h-10">
              <Skeleton
                width={40}
                height={40}
                borderRadius={4}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
            {/* Title Column */}
            <Skeleton
              height={16}
              width="90%"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            {/* Other Columns */}
            <Skeleton
              height={16}
              width="80%"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              height={16}
              width="70%"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            {/* Status Column */}
            <Skeleton
              height={24}
              width={40}
              borderRadius={12}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            {/* Action Column */}
            <div className="flex gap-2">
              <Skeleton
                width={30}
                height={30}
                borderRadius={4}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width={30}
                height={30}
                borderRadius={4}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
          </div>
        ))}
        {/* Pagination Skeleton */}
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
  );
};

export default TableSkeleton;
