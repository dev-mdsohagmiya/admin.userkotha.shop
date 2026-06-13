"use client";

import { Button, Form, Input, Modal, Select, Switch } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { IHomeSection } from "../../../../types/home";
import ImageUploader from "../../../shared/ImageUploader";
import { useGetEcommerceProductListQuery } from "../../../../redux/features/product/productApi";
import { useUpdateHomepageSectionMutation } from "../../../../redux/features/home/homeApi";

const { Option } = Select;

interface UpdateHomeSectionModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IHomeSection;
}

const UpdateHomeSectionModal: React.FC<UpdateHomeSectionModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IHomeSection>();
  const [updateHomeSection, { isLoading }] = useUpdateHomepageSectionMutation();

  // Fetch products
  const { data: ecommerceProductList } = useGetEcommerceProductListQuery([
    { name: "isActive", value: true },
    { name: "limit", value: 100000 },
  ]);
  const products = ecommerceProductList?.data || [];



  // Preload form
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        title: data.title || "Requler Product --",
        subtitle: data.subtitle || "",
        bannerId: data.bannerId || "", // loaded from API
        link: data.link || "",
        isActive: data.isActive ?? true,
      });
    }
  }, [data, form]);

  const onFinish = async (values: IHomeSection) => {
    try {
      const payload = {
        title: values.title,
        subtitle: values.subtitle,
        bannerId: values.bannerId || "", // will come from ImageUploader
        link: values.link || "",
        isActive: values.isActive,
      };

      const res = await updateHomeSection({
        id: data.id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Homepage section updated successfully!");
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Update Homepage Section
        </h1>
        <p className="text-sm text-gray-500">
          Update homepage section title, subtitle, banner, and product.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
      >
        {/* Banner Image (updates bannerId automatically) */}
        <Form.Item
          label="Banner Image"
          name="bannerId"
        >
          <ImageUploader
            fieldPath="bannerId" // ImageUploader will set form field `bannerId`
            form={form}
          />
        </Form.Item>

        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required!" }]}
        >
          <Input placeholder="Requler Product --" />
        </Form.Item>

        {/* Subtitle */}
        <Form.Item label="Subtitle" name="subtitle">
          <Input placeholder="This is Populer Product section for show all requler product" />
        </Form.Item>

        {/* Product Dropdown */}
        <Form.Item label="Select Product" name="link">
          <Select
            showSearch
            placeholder="Select a product"
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {products.map((product: any) => (
              <Option
                key={product.slug}
                value={product.slug}
                label={product.name}
              >
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Status */}
        <Form.Item label="Status" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateHomeSectionModal;
