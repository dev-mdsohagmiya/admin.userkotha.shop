import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="max-w-4xl mx-auto border rounded-sm">
        <div className="bg-white rounded-lg p-6">
          {/* Profile Header inside card */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4">
              <Skeleton
                circle
                width={64}
                height={64}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>
            <div className="flex flex-col items-center gap-2 mb-2">
              <Skeleton
                width={200}
                height={32}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <div className="flex gap-2">
                <Skeleton
                  width={60}
                  height={24}
                  borderRadius={4}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={60}
                  height={24}
                  borderRadius={4}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            </div>
            <Skeleton
              width={180}
              height={16}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <Skeleton
                width={60}
                height={16}
                className="mb-2"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width="100%"
                height={42}
                borderRadius={4}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>

            {/* Email Field */}
            <div>
              <Skeleton
                width={60}
                height={16}
                className="mb-2"
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
              <Skeleton
                width="100%"
                height={42}
                borderRadius={4}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Skeleton
                  width={80}
                  height={12}
                  className="mb-1"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={120}
                  height={20}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
              <div>
                <Skeleton
                  width={80}
                  height={12}
                  className="mb-1"
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
                <Skeleton
                  width={120}
                  height={20}
                  baseColor="#e0e0e0"
                  highlightColor="#f5f5f5"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-5 border-gray-100">
            <Skeleton
              height={40}
              borderRadius={4}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <Skeleton
              height={40}
              borderRadius={4}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          </div>

          {/* Permissions Section */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Skeleton
              width={150}
              height={28}
              className="mb-4"
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <Skeleton
                    width="60%"
                    height={18}
                    className="mb-2"
                    baseColor="#e0e0e0"
                    highlightColor="#f5f5f5"
                  />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton
                      width={50}
                      height={24}
                      borderRadius={4}
                      baseColor="#e0e0e0"
                      highlightColor="#f5f5f5"
                    />
                    <Skeleton
                      width={50}
                      height={24}
                      borderRadius={4}
                      baseColor="#e0e0e0"
                      highlightColor="#f5f5f5"
                    />
                    <Skeleton
                      width={50}
                      height={24}
                      borderRadius={4}
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
    </div>
  );
};

export default ProfileSkeleton;
