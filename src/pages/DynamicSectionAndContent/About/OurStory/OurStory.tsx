"use client";

import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { FormRichTextEditor } from "../../../../components/common/Forms";
import PageMeta from "../../../../components/common/Meta/PageMeta";
import ImageUploader from "../../../../components/shared/ImageUploader";
import AboutSectionSkeleton from "../../../../components/skeleton/AboutSectionSkeleton";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useUpsertAboutPageBannerMutation } from "../../../../redux/features/about/aboutApi";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";

/* ===============================
    TYPES
================================ */
interface OurStoryFormValues {
  title: string;
  description: string;
  image: string;
}

const OurStory = () => {
  const [form] = Form.useForm<OurStoryFormValues>();
  const [upsertContent, { isLoading }] = useUpsertAboutPageBannerMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "about" },
  ]);

  const ourStory = data?.data?.content?.our_story;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (ourStory) {
      form.setFieldsValue({
        title: ourStory.title || "",
        description: ourStory.description || "",
        image: ourStory.image?.id || "",
      });
    }
  }, [ourStory, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: OurStoryFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        about: {
          our_story: {
            title: values.title,
            description: values.description,
            image: values.image,
          },
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("Our Story updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <AboutSectionSkeleton />;

  return (
    <div>
      <PageMeta
        title="Our Story | Amzad Food ERP"
        description="Manage Our Story section"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={readOnly}
        className="space-y-4"
      >
        {/* Story Image */}
        <Form.Item
          label="Story Image"
          name="image"
          rules={[{ required: true, message: "Image is required" }]}
        >
          <ImageUploader fieldPath="image" form={form} disabled={readOnly} />
        </Form.Item>
        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Our Story" />
        </Form.Item>

        {/* Description */}

        <FormRichTextEditor
          name="description"
          height={300}
          rules={[{ required: true, message: "Description is required" }]}
          placeholder="Enter section description"
          readOnly={readOnly}
        />

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

export default OurStory;
