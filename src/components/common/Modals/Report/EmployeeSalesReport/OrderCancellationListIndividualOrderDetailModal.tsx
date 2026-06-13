import { Modal, Spin, Tag } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import moment from "moment";
import CurrencyIcon from "../../../CurrencyIcon";
import { useGetEmployeeOrderCancellationsListDetailsByOrderIdReportQuery } from "../../../../../redux/features/report/reportApi";

interface OrderCancellationListIndividualOrderDetailModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderId: string | null;
}

function formatLogMessage(message: string) {
  const m = String(message || "").trim();
  if (m === "ORDER_VIEWED") return "Order viewed";
  return m.replace(/_/g, " ");
}

const OrderCancellationListIndividualOrderDetailModal: React.FC<
  OrderCancellationListIndividualOrderDetailModalProps
> = ({ open, setOpen, orderId }) => {
  const { data, isLoading, isFetching } =
    useGetEmployeeOrderCancellationsListDetailsByOrderIdReportQuery(
      orderId || "",
      { skip: !open || !orderId },
    );

  const p = data as any;
  const order =
    p?.data && typeof p.data === "object" && !Array.isArray(p.data)
      ? p.data
      : null;

  const billTo = order?.billTo || {};
  const products: any[] = Array.isArray(order?.products) ? order.products : [];
  const totals = order?.totals || {};
  const logTimeline: any[] = Array.isArray(order?.logTimeline)
    ? order.logTimeline
    : [];
  const attachments: any[] = Array.isArray(order?.attachments)
    ? order.attachments
    : [];

  return (
    <Modal
      title={
        <div className="flex flex-col gap-0.5 pr-8">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Order Cancellation List Individual Order Detail
          </span>
          {order?.invoiceId ? (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              Invoice: {String(order.invoiceId).replace(/_/g, " ")}
            </span>
          ) : null}
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={760}
      className="font-outfit"
      destroyOnClose
    >
      <Spin spinning={isLoading || isFetching}>
        {!order && !isLoading && !isFetching ? (
          <p className="text-sm text-gray-500">No order data.</p>
        ) : null}

        {order ? (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/40">
              <div className="min-w-[140px]">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                  Invoice date
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {order.invoiceDate
                    ? moment(order.invoiceDate).format("MMM D, YYYY, h:mm A")
                    : "—"}
                </div>
              </div>
              <div className="min-w-[120px]">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                  Courier status
                </div>
                <Tag className="m-0 mt-0.5 rounded-full text-xs capitalize">
                  {String(order.courierStatus || "—").replace(/_/g, " ")}
                </Tag>
              </div>
              <div className="min-w-[100px]">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                  Ref
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {order.ref || "—"}
                </div>
              </div>
              {orderId ? (
                <div className="ml-auto flex items-end">
                  <Link
                    to={`/orders/${orderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Open order page
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Bill to
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {billTo.name || "—"}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {billTo.address || "—"}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {billTo.phone || "—"}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Products
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs dark:border-gray-600 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Item</th>
                      <th className="w-16 px-2 py-2 text-center font-semibold">
                        Qty
                      </th>
                      <th className="w-28 px-2 py-2 text-right font-semibold">
                        Unit
                      </th>
                      <th className="w-28 px-3 py-2 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-4 text-center text-gray-400"
                        >
                          No line items
                        </td>
                      </tr>
                    ) : (
                      products.map((row: any, i: number) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                        >
                          <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                            {(row.name || "").trim() || "—"}
                          </td>
                          <td className="px-2 py-2 text-center tabular-nums">
                            {row.qty ?? "—"}
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            <span className="inline-flex items-center justify-end gap-0.5">
                              <CurrencyIcon size={11} />
                              {Number(row.unitPrice ?? 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums text-gray-900 dark:text-white">
                            <span className="inline-flex items-center justify-end gap-0.5">
                              <CurrencyIcon size={11} />
                              {Number(row.amount ?? 0).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900/30">
              <div className="flex w-full max-w-xs justify-between gap-4">
                <span className="text-gray-500">Subtotal</span>
                <span className="inline-flex items-center gap-0.5 font-medium tabular-nums">
                  <CurrencyIcon size={11} />
                  {Number(totals.subTotal ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex w-full max-w-xs justify-between gap-4">
                <span className="text-gray-500">Delivery</span>
                <span className="inline-flex items-center gap-0.5 tabular-nums">
                  <CurrencyIcon size={11} />
                  {Number(totals.deliveryCharge ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex w-full max-w-xs justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-600">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Total
                </span>
                <span className="inline-flex items-center gap-0.5 text-base font-bold tabular-nums">
                  <CurrencyIcon size={12} />
                  {Number(totals.total ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {attachments.length > 0 ? (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Attachments ({attachments.length})
                </div>
                <ul className="list-inside list-disc text-sm text-primary">
                  {attachments.map((a: any, i: number) => (
                    <li key={i}>
                      {typeof a === "string" ? a : a?.name || a?.url || "—"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Activity
              </div>
              <ul className="space-y-3 border-l-2 border-gray-200 pl-4 dark:border-gray-600">
                {logTimeline.length === 0 ? (
                  <li className="text-sm text-gray-400">No activity log.</li>
                ) : (
                  logTimeline.map((entry: any, i: number) => (
                    <li key={i} className="relative text-sm">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {formatLogMessage(entry.message)}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {entry.at
                          ? moment(entry.at).format("MMM D, YYYY, h:mm A")
                          : ""}
                        {entry.userName ? ` · ${entry.userName}` : ""}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </Spin>
    </Modal>
  );
};

export default OrderCancellationListIndividualOrderDetailModal;
