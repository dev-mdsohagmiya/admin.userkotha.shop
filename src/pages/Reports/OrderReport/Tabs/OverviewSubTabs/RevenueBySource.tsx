const colorPalette = [
  "blue",
  "green",
  "purple",
  "rose",
  "amber",
  "emerald",
  "indigo",
  "slate",
  "cyan",
  "orange",
];

const RevenueBySource = ({ data = [] }: { data: any[] }) => {
  const sourceData = data.map((item, index) => {
    // Assign a color based on its index
    const color = colorPalette[index % colorPalette.length];

    return {
      name: item.source || "Unknown",
      revenue: item.totalRevenue?.toLocaleString(),
      orders: item.orders,
      avgValue: item.avgValue?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
      color,
      percent: Math.round(item.percentageOfTotal || 0),
    };
  });

  if (!sourceData.length) return null;

  return (
    <div className="bg-white border border-gray-200 dark:bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        Revenue by Order Source
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sourceData.map((source, idx) => (
          <div
            key={idx}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden group transition-all duration-300 shadow-none"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-${source.color}-50 dark:bg-${source.color}-900/10 rounded-full -translate-y-12 translate-x-12 opacity-50`}
            ></div>

            <div className="flex items-center gap-3 mb-6">
              <h4 className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-tight">
                {source.name}
              </h4>
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </span>
                <span className="text-xs font-bold text-primary">
                  ৳{source.revenue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Orders
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-white">
                  {source.orders}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Avg. Value
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-white">
                  ৳{source.avgValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  % of Total
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-white">
                  {source.percent}%
                </span>
              </div>
            </div>

            <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-primary transition-all duration-500`}
                style={{ width: `${source.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueBySource;
