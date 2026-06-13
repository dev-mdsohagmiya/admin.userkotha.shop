import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Modal, Form, Input, DatePicker, Tag } from "antd";
import {
  ArrowLeft,
  Plus,
  Calendar,
  MessageSquare,
  User,
  Clock,
  Phone,
} from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { FaPhoneVolume } from "react-icons/fa6";
import { BsWhatsapp } from "react-icons/bs";

import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import {
  useAddFollowUpMutation,
  useGetFollowUpsQuery,
  useGetOrderByIdQuery,
} from "../../../redux/features/order/orderApi";

const { TextArea } = Input;

const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  const idx = cleaned.indexOf("01");
  if (idx !== -1) cleaned = cleaned.substring(idx);
  return "88" + cleaned;
};

const CallCenterOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form] = Form.useForm();

  const { data: followUpsData, isLoading: isFollowUpsLoading } =
    useGetFollowUpsQuery(id as string, { skip: !id });

  const { data: orderData } = useGetOrderByIdQuery(id as string, { skip: !id });

  const [addFollowUp, { isLoading: isAdding }] = useAddFollowUpMutation();

  const followUps = followUpsData?.data || [];
  const order = orderData?.data;

  // Resolve customer name and phone: admin orders store data in order.customer,
  // web orders store data in order.user. Fall back gracefully.
  const customerName =
    order?.customer?.name || order?.user?.name || "N/A";
  const customerPhone =
    order?.customer?.phone || order?.user?.phone || null;

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        followUpDate: values.followUpDate.toISOString(),
        description: values.description,
      };
      const res = await addFollowUp({
        orderId: id as string,
        data: payload,
      }).unwrap();
      if (res.success) {
        toast.success("Follow-up scheduled successfully");
        setOpen(false);
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to schedule follow-up");
    }
  };

  const columns = [
    {
      title: "Scheduled Date & Time",
      dataIndex: "followUpDate",
      key: "followUpDate",
      width: 210,
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium">
            {dayjs(date).format("DD MMM YYYY, h:mm A")}
          </span>
        </div>
      ),
    },
    {
      title: "Call Notes",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Logged By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 200,
      render: (createdBy: any) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-700">
              {createdBy?.name || "N/A"}
            </span>
            <span className="text-xs text-gray-500">
              {createdBy?.email || ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Logged At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (date: string) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{dayjs(date).format("DD MMM YYYY, h:mm A")}</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Call Center — Order Follow-ups | Marketing"
        description="View and manage call center follow-ups for this order"
      />

      <PageHeader
        title="Call Center — Order Follow-ups"
        subtitle={`Customer: ${customerName}`}
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Marketing" },
          { title: "Call Center Follow-ups", path: "/marketing/call-center" },
          { title: `Order #${id?.slice(-8).toUpperCase() || ""}` },
        ]}
        extra={
          <div className="flex gap-2">
            <Link to="/marketing/call-center">
              <Button icon={<ArrowLeft className="w-4 h-4" />} size="middle">
                Back to Call Center
              </Button>
            </Link>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setOpen(true)}
            >
              Schedule Follow-up
            </Button>
          </div>
        }
      />

      {/* Customer Info Bar */}
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-gray-500">Customer:</span>
          <span className="font-semibold text-gray-800">{customerName}</span>
        </div>

        <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-gray-500">Phone:</span>
          {customerPhone ? (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-primary">{customerPhone}</span>
              <a href={`tel:${customerPhone}`}>
                <Button
                  type="text"
                  size="small"
                  icon={<FaPhoneVolume className="text-primary text-sm" />}
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
            </div>
          ) : (
            <span className="font-semibold text-gray-400">N/A</span>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg flex items-center gap-2">
          <span className="text-gray-500">Order Status:</span>
          <Tag
            color={
              order?.status === "DELIVERED"
                ? "green"
                : order?.status === "CANCELLED"
                ? "red"
                : order?.status === "CONFIRM"
                ? "blue"
                : "orange"
            }
          >
            {order?.status || "N/A"}
          </Tag>
        </div>

        <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg flex items-center gap-2">
          <span className="text-gray-500">Total:</span>
          <span className="font-semibold text-gray-800">
            ৳{(order?.totalPrice || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={followUps}
        loading={isFollowUpsLoading}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={followUps.length}
        isPaginate={followUps.length > 10}
      />

      {/* Schedule Follow-up Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Schedule Follow-up Call</span>
          </div>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={form.submit}
        confirmLoading={isAdding}
        okText="Schedule Follow-up"
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Next Call Date & Time"
            name="followUpDate"
            rules={[{ required: true, message: "Please select a date and time" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              size="large"
              placeholder="Select when to call the customer"
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
    </div>
  );
};

export default CallCenterOrderDetail;
