const colorPalette = [
  {
    color: "emerald",
    bg: "bg-emerald-50",
    text: "text-emerald-500",
    dot: "bg-emerald-500",
  },
  {
    color: "blue",
    bg: "bg-blue-50",
    text: "text-blue-500",
    dot: "bg-blue-500",
  },
  {
    color: "green",
    bg: "bg-green-50",
    text: "text-green-500",
    dot: "bg-green-500",
  },
  {
    color: "purple",
    bg: "bg-purple-50",
    text: "text-purple-500",
    dot: "bg-purple-500",
  },
  {
    color: "rose",
    bg: "bg-rose-50",
    text: "text-rose-500",
    dot: "bg-rose-500",
  },
  {
    color: "amber",
    bg: "bg-amber-50",
    text: "text-amber-500",
    dot: "bg-amber-500",
  },
  {
    color: "indigo",
    bg: "bg-indigo-50",
    text: "text-indigo-500",
    dot: "bg-indigo-500",
  },
  {
    color: "slate",
    bg: "bg-slate-50",
    text: "text-slate-500",
    dot: "bg-slate-500",
  },
  {
    color: "cyan",
    bg: "bg-cyan-50",
    text: "text-cyan-500",
    dot: "bg-cyan-500",
  },
  {
    color: "orange",
    bg: "bg-orange-50",
    text: "text-orange-500",
    dot: "bg-orange-500",
  },
];

const getSourceConfig = (index: number) => {
  return colorPalette[index % colorPalette.length];
};

const PerformanceBySource = ({ data = [] }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, idx) => {
        const config = getSourceConfig(idx);

        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-lg relative overflow-hidden group"
          >
            {/* Top Right Decorative Circle */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 ${config.bg} dark:bg-${config.color}-900/10 rounded-full -translate-y-12 translate-x-12 opacity-50`}
            ></div>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">
                {item.source}
              </h4>
            </div>

            {/* Total Orders */}
            <div className="flex justify-between items-center mb-5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Orders
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">
                {item.totalOrders}
              </span>
            </div>

            {/* Stats list */}
            <div className="space-y-4">
              {Object.keys(item)
                .filter(
                  (key) =>
                    key !== "source" &&
                    key !== "totalOrders" &&
                    !key.endsWith("Rate"),
                )
                .map((statusKey) => {
                  const count = item[statusKey] || 0;
                  const rate = item[`${statusKey}Rate`] || 0;

                  let colorClass = "bg-amber-500";
                  let textClass = "text-amber-600 dark:text-amber-400";
                  const statusKeyLower = statusKey.toLowerCase();

                  if (
                    [
                      "delivered",
                      "shipped",
                      "completed",
                      "confirm",
                      "print",
                      "un_print",
                    ].some((s) => statusKeyLower.includes(s))
                  ) {
                    colorClass = "bg-green-500";
                    textClass = "text-green-600 dark:text-green-400";
                  } else if (
                    [
                      "cancelled",
                      "returned",
                      "failed",
                      "no_response",
                      "incomplete",
                      "hold",
                    ].some((s) => statusKeyLower.includes(s))
                  ) {
                    colorClass = "bg-rose-500";
                    textClass = "text-rose-600 dark:text-rose-400";
                  } else if (
                    [
                      "inprogress",
                      "pending",
                      "advance_required",
                      "good_but_no_response",
                    ].some((s) => statusKeyLower.includes(s))
                  ) {
                    colorClass = "bg-orange-400";
                    textClass = "text-orange-500 dark:text-orange-500";
                  }

                  return (
                    <div key={statusKey}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize">
                          {statusKey.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[11px] font-bold ${textClass}`}
                          >
                            {count}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ({Number(rate).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${colorClass} transition-all duration-500`}
                          style={{ width: `${rate}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceBySource;
