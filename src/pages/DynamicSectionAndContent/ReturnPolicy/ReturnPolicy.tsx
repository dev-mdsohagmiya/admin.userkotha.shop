"use client";

import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { FormRichTextEditor } from "../../../components/common/Forms";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import ImageUploader from "../../../components/shared/ImageUploader";
import PolicySkeleton from "../../../components/skeleton/PolicySkeleton";
import { useContentManagementEdit } from "../../../hooks/useContentManagementEdit";
import { useGetDynamicContentQuery } from "../../../redux/features/dynamicContent/dynamicContentApi";
import { useUpsertReturnPolicyMutation } from "../../../redux/features/policy/policyApi";

/* ===============================
    TYPES
================================ */
interface ReturnPolicyFormValues {
  banner: {
    image: string;
    title: string;
    description?: string;
  };
  content: string;
}

const ReturnPolicy = () => {
  const [form] = Form.useForm<ReturnPolicyFormValues>();
  const [upsertContent, { isLoading }] = useUpsertReturnPolicyMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "return_policy" },
  ]);

  const returnPolicy = data?.data?.content;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (returnPolicy) {
      form.setFieldsValue({
        banner: {
          image: returnPolicy.banner?.image?.id || "",
          title: returnPolicy.banner?.title || "",
          description: returnPolicy.banner?.description || "",
        },
        content: returnPolicy.content || "",
      });
    }
  }, [returnPolicy, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: ReturnPolicyFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        return_policy: {
          banner: {
            image: values.banner.image,
            title: values.banner.title,
            description: values.banner.description,
          },
          content: values.content,
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("Return Policy updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) {
    return (
      <div>
        <PageMeta
          title="Return Policy | UserKotha.Shop ERP"
          description="Manage Return Policy page"
        />
        <PageHeader
          title="Return Policy"
          subtitle="Manage return policy content"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Return Policy" },
          ]}
        />
        <PolicySkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="Return Policy | UserKotha.Shop ERP"
        description="Manage Return Policy page"
      />

      <PageHeader
        title="Return Policy"
        subtitle="Manage return policy content"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Return Policy" },
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={readOnly}
        className="space-y-4"
      >
        {/* Banner Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-4">Banner Section</h3>

          {/* Banner Image */}
          <Form.Item
            label="Banner Image"
            name={["banner", "image"]}
            rules={[{ required: true, message: "Banner image is required" }]}
          >
            <ImageUploader fieldPath="banner.image" form={form} disabled={readOnly} />
          </Form.Item>

          {/* Banner Title */}
          <Form.Item
            label="Title"
            name={["banner", "title"]}
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Return Policy" />
          </Form.Item>

          {/* Banner Description */}
          <Form.Item label="Description" name={["banner", "description"]}>
            <Input.TextArea
              rows={2}
              placeholder="Our hassle-free return policy for your peace of mind."
            />
          </Form.Item>
        </div>

        {/* Content Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-4">Page Content</h3>

          <FormRichTextEditor
            name="content"
            height={300}
            rules={[{ required: true, message: "Content is required" }]}
            placeholder="Enter content"
            readOnly={readOnly}
          />
        </div>

        {/* Save */}
        {canEdit && (
          <div className="flex w-full mb-20">
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

export default ReturnPolicy;
