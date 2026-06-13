import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Switch,
  Tooltip,
  Alert,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from "../../../redux/features/coupon/couponApi";
import { useProductListQuery } from "../../../redux/features/product/productApi";
import { ICoupon } from "../../../types/coupon";
import { IProductData } from "../../../types/product";

interface CreateCouponModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  itemToEdit?: ICoupon | null;
  setItemToEdit: (item: ICoupon | null) => void;
}

const CreateCouponModal = ({
  open,
  setOpen,
  itemToEdit,
  setItemToEdit,
}: CreateCouponModalProps) => {
  const [form] = Form.useForm();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const { data: productsData } = useProductListQuery([
    { name: "limit", value: "1000" },
  ]);

  // add all products in products list
  const products = productsData?.data || [];

  useEffect(() => {
    if (itemToEdit) {
      form.setFieldsValue({
        ...itemToEdit,
        validFrom: itemToEdit.validFrom ? dayjs(itemToEdit.validFrom) : null,
        validTo: itemToEdit.validTo ? dayjs(itemToEdit.validTo) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        discountType: "PERCENTAGE",
      });
    }
  }, [itemToEdit, form, open]);

  const onFinish = async (values: any) => {
    const formattedValues = {
      ...values,
      validFrom: values.validFrom ? values.validFrom.toISOString() : null,
      validTo: values.validTo ? values.validTo.toISOString() : null,
      // Ensure number types, handle optional fields safely
      discountValue: Number(values.discountValue),
      minPurchaseAmount:
        values.minPurchaseAmount !== null &&
        values.minPurchaseAmount !== undefined
          ? Number(values.minPurchaseAmount)
          : null,
      maxDiscountAmount:
        values.maxDiscountAmount !== null &&
        values.maxDiscountAmount !== undefined
          ? Number(values.maxDiscountAmount)
          : null,
      usageLimit:
        values.usageLimit !== null && values.usageLimit !== undefined
          ? Number(values.usageLimit)
          : null,
      perUserLimit:
        values.perUserLimit !== null && values.perUserLimit !== undefined
          ? Number(values.perUserLimit)
          : null,
      applicableProducts: values.applicableProducts || [],
    };

    try {
      if (itemToEdit) {
        await updateCoupon({
          id: itemToEdit.id as string,
          data: formattedValues,
        }).unwrap();
        toast.success("Coupon updated successfully!");
      } else {
        await createCoupon(formattedValues).unwrap();
        toast.success("Coupon created successfully!");
      }
      setOpen(false);
      setItemToEdit(null);
      form.resetFields();
    } catch (error: any) {
      toast.error(error.data?.message || "Something went wrong!");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setItemToEdit(null);
    form.resetFields();
  };

  return (
    <Modal
      title={itemToEdit ? "Edit Coupon" : "Create Coupon"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Alert
          message="Important Information"
          description={
            <div className="text-sm">
              <p>
                • <strong>Coupon Code:</strong> Spaces are not allowed and will
                be automatically removed.
              </p>
            </div>
          }
          type="warning"
          showIcon
          className="mb-6"
        />
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label={
                <span>
                  Coupon Code&nbsp;
                  <Tooltip title="Spaces are not allowed in coupon codes. They will be automatically removed.">
                    <span className="text-gray-400 cursor-help underline decoration-dotted">
                      (No spaces)
                    </span>
                  </Tooltip>
                </span>
              }
              rules={[
                { required: true, message: "Please enter coupon code" },
                {
                  validator: (_, value) => {
                    if (value && /\s/.test(value)) {
                      return Promise.reject("Spaces are not allowed");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              normalize={(value) => value?.toUpperCase().replace(/\s/g, "")}
            >
              <Input
                placeholder="e.g. SAVE20"
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[
                { required: true, message: "Please select discount type" },
              ]}
            >
              <Select>
                <Select.Option value="PERCENTAGE">Percentage (%)</Select.Option>
                <Select.Option value="FIXED">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="discountValue"
              label="Discount Value"
              rules={[
                { required: true, message: "Please enter discount value" },
                {
                  type: "number",
                  min: 0,
                  message: "Must be a positive number",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} placeholder="20" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="minPurchaseAmount"
              label="Min Purchase Amount"
              rules={[
                {
                  type: "number",
                  min: 0,
                  message: "Must be a positive number",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="500"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="maxDiscountAmount"
              label="Max Discount Amount"
              rules={[
                {
                  type: "number",
                  min: 0,
                  message: "Must be a positive number",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="1000"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="usageLimit"
              label="Total Usage Limit"
              rules={[
                {
                  type: "number",
                  min: 0,
                  message: "Must be a positive number",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="100"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="perUserLimit"
              label="Usage Limit Per User"
              rules={[
                { type: "number", min: 1, message: "Must be at least 1" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={1} placeholder="1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="validFrom"
              label="Valid From"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="validTo"
              label="Valid To"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="applicableProducts" label="Applicable Products">
              <Select
                mode="multiple"
                allowClear
                placeholder="Select products"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={products.map((product: IProductData) => ({
                  label: product.name,
                  value: product.id,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Coupon description..." />
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {itemToEdit ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCouponModal;
