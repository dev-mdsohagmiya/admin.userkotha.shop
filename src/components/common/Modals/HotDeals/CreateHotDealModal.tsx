import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { useCreateHotDealMutation } from "../../../../redux/features/hotDeals/hoteDealsApi";
import { useGetEcommerceProductListQuery } from "../../../../redux/features/product/productApi";
import { ICreateHotDeal } from "../../../../types/hotDeals";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface CreateHotDealModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateHotDealModal: React.FC<CreateHotDealModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<ICreateHotDeal>();
  const [createHotDeal, { isLoading }] = useCreateHotDealMutation();

  // Fetch all products (regular + combo) from eCommerce endpoint
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetEcommerceProductListQuery([{ name: "limit", value: "1000" }]);

  const allProducts = useMemo(
    () => productsData?.data || [],
    [productsData?.data],
  );

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

      const res = await createHotDeal(payload).unwrap();

      if (res?.success) {
        toast.success("Hot Deal created successfully! 🔥");
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
          Create Hot Deal 🔥
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Set up an exciting hot deal to boost your sales and attract customers.
        </p>
      </div>

      <Form
        form={form}
        name="create-hot-deal"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
        initialValues={{ isActive: true }}
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
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
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
          initialValue={true}
        >
          <SwitchStatus2 defaultChecked size="default" />
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
            Create Hot Deal
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateHotDealModal;
