"use client";

import { Button, Card, Form, Input } from "antd";
import { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

import { FormRichTextEditor } from "../../../../components/common/Forms";
import PageMeta from "../../../../components/common/Meta/PageMeta";
import AboutSectionSkeleton from "../../../../components/skeleton/AboutSectionSkeleton";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useUpsertAboutPageBannerMutation } from "../../../../redux/features/about/aboutApi";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";

/* ===============================
    TYPES
================================ */
interface CoreValue {
  title: string;
  description: string;
  icon: string;
}

interface CoreValuesFormValues {
  title: string;
  description?: string;
  values: CoreValue[];
}

const CoreValues = () => {
  const [form] = Form.useForm<CoreValuesFormValues>();
  const [upsertContent, { isLoading }] = useUpsertAboutPageBannerMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "about" },
  ]);

  const coreValues = data?.data?.content?.core_values;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (coreValues) {
      form.setFieldsValue({
        title: coreValues.title || "",
        description: coreValues.description || "",
        values: coreValues.values || [],
      });
    }
  }, [coreValues, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: CoreValuesFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        about: {
          core_values: {
            title: values.title,
            description: values.description,
            values: values.values ?? [],
          },
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("Core Values updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <AboutSectionSkeleton />;

  return (
    <div>
      <PageMeta
        title="Core Values | UserKotha.Shop ERP"
        description="Manage Core Values section"
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
          label="Section Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Our Core Values" />
        </Form.Item>

        {/* Description */}
        <FormRichTextEditor
          name="description"
          height={300}
          rules={[{ required: true, message: "Description is required" }]}
          placeholder="Enter section description"
          readOnly={readOnly}
        />
        {/* ===============================
            CORE VALUES LIST
        ================================ */}
        <Form.List name="values">
          {(fields, { add, remove }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    title={`Value ${name + 1}`}
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
                      ) : undefined
                    }
                  >
                    {/* Icon */}
                    <Form.Item
                      label="Icon (Font Awesome)"
                      tooltip="Use Font Awesome icon name (e.g. truck, heart, user)"
                      name={[name, "icon"]}
                      rules={[{ required: true, message: "Icon is required" }]}
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
                      <Input placeholder="shield" />
                    </Form.Item>

                    {/* Title */}
                    <Form.Item
                      label="Title"
                      name={[name, "title"]}
                      rules={[{ required: true, message: "Title is required" }]}
                    >
                      <Input placeholder="Integrity" />
                    </Form.Item>

                    {/* Description */}
                    <Form.Item
                      label="Description"
                      name={[name, "description"]}
                      rules={[
                        { required: true, message: "Description is required" },
                      ]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="We conduct our business with honesty and transparency..."
                      />
                    </Form.Item>
                  </Card>
                ))}
              </div>

              {canEdit && (
              <div className="mt-4">
                <Button
                  type="dashed"
                  block
                  icon={<i className="fa-solid fa-plus"></i>}
                  onClick={() => add({ icon: "", title: "", description: "" })}
                >
                  Add Core Value
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

export default CoreValues;
