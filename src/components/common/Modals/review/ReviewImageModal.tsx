import { Form, Modal, message } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import {
  useCreateReviewMutation,
  useReviewListQuery,
} from "../../../../redux/features/review/reviewApi";
import ImageUploader from "../../../shared/ImageUploader";
import { Loader } from "../../Loading";

interface ReviewImageModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  productId: string;
  isComboProduct?: boolean;
}

const ReviewImageModal: React.FC<ReviewImageModalProps> = ({
  open,
  setOpen,
  productId,
  isComboProduct = false,
}) => {
  const [form] = Form.useForm();
  const [createReview, { isLoading }] = useCreateReviewMutation();

  // Fetch existing review images
  const { data: reviewData, isLoading: reviewImageLoading } =
    useReviewListQuery(
      [
        {
          name: isComboProduct ? "comboProductId" : "productId",
          value: productId,
        },
      ],
      { skip: !open }
    );

  useEffect(() => {
    if (open) {
      if (reviewData?.data) {
        // Map existing review data to media IDs
        // Assuming the API returns objects that contain media information
        // We accept media.id (populated) or mediaId (reference) or id (if the item is the media)
        const mediaIds = reviewData.data
          .map((item: any) => item.media?.id || item.mediaId || item.id)
          .filter(Boolean);

        form.setFieldsValue({
          mediaIds: mediaIds,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, reviewData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const mediaIds = values.mediaIds;

      if (!mediaIds || mediaIds.length === 0) {
        message.warning("Please select at least one image");
        return;
      }

      const payload = {
        [isComboProduct ? "comboProductId" : "productId"]: productId,
        mediaIds: mediaIds,
      };

      const res = await createReview(payload).unwrap();

      if (res.success) {
        toast.success("Review images saved successfully");
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      console.error("Error saving review images:", err);
      const errorMessage =
        err?.data?.message || err?.message || "Failed to save review images";
      toast.error(errorMessage);
    }
  };

  if (reviewImageLoading) {
    return <Loader />;
  }

  return (
    <Modal
      title="Add/Edit Review Images"
      open={open}
      onCancel={() => {
        setOpen(false);
        form.resetFields();
      }}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={800}
      okText="Save Images"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Select images that will be displayed as review images for this
            product. Adding new images or removing existing ones will update the
            gallery.
          </p>

          <Form form={form} layout="vertical">
            <Form.Item
              name="mediaIds"
              label="Review Gallery Images"
              tooltip="Upload multiple review images."
            >
              <ImageUploader fieldPath="mediaIds" form={form} multiple={true} />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewImageModal;
