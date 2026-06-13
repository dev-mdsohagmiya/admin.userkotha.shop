"use client";

import { Button, Card, Divider, Form, Input } from "antd";
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
interface MissionVisionItem {
  title: string;
  description: string;
}

interface MissionVisionFormValues {
  title: string;
  description?: string;
  mission: MissionVisionItem[];
  vision: MissionVisionItem[];
}

const MissionVision = () => {
  const [form] = Form.useForm<MissionVisionFormValues>();
  const [upsertContent, { isLoading }] = useUpsertAboutPageBannerMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "about" },
  ]);

  const missionVision = data?.data?.content?.mission_vision;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (missionVision) {
      form.setFieldsValue({
        title: missionVision.title || "",
        description: missionVision.description || "",
        mission: missionVision.mission || [],
        vision: missionVision.vision || [],
      });
    }
  }, [missionVision, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: MissionVisionFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        about: {
          mission_vision: {
            title: values.title,
            description: values.description,
            mission: values.mission ?? [],
            vision: values.vision ?? [],
          },
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("Mission & Vision updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <AboutSectionSkeleton />;

  return (
    <div>
      <PageMeta
        title="Mission & Vision | Amzad Food ERP"
        description="Manage Mission & Vision section"
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
          <Input placeholder="Our Mission & Vision" />
        </Form.Item>

        {/* Description */}
        <FormRichTextEditor
          name="description"
          height={300}
          rules={[{ required: true, message: "Description is required" }]}
          placeholder="Enter section description"
          readOnly={readOnly}
        />

        <Divider orientation="left">Mission Statements</Divider>

        {/* ===============================
            MISSION LIST
        ================================ */}
        <Form.List name="mission">
          {(fields, { add, remove }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    title={`Mission ${name + 1}`}
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
                    <Form.Item
                      label="Title"
                      name={[name, "title"]}
                      rules={[{ required: true, message: "Title is required" }]}
                    >
                      <Input placeholder="Quality First" />
                    </Form.Item>

                    <FormRichTextEditor
                      label="Description"
                      name={[name, "description"]}
                      rules={[
                        { required: true, message: "Description is required" },
                      ]}
                      placeholder="Enter mission description"
                      readOnly={readOnly}
                    />
                  </Card>
                ))}
              </div>

              {canEdit && (
              <div className="mt-4">
                <Button
                  type="dashed"
                  block
                  icon={<i className="fa-solid fa-plus"></i>}
                  onClick={() => add({ title: "", description: "" })}
                >
                  Add Mission Statement
                </Button>
              </div>
              )}
            </>
          )}
        </Form.List>

        <Divider orientation="left">Vision Statements</Divider>

        {/* ===============================
            VISION LIST
        ================================ */}
        <Form.List name="vision">
          {(fields, { add, remove }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    title={`Vision ${name + 1}`}
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
                    <Form.Item
                      label="Title"
                      name={[name, "title"]}
                      rules={[{ required: true, message: "Title is required" }]}
                    >
                      <Input placeholder="Industry Leader" />
                    </Form.Item>

                    <FormRichTextEditor
                      label="Description"
                      name={[name, "description"]}
                      rules={[
                        { required: true, message: "Description is required" },
                      ]}
                      placeholder="Enter vision description"
                      readOnly={readOnly}
                    />
                  </Card>
                ))}
              </div>

              {canEdit && (
              <div className="mt-4">
                <Button
                  type="dashed"
                  block
                  icon={<i className="fa-solid fa-plus"></i>}
                  onClick={() => add({ title: "", description: "" })}
                >
                  Add Vision Statement
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

export default MissionVision;
