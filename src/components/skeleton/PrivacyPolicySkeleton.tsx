import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PrivacyPolicySkeleton = () => {
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

      <div className="space-y-8">
        {/* Banner Section Card - Following Common Slider Flow */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <Skeleton
            width={150}
            height={22}
            className="mb-6 border-b pb-2"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />

          <div className="space-y-6">
            <div>
              <Skeleton
                width={100}
                height={14}
                className="mb-2"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <div className="w-full max-w-sm h-48 bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                <Skeleton
                  circle
                  width={50}
                  height={50}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            </div>

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

            <div>
              <Skeleton
                width={100}
                height={14}
                className="mb-2"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width="100%"
                height={80}
                borderRadius={6}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
          </div>
        </div>

        {/* Content Section Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <Skeleton
            width={120}
            height={22}
            className="mb-6 border-b pb-2"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />

          <div className="space-y-4">
            <Skeleton
              width={100}
              height={14}
              className="mb-2"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-2 border-b border-gray-100 flex gap-2 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <Skeleton
                    key={i}
                    width={24}
                    height={24}
                    borderRadius={4}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                ))}
              </div>
              <div className="p-4 space-y-3">
                <Skeleton
                  width="100%"
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width="95%"
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width="40%"
                  height={14}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex pt-4 mb-20">
          <Skeleton
            width={130}
            height={45}
            borderRadius={6}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicySkeleton;
