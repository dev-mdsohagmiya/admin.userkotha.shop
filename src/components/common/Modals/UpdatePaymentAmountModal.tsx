import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useUpdatePaymentAmountMutation } from "../../../redux/features/sales/salesApi";

interface UpdatePaymentAmountModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  paymentId?: string; // If you need to specify which payment to update
}

interface PaymentAmountData {
  amount: number;
}

const UpdatePaymentAmountModal: React.FC<UpdatePaymentAmountModalProps> = ({
  open,
  setOpen,
  paymentId,
}) => {
  const [form] = Form.useForm<PaymentAmountData>();
  const [updatePaymentAmount, { isLoading }] = useUpdatePaymentAmountMutation();

  const onFinish = async (values: PaymentAmountData) => {
    try {
      // Prepare the payload - adjust according to your API requirements
      const payload = {
        id: paymentId, // Include paymentId if provided
        data: { amount: Number(values.amount) },
      };

      const res = await updatePaymentAmount(payload).unwrap();

      if (res?.success) {
        toast.success("Payment amount updated successfully!");
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={600}
      destroyOnClose
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white/90">
          Update Payment Amount
        </h1>
      </div>

      <Form
        form={form}
        name="update-payment-amount"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-4 w-full"
      >
        <Form.Item
          label="Amount"
          name="amount"
          className="w-full"
          tooltip="Enter the new payment amount"
          rules={[
            { required: true, message: "Please enter the payment amount!" },
            {
              type: "number",
              min: 0,
              transform: (value) => Number(value),
              message: "Amount must be a positive number!",
            },
          ]}
        >
          <Input type="number" placeholder="e.g., 20" step="0.01" min="0" />
        </Form.Item>

        <div className="flex justify-start gap-2 w-full mt-5">
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
            Update Amount
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdatePaymentAmountModal;
