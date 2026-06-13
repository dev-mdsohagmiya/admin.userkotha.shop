import { Modal, Select, Tag } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import moment from "moment";
import { DataTable } from "../../../Tables";
import CurrencyIcon from "../../../CurrencyIcon";
import PageListPrint from "../../../CommonPrintCsvAndPdf/PageListPrint";
import { useGetEmployeeOrderCompletionsDetailsReportQuery } from "../../../../../redux/features/report/reportApi";

export type OrderCompletionsDetailCategory =
  | "processing"
  | "no_response"
  | "on_hold"
  | "adv_payment"
  | "incomplete"
  | "good_no_response";

const CATEGORY_OPTIONS: {
  value: OrderCompletionsDetailCategory;
  label: string;
}[] = [
  { value: "processing", label: "Processing" },
  { value: "no_response", label: "No response" },
  { value: "on_hold", label: "On hold" },
  { value: "adv_payment", label: "Adv. payment" },
  { value: "incomplete", label: "Incomplete" },
  { value: "good_no_response", label: "Good no response" },
];

interface OrderCompletionsDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string | null;
  /** Set from parent when a table row is opened (first non-zero column, else processing). */
  initialFromCategory: OrderCompletionsDetailCategory;
  dateRange: [string | null, string | null];
}

type DetailRow = {
  orderId?: string;
  invoice?: string;
  customerName?: string;
  customerPhone?: string;
  amount?: number;
  fromStatus?: string;
  fromStatusLabel?: string;
  currentStatus?: string;
  currentStatusLabel?: string;
  completedAt?: string;
};

export default function OrderCompletionsDetailsModal({
  open,
  setOpen,
  employeeId,
  employeeName,
  initialFromCategory,
  dateRange,
}: OrderCompletionsDetailsModalProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [fromCategory, setFromCategory] =
    useState<OrderCompletionsDetailCategory>(initialFromCategory);

  useEffect(() => {
    if (!open || !employeeId) return;
    setFromCategory(initialFromCategory);
    setPage(1);
  }, [open, employeeId, initialFromCategory]);

  const { data, isLoading, isFetching } =
    useGetEmployeeOrderCompletionsDetailsReportQuery(
      [
        { name: "employeeId", value: employeeId || "" },
        { name: "fromCategory", value: fromCategory },
        { name: "startDate", value: dateRange[0] || "" },
        { name: "endDate", value: dateRange[1] || "" },
        { name: "page", value: page },
        { name: "limit", value: limit },
      ],
      { skip: !open || !employeeId },
    );

  const p = data as
    | {
        data?: DetailRow[];
        meta?: { total?: number; totalPages?: number };
        summary?: {
          employeeId?: string;
          employeeName?: string;
          fromCategory?: string;
          fromCategoryLabel?: string;
        };
      }
    | undefined;

  const rows: DetailRow[] = Array.isArray(p?.data)
    ? p.data
    : Array.isArray((p as any)?.data?.data)
      ? (p as any).data.data
      : [];
  const meta = p?.meta ?? {};
  const summary = p?.summary ?? {};

  const titleCategory =
    summary.fromCategoryLabel?.trim() || "—";
  const titleEmployee =
    summary.employeeName?.trim() || employeeName?.trim() || "Employee";

  const columns = useMemo(
    () => [
      {
        title: "Invoice",
        key: "invoice",
        width: 120,
        render: (_: unknown, record: DetailRow) => (
          <span className="font-semibold text-primary">
            {record.invoice || "—"}
          </span>
        ),
      },
      {
        title: "Customer",
        key: "customerName",
        ellipsis: true,
        render: (_: unknown, record: DetailRow) => (
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {record.customerName || "—"}
          </span>
        ),
      },
      {
        title: "Phone",
        key: "customerPhone",
        width: 130,
        render: (_: unknown, record: DetailRow) => (
          <span className="text-gray-600 dark:text-gray-400">
            {record.customerPhone || "—"}
          </span>
        ),
      },
      {
        title: "Amount",
        key: "amount",
        align: "right" as const,
        width: 120,
        render: (_: unknown, record: DetailRow) => (
          <span className="inline-flex items-center justify-end gap-0.5 font-semibold tabular-nums text-gray-900 dark:text-white">
            <CurrencyIcon size={12} />
            {Number(record.amount ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        title: "From Status",
        key: "fromStatus",
        width: 160,
        align: "center" as const,
        render: (_: unknown, record: DetailRow) => {
          const label =
            record.fromStatusLabel ||
            record.fromStatus?.replace(/_/g, " ") ||
            "—";
          return (
            <Tag className="m-0 rounded-full border border-teal-200 bg-teal-50 px-2.5 text-xs font-medium text-teal-800 dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-200">
              {label}
            </Tag>
          );
        },
      },
      {
        title: "Current",
        key: "currentStatus",
        width: 140,
        align: "center" as const,
        render: (_: unknown, record: DetailRow) => {
          const label =
            record.currentStatusLabel ||
            record.currentStatus?.replace(/_/g, " ") ||
            "—";
          return (
            <Tag className="m-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
              {label}
            </Tag>
          );
        },
      },
      {
        title: "Completed At",
        key: "completedAt",
        width: 200,
        render: (_: unknown, record: DetailRow) => {
          const oid = record.orderId;
          const formatted = record.completedAt
            ? moment(record.completedAt).format("DD MMM, hh:mm A")
            : "—";
          return (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {formatted}
              </span>
              {oid ? (
                <Link
                  to={`/orders/${oid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-primary hover:opacity-80"
                  title="Open order"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          );
        },
      },
    ],
    [],
  );

  const printableData = rows.map((item) => ({
    Invoice: item.invoice,
    Customer: item.customerName,
    Phone: item.customerPhone,
    Amount: item.amount,
    "From status": item.fromStatusLabel || item.fromStatus,
    Current: item.currentStatusLabel || item.currentStatus,
    "Completed at": item.completedAt
      ? moment(item.completedAt).format("DD MMM, YYYY hh:mm A")
      : "",
  }));

  const total = Number(meta.total ?? 0);
  const totalPages = Math.max(
    1,
    Number(meta.totalPages ?? 0) ||
      (limit > 0 ? Math.ceil(total / limit) : 1),
  );

  return (
    <Modal
      title={
        <div className="pr-8">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Completed from {titleCategory} by {titleEmployee}
          </span>
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={980}
      className="font-outfit"
      destroyOnClose
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Select
          value={fromCategory}
          onChange={(v) => {
            setFromCategory(v as OrderCompletionsDetailCategory);
            setPage(1);
          }}
          options={CATEGORY_OPTIONS}
          className="min-w-[200px]"
          popupMatchSelectWidth={false}
        />
        <PageListPrint
          tableData={printableData}
          fileName={`Completions_${titleEmployee}_${titleCategory}`.replace(
            /\s+/g,
            "_",
          )}
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
        scroll={{ x: 960 }}
      />
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Page {page} of {totalPages}
        {total > 0 ? ` (${total} orders)` : ""}
      </div>
    </Modal>
  );
}
