import { useEffect, useMemo } from "react";
import { useGetBusinessDailySlipOperationalReportQuery } from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import { FiFileText, FiArrowLeftCircle, FiCopy, FiPauseCircle, FiBox, FiRepeat, FiDollarSign, FiClock } from "react-icons/fi";
import CountUp from "react-countup";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { Typography } from "antd";

const { Text } = Typography;

interface DailySlipParcelOperationalReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const DailySlipParcelOperationalReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: DailySlipParcelOperationalReportProps) => {
  const {
    data: reportData,
    isLoading,
    isFetching,
  } = useGetBusinessDailySlipOperationalReportQuery([
    { name: "startDate", value: dateRange?.[0] || "" },
    { name: "endDate", value: dateRange?.[1] || "" },
    { name: "search", value: search },
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ]);

  const reportList = useMemo(() => reportData?.data || [], [reportData]);
  const meta = reportData?.meta || {};
  const summary = reportData?.summary || {};

  const stats = [
    {
      title: "Total Slip",
      value: summary.totalSlip || 0,
      icon: <FiFileText />,
      color: "blue" as const,
    },
    {
      title: "Back Slip",
      value: summary.backSlip || 0,
      icon: <FiArrowLeftCircle />,
      color: "red" as const,
    },
    {
      title: "Double Slip",
      value: summary.doubleSlip || 0,
      icon: <FiCopy />,
      color: "orange" as const,
    },
    {
      title: "Hold",
      value: summary.hold || 0,
      icon: <FiPauseCircle />,
      color: "purple" as const,
    },
    {
      title: "Total Parcel",
      value: summary.totalParcel || 0,
      icon: <FiBox />,
      color: "green" as const,
    },
    {
      title: "Exchange",
      value: summary.exchange || 0,
      icon: <FiRepeat />,
      color: "blue" as const,
    },
    {
      title: "Total Sale",
      value: summary.totalSale || 0,
      icon: <FiDollarSign />,
      color: "indigo" as const,
    },
    {
      title: "Prev Day Slip",
      value: summary.previousDaySlip || 0,
      icon: <FiClock />,
      color: "cyan" as const,
    },
  ];

  const columns = [
    {
      title: "Metric Name",
      dataIndex: "metric",
      key: "metric",
      width: 250,
      render: (text: string) => (
        <Text strong className="text-gray-800">
          {text}
        </Text>
      ),
    },
    {
      title: "Count / Value",
      dataIndex: "value",
      key: "value",
      width: 150,
      align: "center" as const,
      render: (val: number) => (
        <Text strong className={val > 0 ? "text-primary" : "text-gray-400"}>
          {val.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Data Source",
      dataIndex: "dataSource",
      key: "dataSource",
      width: 250,
      render: (text: string) => <Text type="secondary">{text || "-"}</Text>,
    },
    {
      title: "Calculation Rule / Description",
      dataIndex: "calculationRule",
      key: "calculationRule",
      render: (text: string) => (
        <Text className="text-xs text-gray-500 italic">
          {text || "Standard operational calculation applied"}
        </Text>
      ),
    },
  ];

  useEffect(() => {
    if (reportList.length > 0) {
      const printableData = reportList.map((item: any) => ({
        Metric: item.metric || "-",
        Value: item.value || 0,
        "Data Source": item.dataSource || "-",
        "Calculation Rule": item.calculationRule || "-",
      }));
      setExportData(printableData);
    } else {
      setExportData([]);
    }
  }, [reportList, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          Daily Slip & Parcel Operational Report
        </h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <PageHeaderCard
            key={idx}
            title={stat.title}
            color={stat.color}
            icon={stat.icon}
            value={
              <CountUp
                end={stat.value}
                duration={1.5}
                separator=","
                className="font-bold"
              />
            }
          />
        ))}
      </div>

      <div className="">
        <DataTable
          loading={isLoading || isFetching}
          data={reportList}
          columns={columns}
          rowKey="id"
          isPaginate={meta?.total > limit}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > limit}
          total={meta?.total || 0}
          scroll={{ x: 1000 }}
        />
      </div>
    </div>
  );
};

export default DailySlipParcelOperationalReport;
