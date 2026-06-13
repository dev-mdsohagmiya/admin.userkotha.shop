import { useEffect } from "react";
import { DataTable } from "../../../../components/common/Tables";

interface ManagementReportThreeLayerProps {
  dateRange: [string | null, string | null];
  search: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setExportData: (data: any[]) => void;
}

const ManagementReportThreeLayer = ({
  page,
  limit,
  setPage,
  setLimit,
  setExportData,
}: ManagementReportThreeLayerProps) => {
  const isLoading = false;
  const reportList: any[] = [];

  const columns = [
    {
      title: "SL",
      key: "sl",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Sub-Category",
      dataIndex: "subCategory",
      key: "subCategory",
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
    },
    {
      title: "Margin (%)",
      dataIndex: "margin",
      key: "margin",
    },
  ];

  useEffect(() => {
    setExportData([]);
  }, [setExportData]);

  return (
    <div className="space-y-4 -mt-2 pb-10">
      <h3 className="text-lg font-bold text-gray-800">Management Report (3 Layer)</h3>
      <DataTable
        columns={columns}
        data={reportList}
        loading={isLoading}
        isPaginate={false}
        total={0}
        currentPage={page}
        limit={limit}
        setCurrentPage={setPage}
        setLimit={setLimit}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default ManagementReportThreeLayer;
