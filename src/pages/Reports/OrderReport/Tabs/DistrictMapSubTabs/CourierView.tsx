import { useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiActivity,
} from "react-icons/fi";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { useGetCourierMapReportQuery } from "../../../../../redux/features/report/reportApi";

const CourierView = ({
  activeMetric = "Orders",
  dateRange,
}: {
  activeMetric?: string;
  dateRange: [string | null, string | null];
}) => {
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const { data: courierReport } = useGetCourierMapReportQuery([
    { name: "startDate", value: dateRange?.[0] || "" },
    { name: "endDate", value: dateRange?.[1] || "" },
  ]);

  const summary = courierReport?.data?.summary;
  const courierData = courierReport?.data?.data || [];

  const getCourierCardColor = (name: string): "green" | "blue" | "pink" | "purple" => {
    const lowerName = name.toLowerCase();
    if (lowerName === "steadfast") return "green";
    if (lowerName === "pathao") return "blue";
    if (lowerName === "redx") return "pink";
    return "purple";
  };

  const getFormatValue = (val: number) => {
    if (activeMetric === "Revenue") return `৳${val.toLocaleString()}`;
    return val.toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Courier Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary?.couriers?.map((item: any, idx: number) => (
          <PageHeaderCard
            key={idx}
            color={getCourierCardColor(item.courier)}
            title={item.courier}
            value={getFormatValue(item.value)}
            subtitle={`${item.orders} Orders • ${item.rate.toFixed(1)}% Share • ${idx === 0 ? "Top" : `#${idx + 1}`}`}
          />
        ))}
      </div>
      {/* Main Table Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-50 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">
              Best Courier by District ({activeMetric})
            </h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
              Comparative analysis of logistics partner efficiency
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">{courierData.length} Districts analyzed</span>
          </div>
        </div>

        <div className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {courierData.map((item: any, idx: number) => {
      const isExpanded = expandedDistrict === item.district;
      return (
        <div key={idx} className="flex flex-col">
          {/* Card Header - Clickable */}
          <button
            onClick={() => setExpandedDistrict(isExpanded ? null : item.district)}
            className={`
              w-full flex justify-between items-center p-4 rounded-lg
              transition-all duration-200 ease-in-out
              ${isExpanded
                ? "bg-primary/5 border border-primary/20"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/30"
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Chevron Icon */}
              <div className="text-gray-400">
                {isExpanded ? (
                  <FiChevronDown className="w-4 h-4" />
                ) : (
                  <FiChevronRight className="w-4 h-4" />
                )}
              </div>
              {/* District Info */}
              <div className="text-left">
                <p className={`text-sm font-semibold ${isExpanded ? "text-primary" : "text-gray-800 dark:text-gray-200"}`}>
                  {item.district}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Best: <span className="font-medium">{item.bestCourier}</span>
                </p>
              </div>
            </div>

            {/* Rate & Value */}
            <div className="text-right">
              <p className={`text-sm font-bold ${isExpanded ? "text-primary" : "text-gray-800 dark:text-gray-200"}`}>
                {item.bestCourierRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {getFormatValue(item.bestCourierValue)}
              </p>
            </div>
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-2 ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2 mt-2">
                {item.couriers?.map((c: any, cIdx: number) => (
                  <div key={cIdx} className="flex justify-between items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.value > 0 ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {c.courier}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                        {c.orders} orders
                      </span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white min-w-[70px] text-right">
                        ৳{c.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>

  {/* Empty State */}
  {courierData.length === 0 && (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <FiActivity className="text-2xl text-gray-400" />
      </div>
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Data Available</h4>
      <p className="text-xs text-gray-400 mt-1">No courier records found for this period</p>
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default CourierView;

