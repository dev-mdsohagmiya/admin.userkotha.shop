"use client";

import { Button, Form, Input, Card, Select } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";

import PageMeta from "../../../../components/common/Meta/PageMeta";
import { Loader } from "../../../../components/common/Loading";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";

import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import { useGetEcommerceProductListQuery } from "../../../../redux/features/product/productApi";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";

/* ===============================
    TYPES
================================ */
interface ReviewItem {
  video_link?: string;
  product_id?: string;
  description?: string;
}

interface ReviewsFormValues {
  title?: string;
  description?: string;
  items: ReviewItem[];
}

const Video = () => {
  const [form] = Form.useForm<ReviewsFormValues>();
  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { readOnly, canEdit } = useContentManagementEdit();

  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);
  const reviews = data?.data?.content?.reviews;

  // Fetch products
  const { data: ecommerceProductList } = useGetEcommerceProductListQuery([
    { name: "isActive", value: true },
    { name: "limit", value: 100000 },
  ]);
  const products = ecommerceProductList?.data || [];

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (reviews) {
      form.setFieldsValue({
        title: reviews.title || "",
        description: reviews.description || "",
        items: reviews.items || [],
      });
    }
  }, [reviews, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: ReviewsFormValues) => {
    if (!canEdit) return;
    if (!values.items || values.items.length === 0) {
      toast.error("Please add at least one review.");
      return;
    }

    try {
      const payload = {
        home: {
          reviews: {
            title: values.title,
            description: values.description,
            items: values.items ?? [],
          },
        },
      };

      const res = await upsertContent(payload).unwrap();

      if (res?.success) {
        toast.success("Reviews updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <Loader />;

  return (
    <div>
      <PageMeta
        title="Customer Reviews | Amzad Food ERP"
        description="Manage Customer Reviews section"
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
          <Input placeholder="Customer Reviews" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={4}
            placeholder="See what our customers say about us"
          />
        </Form.Item>

        {/* ===============================
            ITEMS LIST (ADD / REMOVE)
        ================================ */}
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    title={`Review ${name + 1}`}
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
                    <div className="">
                      {/* Video Link */}
                      <Form.Item
                        label="YouTube Video Link"
                        tooltip="Paste the full YouTube video URL"
                        name={[name, "video_link"]}
                        rules={[
                          {
                            required: true,
                            message: "Video link is required",
                          },
                        ]}
                        extra={
                          <div className="space-y-1">
                          
                            <div>
                              Visit{" "}
                              <a
                                href="https://www.youtube.com/@amzadfood"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                              >
                                Amzad Food YouTube Channel
                              </a>{" "}
                              to get video links
                            </div>
                          </div>
                        }
                      >
                        <Input placeholder="https://www.youtube.com/watch?v=..." />
                      </Form.Item>

                      {/* Product */}
                      <Form.Item
                        label="Related Product (Optional)"
                        name={[name, "product_id"]}
                        tooltip="Select a product this review is about"
                      >
                        <Select
                          placeholder="Select Product"
                          showSearch
                          allowClear
                          optionFilterProp="label"
                        >
                          {products.map((product: any) => (
                            <Select.Option
                              key={product.id}
                              value={product.slug}
                              label={product.name}
                            >
                              {product.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Description */}
                      {/* <Form.Item
                        label="Review Description (Optional)"
                        name={[name, "description"]}
                        tooltip="Brief description of the review"
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder="What the customer said about the product..."
                        />
                      </Form.Item> */}
                    </div>
                  </Card>
                ))}
              </div>

              {canEdit && (
              <div className="mt-4">
                <Button
                  type="dashed"
                  block
                  icon={<i className="fa-solid fa-plus"></i>}
                  onClick={() =>
                    add({ video_link: "", product_id: "", description: "" })
                  }
                >
                  Add Review Video
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

export default Video;
