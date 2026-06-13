import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfitAndSalesSummarySkeleton = () => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-lg border border-gray-200 p-4">
            <Skeleton height={12} width="45%" />
            <Skeleton height={28} width="65%" className="mt-2" />
            <Skeleton height={12} width="80%" className="mt-2" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 p-5">
        <Skeleton height={16} width={140} className="mb-3" />
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center justify-between py-2">
            <Skeleton height={12} width={120} />
            <Skeleton height={12} width={140} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} height={14} />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div
            key={row}
            className="p-4 border-b border-gray-100 grid grid-cols-4 gap-4 items-center"
          >
            {[1, 2, 3, 4].map((col) => (
              <Skeleton key={col} height={14} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfitAndSalesSummarySkeleton;
