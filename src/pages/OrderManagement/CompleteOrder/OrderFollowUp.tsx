import { useState, useEffect, useRef } from "react";
import { useLockRefresh } from "../../../hooks/useLockRefresh";
import { useParams, Link } from "react-router-dom";
import { Button, Modal, Form, Input, DatePicker, Tag } from "antd";
import {
  ArrowLeft,
  Plus,
  Calendar,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

import dayjs from "dayjs";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import CustomActionButton from "../../../components/common/Button/CustomActionButton";
import { DataTable } from "../../../components/common/Tables";
import {
  useAddFollowUpMutation,
  useGetFollowUpsQuery,
  useGetLockStatusQuery,
  useGetOrderByIdQuery,
  useLockOrderMutation,
  useRefreshLockMutation,
  useUnlockOrderMutation,
} from "../../../redux/features/order/orderApi";
import { useAppSelector } from "../../../redux/features/hooks";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { FaPhoneVolume } from "react-icons/fa6";
import { BsWhatsapp } from "react-icons/bs";

const { TextArea } = Input;

const OrderFollowUp = () => {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form] = Form.useForm();

  const { data: followUpsData, isLoading: isFollowUpsLoading } =
    useGetFollowUpsQuery(id as string, {
      skip: !id,
    });

  const { data: orderData } = useGetOrderByIdQuery(id as string, {
    skip: !id,
  });

  // Poll lock status once per TTL period (30 s) — only needed to detect
  // if the lock was externally revoked between heartbeats.
  const { data: lockStatusData } = useGetLockStatusQuery(id as string, {
    skip: !id,
    pollingInterval: 30000,
  });

  const [addFollowUp, { isLoading: isAdding }] = useAddFollowUpMutation();
  const [lockOrder] = useLockOrderMutation();
  const [refreshLock] = useRefreshLockMutation();
  const [unlockOrder] = useUnlockOrderMutation();

  const followUps = followUpsData?.data || [];
  const order = orderData?.data;
  const lockData = lockStatusData?.data;
  const currentUser = useAppSelector(selectCurrentUser);

  const isLocked = lockData?.isLocked;

  const isLockedByMe = isLocked && lockData?.maintainer?.id === currentUser?.id;

  const isLockedByOther =
    isLocked && lockData?.maintainer?.id !== currentUser?.id;

  const isLockedByMeRef = useRef(isLockedByMe);

  useEffect(() => {
    isLockedByMeRef.current = isLockedByMe;
  }, [isLockedByMe]);

  useEffect(() => {
    // Initial lock attempt
    // If order is HOLD, has ID, and IS NOT LOCKED -> attempt to lock
    if (order?.status === "HOLD" && id && isLocked === false) {
      lockOrder(id);
    }
  }, [order?.status, id, lockOrder, isLocked]);

  useLockRefresh(id, isLockedByMe, refreshLock);

  useEffect(() => {
    // Cleanup: unlock on unmount if locked by me
    return () => {
      if (isLockedByMeRef.current && id) {
        unlockOrder(id);
      }
    };
  }, [id, unlockOrder]);

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
        toast.success("Follow-up added successfully");
        setOpen(false);
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add follow-up");
    }
  };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "followUpDate",
      key: "followUpDate",
      width: 200,
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">
            {dayjs(date).format("DD MMM YYYY, h:mm A")}
          </span>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 200,
      render: (createdBy: any) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
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
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (date: string) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{dayjs(date).format("DD MMM YYYY, h:mm A")}</span>
        </div>
      ),
    },
  ];

  // Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return "";

    // Remove all non-numeric characters
    let cleaned = phone.replace(/[^0-9]/g, "");

    // Find the first occurrence of "01" and keep everything from there
    const zeroOneIndex = cleaned.indexOf("01");
    if (zeroOneIndex !== -1) {
      cleaned = cleaned.substring(zeroOneIndex);
    }

    // Always ensure it starts with 88
    return "88" + cleaned;
  };

  return (
    <div>
      <PageMeta
        title="Order Follow-up | ERP"
        description="View and manage order follow-ups"
      />

      <PageHeader
        title="Order Follow-ups"
        subtitle={`Customer Name: ${order?.user?.name || "N/A"}`}
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Orders", path: "/orders" },
          { title: "Completed Orders", path: "/orders/completed" },
          { title: "Follow-up" },
        ]}
        extra={
          <div className="flex gap-2">
            <Link to="/orders/completed">
              <Button icon={<ArrowLeft className="w-4 h-4" />} size="middle">
                Back to Orders
              </Button>
            </Link>
            <CustomActionButton
              onClick={() => setOpen(true)}
              text="Add Follow-up"
              icon={<Plus />}
              type="primary"
              disabled={isLockedByOther}
            />
          </div>
        }
      />

      <div className="mb-6">
        <div className="mb-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-gray-50 px-3 py-2 rounded">
              <span className="text-gray-500 mr-2">Customer:</span>
              <span className="font-medium">{order?.user?.name || "N/A"}</span>
            </div>
            <div className="bg-gray-50 px-3 !-mt-1.5 py-2 rounded">
              <span className="text-gray-500 mr-2">Phone:</span>
              <span className="font-medium text-primary">
                {order?.user?.phone || "N/A"}

                <a href={`tel:${order?.user?.phone}`}>
                  <Button
                    icon={
                      <FaPhoneVolume className=" ml-1.5 !text-primary !cursor-pointer" />
                    }
                    type="text"
                  />
                </a>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(order?.user?.phone || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    icon={
                      <BsWhatsapp className="!-mt-2 ml-1.5 !text-primary !cursor-pointer text-[16px]" />
                    }
                    type="text"
                  />
                </a>
              </span>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded">
              <span className="text-gray-500 mr-2">Current Status:</span>
              <Tag
                style={{
                  backgroundColor: "orange",
                  color: "white",
                  border: "none",
                }}
              >
                {order?.status || "N/A"}
              </Tag>
            </div>
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
      </div>

      <Modal
        title="Add Follow-up"
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={form.submit}
        confirmLoading={isAdding}
        okText="Add Follow-up"
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Follow-up Date"
            name="followUpDate"
            rules={[
              { required: true, message: "Please select a follow-up date" },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              className="w-full"
              size="large"
              placeholder="Select date and time"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter follow-up details..."
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderFollowUp;
