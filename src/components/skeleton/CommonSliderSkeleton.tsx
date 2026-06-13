import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CommonSliderSkeleton = () => {
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
        {/* Ads/Banner Section Styled like HeroBanner Cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <Skeleton
            width={180}
            height={24}
            className="mb-6 border-b pb-2"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />

          <div className="space-y-6">
            {/* Image Uploader Area */}
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

            {/* Inputs Area */}
            <div className="grid grid-cols-1 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
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
              ))}
            </div>
          </div>
        </div>

        {/* Multi-item grid (Slider Flow) */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <Skeleton
            width={200}
            height={24}
            className="mb-8 border-b pb-2"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 border border-gray-100 rounded-lg bg-gray-50 relative"
              >
                <div className="flex justify-between mb-4">
                  <div className="w-24 h-24 bg-white border border-dashed border-gray-200 rounded flex items-center justify-center">
                    <Skeleton
                      circle
                      width={30}
                      height={30}
                      baseColor="#e0e0e0"
                      highlightColor="#f5f5f5"
                    />
                  </div>
                  <Skeleton
                    width={32}
                    height={32}
                    borderRadius={6}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                </div>
                <div className="space-y-3">
                  <Skeleton
                    width="40%"
                    height={14}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                  <Skeleton
                    width="100%"
                    height={32}
                    borderRadius={4}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                </div>
              </div>
            ))}
            {/* Add New Button Placeholder */}
            <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg">
              <Skeleton
                circle
                width={40}
                height={40}
                className="mb-2"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width={100}
                height={16}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 mb-20">
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

export default CommonSliderSkeleton;
