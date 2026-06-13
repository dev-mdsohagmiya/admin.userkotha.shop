

import { Button, Form, Input, Card } from "antd";
import { toast } from "react-toastify";

import PageMeta from "../../../../components/common/Meta/PageMeta";

import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import { useEffect } from "react";
import { Loader } from "../../../../components/common/Loading";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";

/* ===============================
    TYPES
================================ */
interface WhyChooseItem {
  count: number;
  suffix: string;
  label: string;
}

interface WhyChooseFormValues {
  title: string;
  description?: string;
  stats: WhyChooseItem[];
}

const Report = () => {
  const [form] = Form.useForm<WhyChooseFormValues>();
  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();
  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);

  const report = data?.data?.content?.report;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (report) {
      form.setFieldsValue({
        title: report.title || "",
        description: report.description || "",
        stats: report.stats || [],
      });
    }
  }, [report, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: WhyChooseFormValues) => {
    if (!canEdit) return;
    try {
      const payload = {
        home: {
          report: {
            title: values.title,
            description: values.description,
            stats: values.stats,
          },
        },
      };
      const res = await upsertContent(payload).unwrap();
      if (res?.success) {
        toast.success("Report updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };
  if (contentLoading) return <Loader />;
  return (
    <div>
      <PageMeta
        title="Why Choose Us | UserKotha.Shop ERP"
        description="Manage Why Choose Us section"
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
          <Input placeholder="Our Achievements" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* ===============================
    STATS LIST (UPDATE ONLY)
=============================== */}
        {/* ===============================
    STATS LIST (UPDATE ONLY)
=============================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.stats?.map((item: WhyChooseItem, idx: number) => (
            <Card key={idx} title={`Item ${idx + 1}`} className="">
              <div className="grid grid-cols-1">
                <Form.Item
                  label="Count"
                  name={["stats", idx, "count"]}
                  initialValue={item.count}
                  rules={[{ required: true, message: "Count is required" }]}
                >
                  <Input type="number" />
                </Form.Item>

                <Form.Item
                  label="Suffix"
                  name={["stats", idx, "suffix"]}
                  initialValue={item.suffix}
                  rules={[{ required: true, message: "Suffix is required" }]}
                >
                  <Input placeholder="e.g. +" />
                </Form.Item>

                <Form.Item
                  label="Label"
                  name={["stats", idx, "label"]}
                  initialValue={item.label}
                  rules={[{ required: true, message: "Label is required" }]}
                >
                  <Input placeholder="e.g. Happy Customers" />
                </Form.Item>
              </div>
            </Card>
          ))}
        </div>

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

export default Report;
