"use client";

import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import CommonSectionSkeleton from "../../../../components/skeleton/CommonSectionSkeleton";

import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";
import SwitchStatus2 from "../../../../components/common/Forms/SwitchStatus2";

/* ===============================
    TYPES
================================ */
interface AdsFormValues {
  icon: string;
  title: string;
  description?: string;
  isActive?: boolean;
}

const DetailsPageMassage = () => {
  const [form] = Form.useForm<AdsFormValues>();
  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();
  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);

  const adsData = data?.data?.content?.ads;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (adsData) {
      form.setFieldsValue({
        icon: adsData.icon || "",
        title: adsData.title || "",
        description: adsData.description || "",
        isActive: adsData.status || true,
      });
    }
  }, [adsData, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: AdsFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        home: {
          ads: {
            icon: values.icon,
            title: values.title,
            description: values.description,
            status: values.isActive,
          },
        },
      };

      const res = await upsertContent(payload).unwrap();
      if (res?.success) {
        toast.success(
          res?.message || "Details Page Message updated successfully",
        );
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <CommonSectionSkeleton />;

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={readOnly}
        className="space-y-4"
      >
        {/* Icon */}
        <Form.Item
          label="Icon (Font Awesome)"
          tooltip="Use Font Awesome icon name (e.g. truck, heart, user)"
          name="icon"
          rules={[{ required: true, message: "Icon is required" }]}
          extra={
            <span>
              Browse icons from{" "}
              <a
                href="https://fontawesome.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                Font Awesome Icons
              </a>
            </span>
          }
        >
          <Input placeholder="truck" />
        </Form.Item>

        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter title" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          tooltip="Enter a brief description"
        >
          <Input.TextArea rows={4} placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue={true}
        >
          <SwitchStatus2 defaultChecked={adsData?.isActive} size="default" disabled={readOnly} />
        </Form.Item>

        {/* Save */}
        {canEdit && (
        <div className="flex mb-20">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading || contentLoading}
          >
            Save Changes
          </Button>
        </div>
        )}
      </Form>
    </div>
  );
};

export default DetailsPageMassage;
