import { Button, Form, Input, InputNumber, Modal } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUpdateStockMutation } from "../../../../redux/features/stock/stockApi";

interface UpdateStockModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string; // Stock ID
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  open,
  setOpen,
  id,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [updateStock, { isLoading }] = useUpdateStockMutation();

  const onFinish = async (values: any) => {
    try {
      const payload = {
        quantity: values.quantity,
        operation: "add",
        reason: values.reason,
      };

      const res = await updateStock({ id, data: payload }).unwrap();

      if (res?.success) {
        toast.success(res.message || "Stock updated successfully!");
        setOpen(false);
        form.resetFields();
        navigate("/stock-alert"); // ✅ go to stock page after update
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={600}
      centered
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white/90">
          Update Stock
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the quantity and reason for updating stock.
        </p>
      </div>

      <Form
        form={form}
        name="update-stock"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        {/* Quantity Field */}
        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Please enter the quantity!" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Enter quantity"
            min={1}
            className="w-full"
          />
        </Form.Item>

        {/* Reason Field */}
        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: "Please provide a reason!" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe the reason for this stock update..."
          />
        </Form.Item>

        <div className="flex justify-end gap-2 w-full mt-5">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
            }}
            type="default"
            htmlType="button"
            className="px-5!"
          >
            Cancel
          </Button>

          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            className="px-5!"
          >
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateStockModal;
