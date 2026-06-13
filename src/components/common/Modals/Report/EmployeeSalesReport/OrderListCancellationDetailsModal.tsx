import { Modal, Tag } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { DataTable } from "../../../Tables";
import PageListPrint from "../../../CommonPrintCsvAndPdf/PageListPrint";
import { useGetEmployeeOrderCancellationsListDetailsReportQuery } from "../../../../../redux/features/report/reportApi";
import OrderCancellationListIndividualOrderDetailModal from "./OrderCancellationListIndividualOrderDetailModal";

interface OrderListCancellationDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string | null;
  dateRange: [string | null, string | null];
}

function orderStatusTagColor(status: string) {
  const s = String(status || "")
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (s.includes("CANCEL")) return "error";
  if (s.includes("COMPLETE") || s.includes("DELIVER")) return "success";
  if (s.includes("CONFIRM")) return "success";
  if (s.includes("HOLD")) return "warning";
  if (s.includes("PENDING")) return "processing";
  if (s.includes("INCOMPLETE")) return "warning";
  if (s.includes("SHIP")) return "processing";
  if (s.includes("RETURN") || s.includes("REFUND")) return "orange";
  return "default";
}

const rowDate = (record: any) =>
  record?.date ?? record?.cancellationDate ?? null;

const OrderListCancellationDetailsModal: React.FC<
  OrderListCancellationDetailsModalProps
> = ({ open, setOpen, employeeId, employeeName, dateRange }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [childOpen, setChildOpen] = useState(false);
  const [childOrderId, setChildOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, employeeId]);

  useEffect(() => {
    if (open) {
      setChildOpen(false);
      setChildOrderId(null);
    }
  }, [open]);

  const openIndividualDetail = useCallback(
    (oid: string) => {
      setChildOrderId(oid);
      setChildOpen(true);
      setOpen(false);
    },
    [setOpen],
  );

  const { data: detailsResponse, isLoading, isFetching } =
    useGetEmployeeOrderCancellationsListDetailsReportQuery(
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
  const summary = p?.summary || p?.data?.summary || {};
  const displayName =
    summary?.employeeName || employeeName || "Employee";

  const columns = useMemo(
    () => [
      {
        title: "Invoice",
        key: "invoice",
        width: 140,
        render: (_: unknown, record: any) => {
          const oid = record?.orderId;
          const inv =
            record?.invoice ||
            (oid ? `#${String(oid).slice(-6).toUpperCase()}` : "—");
          if (!oid) {
            return (
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {inv}
              </span>
            );
          }
          return (
            <button
              type="button"
              className="inline-flex items-center gap-1 border-0 bg-transparent p-0 font-semibold text-primary hover:underline"
              onClick={() => openIndividualDetail(oid)}
            >
              {inv}
            </button>
          );
        },
      },
      {
        title: "Date",
        key: "date",
        width: 200,
        render: (_: unknown, record: any) => {
          const raw = rowDate(record);
          return (
            <span className="text-gray-800 dark:text-gray-200">
              {raw
                ? moment(raw).format("MMM D, YYYY, h:mm A")
                : "—"}
            </span>
          );
        },
      },
      {
        title: "Status",
        key: "status",
        width: 150,
        align: "center" as const,
        render: (_: unknown, record: any) => {
          const st = record?.status || "—";
          return (
            <Tag
              color={orderStatusTagColor(String(st))}
              className="m-0 rounded-full px-2.5 text-xs font-medium"
            >
              {String(st).replace(/_/g, " ")}
            </Tag>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        width: 140,
        align: "center" as const,
        render: (_: unknown, record: any) => {
          const oid = record?.orderId;
          const label = record?.action || "Order Details";
          if (!oid) {
            return <span className="text-sm text-gray-500">{label}</span>;
          }
          return (
            <button
              type="button"
              className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-primary hover:underline"
              onClick={() => openIndividualDetail(oid)}
            >
              {label}
            </button>
          );
        },
      },
    ],
    [openIndividualDetail],
  );

  const printableData = rows.map((item: any) => ({
    Invoice: item.invoice || item.orderId,
    Date: rowDate(item)
      ? moment(rowDate(item)).format("MMM D, YYYY, h:mm A")
      : "",
    Status: item.status || "",
    Action: item.action || "",
  }));

  const total = Number(meta?.total ?? 0);

  return (
    <>
      <Modal
        title={
          <div className="flex flex-col gap-0.5 pr-8">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Cancelled orders — {displayName}
            </span>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={900}
        className="font-outfit"
        destroyOnClose
      >
        <div className="mb-3 flex justify-end">
          <PageListPrint
            tableData={printableData}
            fileName={`${displayName}_List_Cancellation_Details`}
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
          scroll={{ x: 640 }}
        />
      </Modal>

      <OrderCancellationListIndividualOrderDetailModal
        open={childOpen}
        setOpen={(v) => {
          setChildOpen(v);
          if (!v) setChildOrderId(null);
        }}
        orderId={childOrderId}
      />
    </>
  );
};

export default OrderListCancellationDetailsModal;
