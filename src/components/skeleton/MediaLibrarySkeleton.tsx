import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MediaLibrarySkeleton = () => {
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
        <div className="flex gap-3">
          <Skeleton
            width={120}
            height={40}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          {/* Breadcrumb and Stats Skeleton */}
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Skeleton
                width={32}
                height={32}
                borderRadius={8}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width={200}
                height={20}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton
                width={150}
                height={16}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width={80}
                height={24}
                borderRadius={4}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* New Folder Placeholder - Corrected height and logic */}
            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-gray-200 h-[126px]">
              <div className="w-[54px] h-[54px] mb-2 flex items-center justify-center bg-gray-50 rounded-full border border-dashed border-gray-300">
                <Skeleton
                  circle
                  width={30}
                  height={30}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
              <Skeleton
                width={60}
                height={12}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>

            {/* Folder Items Skeletons - Matches FolderItem.tsx */}
            {[...Array(3)].map((_, i) => (
              <div
                key={`folder-${i}`}
                className="flex flex-col items-center justify-center w-full p-2 rounded-lg border border-transparent h-[126px]"
              >
                <div className="mb-1">
                  <Skeleton
                    width={72}
                    height={72}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                </div>
                <Skeleton
                  width="60%"
                  height={12}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            ))}

            {/* Image Items Skeletons - Matches MediaCard.tsx */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`image-${i}`}
                className="bg-white rounded-[6px] border border-gray-200 overflow-hidden h-[166px]"
              >
                {/* Square Aspect Ratio Image Container */}
                <div className="w-full aspect-square bg-gray-50/50 p-3">
                  <Skeleton
                    width="100%"
                    height="100%"
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                </div>
                {/* Info Area */}
                <div className="p-2.5 border-t border-gray-100 flex flex-col items-center">
                  <Skeleton
                    width="80%"
                    height={12}
                    className="mb-1"
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                  <Skeleton
                    width="40%"
                    height={10}
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrarySkeleton;
