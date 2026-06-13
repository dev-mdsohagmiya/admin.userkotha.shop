import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfitAndSalesSalesSkeleton = () => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg border border-gray-200 p-4">
            <Skeleton height={12} width="50%" />
            <Skeleton height={28} width="70%" className="mt-2" />
            <Skeleton height={12} width="75%" className="mt-2" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} height={14} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
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

export default ProfitAndSalesSalesSkeleton;
