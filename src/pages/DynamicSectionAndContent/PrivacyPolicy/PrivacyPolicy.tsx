"use client";

import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { FormRichTextEditor } from "../../../components/common/Forms";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import ImageUploader from "../../../components/shared/ImageUploader";
import PrivacyPolicySkeleton from "../../../components/skeleton/PrivacyPolicySkeleton";
import { useContentManagementEdit } from "../../../hooks/useContentManagementEdit";
import { useGetDynamicContentQuery } from "../../../redux/features/dynamicContent/dynamicContentApi";
import { useUpsertPrivacyPolicyMutation } from "../../../redux/features/policy/policyApi";

/* ===============================
    TYPES
================================ */
interface PrivacyPolicyFormValues {
  banner: {
    image: string;
    title: string;
    description?: string;
  };
  content: string;
}

const PrivacyPolicy = () => {
  const [form] = Form.useForm<PrivacyPolicyFormValues>();
  const [upsertContent, { isLoading }] = useUpsertPrivacyPolicyMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "privacy_policy" },
  ]);

  const privacyPolicy = data?.data?.content;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (privacyPolicy) {
      form.setFieldsValue({
        banner: {
          image: privacyPolicy.banner?.image?.id || "",
          title: privacyPolicy.banner?.title || "",
          description: privacyPolicy.banner?.description || "",
        },
        content: privacyPolicy.content || "",
      });
    }
  }, [privacyPolicy, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: PrivacyPolicyFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        privacy_policy: {
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
        toast.success("Privacy Policy updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <PrivacyPolicySkeleton />;

  return (
    <div>
      <PageMeta
        title="Privacy Policy | Amzad Food ERP"
        description="Manage Privacy Policy page"
      />

      <PageHeader
        title="Privacy Policy"
        subtitle="Manage privacy policy content"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Privacy Policy" },
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
        <div className="bg-gray-50 rounded-lg mb-4">
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
            <Input placeholder="Privacy Policy" />
          </Form.Item>

          {/* Banner Description */}
          <Form.Item label="Description" name={["banner", "description"]}>
            <Input.TextArea
              rows={2}
              placeholder="Learn how we protect your personal information."
            />
          </Form.Item>
        </div>

        {/* Content Section */}
        <div className="bg-gray-50 rounded-lg mb-4">
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

export default PrivacyPolicy;
