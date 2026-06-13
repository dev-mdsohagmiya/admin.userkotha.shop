import { Modal, Tag } from "antd";
import React, { useState } from "react";
import { DataTable } from "../../../Tables";
import CurrencyIcon from "../../../CurrencyIcon";
import PageListPrint from "../../../CommonPrintCsvAndPdf/PageListPrint";
import moment from "moment";
import { useGetEmployeeOrdersReportQuery } from "../../../../../redux/features/report/reportApi";

interface EmployeeOrdersModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string | null;
  dateRange: [string | null, string | null];
}

const EmployeeOrdersModal: React.FC<EmployeeOrdersModalProps> = ({
  open,
  setOpen,
  employeeId,
  employeeName,
  dateRange,
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: ordersData, isLoading, isFetching } = useGetEmployeeOrdersReportQuery([
    { name: "employeeId", value: employeeId },
    { name: "startDate", value: dateRange[0] },
    { name: "endDate", value: dateRange[1] },
    { name: "page", value: page },
    { name: "limit", value: limit },
  ], { skip: !open || !employeeId });

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta;

  console.log("orders",orders)

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-bold text-gray-800">#{id?.slice(-6).toUpperCase()}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (name: string) => <span className="font-semibold">{name || "Unknown"}</span>,
    },
    {
      title: "Mobile",
      dataIndex: "customerMobile",
      key: "customerMobile",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => {
        let color = "default";
        if (status === "CONFIRM") color = "success";
        if (status === "HOLD") color = "warning";
        if (status === "CANCELLED") color = "error";
        if (status === "SHIPPED") color = "processing";
        return (
          <Tag color={color} className="rounded-full px-3">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: string) => (
        <span className="font-medium text-gray-700">{source}</span>
      ),
    },
    {
      title: "Cross Sale",
      key: "isCrossSale",
      align: "center" as const,
      render: (_: any, record: any) => {
        // console.log("record.isCrossSale", record?.isCrossSale);
        const isTrue =
          record?.isCrossSale === true ||
          record?.is_cross_sale === true ||
          record?.isCrossSale === "true" ||
          record?.isCrossSale === 1;

        return isTrue ? (
          <Tag color="purple" className="text-[10px] m-0">
            Yes
          </Tag>
        ) : (
          <span className="text-gray-400">No</span>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (amount: number) => (
        <span className="font-bold text-gray-800 flex items-center justify-end gap-1">
          <CurrencyIcon size={12} />
          {amount?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => moment(date).format("DD/MM/YYYY"),
    },
  ];

  const printableData = orders.map((item: any) => ({
    "Invoice #": item.id,
    Customer: item.customerName,
    Mobile: item.customerMobile,
    Status: item.status,
    Source: item.source,
    "Cross Sale":
      item.isCrossSale === true ||
      item.isCrossSale === "true" ||
      item.isCrossSale === 1
        ? "Yes"
        : "No",
    Amount: item.amount,
    Date: moment(item.date).format("DD/MM/YYYY"),
  }));

  return (
    <Modal
      title={
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-800">
            {employeeName} - Total Orders ({meta?.total || 0})
          </span>
          <span className="text-xs text-gray-400 font-normal">
            {dateRange[0] ? moment(dateRange[0]).format("DD MMM YYYY") : "All Time"} -{" "}
            {dateRange[1] ? moment(dateRange[1]).format("DD MMM YYYY") : "Present"}
          </span>
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1000}
      className="font-outfit"
    >
      <div className="flex justify-end mb-4">
        <PageListPrint
          tableData={printableData}
          fileName={`${employeeName}_Orders_Report`}
        />
      </div>
      <DataTable
        loading={isLoading || isFetching}
        columns={columns}
        data={orders}
        rowKey="id"
        isPaginate={meta?.total > limit}
        total={meta?.total || 0}
        limit={limit}
        currentPage={page}
        setCurrentPage={setPage}
        setLimit={setLimit}
        showSizeChanger={true}
      />
    </Modal>
  );
};

export default EmployeeOrdersModal;
