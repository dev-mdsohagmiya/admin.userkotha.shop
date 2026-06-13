import { FiMapPin, FiBox, FiTrendingUp } from "react-icons/fi";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { useGetDivisionMapReportQuery } from "../../../../../redux/features/report/reportApi";

const DivisionView = ({
  activeMetric = "Orders",
  dateRange,
}: {
  activeMetric?: string;
  dateRange: [string | null, string | null];
}) => {
  const { data: division } = useGetDivisionMapReportQuery([
    { name: "startDate", value: dateRange?.[0] || "" },
    { name: "endDate", value: dateRange?.[1] || "" },
  ]);
  const divisionMapData = division?.data?.data;
  const divisionSummary = division?.data?.summary;

  const topDivision = divisionSummary?.topDivisions?.[0];

  const colors = [
    "bg-primary/30 text-primary dark:bg-primary/30",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30",
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <PageHeaderCard
          icon={<FiMapPin className="text-[18px]" />}
          color="primary"
          title="Divisions"
          value={divisionSummary?.divisions || 0}
          subtitle={`${divisionSummary?.activeDivisions || 0} with orders`}
        />

        <PageHeaderCard
          icon={<FiBox className="text-[18px]" />}
          color="cyan"
          title={`Total ${activeMetric}`}
          value={
            activeMetric === "Orders"
              ? (divisionSummary?.orders || 0).toLocaleString()
              : activeMetric === "Revenue"
                ? `৳${(divisionSummary?.revenue || 0).toLocaleString()}`
                : activeMetric === "Delivery %"
                  ? `${
                      divisionSummary?.orders > 0
                        ? (
                            (divisionSummary?.delivered /
                              divisionSummary?.orders) *
                            100
                          ).toFixed(1)
                        : "0"
                    }%`
                  : `${
                      divisionSummary?.orders > 0
                        ? (
                            (divisionSummary?.returned /
                              divisionSummary?.orders) *
                            100
                          ).toFixed(1)
                        : "0"
                    }%`
          }
          subtitle="Based on selected date range"
        />
        <PageHeaderCard
          icon={<FiTrendingUp className="text-[18px]" />}
          color="green"
          title="Top Division"
          value={topDivision?.division || "N/A"}
          subtitle={
            activeMetric === "Orders"
              ? `${topDivision?.orders || 0} orders`
              : activeMetric === "Revenue"
                ? `৳${(topDivision?.revenue || 0).toLocaleString()}`
                : activeMetric === "Delivery %"
                  ? `${
                      topDivision?.orders > 0
                        ? (
                            (topDivision?.delivered / topDivision?.orders) *
                            100
                          ).toFixed(1)
                        : "0"
                    }% delivery`
                  : `${
                      topDivision?.orders > 0
                        ? (
                            (topDivision?.returned / topDivision?.orders) *
                            100
                          ).toFixed(1)
                        : "0"
                    }% return`
          }
        />
        <PageHeaderCard
          icon={<FiMapPin className="text-[18px]" />}
          color="indigo"
          title="Districts"
          value={divisionSummary?.activeDistricts || 0}
          subtitle="With orders"
        />
      </div>

      {/* Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {divisionMapData?.map((div: any, i: number) => (
          <div
            key={i}
            className={`${
              colors[i % colors.length]
            } flex flex-col justify-between p-5 rounded-lg border border-gray-200 transition-all cursor-pointer group`}
          >
            <h4 className="text-[14px] font-semibold uppercase tracking-tight">
              {div.name}
            </h4>
            <div className="mt-3 flex justify-between items-end">
              <div className="leading-tight">
                <span className="text-2xl font-bold">
                  {activeMetric === "Orders"
                    ? (div.orders || 0).toLocaleString()
                    : activeMetric === "Revenue"
                      ? `৳${(div.revenue || 0).toLocaleString()}`
                      : activeMetric === "Delivery %"
                        ? `${
                            div.orders > 0
                              ? ((div.delivered / div.orders) * 100).toFixed(1)
                              : "0"
                          }%`
                        : `${
                            div.orders > 0
                              ? ((div.returned / div.orders) * 100).toFixed(1)
                              : "0"
                          }%`}
                </span>
                <p className="text-[10px] font-bold opacity-40">
                  {div.activeDistricts} districts
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DivisionView;
