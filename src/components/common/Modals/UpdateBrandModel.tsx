import { Button, Form, Image, Input, Modal } from "antd";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { config } from "../../../config";
import { useUpdateBrandMutation } from "../../../redux/features/brand/brandApi";
import { IBrand, ICreateBrand } from "../../../types/brands";
import ImageUploader from "../../shared/ImageUploader";
import SwitchStatus2 from "../Forms/SwitchStatus2";

interface UpdateBrandModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: IBrand;
}

const UpdateBrandModal: React.FC<UpdateBrandModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IBrand>();
  const [updateBrand, { isLoading }] = useUpdateBrandMutation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      });
      if (data.logo?.url) {
        setPreviewImage(`${config.image_access_url}${data.logo.url}`);
      }
    }
  }, [data, form]);

  const handleRemoveImage = () => {
    setPreviewImage(null);
  };

  const onFinish = async (values: ICreateBrand) => {
    try {
      const updateData = {
        id: data?.id,
        data: values,
      };

      const res = await updateBrand(updateData).unwrap();

      if (res?.success) {
        toast.success(res.message || "Brand updated successfully!");
        setOpen(false);
        form.resetFields();
        setPreviewImage(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
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
      width={800}
    >
      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Update Brand
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify the details of the brand.
        </p>
      </div>

      <Form
        form={form}
        name="update-brand"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <Form.Item
          label="Name"
          name="name"
          tooltip="Type the brand name"
          rules={[{ required: true, message: "Please enter the brand name!" }]}
        >
          <Input placeholder="Brand Name" />
        </Form.Item>

        <Form.Item name={"logoId"} label="Logo (Optional)">
          {previewImage ? (
            <div className="relative inline-block">
              <Image
                src={previewImage}
                alt="Brand Logo"
                width={150}
                height={140}
                className="object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <ImageUploader fieldPath="logoId" form={form} />
          )}
        </Form.Item>

        <Form.Item label="Description (Optional)" name="description">
          <Input.TextArea placeholder="Enter brand description" rows={3} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <SwitchStatus2 defaultChecked={data?.isActive} />
        </Form.Item>

        <div className="flex justify-start gap-2 w-full mt-5">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
              setPreviewImage(null);
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

export default UpdateBrandModal;
