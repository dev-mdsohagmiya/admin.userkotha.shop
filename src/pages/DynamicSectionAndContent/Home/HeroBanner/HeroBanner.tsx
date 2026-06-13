"use client";

import { Button, Form, Select } from "antd";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";

import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import ImageUploader from "../../../../components/shared/ImageUploader";
import CommonSliderSkeleton from "../../../../components/skeleton/CommonSliderSkeleton";
import { useContentManagementEdit } from "../../../../hooks/useContentManagementEdit";
import { useGetDynamicContentQuery } from "../../../../redux/features/dynamicContent/dynamicContentApi";
import { useUpsertHomepageMutation } from "../../../../redux/features/home/homeApi";
import { useGetEcommerceProductListQuery } from "../../../../redux/features/product/productApi";

const { Option } = Select;

const HeroBanner = () => {
  const [form] = Form.useForm();

  const { readOnly, canEdit } = useContentManagementEdit();

  const [updateBanner, { isLoading }] = useUpsertHomepageMutation();

  const { data, isLoading: isBannerLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);
  const banner = data?.data?.content?.banner;

  const { data: ecommerceProductList, isLoading: isProductLoading } =
    useGetEcommerceProductListQuery([
      { name: "isActive", value: true },
      { name: "limit", value: 100000 },
    ]);
  const products = useMemo(
    () => ecommerceProductList?.data || [],
    [ecommerceProductList],
  );

  // 🔹 preload banner data
  useEffect(() => {
    if (banner && !form.isFieldsTouched()) {
      form.setFieldsValue({
        ads_image: {
          image: banner?.ads_image?.image?.id,
          link: banner?.ads_image?.link,
        },
        slider_images:
          banner?.slider_images?.map((item: any) => ({
            image: item.image?.id || item.image,
            link: item.link,
          })) || [],
      });
    }
  }, [banner, form]);

  // 🔹 preload default product slug if link empty for ads_image
  useEffect(() => {
    if (products.length && !form.getFieldValue(["ads_image", "link"])) {
      const currentAdsImage = form.getFieldValue("ads_image") || {};
      // Only set default if we don't have a value yet and we have a banner image
      if (currentAdsImage.image || banner?.ads_image?.image) {
        form.setFieldsValue({
          ads_image: {
            image: currentAdsImage.image || banner?.ads_image?.image?.id,
            link: currentAdsImage.link || products[0].slug, // default first product slug
          },
        });
      }
    }
  }, [products, banner, form]);

  // 🔹 submit
  const onFinish = async (values: any) => {
    if (!canEdit) return;
    const payload = {
      home: {
        banner: {
          ads_image: values.ads_image,
          slider_images: values.slider_images?.map((item: any) => ({
            image: item.image,
            link: item.link,
          })),
        },
      },
    };

    try {
      const res = await updateBanner(payload).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Banner updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Update failed");
    }
  };

  if (isBannerLoading || isProductLoading) {
    return <CommonSliderSkeleton />;
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={readOnly} className="w-full">
      <div className="space-y-8">
        {/* Ads Section */}
        <div className="bg-white p-6 rounded-lg  border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
            Ads Configuration
          </h2>
          {/* Ads Image */}
          <Form.Item
            name={["ads_image", "image"]}
            label="Ads Image"
            rules={[{ required: true, message: "Please enter ads image!" }]}
          >
            <ImageUploader fieldPath="ads_image.image" form={form} disabled={readOnly} />
          </Form.Item>

          {/* Product Dropdown for Ads Image */}
          <Form.Item
            label="Select Product (Ads)"
            name={["ads_image", "link"]}
            rules={[{ required: false, message: "Please select a product!" }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select a product"
              optionFilterProp="label"
              onChange={(value) => {
                form.setFieldsValue({
                  ads_image: {
                    ...form.getFieldValue("ads_image"),
                    link: value,
                  },
                });
              }}
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {products.map((product: any) => (
                <Option
                  key={product.slug}
                  value={product.slug}
                  label={product.name}
                >
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Slider Section */}
        <div className="bg-white p-6 rounded-lg  border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
            Slider Configuration
          </h2>
          <Form.List name="slider_images">
            {(fields, { add, remove }) => (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      className="group relative p-4 border rounded-lg bg-gray-50 hover:bg-white  transition-all duration-200"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                          <Form.Item
                            name={[name, "image"]}
                            label="Slider Image"
                            rules={[
                              {
                                required: true,
                                message: "Please enter slider image!",
                              },
                            ]}
                          >
                            <ImageUploader
                              fieldPath={`slider_images.${name}.image`}
                              form={form}
                              isThumbnail={true}
                              disabled={readOnly}
                            />
                          </Form.Item>

                          {canEdit && (
                          <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => remove(name)}
                            className="border-dashed border-red-500"
                          />
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">
                            Slide {name + 1}
                          </h4>
                          <Form.Item
                            label="Link (Product Slug)"
                            name={[name, "link"]}
                            rules={[{ required: false }]}
                            className="mb-0"
                          >
                            <Select
                              showSearch
                              allowClear
                              size="middle"
                              placeholder="Select product (optional)"
                              optionFilterProp="label"
                              filterOption={(input, option) =>
                                String(option?.label ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            >
                              {products.map((product: any) => (
                                <Option
                                  key={product.slug}
                                  value={product.slug}
                                  label={product.name}
                                >
                                  {product.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Slide Button Block - Optional: could be outside grid or as a card in grid */}
                  {canEdit && (
                  <button
                    type="button"
                    onClick={() => add()}
                    className="flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-primary hover:border-primary transition-colors gap-2"
                  >
                    <PlusOutlined className="text-2xl" />
                    <span className="font-medium">Add New Slide</span>
                  </button>
                  )}
                </div>
              </>
            )}
          </Form.List>
        </div>
      </div>

      <div className="pt-10">
        {canEdit && (
          <Form.Item className=" ">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              className="px-8"
            >
              Save Changes
            </Button>
          </Form.Item>
        )}
      </div>
    </Form>
  );
};

export default HeroBanner;
