import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { 
    FiEdit, 
    FiCheckCircle, 
    FiRotateCcw, 
    FiXCircle, 
    FiClock, 
    FiPercent 
} from "react-icons/fi";
import CountUp from "react-countup";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";

interface ManualWebEntryOutcomeProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const ManualWebEntryOutcome = ({
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: ManualWebEntryOutcomeProps) => {
  // Placeholder data
  const reportList: any[] = useMemo(() => [], []);

  console.log("Current search:", search);

  const stats = [
    { title: "Entries", value: 0, icon: <FiEdit />, color: "blue" as const },
    { title: "Delivered", value: 0, icon: <FiCheckCircle />, color: "green" as const },
    { title: "Returned", value: 0, icon: <FiRotateCcw />, color: "orange" as const },
    { title: "Cancelled", value: 0, icon: <FiXCircle />, color: "red" as const },
    { title: "Pending", value: 0, icon: <FiClock />, color: "yellow" as const },
    { title: "Delivery Rate", value: 0, icon: <FiPercent />, color: "indigo" as const, unit: "%" },
  ];

  const columns = [
    { title: "Employee", dataIndex: "emp", key: "emp" },
    { title: "Custom ID", dataIndex: "id", key: "id" },
    { title: "Entries", dataIndex: "entries", key: "entries", align: "center" as const },
    { title: "Entries Value", dataIndex: "entriesVal", key: "entriesVal" },
    { title: "Delivered", dataIndex: "del", key: "del", align: "center" as const },
    { title: "Delivered Value", dataIndex: "delVal", key: "delVal" },
    { title: "Returned", dataIndex: "ret", key: "ret", align: "center" as const },
    { title: "Returned Value", dataIndex: "retVal", key: "retVal" },
    { title: "Cancelled", dataIndex: "can", key: "can", align: "center" as const },
    { title: "Cancelled Value", dataIndex: "canVal", key: "canVal" },
    { title: "Pending", dataIndex: "pen", key: "pen", align: "center" as const },
    { title: "Pending Value", dataIndex: "penVal", key: "penVal" },
  ];

  useEffect(() => {
    setExportData(reportList);
  }, [reportList, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          Manual Web Entry Outcome (Employee-wise)
        </h3>
        <p className="text-xs text-gray-500">
            Employee-wise delivery, return, cancel, and pending outcomes for manual web entries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <PageHeaderCard
            key={idx}
            title={stat.title}
            color={stat.color}
            icon={stat.icon}
            value={
              <div className="flex items-center">
                <CountUp end={stat.value} duration={1.5} separator="," />
                {stat.unit && <span>{stat.unit}</span>}
              </div>
            }
          />
        ))}
      </div>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={reportList}
          isPaginate={false}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={0}
        />
      </div>
    </div>
  );
};

export default ManualWebEntryOutcome;
