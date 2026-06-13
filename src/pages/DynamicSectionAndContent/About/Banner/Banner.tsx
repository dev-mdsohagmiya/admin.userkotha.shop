"use client";

import { Button, Form, Input } from "antd";

import { useEffect } from "react";
import { toast } from "react-toastify";

import PageMeta from "../../../../components/common/Meta/PageMeta";
import ImageUploader from "../../../../components/shared/ImageUploader";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import AboutSectionSkeleton from "../../../../components/skeleton/AboutSectionSkeleton";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useUpsertAboutPageBannerMutation } from "../../../../redux/features/about/aboutApi";

/* ===============================
    TYPES
================================ */
interface BannerButton {
  text: string;
  link: string;
}

interface BannerFormValues {
  image: string;
  title: string;
  description?: string;
  buttons: BannerButton[];
}

const Banner = () => {
  const [form] = Form.useForm<BannerFormValues>();
  const [upsertContent, { isLoading }] = useUpsertAboutPageBannerMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "about" },
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
        buttons: banner.buttons || [],
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
        about: {
          banner: {
            image: values.image,
            title: values.title,
            description: values.description,
            // buttons: values.buttons ?? [],
          },
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("About Banner updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <AboutSectionSkeleton />;

  return (
    <div>
      <PageMeta
        title="About Banner | UserKotha.Shop ERP"
        description="Manage About Banner section"
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
          <Input placeholder="About UserKotha.Shop" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Your trusted partner for quality food products..."
          />
        </Form.Item>

        {/* ===============================
            BUTTONS LIST
        ================================ */}
        {/* <Form.List name="buttons">
          {(fields, { add, remove }) => (
            <>
              {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    title={`Button ${name + 1}`}
                    className="!mb-4"
                    extra={
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ color: "red", fontSize: 18 }}
                      />
                    }
                  >
                    <div className="grid grid-cols-1">
                      <Form.Item
                        label="Button Text"
                        name={[name, "text"]}
                        rules={[
                          {
                            required: true,
                            message: "Button text is required",
                          },
                        ]}
                      >
                        <Input placeholder="Learn More" />
                      </Form.Item>

                      <Form.Item
                        label="Button Link"
                        name={[name, "link"]}
                        rules={[
                          { required: true, message: "Link is required" },
                        ]}
                      >
                        <Input placeholder="/about#story" />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
              </div>
              <Form.Item>
                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => add({ text: "", link: "" })}
                >
                  Add Button
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List> */}

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

export default Banner;
