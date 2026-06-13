import React from "react";
import { Modal, Form, Input, DatePicker, Button } from "antd";
import { useAddFollowUpMutation } from "../../../../redux/features/order/orderApi";
import { toast } from "react-toastify";

const { TextArea } = Input;

interface AddFollowUpModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderId: string;
}

const AddFollowUpModal: React.FC<AddFollowUpModalProps> = ({
  open,
  setOpen,
  orderId,
}) => {
  const [form] = Form.useForm();
  const [addFollowUp, { isLoading }] = useAddFollowUpMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        followUpDate: values.followUpDate.toISOString(),
        description: values.description,
      };

      await addFollowUp({
        orderId,
        data: payload,
      }).unwrap();

      toast.success("Follow-up added successfully");
      form.resetFields();
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding follow-up:", error);
      toast.error(error?.data?.message || "Failed to add follow-up");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  return (
    <Modal
      title="Add New Follow-up"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
        >
          Add Follow-up
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Follow-up Date"
          name="followUpDate"
          rules={[{ required: true, message: "Please select follow-up date" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            className="w-full"
            placeholder="Select date and time"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea rows={4} placeholder="Enter follow-up details..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddFollowUpModal;
