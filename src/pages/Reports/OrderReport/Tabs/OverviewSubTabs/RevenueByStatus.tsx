import React from "react";

const getStatusColors = (color: string) => {
  const statusMap: Record<string, { text: string; bg: string; dot: string }> = {
    amber: { text: "text-amber-600", bg: "bg-amber-500", dot: "bg-amber-500" },
    primary: {
      text: "text-primary",
      bg: "bg-primary-500",
      dot: "bg-primary-500",
    },
    rose: { text: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
    blue: { text: "text-primary", bg: "bg-primary", dot: "bg-primary" },
  };
  return statusMap[color] || statusMap.amber;
};

const RevenueByStatus = ({ data = [] }: { data: any[] }) => {
  const statusProgress = data.map((item) => {
    let color = "amber";
    if (["SHIPPED", "DELIVERED"].includes(item.status)) color = "blue";
    if (["CANCELLED", "RETURNED", "NO_RESPONSE"].includes(item.status))
      color = "primary";
    if (["CONFIRM", "PRINT", "UN_PRINT"].includes(item.status))
      color = "purple";
    if (item.status === "INCOMPLETE") color = "rose";

    return {
      label: item.status.replace(/_/g, " "),
      amount: item.totalRevenue?.toLocaleString(),
      orders: item.orders,
      color,
      percent: Math.round(item.percentageOfTotal || 0),
      avgValue: item.avgValue?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
      profitMargin: item.profitMargin?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
    };
  });

  if (!statusProgress.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">
          Revenue by Order Status
        </h3>
      </div>
      <p className="text-[11px] text-gray-400 mb-6">
        Monetary breakdown of orders across different statuses
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusProgress.map((status, idx) => {
          const colors = getStatusColors(status.color);
          return (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden group transition-all duration-300 shadow-none"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-${status.color === "amber" ? "orange" : status.color}-50 dark:bg-${status.color === "amber" ? "orange" : status.color}-900/5 rounded-full -translate-y-12 translate-x-12 opacity-40`}
              ></div>

              <div className="flex items-center gap-2 mb-5">
                <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></div>
                <h4 className="text-[13px] font-bold text-gray-800 dark:text-white">
                  {status.label}
                </h4>
              </div>

              <div className="space-y-2.5 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-gray-500">
                    Total Revenue
                  </span>
                  <span className={`text-[13px] font-bold ${colors.text}`}>
                    ৳{status.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-gray-500">
                    Orders
                  </span>
                  <span className="text-[13px] font-bold text-gray-800 dark:text-white">
                    {status.orders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-gray-500">
                    Avg. Value
                  </span>
                  <span className="text-[11px] font-bold text-gray-800 dark:text-white">
                    ৳{status.avgValue}
                  </span>
                </div>
                {status.label !== "Cancelled" && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-gray-500">
                      Profit Margin
                    </span>
                    <span className="text-[11px] font-bold text-blue-500">
                      {status.profitMargin}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-gray-500">
                    % of Total
                  </span>
                  <span className="text-[11px] font-bold text-gray-800 dark:text-white">
                    {status.percent}%
                  </span>
                </div>
              </div>

              <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-primary transition-all duration-500`}
                  style={{ width: `${status.percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueByStatus;
