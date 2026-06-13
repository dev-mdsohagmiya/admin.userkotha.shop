import { Button, Form, Image, Input, Modal } from "antd";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ImageUploader from "../../../shared/ImageUploader";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

import { config } from "../../../../config";
import { useUpdateBlogMutation } from "../../../../redux/features/blogs/blogApi";
import { IBlog, TBlogCreateInput } from "../../../../types/blogs";
import { FormRichTextEditor } from "../../Forms";

interface UpdateBlogModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: IBlog;
}

const UpdateBlogModal: React.FC<UpdateBlogModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<TBlogCreateInput>();
  const [updateBlog, { isLoading }] = useUpdateBlogMutation();

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // set initial data (same flow as UpdateBrandModal)
  useEffect(() => {
    if (data && open) {
      form.setFieldsValue({
        title: data.title,
        shortDesc: data.shortDesc,
        description: data.description,
        isActive: data.isActive,
        imageId: data.imageId || undefined,
      });

      if (data.image?.url) {
        setPreviewImage(`${config.image_access_url}${data.image.url}`);
      }
    }
  }, [data, open, form]);

  const handleRemoveImage = () => {
    setPreviewImage(null);
    form.setFieldValue("imageId", undefined);
  };

  const onFinish = async (values: TBlogCreateInput) => {
    try {
      const payload = {
        id: data?.id,
        data: values,
      };

      const res = await updateBlog(payload).unwrap();

      if (res?.success) {
        toast.success(res.message || "Blog updated successfully!");
        setOpen(false);
        form.resetFields();
        setPreviewImage(null);
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        form.resetFields();
        setPreviewImage(null);
      }}
      footer={false}
      width={1200}
    >
      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 text-2xl">
          Update Blog Post
        </h1>
        <p className="text-sm text-gray-500">
          Edit the details of the blog post.
        </p>
      </div>

      <Form
        form={form}
        name="update-blog"
        onFinish={onFinish}
        layout="vertical"
        className="space-y-2"
      >
        <Form.Item
          label="Blog Title"
          name="title"
          rules={[{ required: true, message: "Please enter blog title!" }]}
        >
          <Input placeholder="Blog title" />
        </Form.Item>

        {/* Image (same flow as Brand) */}
        <Form.Item label="Thumbnail Image" name="imageId">
          {previewImage ? (
            <div className="relative inline-block">
              <Image
                src={previewImage}
                alt="Blog Image"
                width={160}
                height={140}
                className="rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <ImageUploader fieldPath="imageId" form={form} />
          )}
        </Form.Item>

        <Form.Item label="Short Description" name="shortDesc">
          <Input.TextArea rows={3} />
        </Form.Item>

        <FormRichTextEditor
          label="Description"
          name="description"
          height={300}
          rules={[{ required: true, message: "Please enter the description." }]}
          placeholder="Enter description"
        />

        <Form.Item label="Status" name="isActive">
          <SwitchStatus2 defaultChecked={data?.isActive} />
        </Form.Item>

        <div className="flex gap-2 mt-5">
          <Button
            type="default"
            onClick={() => {
              setOpen(false);
              form.resetFields();
              setPreviewImage(null);
            }}
          >
            Cancel
          </Button>

          <Button loading={isLoading} type="primary" htmlType="submit">
            Update Blog
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateBlogModal;
