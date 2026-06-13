import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useUpdateHotDealMutation } from "../../../../redux/features/hotDeals/hoteDealsApi";
import { useGetEcommerceProductListQuery } from "../../../../redux/features/product/productApi";
import { IHotDealData } from "../../../../types/hotDeals";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface UpdateHotDealModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IHotDealData;
}

const UpdateHotDealModal: React.FC<UpdateHotDealModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm();
  const [updateHotDeal, { isLoading }] = useUpdateHotDealMutation();

  // Fetch all products (regular + combo) from eCommerce endpoint
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetEcommerceProductListQuery([{ name: "limit", value: "1000" }]);

  console.log("productsData", productsData);

  const allProducts = useMemo(
    () => productsData?.data || [],
    [productsData?.data],
  );

  // Populate form when data changes
  useEffect(() => {
    if (data && open) {
      // Find the product in the unified list
      const product = allProducts.find((p: any) => p.id === data.productId);

      // Determine the product type based on the product's type field
      const productType = product?.type || "regular";
      const combinedProductId = `${productType}-${data.productId}`;

      form.setFieldsValue({
        productId: combinedProductId,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        dateRange: [dayjs(data.startTime), dayjs(data.endTime)],
        isActive: data.isActive,
      });
    }
  }, [data, open, form, allProducts]);

  const onFinish = async (values: any) => {
    try {
      const { dateRange, productId, ...rest } = values;

      // Parse productId to extract actual ID (format: "regular-123" or "combo-456")
      const [, actualProductId] = productId.split("-");

      const payload = {
        ...rest,
        productId: actualProductId,
        startTime: dateRange[0].toISOString(),
        endTime: dateRange[1].toISOString(),
      };

      const res = await updateHotDeal({
        id: data.id as string,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Hot Deal updated successfully! 🔥");
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Something went wrong. Please try again.",
      );
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={false}
      width={800}
      destroyOnClose
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white/90">
          Update Hot Deal 🔥
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify your hot deal details to keep your offers fresh and exciting.
        </p>
      </div>

      <Form
        form={form}
        name="update-hot-deal"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        {/* Product Selection - All Products from eCommerce API */}
        <Form.Item
          label="Select Product"
          name="productId"
          tooltip="Choose a product for this hot deal (Regular or Combo)"
          rules={[{ required: true, message: "Please select a product!" }]}
        >
          <Select
            showSearch
            placeholder="Search and select a product"
            loading={isLoadingProducts}
            filterOption={(input, option) => {
              const label = option?.label ? String(option.label) : "";
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            options={allProducts.map((product: any) => ({
              label: `[${product.type === "combo" ? "Combo" : "Regular"}] ${
                product.name
              } (${product.category?.name || "No Category"})`,
              value: `${product.type || "regular"}-${product.id}`,
            }))}
          />
        </Form.Item>

        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          tooltip="Main headline for the hot deal (e.g., '🔥 Hot Deal of the Week')"
          rules={[{ required: true, message: "Please enter a title!" }]}
        >
          <Input placeholder="e.g., 🔥 Hot Deal of the Week" maxLength={100} />
        </Form.Item>

        {/* Subtitle */}
        <Form.Item
          label="Subtitle"
          name="subtitle"
          tooltip="Catchy tagline or offer details (e.g., 'Limited Time Offer - 50% OFF!')"
          rules={[{ required: true, message: "Please enter a subtitle!" }]}
        >
          <Input
            placeholder="e.g., Limited Time Offer - 50% OFF!"
            maxLength={150}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          tooltip="Detailed description of the hot deal"
          rules={[{ required: true, message: "Please enter a description!" }]}
        >
          <TextArea
            placeholder="Enter detailed description about the hot deal..."
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Date Range */}
        <Form.Item
          label="Deal Duration"
          name="dateRange"
          tooltip="Select start and end date for the hot deal"
          rules={[{ required: true, message: "Please select deal duration!" }]}
        >
          <RangePicker
            showTime
            format="DD MMM YYYY, hh:mm A"
            className="w-full"
            disabledDate={(current) => {
              return current && current < dayjs().startOf("day");
            }}
          />
        </Form.Item>

        {/* Status */}
        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <SwitchStatus2 defaultChecked={data?.isActive} size="default" />
        </Form.Item>

        {/* Action Buttons */}
        <div className="flex justify-start gap-2 w-full mt-5">
          <Button
            onClick={handleCancel}
            type="default"
            htmlType="button"
            className="px-5!"
          >
            Cancel
          </Button>

          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            className="px-5!"
          >
            Update Hot Deal
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateHotDealModal;
