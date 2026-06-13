"use client";

import { Button, Form, Input, Card } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import PageMeta from "../../../../components/common/Meta/PageMeta";
import { Loader } from "../../../../components/common/Loading";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";

import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";

/* ===============================
    TYPES
================================ */
interface SpecialBenefitItem {
  icon: string;
  title: string;
  description: string;
}

interface SpecialBenefitsFormValues {
  title: string;
  description?: string;
  items: SpecialBenefitItem[];
}

const SpecialBenefits = () => {
  const [form] = Form.useForm<SpecialBenefitsFormValues>();
  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();
  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);

  const report = data?.data?.content?.spacial_benefits;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (report) {
      form.setFieldsValue({
        title: report.title || "",
        description: report.description || "",
        items: report.items || [],
      });
    }
  }, [report, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: SpecialBenefitsFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        home: {
          spacial_benefits: {
            title: values.title,
            description: values.description,
            items: values.items,
          },
        },
      };

      const res = await upsertContent(payload).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Special benefits updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <Loader />;

  return (
    <div>
      <PageMeta
        title="Special Benefits | UserKotha.Shop ERP"
        description="Manage Special Benefits section"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={readOnly}
        className="space-y-4"
      >
        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Special Benefits" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* ===============================
            ITEMS LIST (ADD / REMOVE)
        ================================ */}
        <Form.List name="items">
          {(fields) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ key, name, fieldKey }) => (
                  <Card key={key} title={`Special Benefit ${name + 1}`} className="">
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
                        <Input placeholder="gift" />
                      </Form.Item>

                      {/* Title */}
                      <Form.Item
                        label="Title"
                        name={[name, "title"]}
                        fieldKey={[fieldKey!, "title"]}
                        rules={[
                          { required: true, message: "Title is required" },
                        ]}
                      >
                        <Input placeholder="e.g. Free Gifts" />
                      </Form.Item>

                      {/* Description */}
                      <Form.Item
                        label="Description"
                        name={[name, "description"]}
                        fieldKey={[fieldKey!, "description"]}
                        rules={[
                          {
                            required: true,
                            message: "Description is required",
                          },
                        ]}
                      >
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
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

export default SpecialBenefits;
