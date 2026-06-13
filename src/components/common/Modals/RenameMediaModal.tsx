import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { MediaImage } from "../../../types/media";
import { toast } from "react-toastify";
import { useUpdateMediaMutation } from "../../../redux/features/media/mediaApi";

interface RenameMediaModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  media: MediaImage | null;
  onSuccess?: () => void;
}

const RenameMediaModal: React.FC<RenameMediaModalProps> = ({
  open,
  setOpen,
  media,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [updateMedia, { isLoading }] = useUpdateMediaMutation();

  useEffect(() => {
    if (open && media) {
      form.setFieldsValue({
        name: media.name,
      });
    }
  }, [open, media, form]);

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    if (!media) return;

    try {
      await updateMedia({
        id: media.id,
        payload: {
          name: values.name,
        },
      }).unwrap();

      toast.success("Media name updated successfully");
      if (onSuccess) onSuccess();
      handleCancel();
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error?.data?.message || "Failed to update media name");
    }
  };

  return (
    <Modal
      title="Rename Media"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={() => form.submit()}
        >
          Rename
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Media Name"
          name="name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input placeholder="Enter new media name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RenameMediaModal;
