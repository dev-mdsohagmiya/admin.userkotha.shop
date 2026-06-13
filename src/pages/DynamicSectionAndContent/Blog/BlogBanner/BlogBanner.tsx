"use client";

import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import PageMeta from "../../../../components/common/Meta/PageMeta";
import PageHeader from "../../../../components/common/Navigation/PageHeader";
import ImageUploader from "../../../../components/shared/ImageUploader";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import PolicySkeleton from "../../../../components/skeleton/PolicySkeleton";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useUpsertBlogPageMutation } from "../../../../redux/features/blog/blogApi";

/* ===============================
    TYPES
================================ */
interface BannerFormValues {
  image: {
    id: string;
    url: string;
  };
  title: string;
  description?: string;
}

const BlogBanner = () => {
  const [form] = Form.useForm<BannerFormValues>();
  const [upsertContent, { isLoading }] = useUpsertBlogPageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "blog" },
  ]);

  const banner = data?.data?.content?.banner;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (banner) {
      form.setFieldsValue({
        image: banner.image?.id || "",
        title: banner.title || "",
        description: banner.description || "",
      });
    }
  }, [banner, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: BannerFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        blog: {
          banner: {
            image: values.image,
            title: values.title,
            description: values.description,
          },
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("Blog Banner updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <PolicySkeleton />;

  return (
    <div>
      <PageMeta
        title="Blog Banner | UserKotha.Shop ERP"
        description="Manage Blog Banner section"
      />

      <PageHeader
        title="Blog Section"
        subtitle="Manage blog banner content"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Blog Section" },
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={readOnly}
        className="space-y-4"
      >
        {/* Banner Image */}
        <Form.Item
          label="Banner Image"
          name="image"
          rules={[{ required: true, message: "Banner image is required" }]}
        >
          <ImageUploader fieldPath="image" form={form} disabled={readOnly} />
        </Form.Item>

        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Our Blog" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <Input.TextArea rows={4} placeholder="Description" />
        </Form.Item>

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

export default BlogBanner;
