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
import { useUpsertTermsAndConditionsMutation } from "../../../redux/features/policy/policyApi";

/* ===============================
    TYPES
================================ */
interface TermsConditionsFormValues {
  banner: {
    image: string;
    title: string;
    description?: string;
  };
  content: string;
}

const TermsAndConditions = () => {
  const [form] = Form.useForm<TermsConditionsFormValues>();
  const [upsertContent, { isLoading }] = useUpsertTermsAndConditionsMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "terms_and_conditions" },
  ]);

  const termsConditions = data?.data?.content;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (termsConditions) {
      form.setFieldsValue({
        banner: {
          image: termsConditions.banner?.image?.id || "",
          title: termsConditions.banner?.title || "",
          description: termsConditions.banner?.description || "",
        },
        content: termsConditions.content || "",
      });
    }
  }, [termsConditions, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: TermsConditionsFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        terms_and_conditions: {
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
        toast.success("Terms & Conditions updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <PolicySkeleton />;

  return (
    <div>
      <PageMeta
        title="Terms & Conditions | Amzad Food ERP"
        description="Manage Terms & Conditions page"
      />

      <PageHeader
        title="Terms & Conditions"
        subtitle="Manage terms and conditions content"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Terms & Conditions" },
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
            <Input placeholder="Terms & Conditions" />
          </Form.Item>

          {/* Banner Description */}
          <Form.Item label="Description" name={["banner", "description"]}>
            <Input.TextArea
              rows={2}
              placeholder="Please read these terms carefully before using our services."
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

export default TermsAndConditions;
