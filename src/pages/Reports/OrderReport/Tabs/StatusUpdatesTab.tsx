import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { useGetProductStatusTransitionReportQuery } from "../../../../redux/features/report/reportApi";

const StatusUpdatesTab = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const { data: statusUpdatesData } = useGetProductStatusTransitionReportQuery([
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const transitions = statusUpdatesData?.data?.data || [];
  const totalStatusUpdates = statusUpdatesData?.data?.totalStatusUpdates;

  const printableData = transitions.map((t: any) => ({
    "From Status": t.fromStatus,
    "To Status": t.toStatus,
    Count: t.count,
  }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight leading-none mb-1">
              Status Report
            </h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              Transitions & History
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CustomDatePicker
            onChange={(dates) => setDateRange(dates)}
            selectedData={dateRange}
          />
          <PageListPrint tableData={printableData} fileName="Status-Updates" />
        </div>
      </div>
      {/* Summary Card */}

      {/* Transition Breakdown */}
      <div className="bg-white dark:bg-gray-900  rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  From Status
                </th>
                <th className="px-6 py-3 text-center w-20"></th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  To Status
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {transitions.map((t: any, i: number) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group cursor-default"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[12px] font-bold  tracking-wider  border border-gray-200`}
                    >
                      {t.fromStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <FiArrowRight className="text-gray-800 transition-all inline-block" />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[12px]   tracking-wider bg-primary text-white  border border-gray-200`}
                    >
                      {t.toStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums group-hover:text-primary transition-colors">
                      {t.count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <td colSpan={3} className="px-6 py-4 text-left">
                  <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Total Status Updates
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-lg font-black text-primary tabular-nums">
                    {totalStatusUpdates || transitions.reduce((acc: number, t: any) => acc + t.count, 0)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdatesTab;
