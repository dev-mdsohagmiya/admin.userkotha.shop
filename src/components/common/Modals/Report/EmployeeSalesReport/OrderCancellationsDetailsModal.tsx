import { Modal, Tag } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { DataTable } from "../../../Tables";
import PageListPrint from "../../../CommonPrintCsvAndPdf/PageListPrint";
import { useGetEmployeeOrderCancellationsDetailsReportQuery } from "../../../../../redux/features/report/reportApi";

interface OrderCancellationsDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string | null;
  dateRange: [string | null, string | null];
}

function isPlaceholderCancellationReason(record: any) {
  const code = String(record?.reason ?? "").trim().toUpperCase();
  const name = String(record?.reasonName ?? "").trim();
  if (code === "NOT_SPECIFIED" || code === "N/A") return true;
  if (/^not specified$/i.test(name)) return true;
  return !code && !name;
}

/** Ant Design Tag preset `color` from previous order status code/name */
function previousStatusTagColor(status: string) {
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

const OrderCancellationsDetailsModal: React.FC<
  OrderCancellationsDetailsModalProps
> = ({ open, setOpen, employeeId, employeeName, dateRange }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, employeeId]);

  const { data: detailsResponse, isLoading, isFetching } =
    useGetEmployeeOrderCancellationsDetailsReportQuery(
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
        title: "index",
        key: "index",
        width: 120,
        render: (_: unknown, record: any, index: number) => {
         return (
          <span className="text-gray-500">{index + 1}</span>
         )
        },
      },
      {
        title: "Date",
        key: "cancellationDate",
        width: 200,
        render: (_: unknown, record: any) => {
          const raw = record?.cancellationDate;
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
        title: "Previous Status",
        key: "previousStatus",
        width: 160,
        render: (_: unknown, record: any) => {
          const raw =
            record?.previousStatusName ||
            record?.previousStatus ||
            "";
          const label = raw ? String(raw).replace(/_/g, " ") : "—";
          const colorKey =
            raw ? previousStatusTagColor(String(raw)) : "default";
          return (
            <Tag
              color={colorKey}
              className="m-0 rounded-full px-2.5 text-xs font-medium"
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
        render: (_: unknown, record: any) => {
          const note = record?.reasonName;
          const text =
            typeof note === "string" && note.trim() ? note.trim() : null;
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {text || "—"}
            </span>
          );
        },
      },
      {
        title: "Note",
        key: "note",
        ellipsis: true,
        render: (_: unknown, record: any) => {
          const note = record?.note;
          const text =
            typeof note === "string" && note.trim() ? note.trim() : null;
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {text || "—"}
            </span>
          );
        },
      },
    ],
    [],
  );

  const printableData = rows.map((item: any) => ({
    "Order #": item.orderId,
    Date: item.cancellationDate
      ? moment(item.cancellationDate).format("MMM D, YYYY, h:mm A")
      : "",
    "Previous Status":
      item.previousStatusName || item.previousStatus || "",
    Reason: isPlaceholderCancellationReason(item)
      ? ""
      : item.reasonName || item.reason || "",
    Note: item.note || "",
  }));

  const total = Number(meta?.total ?? 0);
  

  return (
    <Modal
      title={
        <div className="flex flex-col gap-0.5 pr-8">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            All Cancellations by {displayName}
          </span>
          {/* <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {dateSubtitle}
          </span> */}
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1000}
      className="font-outfit"
      destroyOnClose
    >
      <div className="mb-3 flex justify-end">
        <PageListPrint
          tableData={printableData}
          fileName={`${displayName}_Order_Cancellations`}
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
        scroll={{ x: 900 }}
      />
    
    </Modal>
  );
};

export default OrderCancellationsDetailsModal;
