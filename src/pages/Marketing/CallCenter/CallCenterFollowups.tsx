import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Tag,
  Select,
  Statistic,
  Row,
  Col,
  Card,
  Drawer,
  Divider,
  Empty,
  Spin,
  Tabs,
} from "antd";
import {
  Phone,
  Plus,
  Calendar,
  MessageSquare,
  User,
  Clock,
  Search,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  AlarmClock,
  History,
  ShoppingBag,
  TrendingUp,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { FaPhoneVolume } from "react-icons/fa6";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-toastify";

import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import {
  useGetCallCenterFollowupsQuery,
  useAddFollowUpMutation,
  useGetFollowUpsQuery,
  useGetOrderByIdQuery,
  useGetCustomerOrdersQuery,
} from "../../../redux/features/order/orderApi";

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Option } = Select;

const followUpStatusConfig = {
  due_today: {
    color: "orange",
    label: "Due Today",
    icon: <AlarmClock className="w-3 h-3" />,
  },
  overdue: {
    color: "red",
    label: "Overdue",
    icon: <PhoneMissed className="w-3 h-3" />,
  },
  upcoming: {
    color: "blue",
    label: "Upcoming",
    icon: <PhoneCall className="w-3 h-3" />,
  },
  no_followup: {
    color: "default",
    label: "No Follow-up",
    icon: <PhoneOff className="w-3 h-3" />,
  },
};

const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  const idx = cleaned.indexOf("01");
  if (idx !== -1) cleaned = cleaned.substring(idx);
  return "88" + cleaned;
};

// ── Drawer: Call History + Order History ─────────────────────────────────────

const statusColor: Record<string, string> = {
  DELIVERED: "green",
  CANCELLED: "red",
  CONFIRM: "blue",
  SHIPPED: "cyan",
  PENDING: "orange",
  HOLD: "gold",
};

interface HistoryDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

