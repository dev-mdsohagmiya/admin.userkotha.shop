import { Button, Form, Input, Modal, Rate } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useUpdateReviewDataMutation } from "../../../../redux/features/review/reviewApi";
import { IReview } from "../../../../types/review";

interface UpdateReviewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  review: IReview | null;
}

const UpdateReviewModal: React.FC<UpdateReviewModalProps> = ({
  open,
  setOpen,
  review,
}) => {
  const [form] = Form.useForm();
  const [updateReview, { isLoading }] = useUpdateReviewDataMutation();

  useEffect(() => {
    if (review) {
      form.setFieldsValue({
        name: review.name,
        rating: review.rating,
        review: review.review,
        // isConfirmed: review.isConfirmed, // Handled separately or here if needed
      });
    }
  }, [review, form]);

  const onFinish = async (values: any) => {
    if (!review) return;

    try {
      const res = await updateReview({
        id: review.id,
        data: values,
      }).unwrap();

      if (res.success) {
        toast.success("Review updated successfully");
        setOpen(false);
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update review");
    }
  };

  return (
    <Modal
      title="Update Review"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Reviewer Name"
          rules={[{ required: true, message: "Please enter reviewer name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="rating"
          label="Rating"
          rules={[{ required: true, message: "Please enter rating" }]}
        >
          <Rate />
        </Form.Item>

        {/* Helper to input exact number if needed, or just rely on Rate */}
        {/* <Form.Item name="rating" hidden><Input /></Form.Item> */}

        <Form.Item
          name="review"
          label="Review Content"
          rules={[{ required: true, message: "Please enter review content" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateReviewModal;
