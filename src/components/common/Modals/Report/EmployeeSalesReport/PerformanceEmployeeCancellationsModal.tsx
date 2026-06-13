import { Modal, Tag } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import moment from "moment";
import { DataTable } from "../../../Tables";
import CurrencyIcon from "../../../CurrencyIcon";
import PageListPrint from "../../../CommonPrintCsvAndPdf/PageListPrint";
import { useGetEmployeeOrderCancellationsByEmployeeReportQuery } from "../../../../../redux/features/report/reportApi";

interface PerformanceEmployeeCancellationsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string | null;
  dateRange: [string | null, string | null];
}

type CancelRow = {
  orderId?: string;
  orderNo?: string;
  date?: string;
  customerName?: string;
  customerPhone?: string;
  items?: string;
  total?: number;
  previousStatus?: string;
  reason?: string;
  note?: string;
};

function normalizeCancelRow(raw: Record<string, unknown>): CancelRow {
  const r = raw as Record<string, string | number | undefined>;
  return {
    orderId: (r.orderId ?? r.order_id) as string | undefined,
    orderNo: (r.orderNo ?? r.order_no) as string | undefined,
    date: (r.date ?? r.createdAt ?? r.created_at) as string | undefined,
    customerName: (r.customerName ?? r.customer_name) as string | undefined,
    customerPhone: (r.customerPhone ?? r.customer_phone) as string | undefined,
    items: r.items as string | undefined,
    total: (typeof r.total === "number" ? r.total : Number(r.total)) as
      | number
      | undefined,
    previousStatus: (r.previousStatus ??
      r.previous_status) as string | undefined,
    reason: (r.reason ??
      r.cancellationReason ??
      r.cancellation_reason) as string | undefined,
    note: r.note as string | undefined,
  };
}

/** Ant Design Tag preset colors — distinct per workflow status */
function previousStatusTagColor(status: string) {
  const u = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (!u || u === "—") return "default";
  if (u.includes("CANCEL")) return "error";
  if (u.includes("COMPLETE") || u === "CONFIRM" || u.includes("DELIVER"))
    return "success";
  if (u.includes("HOLD")) return "warning";
  if (u.includes("PENDING")) return "processing";
  if (u.includes("INCOMPLETE")) return "orange";
  if (u.includes("PROCESSING")) return "geekblue";
  if (u.includes("READY") || u.includes("PICK")) return "cyan";
  if (u.includes("SHIP") || u.includes("DISPATCH")) return "purple";
  return "default";
}

