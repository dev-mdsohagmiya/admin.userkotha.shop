import { Modal, Form, Select, Input, DatePicker } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useUpdateOrderStatusMutation } from "../../../../redux/features/order/orderApi";
import { OrderStatus } from "../../../../types/order";

const { TextArea } = Input;

interface UpdateOrderStatusModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderId: string | null;
  currentStatus?: OrderStatus | "";
  onSuccess?: (status: OrderStatus) => void;
}

const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  open,
  setOpen,
  orderId,
  currentStatus,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(
    currentStatus as OrderStatus | undefined,
  );
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();

  useEffect(() => {
    if (open && currentStatus) {
      form.setFieldsValue({ status: currentStatus });
      setSelectedStatus(currentStatus as OrderStatus);
    }
  }, [open, currentStatus, form]);

  const statusOptions = useMemo(() => {
    const options = [
      { value: "PENDING", label: "Pending" },
      { value: "HOLD", label: "Hold" },
      { value: "CONFIRM", label: "Confirmed" },
      { value: "SHIPPED", label: "Shipped" },
      { value: "DELIVERED", label: "Delivered" },
      { value: "CANCELLED", label: "Cancelled" },
      { value: "GOOD_BUT_NO_RESPONSE", label: "Good But No Response" },
      { value: "NO_RESPONSE", label: "No Response" },
      { value: "ADVANCE_REQUIRED", label: "Advance Required" },
    ];

    if (!currentStatus) return options;

    switch (currentStatus) {
      case "PENDING":
        return options.filter((opt) =>
          [
            "CONFIRM",
            "HOLD",
            "CANCELLED",
            "GOOD_BUT_NO_RESPONSE",
            "NO_RESPONSE",
            "ADVANCE_REQUIRED",
          ].includes(opt.value),
        );
      case "HOLD":
        return options.filter((opt) =>
          ["CONFIRM", "ADVANCE_REQUIRED", "CANCELLED", "HOLD"].includes(
            opt.value,
          ),
        );
      case "PROCESSING":
        return options.filter((opt) =>
          ["CONFIRM", "ADVANCE_REQUIRED", "CANCELLED", "HOLD"].includes(
            opt.value,
          ),
        );
      case "CONFIRM":
        return options.filter((opt) =>
          ["SHIPPED", "CANCELLED"].includes(opt.value),
        );
      case "SHIPPED":
        return options.filter((opt) =>
          ["DELIVERED", "CANCELLED"].includes(opt.value),
        );
      case "DELIVERED":
        return options.filter((opt) => ["CANCELLED"].includes(opt.value));
      case "CANCELLED":
        return options.filter((opt) =>
          ["HOLD", "CONFIRM", "ADVANCE_REQUIRED"].includes(opt.value),
        );
      default:
        return options;
    }
  }, [currentStatus]);

  const handleSubmit = async () => {
    if (!orderId) {
      toast.error("Order ID is missing");
      return;
    }

    try {
      const values = await form.validateFields();

      const payload: any = {
        status: values.status,
      };

      // If status is HOLD and coming from PENDING, include follow-up information
      if (
        values.status === "HOLD" &&
        (currentStatus === "PENDING" || currentStatus === "PROCESSING") &&
        (values.followUpDate || values.followUpDescription)
      ) {
        payload.followUp = {
          followUpDate: values.followUpDate?.toISOString(),
          description: values.followUpDescription || "",
        };
      }

      const result = await updateOrderStatus({
        orderId,
        data: payload,
      }).unwrap();

      if (result.success) {
        toast.success(`Status updated to ${values.status} successfully`);
        form.resetFields();
        setOpen(false);
        if (onSuccess) {
          onSuccess(values.status);
        }
      } else {
        toast.error(result.message || "Failed to update order status");
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error?.data?.message || "Failed to update order status");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedStatus(currentStatus || undefined);
    setOpen(false);
  };

  return (
    <Modal
      title="Update Order Status"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isLoading}
      okText="Update"
      cancelText="Cancel"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: currentStatus }}
      >
        <Form.Item
          label="Order Status"
          name="status"
          rules={[{ required: true, message: "Please select order status" }]}
        >
          <Select
            placeholder="Select order status"
            options={statusOptions}
            size="large"
            className="border !border-primary/50 rounded-lg"
            onChange={(value) => setSelectedStatus(value)}
          />
        </Form.Item>

        {/* Show follow-up fields only when switching to HOLD from PENDING or PROCESSING */}
        {(currentStatus === "PENDING" || currentStatus === "PROCESSING") &&
          selectedStatus === "HOLD" && (
            <>
              <Form.Item
                label="Follow-up Date"
                name="followUpDate"
                rules={[
                  {
                    required: true,
                    message: "Please select follow-up date for HOLD status",
                  },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  className="w-full border !border-primary/50"
                  size="large"
                  placeholder="Select follow-up date and time"
                  placement="topRight"
                  getPopupContainer={() => document.body}
                />
              </Form.Item>

              <Form.Item
                label="Follow-up Description"
                name="followUpDescription"
                rules={[
                  {
                    required: true,
                    message: "Please provide a reason for holding the order",
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Reason for holding (e.g., Customer not reachable)"
                  className="border !border-primary/50"
                />
              </Form.Item>
            </>
          )}
      </Form>
    </Modal>
  );
};

export default UpdateOrderStatusModal;
