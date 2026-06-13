import { Modal, Input, Button, Form } from "antd";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useApproveRequisitionMutation,
  useRejectRequisitionMutation,
} from "../../../../redux/features/requisition/requisitionApi";

interface RequisitionStatusModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  requisitionId: string;
}

const { TextArea } = Input;

const RequisitionStatusModal: React.FC<RequisitionStatusModalProps> = ({
  open,
  setOpen,
  requisitionId,
}) => {
  const [form] = Form.useForm();
  const textAreaRef = useRef<any>(null);

  const [approveRequisition, { isLoading: approving }] =
    useApproveRequisitionMutation();
  const [rejectRequisition, { isLoading: rejecting }] =
    useRejectRequisitionMutation();

  // Reset form and focus textarea whenever modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [open, form]);

  const handleApproveClick = async () => {
    try {
      const values = await form.validateFields();
      await approveRequisition({
        id: requisitionId,
        comments: values.comments || "",
      }).unwrap();
      toast.success("Requisition approved successfully!");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleRejectClick = async () => {
    try {
      const values = await form.validateFields();
      await rejectRequisition({
        id: requisitionId,
        comments: values.comments || "",
      }).unwrap();
      toast.success("Requisition rejected successfully!");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      closable={false} // removes the top-right X button
      maskClosable={false} // prevent closing by clicking outside
      footer={null} // no default footer
      title={
        <div className="mb-2">
          <h2 className="text-lg font-semibold">Requisition Feedback</h2>
          <p className="text-sm text-gray-500">
            Provide comments before approving or rejecting
          </p>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="Comments (Optional)"
          name="comments"
          rules={[{ required: false, message: "Please provide comments!" }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter your comments..."
            ref={textAreaRef}
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            danger
            loading={rejecting}
            onClick={handleRejectClick}
          >
            Reject
          </Button>
          <Button
            type="primary"
            loading={approving}
            onClick={handleApproveClick}
          >
            Approve
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RequisitionStatusModal;