const CallHistoryDrawer = ({ orderId, onClose }: HistoryDrawerProps) => {
  const [scheduleForm] = Form.useForm();
  const [addFollowUp, { isLoading: isAdding }] = useAddFollowUpMutation();

  const { data: orderData, isLoading: orderLoading } = useGetOrderByIdQuery(
    orderId as string,
    { skip: !orderId }
  );
  const { data: followUpsData, isLoading: historyLoading } =
    useGetFollowUpsQuery(orderId as string, { skip: !orderId });

  const order = orderData?.data;
  const followUps: any[] = followUpsData?.data || [];

  const customerName = order?.customer?.name || order?.user?.name || "N/A";
  const customerPhone = order?.customer?.phone || order?.user?.phone || null;
  const customerId = order?.customer?.id || null;

  // Customer order history
  const { data: customerOrdersData, isLoading: ordersLoading } =
    useGetCustomerOrdersQuery(
      { customerId: customerId ?? undefined, phone: customerPhone ?? undefined },
      { skip: !orderId || (!customerId && !customerPhone) }
    );
  const customerOrders: any[] = customerOrdersData?.data || [];
  const orderSummary = customerOrdersData?.summary || {};

  // Sort follow-ups: overdue → due today → upcoming
  const now = dayjs();
  const todayStart = now.startOf("day");
  const todayEnd = now.endOf("day");

  const overdue = followUps
    .filter((f) => dayjs(f.followUpDate).isBefore(todayStart))
    .sort((a, b) => dayjs(a.followUpDate).diff(dayjs(b.followUpDate)));
  const dueToday = followUps
    .filter(
      (f) =>
        !dayjs(f.followUpDate).isBefore(todayStart) &&
        !dayjs(f.followUpDate).isAfter(todayEnd)
    )
    .sort((a, b) => dayjs(a.followUpDate).diff(dayjs(b.followUpDate)));
  const upcoming = followUps
    .filter((f) => dayjs(f.followUpDate).isAfter(todayEnd))
    .sort((a, b) => dayjs(a.followUpDate).diff(dayjs(b.followUpDate)));
  const sortedFollowUps = [...overdue, ...dueToday, ...upcoming];

  const handleSchedule = async (values: any) => {
    if (!orderId) return;
    try {
      const res = await addFollowUp({
        orderId,
        data: {
          followUpDate: values.followUpDate.toISOString(),
          description: values.description,
        },
      }).unwrap();
      if (res.success) {
        toast.success("Follow-up scheduled");
        scheduleForm.resetFields();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to schedule follow-up");
    }
  };

  const renderFollowUpGroup = (
    items: any[],
    groupLabel: string,
    dotColor: string
  ) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {groupLabel}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {items.map((f) => (
            <div
              key={f.id}
              className="border border-gray-100 rounded-lg p-3 bg-gray-50"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-medium text-sm text-gray-800">
                  {dayjs(f.followUpDate).format("DD MMM YYYY, h:mm A")}
                </span>
                <span
                  className={`text-xs ml-auto ${dayjs(f.followUpDate).isBefore(now) ? "text-red-400" : "text-blue-400"}`}
                >
                  {dayjs(f.followUpDate).fromNow()}
                </span>
              </div>
              <div className="flex items-start gap-2 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">{f.description}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <User className="w-3 h-3" />
                <span>
                  {f.createdBy?.name || "System"} ·{" "}
                  {dayjs(f.createdAt).format("DD MMM, h:mm A")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isLoading = orderLoading || historyLoading;

  // ── Tab: Call History content ──
  const callHistoryTab = (
    <>
      {/* Schedule new follow-up */}
      <div className="mb-4 p-3 border border-primary/20 rounded-lg bg-primary/5">
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm text-gray-700">
          <Plus className="w-4 h-4 text-primary" />
          Schedule Next Follow-up
        </div>
        <Form form={scheduleForm} layout="vertical" onFinish={handleSchedule}>
          <Form.Item
            name="followUpDate"
            label="Call Date & Time"
            rules={[{ required: true, message: "Select date and time" }]}
            className="mb-2"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              placeholder="When to call?"
              disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Call Notes"
            rules={[{ required: true, message: "Enter call notes" }]}
            className="mb-2"
          >
            <TextArea
              rows={3}
              placeholder="What was discussed, customer feedback, outcome, next steps..."
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isAdding}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="flex items-center gap-1"
          >
            Schedule Follow-up
          </Button>
        </Form>
      </div>

      <Divider className="my-3" />

      <div className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
        <History className="w-4 h-4" />
        Follow-up History ({followUps.length})
      </div>

      {sortedFollowUps.length === 0 ? (
        <Empty description="No follow-ups yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <>
          {renderFollowUpGroup(overdue, "Overdue", "#ef4444")}
          {renderFollowUpGroup(dueToday, "Due Today", "#f97316")}
          {renderFollowUpGroup(upcoming, "Upcoming", "#3b82f6")}
        </>
      )}
    </>
  );

  // ── Tab: Order History content ──
  const orderHistoryTab = (
    <>
      {/* Summary stats */}
      {!ordersLoading && customerOrders.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            {
              icon: <ShoppingBag className="w-4 h-4 text-gray-500" />,
              label: "Total Orders",
              value: orderSummary.total ?? 0,
              color: "text-gray-700",
            },
            {
              icon: <PackageCheck className="w-4 h-4 text-green-500" />,
              label: "Delivered",
              value: orderSummary.delivered ?? 0,
              color: "text-green-600",
            },
            {
              icon: <PackageX className="w-4 h-4 text-red-400" />,
              label: "Cancelled",
              value: orderSummary.cancelled ?? 0,
              color: "text-red-500",
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
              label: "Total Spent",
              value: `৳${(orderSummary.totalSpent ?? 0).toLocaleString()}`,
              color: "text-blue-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-2.5"
            >
              {s.icon}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">{s.label}</span>
                <span className={`font-semibold text-sm ${s.color}`}>
                  {s.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {ordersLoading ? (
        <div className="flex justify-center items-center h-32">
          <Spin />
        </div>
      ) : customerOrders.length === 0 ? (
        <Empty
          description="No orders found for this customer"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {customerOrders.map((o: any) => {
            const products = o.orderProducts || [];
            const isCurrentOrder = o.id === orderId;
            return (
              <div
                key={o.id}
                className={`border rounded-lg p-3 ${isCurrentOrder ? "border-primary bg-primary/5" : "border-gray-100 bg-gray-50"}`}
              >
                {/* Order header */}
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    to={`/orders/${o.id}`}
                    className="font-mono text-xs text-primary hover:underline font-semibold"
                  >
                    #{o.id.slice(-8).toUpperCase()}
                  </Link>
                  {isCurrentOrder && (
                    <span className="text-xs bg-primary text-white rounded px-1.5 py-0.5">
                      Current
                    </span>
                  )}
                  <Tag
                    color={statusColor[o.status] || "default"}
                    className="ml-auto text-xs"
                  >
                    {o.status}
                  </Tag>
                </div>

                {/* Products */}
                <div className="flex flex-col gap-0.5 mb-2">
                  {products.slice(0, 3).map((item: any, i: number) => {
                    const name =
                      item.product?.name || item.comboProduct?.name || "Product";
                    const variant =
                      item.variant?.name || item.comboVariant?.name || "";
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-1 text-xs text-gray-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        <span>
                          {name}
                          {variant ? ` — ${variant}` : ""}{" "}
                          <span className="text-gray-400">×{item.quantity}</span>
                        </span>
                      </div>
                    );
                  })}
                  {products.length > 3 && (
                    <span className="text-xs text-gray-400 ml-3">
                      +{products.length - 3} more items
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dayjs(o.createdAt).format("DD MMM YYYY")}
                  </div>
                  <span className="font-semibold text-gray-700">
                    ৳{(o.totalPrice || 0).toLocaleString()}
                  </span>
                </div>

                {/* Follow-ups on this order */}
                {o.followUps && o.followUps.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <History className="w-3 h-3" />
                      {o.followUps.length} follow-up
                      {o.followUps.length > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 shrink-0" />
                      Next:{" "}
                      {dayjs(
                        o.followUps.find(
                          (f: any) => new Date(f.followUpDate) >= new Date()
                        )?.followUpDate || o.followUps[o.followUps.length - 1].followUpDate
                      ).format("DD MMM, h:mm A")}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span>Customer Details</span>
        </div>
      }
      open={!!orderId}
      onClose={onClose}
      width={560}
      styles={{ body: { padding: "12px 20px" } }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Customer Info Bar */}
          <div className="flex flex-col gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-800">{customerName}</span>
              <Link
                to={`/orders/${orderId}`}
                className="ml-auto text-xs text-primary hover:underline font-mono"
              >
                #{orderId?.slice(-8).toUpperCase()}
              </Link>
            </div>
            {customerPhone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-medium text-primary">{customerPhone}</span>
                <a href={`tel:${customerPhone}`}>
                  <Button
                    type="text"
                    size="small"
                    icon={<FaPhoneVolume className="text-green-600 text-sm" />}
                  />
                </a>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(customerPhone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<BsWhatsapp className="text-green-500 text-base" />}
                  />
                </a>
                <Tag
                  color={order?.status ? statusColor[order.status] || "orange" : "orange"}
                  className="ml-auto"
                >
                  {order?.status}
                </Tag>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs
            defaultActiveKey="call-history"
            size="small"
            items={[
              {
                key: "call-history",
                label: (
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Call History
                    {followUps.length > 0 && (
                      <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                        {followUps.length}
                      </span>
                    )}
                  </span>
                ),
                children: callHistoryTab,
              },
              {
                key: "order-history",
                label: (
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Order History
                    {customerOrders.length > 0 && (
                      <span className="ml-1 bg-gray-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                        {customerOrders.length}
                      </span>
                    )}
                  </span>
                ),
                children: orderHistoryTab,
              },
            ]}
          />
        </>
      )}
    </Drawer>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const CallCenterFollowups = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Schedule follow-up modal (from list row)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderCustomer, setSelectedOrderCustomer] = useState<string>("");
  const [form] = Form.useForm();

  // Call history drawer
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null);

  const queryArgs = [
    { name: "page", value: String(page) },
    { name: "limit", value: String(limit) },
    ...(search ? [{ name: "search", value: search }] : []),
    ...(followUpFilter ? [{ name: "followUpFilter", value: followUpFilter }] : []),
    ...(statusFilter ? [{ name: "status", value: statusFilter }] : []),
  ];

  const { data, isLoading, isFetching } = useGetCallCenterFollowupsQuery(queryArgs);
  const [addFollowUp, { isLoading: isAdding }] = useAddFollowUpMutation();

  const orders = data?.data || [];
  const meta = data?.meta || { total: 0 };
  const summary = data?.summary || {};

  const openFollowUpModal = (orderId: string, customerName: string) => {
    setSelectedOrderId(orderId);
    setSelectedOrderCustomer(customerName);
    form.resetFields();
    setModalOpen(true);
  };

  const handleFollowUpSubmit = async (values: any) => {
    if (!selectedOrderId) return;
    try {
      const res = await addFollowUp({
        orderId: selectedOrderId,
        data: {
          followUpDate: values.followUpDate.toISOString(),
          description: values.description,
        },
      }).unwrap();
      if (res.success) {
        toast.success("Follow-up scheduled successfully");
        setModalOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add follow-up");
    }
  };

  const columns = [
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (_: any, record: any) => {
        const name = record.customerName || "Unknown";
        const phone = record.customerPhone || "";
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-medium text-gray-800">
              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{name}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-500">{phone}</span>
                <a href={`tel:${phone}`} title="Call">
                  <Button
                    type="text"
                    size="small"
                    icon={<Phone className="w-3 h-3 text-green-600" />}
                    className="!p-0.5"
                  />
                </a>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<BsWhatsapp className="text-green-500 text-sm" />}
                    className="!p-0.5"
                  />
                </a>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Order",
      key: "order",
      width: 160,
      render: (_: any, record: any) => (
        <div className="flex flex-col gap-0.5 text-sm">
          <Link
            to={`/orders/${record.id}`}
            className="font-mono text-primary hover:underline text-xs"
          >
            #{record.id.slice(-8).toUpperCase()}
          </Link>
          <Tag
            color={
              record.status === "DELIVERED"
                ? "green"
                : record.status === "CANCELLED"
                ? "red"
                : record.status === "PENDING"
                ? "orange"
                : record.status === "CONFIRM"
                ? "blue"
                : "default"
            }
            className="text-xs w-fit"
          >
            {record.status}
          </Tag>
          <span className="text-gray-400 text-xs">
            {dayjs(record.createdAt).format("DD MMM YYYY")}
          </span>
        </div>
      ),
    },
    {
      title: "Products",
      key: "products",
      render: (_: any, record: any) => {
        const items = record.orderProducts || [];
        if (items.length === 0)
          return <span className="text-gray-400 text-xs">—</span>;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-gray-600">
            {items.slice(0, 2).map((item: any, i: number) => {
              const name =
                item.product?.name || item.comboProduct?.name || "Product";
              const variant =
                item.variant?.name || item.comboVariant?.name || "";
              return (
                <span key={i}>
                  {name}
                  {variant ? ` (${variant})` : ""} ×{item.quantity}
                </span>
              );
            })}
            {items.length > 2 && (
              <span className="text-gray-400">+{items.length - 2} more</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Amount",
      key: "amount",
      width: 110,
      render: (_: any, record: any) => (
        <span className="font-semibold text-gray-800">
          ৳{(record.totalPrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Follow-up Status",
      key: "followUpStatus",
      width: 155,
      render: (_: any, record: any) => {
        const cfg =
          followUpStatusConfig[
            record.followUpStatus as keyof typeof followUpStatusConfig
          ];
        return (
          <div className="flex flex-col gap-1">
            <Tag
              color={cfg?.color}
              className="flex items-center gap-1 w-fit text-xs"
            >
              {cfg?.icon}
              {cfg?.label}
            </Tag>
            {record.nextFollowUp && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {dayjs(record.nextFollowUp.followUpDate).format("DD MMM, h:mm A")}
              </div>
            )}
            {record.lastFollowUp && record.followUpStatus === "overdue" && (
              <div className="text-xs text-red-400">
                {dayjs(record.lastFollowUp.followUpDate).fromNow()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Last Call Note",
      key: "lastNote",
      render: (_: any, record: any) => {
        const note = record.lastCallNote;
        if (!note)
          return <span className="text-gray-400 text-xs">No notes yet</span>;
        return (
          <div className="flex flex-col gap-0.5 max-w-[220px]">
            <div className="flex items-start gap-1 text-xs text-gray-700">
              <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
              <span className="line-clamp-2">{note.description}</span>
            </div>
            <span className="text-gray-400 text-xs ml-4">
              {dayjs(note.createdAt).format("DD MMM, h:mm A")}
            </span>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 170,
      render: (_: any, record: any) => (
        <div className="flex flex-col gap-1.5">
          <Button
            type="primary"
            size="small"
            icon={<Plus className="w-3 h-3" />}
            onClick={() => openFollowUpModal(record.id, record.customerName)}
            className="flex items-center gap-1 text-xs"
          >
            Schedule Follow-up
          </Button>
          <Button
            size="small"
            icon={<History className="w-3 h-3" />}
            onClick={() => setDrawerOrderId(record.id)}
            className="flex items-center gap-1 text-xs"
          >
            View Call History
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Call Center Follow-ups | Marketing"
        description="Manage customer follow-up calls for all orders"
      />

      <PageHeader
        title="Call Center Follow-ups"
        subtitle="View all orders with customer contact info and schedule follow-up calls"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Marketing" },
          { title: "Call Center Follow-ups" },
        ]}
      />

      {/* Summary Cards */}
      <Row gutter={16} className="mb-6">
        {(
          [
            {
              key: "due_today",
              label: "Due Today",
              color: "orange",
              borderColor: "border-orange-400",
              valueColor: "#f97316",
              icon: <AlarmClock className="w-4 h-4 text-orange-500 mr-1" />,
            },
            {
              key: "overdue",
              label: "Overdue",
              color: "red",
              borderColor: "border-red-400",
              valueColor: "#ef4444",
              icon: <PhoneMissed className="w-4 h-4 text-red-500 mr-1" />,
            },
            {
              key: "upcoming",
              label: "Upcoming",
              color: "blue",
              borderColor: "border-blue-400",
              valueColor: "#3b82f6",
              icon: <PhoneCall className="w-4 h-4 text-blue-500 mr-1" />,
            },
            {
              key: "no_followup",
              label: "No Follow-up",
              color: "gray",
              borderColor: "border-gray-400",
              valueColor: "#6b7280",
              icon: <PhoneOff className="w-4 h-4 text-gray-400 mr-1" />,
            },
          ] as const
        ).map((card) => (
          <Col xs={12} sm={6} key={card.key}>
            <Card
              className={`cursor-pointer border-2 ${followUpFilter === card.key ? card.borderColor : "border-transparent"}`}
              onClick={() =>
                setFollowUpFilter(followUpFilter === card.key ? "" : card.key)
              }
            >
              <Statistic
                title={
                  <span style={{ color: card.valueColor }} className="font-medium">
                    {card.label}
                  </span>
                }
                value={summary[card.key] ?? 0}
                prefix={card.icon}
                valueStyle={{ color: card.valueColor }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Input
            placeholder="Search by customer name or phone..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={() => {
              setSearch(searchInput);
              setPage(1);
            }}
            allowClear
            onClear={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
          >
            Search
          </Button>
        </div>

        <Select
          placeholder="Order Status"
          value={statusFilter || undefined}
          onChange={(v) => {
            setStatusFilter(v || "");
            setPage(1);
          }}
          allowClear
          style={{ minWidth: 160 }}
        >
          <Option value="PENDING">Pending</Option>
          <Option value="HOLD">Hold</Option>
          <Option value="CONFIRM">Confirm</Option>
          <Option value="SHIPPED">Shipped</Option>
          <Option value="DELIVERED">Delivered</Option>
          <Option value="CANCELLED">Cancelled</Option>
        </Select>

        <Select
          placeholder="Follow-up Filter"
          value={followUpFilter || undefined}
          onChange={(v) => {
            setFollowUpFilter(v || "");
            setPage(1);
          }}
          allowClear
          style={{ minWidth: 160 }}
        >
          <Option value="due_today">Due Today</Option>
          <Option value="overdue">Overdue</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="no_followup">No Follow-up</Option>
        </Select>

        {(followUpFilter || statusFilter || search) && (
          <Button
            onClick={() => {
              setFollowUpFilter("");
              setStatusFilter("");
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading || isFetching}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta.total}
        isPaginate
      />

      {/* Call History Drawer */}
      <CallHistoryDrawer
        orderId={drawerOrderId}
        onClose={() => setDrawerOrderId(null)}
      />

      {/* Quick Schedule Follow-up Modal (from row button) */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Schedule Follow-up</span>
            {selectedOrderCustomer && (
              <span className="text-gray-500 font-normal text-sm">
                — {selectedOrderCustomer}
              </span>
            )}
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={form.submit}
        confirmLoading={isAdding}
        okText="Schedule Follow-up"
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleFollowUpSubmit}>
          <Form.Item
            label="Next Follow-up Date & Time"
            name="followUpDate"
            rules={[{ required: true, message: "Please select a follow-up date and time" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              size="large"
              placeholder="Select date and time for next call"
              disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))}
            />
          </Form.Item>

          <Form.Item
            label="Call Notes"
            name="description"
            rules={[{ required: true, message: "Please enter call notes" }]}
          >
            <TextArea
              rows={5}
              size="large"
              placeholder="What was discussed, customer feedback, outcome of the call, next steps..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CallCenterFollowups;
