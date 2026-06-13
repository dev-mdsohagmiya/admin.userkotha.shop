"use client";

import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { IContent } from "../../../../types/home";
import { useUpdateHomepageSectionMutation } from "../../../../redux/features/home/homeApi";

interface UpdateHomeSectionModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IContent;
}

const CreateDynamicContent: React.FC<UpdateHomeSectionModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  console.log(data);

  const [form] = Form.useForm<IContent>();
  const [updateHomeSection, { isLoading }] = useUpdateHomepageSectionMutation();

  // modal open হলে data form এ বসবে
  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const onFinish = async (values: IContent) => {
    try {
      const res = await updateHomeSection({
        id: data.id,
        data: values,
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
          Update homepage section title and subtitle.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-2"
      >
        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required!" }]}
        >
          <Input placeholder="🔥 HOT DEALS - Limited Time!" />
        </Form.Item>

        {/* Subtitle */}
        <Form.Item label="Subtitle" name="subtitle">
          <Input placeholder="Up to 60% off!" />
        </Form.Item>

        {/* Status */}
        {/* <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <SwitchStatus2 defaultChecked={data?.isActive} />
        </Form.Item> */}

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

export default CreateDynamicContent;
