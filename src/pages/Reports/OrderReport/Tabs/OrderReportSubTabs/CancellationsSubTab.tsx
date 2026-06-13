import { useState } from "react";
import { Button, Modal, Tag } from "antd";
import { FiXCircle } from "react-icons/fi";
import { TbCoinTaka } from "react-icons/tb";
import { DataTable } from "../../../../../components/common/Tables";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker";
import { useGetOrderCancellationReportQuery, useGetOrderCancellationListQuery } from "../../../../../redux/features/report/reportApi";
import { CurrencyIcon } from "../../../../../utils/currency";

const CancellationListModal = ({
  isOpen,
  onClose,
  filters,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams = [
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...filters,
  ];

  const { data, isLoading, isFetching } = useGetOrderCancellationListQuery(queryParams);

  const columns = [
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (text: string) => <span className="font-bold text-primary">{text}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (customer: any) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-200">{customer?.name}</div>
          <div className="text-[10px] text-gray-500">{customer?.phone}</div>
        </div>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => <span className="text-xs text-rose-500">{text}</span>,
    },
    {
      title: "Date",
      dataIndex: "cancelDate",
      key: "cancelDate",
      render: (date: string) => (
        <span className="text-[11px] text-gray-500">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (val: number) => (
        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-0.5">
          <CurrencyIcon className="text-[10px]" />
          {val?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "By",
      dataIndex: "cancelledBy",
      key: "cancelledBy",
      render: (text: string) => <Tag color="green" className="text-[10px]">{text}</Tag>,
    },
    {
      title: "Source",
      dataIndex: "orderSource",
      key: "orderSource",
      render: (text: string) => <span className="text-[10px] uppercase font-bold text-gray-400">{text}</span>,
    },
  ];

  return (
    <Modal
      title="Cancellation Order Details"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      className="font-outfit"
    >
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading || isFetching}
          isPaginate={data?.meta?.total > limit}
          total={data?.meta?.total || 0}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          setLimit={setLimit}
          className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden"
        />
      </div>
    </Modal>
  );
};

const CancellationsSubTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeSubTab, setActiveSubTab] = useState("By Reason");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);

  const groupByValue = activeSubTab === "By Reason" ? "reason" : "status";

  const {
    data: cancellationReportData,
    isLoading: cancellationReportLoading,
    isFetching,
  } = useGetOrderCancellationReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    { name: "groupBy", value: groupByValue },
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const reportData = cancellationReportData?.data?.data || [];
  const summary = cancellationReportData?.data?.summary;
  const total = cancellationReportData?.meta?.total || reportData.length;

  const handleRowClick = (record: any) => {
    const filterKey = activeSubTab === "By Reason" ? "reason" : "status";
    const filterValue = activeSubTab === "By Reason" ? record.reason : record.status;

    const modalFilters = [
      { name: filterKey, value: filterValue || "Not Specified" },
      ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
      ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
    ];

    setSelectedFilters(modalFilters);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: activeSubTab === "By Reason" ? "Reason" : "Status",
      dataIndex: activeSubTab === "By Reason" ? "reason" : "status",
      key: "label",
      render: (text: string) => (
        <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">
          {text || "Not Specified"}
        </span>
      ),
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      align: "center" as const,
      render: (val: number) => (
        <span className="text-rose-500 font-bold text-sm">{val}</span>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (val: number) => (
        <span className="font-bold text-gray-800 dark:text-gray-200">
          ৳{val?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: "By Employee",
      dataIndex: "byEmployee",
      key: "byEmployee",
      render: (byEmployee: { name: string; count: number }[]) => (
        <div className="flex flex-wrap gap-2">
          {byEmployee?.map((emp, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[11px] font-medium rounded border border-gray-100 dark:border-gray-700"
            >
              {emp.name} ({emp.count})
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-outfit">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PageHeaderCard
          icon={<FiXCircle />}
          color="red"
          title="Cancelled Orders"
          value={summary?.totalCancelled || "0"}
        />
        <PageHeaderCard
          icon={<TbCoinTaka />}
          color="indigo"
          title="Cancelled Revenue"
          value={`${summary?.totalAmount?.toLocaleString() || "0"}`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center">
          {/* Toggle Buttons */}
          <div className="flex gap-4 items-center">
            <Button
              type={activeSubTab === "By Reason" ? "primary" : "default"}
              onClick={() => {
                setActiveSubTab("By Reason");
                setPage(1);
              }}
              className={`h-auto px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === "By Reason"
                  ? ""
                  : "text-gray-500 hover:text-primary dark:text-gray-400 border-gray-200 dark:border-gray-700"
              }`}
            >
              By Reason
            </Button>
            <Button
              type={activeSubTab === "By Status" ? "primary" : "default"}
              onClick={() => {
                setActiveSubTab("By Status");
                setPage(1);
              }}
              className={`h-auto px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === "By Status"
                  ? ""
                  : "text-gray-500 hover:text-primary dark:text-gray-400 border-gray-200 dark:border-gray-700"
              }`}
            >
              By Status
            </Button>
          </div>
        </div>

        <div className="flex items-center">
          <CustomDatePicker
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
            selectedData={dateRange}
          />
        </div>
      </div>

      <div className="">
        <DataTable
          columns={columns}
          data={reportData}
          loading={cancellationReportLoading || isFetching}
          isPaginate={total > limit}
          total={total}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          setLimit={setLimit}
          className="border-none cursor-pointer"
          onRow={(record: any) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>

      <CancellationListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={selectedFilters}
      />
    </div>
  );
};

export default CancellationsSubTab;
