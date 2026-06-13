import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CommonSectionSkeleton = () => {
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
      </div>

      {/* Tabs Skeleton (Optional, as it might be inside the page meta) */}
      <div className="flex gap-8 mb-6 border-b border-gray-200 overflow-x-auto pb-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            width={80}
            height={20}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        ))}
      </div>

      <div className="space-y-6">
        {/* Banner/Image Section Skeleton */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mb-6">
          <Skeleton
            width={120}
            height={20}
            className="mb-4"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <div className="w-full max-w-[200px] h-[150px] bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center mb-4">
            <Skeleton
              circle
              width={40}
              height={40}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton
                width={80}
                height={14}
                className="mb-2"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width="100%"
                height={38}
                borderRadius={6}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
          </div>
        </div>

        {/* Card Grid Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
            >
              <Skeleton
                width={100}
                height={20}
                className="mb-4 pb-2 border-b"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <Skeleton
                      width={60}
                      height={14}
                      className="mb-2"
                      baseColor="#e0e0e0"
                      highlightColor="#f5f5f5"
                    />
                    <Skeleton
                      width="100%"
                      height={38}
                      borderRadius={6}
                      baseColor="#e0e0e0"
                      highlightColor="#f5f5f5"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button Skeleton */}
        <div className="flex w-full mt-6 mb-20">
          <Skeleton
            width={140}
            height={42}
            borderRadius={6}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>
    </div>
  );
};

export default CommonSectionSkeleton;
