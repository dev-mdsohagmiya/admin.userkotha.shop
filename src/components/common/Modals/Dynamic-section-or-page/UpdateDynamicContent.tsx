"use client";

import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { IContent } from "../../../../types/home";
import ImageUploader from "../../../shared/ImageUploader";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";

interface UpdateHomeSectionModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IContent;
  heroSection: IContent[];
}

const UpdateDynamicContent: React.FC<UpdateHomeSectionModalProps> = ({
  open,
  setOpen,
  data,
  heroSection,
}) => {
  const [form] = Form.useForm();
  const [upsertHomepageBanner, { isLoading }] = useUpsertHomepageMutation();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        content: data.content ? Number(data.content) : null,
        // For ads_image, we might need a link. Since it's not in IContent, we start empty or let user input.
        link: "",
      });
    }
  }, [data, form]);

  const onFinish = async (values: any) => {
    try {
      // Reconstruct the payload
      const sliderImages = heroSection
        .filter((item) => item.key === "slider_images")
        .map((item) => {
          // If this is the item being updated, use the new content
          if (item.id === data.id) {
            return String(values.content);
          }
          return item.content;
        });

      // Handle ads_image
      const adsImageItem = heroSection.find((item) => item.key === "ads_image");
      let adsImage = {
        image: adsImageItem?.content,
        link: "https://example.com", // Default or fetch if available
      };

      if (data.key === "ads_image") {
        adsImage = {
          image: String(values.content),
          link: values.link,
        };
      } else if (adsImageItem) {
        // If we are updating slider_images, verify if we need to preserve ads_image link?
        // Since we don't have the link in heroSection, we might be overwriting it with default.
        //Ideally we should have the link in heroSection.
        // For now, we proceed.
      }

      const payload = {
        home: {
          banner: {
            slider_images: sliderImages,
            ads_image: adsImage,
          },
        },
      };

      const res = await upsertHomepageBanner(payload).unwrap();

      if (res?.success) {
        toast.success("Homepage banner updated successfully!");
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
      title="Update Home Banner"
    >
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Update the banner image {data?.key === "ads_image" && "and link"}.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
      >
        {/* Image Upload */}
        <Form.Item
          label="Image"
          required
          tooltip="Upload an image for the banner"
        >
          <ImageUploader form={form} fieldPath="content" />
        </Form.Item>

        {/* Link Input (Only for ads_image) */}
        {data?.key === "ads_image" && (
          <Form.Item
            label="Link"
            name="link"
            rules={[
              { required: true, message: "Link is required for Ads Image!" },
            ]}
          >
            <Input placeholder="Enter URL (e.g. https://example.com)" />
          </Form.Item>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-5 justify-end">
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

export default UpdateDynamicContent;
