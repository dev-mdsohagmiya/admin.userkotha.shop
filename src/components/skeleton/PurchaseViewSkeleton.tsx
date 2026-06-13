import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, Divider } from "antd";

const PurchaseViewSkeleton = () => {
  return (
    <div className="mx-auto animate-pulse">
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
            width={80}
            height={32}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={80}
            height={32}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={100}
            height={32}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width={80}
            height={32}
            borderRadius={8}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>

      {/* Purchase Summary Skeleton */}
      <Card
        style={{ marginBottom: 24 }}
        title={<Skeleton width={180} height={20} />}
        className="rounded-xl border border-gray-200"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i}>
              <Skeleton width="40%" height={12} className="mb-1" />
              <Skeleton width="70%" height={16} />
            </div>
          ))}
        </div>
      </Card>

      {/* Purchase Items Skeleton */}
      <Card
        style={{ marginBottom: 24 }}
        title={<Skeleton width={160} height={20} />}
        className="rounded-xl border border-gray-200"
      >
        <div className="pb-2">
          {/* Table Header */}
          <div className="flex justify-between mb-4 border-b border-gray-100 pb-3 px-2">
            <Skeleton width="20%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="15%" height={16} />
          </div>

          {/* Table Rows */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 px-2"
            >
              <Skeleton width="20%" height={16} />
              <Skeleton width="15%" height={16} />
              <Skeleton width="15%" height={16} />
              <Skeleton width="15%" height={16} />
              <Skeleton width="15%" height={16} />
            </div>
          ))}
          {/* Table Footer */}
          <div className="flex justify-end mt-4 px-2">
            <Skeleton width="30%" height={24} />
          </div>
        </div>
      </Card>

      {/* Payment History Skeleton */}
      <Card
        style={{ marginBottom: 24 }}
        title={<Skeleton width={180} height={20} />}
        className="rounded-xl border border-gray-200"
      >
        <div className="py-4 text-center">
          <Skeleton width="30%" height={16} className="mb-4 mx-auto block" />
          <Skeleton
            width={140}
            height={32}
            borderRadius={8}
            className="mx-auto"
          />
        </div>
      </Card>

      {/* Return History Skeleton */}
      <Card
        style={{ marginBottom: 24 }}
        title={<Skeleton width={220} height={20} />}
        className="rounded-xl border border-gray-200"
      >
        <div className="py-8 text-center">
          <Skeleton width="40%" height={16} className="mx-auto" />
        </div>
      </Card>

      {/* Financial Summary Skeleton */}
      <Card
        title={<Skeleton width={180} height={20} />}
        className="rounded-xl border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Breakdown */}
          <div>
            <Skeleton width="60%" height={18} className="mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton width="40%" height={14} />
                  <Skeleton width="20%" height={14} />
                </div>
              ))}
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Skeleton width="30%" height={16} />
                <Skeleton width="25%" height={16} />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <Skeleton width="50%" height={18} className="mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton width="40%" height={14} />
                  <Skeleton width="20%" height={14} />
                </div>
              ))}
              <div className="flex justify-between">
                <Skeleton width="40%" height={14} />
                <Skeleton width="15%" height={20} borderRadius={12} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseViewSkeleton;
