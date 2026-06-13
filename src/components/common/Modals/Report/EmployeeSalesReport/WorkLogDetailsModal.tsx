import { Modal, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import moment from "moment";
import { DataTable } from "../../../Tables";
import CurrencyIcon from "../../../CurrencyIcon";
import PageListPrint from "../../../CommonPrintCsvAndPdf/PageListPrint";
import { useGetEmployeeWorkLogReportDetailsQuery } from "../../../../../redux/features/report/reportApi";

interface WorkLogDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string | null;
  dateRange: [string | null, string | null];
}

function statusTagColor(status: string) {
  const s = String(status || "").toUpperCase();
  if (s.includes("CANCEL")) return "error";
  if (s.includes("COMPLETE")) return "success";
  if (s.includes("HOLD")) return "warning";
  if (s.includes("SHIP")) return "processing";
  if (s.includes("CONFIRM")) return "success";
  return "default";
}

const orderIdForRow = (record: any) =>
  record?.orderId ?? record?.order_id ?? record?.id ?? null;

const WorkLogDetailsModal: React.FC<WorkLogDetailsModalProps> = ({
  open,
  setOpen,
  employeeId,
  employeeName,
  dateRange,
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, employeeId]);

  const { data: detailsResponse, isLoading, isFetching } =
    useGetEmployeeWorkLogReportDetailsQuery(
      [
        { name: "employeeId", value: employeeId || "" },
        { name: "startDate", value: dateRange[0] || "" },
        { name: "endDate", value: dateRange[1] || "" },
        { name: "page", value: page },
        { name: "limit", value: limit },
      ],
      { skip: !open || !employeeId },
    );

  const p = detailsResponse as any;
  const rows: any[] = Array.isArray(p?.data)
    ? p.data
    : Array.isArray(p?.data?.data)
      ? p.data.data
      : [];
  const meta = p?.meta || p?.data?.meta || {};

  const columns = [
    {
      title: "Invoice",
      key: "invoice",
      width: 110,
      render: (_: unknown, record: any) => {
        const id = orderIdForRow(record);
        const short = id ? String(id).slice(-6).toUpperCase() : "—";
        return (
          <span className="font-bold text-gray-800 dark:text-gray-100">#{short}</span>
        );
      },
    },
    {
      title: "Customer",
      key: "customer",
      ellipsis: true,
      render: (_: unknown, record: any) => (
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {record.customer || record.customer || "—"}
        </span>
      ),
    },
    {
      title: "Phone",
      key: "phone",
      width: 130,
      render: (_: unknown, record: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {record.customerMobile || record.customer_mobile || record.phone || "—"}
        </span>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      align: "right" as const,
      width: 110,
      render: (_: unknown, record: any) => {
        const amt = record.amount ?? record.totalAmount ?? record.orderAmount ?? 0;
        return (
          <span className="font-bold text-gray-800 dark:text-gray-100 flex items-center justify-end gap-1">
            <CurrencyIcon size={12} />
            {Number(amt).toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      align: "center" as const,
      width: 140,
      render: (_: unknown, record: any) => {
        const st = record.status || record.orderStatus || "—";
        return (
          <Tag color={statusTagColor(String(st))} className="rounded-full px-2.5 text-xs">
            {String(st).replace(/_/g, " ")}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center" as const,
      width: 90,
      render: (_: unknown, record: any) => {
        const n = Number(
          record.actionCount ?? record.actionsCount ?? record.actions ?? record.touchCount ?? 0,
        );
        return (
          <span className="inline-flex min-w-[2.25rem] items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-200">
            {n}x
          </span>
        );
      },
    },
    {
      title: "Last action",
      key: "lastAction",
      width: 200,
      render: (_: unknown, record: any) => {
        const raw =
          record.lastActionAt || record.last_action_at || record.lastAction || record.updatedAt;
        const id = orderIdForRow(record);
        const formatted = raw ? moment(raw).format("DD MMM, hh:mm A") : "—";
        return (
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{formatted}</span>
            {id ? (
              <Link
                to={`/orders/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary shrink-0 p-1 hover:opacity-80"
                title="Open order"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            ) : null}
          </div>
        );
      },
    },
  ];

  const printableData = rows.map((item: any) => ({
    Invoice: orderIdForRow(item),
    Customer: item.customerName || item.customer_name,
    Phone: item.customerMobile || item.customer_mobile || item.phone,
    Amount: item.amount ?? item.totalAmount,
    Status: item.status,
    Actions: item.actionCount ?? item.actionsCount ?? item.actions,
    "Last action": item.lastActionAt || item.lastAction,
  }));

  const total = Number(meta?.total ?? 0);
  const totalPages = Math.max(
    1,
    Number(meta?.totalPages ?? 0) || (limit > 0 ? Math.ceil(total / limit) : 1),
  );

  return (
    <Modal
      title={
        <div className="flex flex-col gap-0.5 pr-8">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Orders touched by {employeeName || "Employee"}
          </span>
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {dateRange[0] ? moment(dateRange[0]).format("DD MMM YYYY") : "All time"} —{" "}
            {dateRange[1] ? moment(dateRange[1]).format("DD MMM YYYY") : "Present"}
          </span>
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1100}
      className="font-outfit"
      destroyOnClose
    >
      <div className="flex justify-end mb-3">
        <PageListPrint
          tableData={printableData}
          fileName={`${employeeName || "Employee"}_Work_Log_Orders`}
        />
      </div>
      <DataTable
        loading={isLoading || isFetching}
        columns={columns}
        data={rows}
        rowKey={(record: any) => {
          const oid = orderIdForRow(record);
          if (oid) return String(oid);
          const i = rows.indexOf(record);
          return [record?.customerMobile, record?.lastActionAt, record?.customerName]
            .filter(Boolean)
            .join("|") || `row-${i}`;
        }}
        isPaginate={total > limit}
        total={total}
        limit={limit}
        currentPage={page}
        setCurrentPage={setPage}
        setLimit={setLimit}
        showSizeChanger
        scroll={{ x: 960 }}
      />
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Page {page} of {totalPages}
        {total > 0 ? ` (${total} orders)` : ""}
      </div>
    </Modal>
  );
};

export default WorkLogDetailsModal;
