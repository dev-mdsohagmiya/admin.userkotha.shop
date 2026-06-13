"use client";

import { Button, Form, Input, Card } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import CommonSectionSkeleton from "../../../../components/skeleton/CommonSectionSkeleton";
import PageMeta from "../../../../components/common/Meta/PageMeta";
import TextArea from "antd/es/input/TextArea";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";

/* ===============================
    TYPES
================================ */
interface TopbarItem {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

interface TopbarFormValues {
  description?: string;
  image?: string;
  items: TopbarItem[];
}

const Topbar = () => {
  const [form] = Form.useForm<TopbarFormValues>();
  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();
  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);

  const topbarData = data?.data?.content?.topbar;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (topbarData) {
      // Clone items to avoid mutating read-only state and ensure at least 2 items
      const items = [...(topbarData.items || [])];
      while (items.length < 2) {
        items.push({ icon: "", title: "", description: "" } as any);
      }

      form.setFieldsValue({
        description: topbarData.description || "",
        image: topbarData.image || "",
        items: items,
      });
    }
  }, [topbarData, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: TopbarFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        home: {
          topbar: {
            description: values.description,
            image: values.image,
            items: values.items,
          },
        },
      };

      const res = await upsertContent(payload).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Topbar updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <CommonSectionSkeleton />;

  return (
    <div>
      <PageMeta
        title="Topbar | UserKotha.Shop ERP"
        description="Manage Topbar section"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={readOnly}
        className="space-y-4"
      >
        {/* Description */}
        <Form.Item label="Content text" name="description">
          <Input.TextArea
            rows={4}
            placeholder="We are committed to providing the best quality products and services."
          />
        </Form.Item>

        {/* ===============================
            ITEMS LIST (ADD / REMOVE)
        ================================ */}
        <Form.List name="items" initialValue={[{}, {}]}>
          {(fields) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ key, name, fieldKey }) => {
                  // Ensure we only show first 2 items if the array happens to be larger,
                  // though we removed the add button so it shouldn't grow.
                  if (name > 1) return null;

                  const isFirstItem = name === 0;
                  const whatsUp = name === 1;
                  const cardTitle = isFirstItem ? "Call" : "WhatsApp";

                  return (
                    <Card key={key} title={cardTitle}>
                      <div className="">
                        {/* Icon */}
                        <Form.Item
                          label="Icon (Font Awesome)"
                          tooltip="Use Font Awesome icon name (e.g. phone, whatsapp)"
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
                          <Input
                            placeholder={isFirstItem ? "phone" : "whatsapp"}
                          />
                        </Form.Item>

                        {/* Title */}
                        {whatsUp && (
                          <Form.Item
                            label="Title"
                            name={[name, "title"]}
                            fieldKey={[fieldKey!, "title"]}
                          >
                            <TextArea rows={4} />
                          </Form.Item>
                        )}

                        {/* Description / Number */}
                        <Form.Item
                          label={isFirstItem ? "Number" : "Text/Number"}
                          name={[name, "description"]}
                          fieldKey={[fieldKey!, "description"]}
                          rules={[
                            {
                              required: true,
                              message: "Description is required",
                            },
                          ]}
                        >
                          <Input
                            placeholder={
                              isFirstItem
                                ? "+880 1700-000000"
                                : "+880 1800-000000"
                            }
                          />
                        </Form.Item>

                        {/* Link */}
                        <Form.Item
                          label="Link / Action"
                          name={[name, "link"]}
                          fieldKey={[fieldKey!, "link"]}
                          tooltip={
                            isFirstItem
                              ? "e.g. tel:+880..."
                              : "e.g. https://wa.me/..."
                          }
                        >
                          <Input
                            placeholder={
                              isFirstItem
                                ? "tel:+8801700000000"
                                : "https://wa.me/8801800000000"
                            }
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  );
                })}
              </div>
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

export default Topbar;
