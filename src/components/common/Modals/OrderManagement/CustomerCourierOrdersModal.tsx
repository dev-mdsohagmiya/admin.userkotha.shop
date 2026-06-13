import { Modal, Table, Tabs, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { DisplayCurrency } from "../../../../utils/currency";

const { Text } = Typography;

export type CustomerCourierOrderProductLine = {
  productName?: string;
  variantName?: string;
  quantity?: number;
  product?: { name?: string };
  variant?: { name?: string };
  comboProduct?: { name?: string };
  comboVariant?: { name?: string };
};

export type CustomerCourierOrderRow = {
  id: string;
  status?: string;
  totalPrice?: number;
  subTotal?: number;
  deliveryCharge?: number;
  createdAt?: string;
  address?: string | null;
  paymentMethod?: string | null;
  deliveryMethod?: string | null;
  orderProducts?: CustomerCourierOrderProductLine[] | null;
};

export type CustomerCourierOrdersPayload = {
  totalOrders?: unknown;
  deliveredOrders?: unknown;
  canceledOrders?: unknown;
  /** Some APIs spell it with double "l" */
  cancelledOrders?: unknown;
};

function normalizeOrderRows(raw: unknown): CustomerCourierOrderRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is CustomerCourierOrderRow =>
      !!item &&
      typeof item === "object" &&
      typeof (item as CustomerCourierOrderRow).id === "string",
  );
}

const statusColor = (status?: string) => {
  const s = (status || "").toUpperCase();
  if (s === "DELIVERED") return "success";
  if (s === "CONFIRM" || s === "SHIPPED") return "processing";
  if (s === "PENDING" || s === "HOLD") return "warning";
  if (s === "CANCELLED" || s === "CANCELED") return "error";
  return "default";
};

function orderProductLines(record: CustomerCourierOrderRow): string[] {
  const raw = record as CustomerCourierOrderRow & {
    order_products?: CustomerCourierOrderProductLine[] | null;
  };
  const ops = raw.orderProducts ?? raw.order_products;
  if (!Array.isArray(ops) || ops.length === 0) return [];
  return ops.map((op, idx) => {
    const p =
      op?.productName ??
      op?.product?.name ??
      op?.comboProduct?.name ??
      "Product";
    const v =
      op?.variantName ??
      op?.variant?.name ??
      op?.comboVariant?.name ??
      "";
    const qty =
      op?.quantity != null && Number(op.quantity) > 1
        ? ` ×${op.quantity}`
        : "";
    const line = v ? `${p} — ${v}${qty}` : `${p}${qty}`;
    return line.trim() || `Item ${idx + 1}`;
  });
}

interface CustomerCourierOrdersModalProps {
  open: boolean;
  onClose: () => void;
  data: CustomerCourierOrdersPayload | null | undefined;
  /** Optional subtitle, e.g. last digits of phone */
  phoneHint?: string;
}

function CustomerCourierOrdersModal({
  open,
  onClose,
  data,
  phoneHint,
}: CustomerCourierOrdersModalProps) {
  const totalOrders = normalizeOrderRows(data?.totalOrders);
  const deliveredOrders = normalizeOrderRows(data?.deliveredOrders);
  const canceledOrders = normalizeOrderRows(
    data?.canceledOrders ?? data?.cancelledOrders,
  );

  const columns: ColumnsType<CustomerCourierOrderRow> = [
    {
      title: "Order",
      key: "order",
      width: 200,
      render: (_, record) => (
        <Tooltip title={record.id}>
          <Link
            to={`/orders/${record.id}`}
            className="text-primary font-semibold hover:underline"
            onClick={() => onClose()}
          >
            #{record.id.slice(-8).toUpperCase()}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: "Placed",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (v: string) =>
        v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={statusColor(status)} className="m-0 uppercase text-[10px]">
          {(status || "—").replace(/_/g, " ")}
        </Tag>
      ),
    },
    {
      title: "Products",
      key: "orderProducts",
      width: 280,
      render: (_: unknown, record: CustomerCourierOrderRow) => {
        const lines = orderProductLines(record);
        if (lines.length === 0) {
          return (
            <Text type="secondary" className="text-xs">
              —
            </Text>
          );
        }
        const preview = lines.slice(0, 3);
        const rest = lines.length - preview.length;
        return (
          <Tooltip
            title={
              <div className="max-w-sm whitespace-pre-wrap text-xs">
                {lines.join("\n")}
              </div>
            }
          >
            <div className="text-[11px] leading-snug text-gray-800 space-y-0.5 max-w-[260px]">
              {preview.map((line, i) => (
                <div key={i} className="truncate">
                  {line}
                </div>
              ))}
              {rest > 0 ? (
                <div className="text-[10px] text-gray-400">+{rest} more</div>
              ) : null}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      align: "right",
      render: (v: number) =>
        v != null && Number.isFinite(Number(v)) ? (
          <DisplayCurrency amount={Number(v)} />
        ) : (
          "—"
        ),
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      ellipsis: true,
      render: (v: string | null) =>
        v ? (
          <Text ellipsis className="text-xs">
            {String(v).replace(/-/g, " ")}
          </Text>
        ) : (
          "—"
        ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (v: string | null) => (
        <Text type="secondary" ellipsis className="text-xs max-w-[220px]">
          {v || "—"}
        </Text>
      ),
    },
  ];

  const table = (rows: CustomerCourierOrderRow[]) => (
    <Table<CustomerCourierOrderRow>
      rowKey="id"
      size="small"
      pagination={
        rows.length > 8 ? { pageSize: 8, showSizeChanger: false } : false
      }
      columns={columns}
      dataSource={rows}
      locale={{ emptyText: "No orders in this category" }}
      scroll={{ x: 1040 }}
    />
  );

  return (
    <Modal
      title={
        <div>
          <div className="text-base font-semibold text-gray-900">
            Courier order history
          </div>
          {phoneHint ? (
            <div className="text-xs font-normal text-gray-500 mt-0.5">
              Phone: {phoneHint}
            </div>
          ) : null}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnClose
      classNames={{ body: "!pt-2" }}
    >
      <Tabs
        defaultActiveKey="total"
        items={[
          {
            key: "total",
            label: `Total (${totalOrders.length})`,
            children: table(totalOrders),
          },
          {
            key: "delivered",
            label: `Delivered (${deliveredOrders.length})`,
            children: table(deliveredOrders),
          },
          {
            key: "canceled",
            label: `Cancelled (${canceledOrders.length})`,
            children: table(canceledOrders),
          },
        ]}
      />
    </Modal>
  );
}

export default CustomerCourierOrdersModal;
