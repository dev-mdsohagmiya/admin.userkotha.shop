import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfitAndSalesChartSkeleton = () => {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <Skeleton height={16} width={220} />
        <Skeleton height={12} width="50%" className="mt-2" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item}>
              <Skeleton height={12} width="70%" />
              <Skeleton height={26} width="85%" className="mt-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <Skeleton height={360} />
        <div className="flex gap-4 mt-3">
          <Skeleton height={12} width={160} />
          <Skeleton height={12} width={160} />
          <Skeleton height={12} width={160} />
        </div>
      </div>
    </div>
  );
};

export default ProfitAndSalesChartSkeleton;
