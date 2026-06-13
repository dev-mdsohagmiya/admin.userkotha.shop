"use client";

import { Button, Form, Input, Card } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";

import CommonSectionSkeleton from "../../../../components/skeleton/CommonSectionSkeleton";
import ImageUploader from "../../../../components/shared/ImageUploader";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";

/* ===============================
    TYPES
================================ */
interface FooterItem {
  icon: string;
  title: string;
  description: string;
}

interface FooterFormValues {
  title: string;
  description?: string;
  image?: string;
  items: FooterItem[];
}

const Footer = () => {
  const [form] = Form.useForm<FooterFormValues>();
  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();
  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);

  const footerData = data?.data?.content?.footer;

  /* ===============================

      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (footerData) {
      form.setFieldsValue({
        title: footerData.title || "",
        description: footerData.description || "",
        image: footerData.image?.id || "",
        items: footerData.items || [],
      });
    }
  }, [footerData, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: FooterFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        home: {
          footer: {
            title: values.title,
            description: values.description,
            image: values.image,
            items: values.items,
          },
        },
      };

      const res = await upsertContent(payload).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Footer updated successfully");
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
        <Form.Item
          label="Footer Image"
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
          <Input placeholder="Footer" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={4}
            placeholder="We are committed to providing the best quality products and services."
          />
        </Form.Item>

        {/* Image */}

        {/* ===============================
            ITEMS LIST (ADD / REMOVE)
        ================================ */}
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ key, name, fieldKey }) => (
                  <Card
                    key={key}
                    title={
                      name === 0
                        ? "Email"
                        : name === 1
                          ? "Location"
                          : `Social Media ${name - 2}`
                    }
                    className=""
                    extra={
                      name == 0 && canEdit && (
                        <Button
                          type="dashed"
                          danger
                          size="small"
                          onClick={() => remove(name)}
                          icon={<RxCross2 />}
                        ></Button>
                      )
                    }
                  >
                    <div className="">
                      {/* Icon */}
                      <Form.Item
                        label="Icon (Font Awesome)"
                        tooltip="Use Font Awesome icon name (e.g. truck, heart, user)"
                        name={[name, "icon"]}
                        fieldKey={[fieldKey!, "icon"]}
                        rules={[
                          { required: true, message: "Icon is required" },
                        ]}
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
                        label={
                          name === 0
                            ? "Time"
                            : name === 1
                              ? "Email"
                              : name === 2
                                ? "Location"
                                : "Title"
                        }
                        name={[name, "title"]}
                        fieldKey={[fieldKey!, "title"]}
                        rules={[
                          { required: true, message: "Title is required" },
                        ]}
                      >
                        <Input
                          placeholder={
                            name === 0
                              ? "e.g. 9:00 AM - 10:00 PM"
                              : name === 1
                                ? "e.g. info@amzadfood.com"
                                : name === 2
                                  ? "e.g. Dhaka, Bangladesh"
                                  : "e.g. Fast Delivery"
                          }
                        />
                      </Form.Item>

                      {/* Description */}
                      <Form.Item
                        label={name === 0 ? "Number" : "Link"}
                        name={[name, "description"]}
                        fieldKey={[fieldKey!, "description"]}
                      >
                        <Input placeholder="Link............" />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add New Item Button */}
              {canEdit && (
              <div className="mt-4">
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<i className="fa-solid fa-plus"></i>}
                >
                  Add New Item
                </Button>
              </div>
              )}
            </>
          )}
        </Form.List>

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

export default Footer;