export default function PerformanceEmployeeCancellationsModal({
  open,
  setOpen,
  employeeId,
  employeeName,
  dateRange,
}: PerformanceEmployeeCancellationsModalProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, employeeId]);

  const { data, isLoading, isFetching } =
    useGetEmployeeOrderCancellationsByEmployeeReportQuery(
      [
        { name: "employeeId", value: employeeId || "" },
        { name: "startDate", value: dateRange[0] || "" },
        { name: "endDate", value: dateRange[1] || "" },
        { name: "page", value: page },
        { name: "limit", value: limit },
      ],
      { skip: !open || !employeeId },
    );

  const p = data as
    | {
        data?: CancelRow[];
        meta?: { total?: number; totalPages?: number };
        summary?: {
          employeeId?: string;
          employeeName?: string;
          totalCancelled?: number;
        };
      }
    | undefined;

  const rawRows: unknown[] = Array.isArray(p?.data)
    ? (p!.data as unknown[])
    : Array.isArray((p as any)?.data?.data)
      ? (p as any).data.data
      : [];
  const rows: CancelRow[] = rawRows.map((row) =>
    normalizeCancelRow(row as Record<string, unknown>),
  );
  const meta = p?.meta ?? {};
  const summary = p?.summary ?? {};

  const titleName =
    summary.employeeName?.trim() || employeeName?.trim() || "Employee";
  const totalOrders = Number(
    summary.totalCancelled ?? meta.total ?? rows.length ?? 0,
  );

  const dateSubtitle = useMemo(() => {
    const fmt = (d: string | null) =>
      d ? moment(d).format("MMMM Do, YYYY") : null;
    const a = fmt(dateRange[0]);
    const b = fmt(dateRange[1]);
    let range = "All time";
    if (a && b) range = `${a} to ${b}`;
    else if (a) range = `${a} to Present`;
    else if (b) range = `Up to ${b}`;
    return `${range} · Total: ${totalOrders.toLocaleString()} orders`;
  }, [dateRange, totalOrders]);

  const columns = useMemo(
    () => [
      {
        title: "Order #",
        key: "orderNo",
        width: 130,
        render: (_: unknown, record: CancelRow) => {
          const oid = record.orderId;
          const label = record.orderNo
            ? `#${String(record.orderNo).replace(/^#/, "")}`
            : oid
              ? `#${String(oid).slice(-6).toUpperCase()}`
              : "—";
          if (!oid) {
            return (
              <span className="font-semibold text-primary">{label}</span>
            );
          }
          return (
            <Link
              to={`/orders/${oid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:opacity-80"
            >
              {label}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </Link>
          );
        },
      },
      {
        title: "Date",
        key: "date",
        width: 168,
        render: (_: unknown, record: CancelRow) => (
          <span className="block whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
            {record.date
              ? moment(record.date).format("MMM D, h:mm A")
              : "—"}
          </span>
        ),
      },
      {
        title: "Customer",
        key: "customer",
        ellipsis: true,
        render: (_: unknown, record: CancelRow) => (
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {record.customerName || "—"}
            </div>
            {record.customerPhone ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {record.customerPhone}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        title: "Items",
        key: "items",
        ellipsis: true,
        render: (_: unknown, record: CancelRow) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {(record.items || "").trim() || "—"}
          </span>
        ),
      },
      {
        title: "Total",
        key: "total",
        align: "right" as const,
        width: 120,
        render: (_: unknown, record: CancelRow) => (
          <span className="inline-flex items-center justify-end gap-0.5 font-semibold tabular-nums">
            <CurrencyIcon size={12} />
            {Number(record.total ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        title: "Previous Status",
        key: "previousStatus",
        width: 150,
        align: "center" as const,
        render: (_: unknown, record: CancelRow) => {
          const st = record.previousStatus || "—";
          const label = String(st).replace(/_/g, " ");
          return (
            <Tag
              color={previousStatusTagColor(String(st))}
              className="m-0 rounded-full border-0 px-2.5 text-xs font-semibold uppercase"
            >
              {label}
            </Tag>
          );
        },
      },
     
      {
        title: "Reason",
        key: "reason",
        ellipsis: true,
        render: (_: unknown, record: CancelRow) => {
          const n = record.reason;
          const t = typeof n === "string" && n.trim() ? n.trim() : null;
          return (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t || "—"}
            </span>
          );
        },
      },
      {
        title: "Note",
        key: "note",
        ellipsis: true,
        render: (_: unknown, record: CancelRow) => {
          const n = record.note;
          const t = typeof n === "string" && n.trim() ? n.trim() : null;
          return (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t || "—"}
            </span>
          );
        },
      },
    ],
    [],
  );

  const printableData = rows.map((item) => ({
    "Order #": item.orderNo || item.orderId,
    Date: item.date
      ? moment(item.date).format("MMM D, YYYY h:mm A")
      : "",
    Customer: item.customerName,
    Phone: item.customerPhone,
    Items: item.items,
    Total: item.total,
    "Previous status": item.previousStatus,
    Reason: String(item.reason ?? "").trim(),
    Note: item.note || "",
  }));

  const total = Number(meta.total ?? 0);


  return (
    <Modal
      title={
        <div className="flex flex-col gap-1 pr-8">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Cancelled Orders — {titleName}
          </span>
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {dateSubtitle}
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
      <div className="mb-3 flex justify-end">
        <PageListPrint
          tableData={printableData}
          fileName={`Cancelled_${titleName}`.replace(/\s+/g, "_")}
        />
      </div>
      <DataTable
        loading={isLoading || isFetching}
        columns={columns}
        data={rows}
        rowKey="orderId"
        isPaginate={total > limit}
        total={total}
        limit={limit}
        currentPage={page}
        setCurrentPage={setPage}
        setLimit={setLimit}
        showSizeChanger
        scroll={{ x: 1200 }}
      />
   
    </Modal>
  );
}
