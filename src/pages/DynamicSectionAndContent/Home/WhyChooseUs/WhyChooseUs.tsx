"use client";

import { Button, Form, Input, Card, Alert } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";

import PageMeta from "../../../../components/common/Meta/PageMeta";
import ImageUploader from "../../../../components/shared/ImageUploader";

import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import { Loader } from "../../../../components/common/Loading";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";

/* ===============================
    TYPES
================================ */
interface WhyChooseItem {
  icon: string;
  title: string;
  description?: string;
}

interface WhyChooseFormValues {
  image: {
    id: string;
    url: string;
  };
  imageId: string;
  title: string;
  description?: string;
  isActive: boolean;
  items: WhyChooseItem[];
}

const WhyChooseUs = () => {
  const [form] = Form.useForm<WhyChooseFormValues>();

  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);

  const whyChoose = data?.data?.content?.why_choose;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (whyChoose) {
      form.setFieldsValue({
        imageId: whyChoose.image?.id || "",
        title: whyChoose.title || "",
        description: whyChoose.description || "",
        isActive: whyChoose.isActive ?? true,
        items: (whyChoose.items || []) as WhyChooseItem[],
      });
    }
  }, [whyChoose, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: WhyChooseFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        home: {
          why_choose: {
            image: values.imageId,
            title: values.title,
            description: values.description,
            items: values.items ?? [],
          },
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("Why Choose Us updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <Loader />;

  return (
    <div>
      <PageMeta
        title="Why Choose Us | Amzad Food ERP"
        description="Manage Why Choose Us section"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={readOnly}
        className="space-y-4"
      >
        {/* Banner */}
        <Form.Item
          label="Banner Image"
          name="imageId"
          rules={[{ required: true, message: "Banner image is required" }]}
        >
          <ImageUploader fieldPath="imageId" form={form} disabled={readOnly} />
        </Form.Item>

        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Why Choose Us?" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={4}
            placeholder="Discover what makes us different and why customers choose us"
          />
        </Form.Item>

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
                    title={`Item ${name + 1}`}
                    className=""
                    extra={
                      canEdit ? (
                      <Button
                        type="dashed"
                        danger
                        size="small"
                        onClick={() => remove(name)}
                        icon={<RxCross2 />}
                      ></Button>
                      ) : null
                    }
                  >
                    <div className="space-y-4">
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
                        label="Item Title"
                        name={[name, "title"]}
                        fieldKey={[fieldKey!, "title"]}
                        rules={[
                          { required: true, message: "Title is required" },
                        ]}
                      >
                        <Input placeholder="Fast Delivery" />
                      </Form.Item>

                      {/* Description */}
                      <Form.Item
                        label="Item Description"
                        name={[name, "description"]}
                        fieldKey={[fieldKey!, "description"]}
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder="Brief description of this benefit..."
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
              </div>
              {fields.length >= 6 && (
                <Alert
                  message="Maximum Limit Reached"
                  description="You have reached the maximum limit of 6 items. Adding more items may affect the design layout."
                  type="warning"
                  showIcon
                  className="mt-4"
                />
              )}

              {canEdit && (
              <div className="mt-4">
                <Button
                  type="dashed"
                  block
                 
                  icon={<i className="fa-solid fa-plus"></i>}
                  onClick={() => add({ icon: "", title: "", description: "" })}
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

export default WhyChooseUs;
