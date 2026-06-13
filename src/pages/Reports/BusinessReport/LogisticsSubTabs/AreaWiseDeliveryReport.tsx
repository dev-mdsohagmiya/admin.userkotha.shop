import { useEffect, useMemo } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useGetBusinessAreaWiseDeliveryReportQuery } from "../../../../redux/features/report/reportApi";

interface AreaWiseDeliveryReportProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const AreaWiseDeliveryReport = ({
  dateRange,
  search,
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: AreaWiseDeliveryReportProps) => {
  const queryArgs = useMemo(() => {
    const args = [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      { name: "search", value: search },
      { name: "startDate", value: dateRange[0] || "" },
      { name: "endDate", value: dateRange[1] || "" },
    ];
    return args;
  }, [page, limit, search, dateRange]);

  const { data: response, isLoading } =
    useGetBusinessAreaWiseDeliveryReportQuery(queryArgs);

  const reportData = useMemo(() => response?.data || [], [response]);


  const columns = [
    { title: "Delivery Area", dataIndex: "district", key: "district" },
    { title: "Total Orders", dataIndex: "total", key: "total", align: "center" as const },
    { title: "Delivered", dataIndex: "delivered", key: "delivered", align: "center" as const },
    { title: "Returned", dataIndex: "returned", key: "returned", align: "center" as const },
    {
      title: "Success Rate",
      dataIndex: "deliveryRate",
      key: "deliveryRate",
      render: (rate: number) => (
        <span className="text-primary font-bold">{rate}%</span>
      ),
    },
  ];

  useEffect(() => {
    if (reportData.length > 0) {
      setExportData(reportData);
    }
  }, [reportData, setExportData]);

  return (
    <div className="space-y-6 -mt-2 pb-10">
      <div className="flex items-center gap-2 mb-2">
       
        <h3 className="text-lg font-bold text-gray-800">Area Wise Delivery Report</h3>
      </div>

      

      <DataTable
        columns={columns}
        data={reportData}
        loading={isLoading}
        isPaginate={response?.meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={response?.meta?.total || 0}
      />
    </div>
  );
};

export default AreaWiseDeliveryReport;
