import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  TimePicker,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useCreateSmsRuleMutation,
  useUpdateSmsRuleMutation,
} from "../../../redux/features/autoSms/autoSmsApi";
import { useProductListQuery } from "../../../redux/features/product/productApi";
import { useComboProductListQuery } from "../../../redux/features/comboProduct/comboProductApi";
import { ISmsRule, ISmsRuleRequest } from "../../../types/autoSms";

interface SmsRuleModalProps {
  open: boolean;
  onClose: () => void;
  selectedRule: ISmsRule | null;
}

const SmsRuleModal = ({ open, onClose, selectedRule }: SmsRuleModalProps) => {
  const [form] = Form.useForm();
  const [applyTo, setApplyTo] = useState<"all" | "selected">("all");

  const [createRule, { isLoading: isCreating }] = useCreateSmsRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateSmsRuleMutation();

  // Fetch products and combo products for selection with a higher limit
  const { data: productsData, isLoading: productsLoading } = useProductListQuery([
    { name: "limit", value: 1000 },
    { name: "isActive", value: "true" },
  ]);
  const { data: comboProductsData, isLoading: comboLoading } = useComboProductListQuery([
    { name: "limit", value: 1000 },
    { name: "isActive", value: "true" },
  ]);

  const productOptions = useMemo(() => {
    // Handle both { data: [...] } and direct [...] response structures if any
    const productsArray = Array.isArray(productsData) ? productsData : productsData?.data || [];
    const comboArray = Array.isArray(comboProductsData) ? comboProductsData : comboProductsData?.data || [];

    const products = productsArray.map((p: any) => ({
      label: `[Product] ${p.name}`,
      value: `p_${p.id}`,
    }));
    
    const comboProducts = comboArray.map((cp: any) => ({
      label: `[Combo] ${cp.name}`,
      value: `c_${cp.id}`,
    }));

    return [...products, ...comboProducts];
  }, [productsData, comboProductsData]);

  useEffect(() => {
    if (selectedRule) {
      setApplyTo(selectedRule.applyTo);
      
      // Transform products for the multi-select
      const selectedProducts = selectedRule.products.map(p => 
        p.productId ? `p_${p.productId}` : `c_${p.comboProductId}`
      );

      form.setFieldsValue({
        ...selectedRule,
        sendTime: selectedRule.sendTime ? dayjs(selectedRule.sendTime, "HH:mm:ss") : null,
        selectedProducts: selectedRule.applyTo === "selected" ? selectedProducts : [],
        excludedProducts: selectedRule.applyTo === "all" ? selectedProducts : [],
      });
    } else {
      form.resetFields();
      setApplyTo("all");
    }
  }, [selectedRule, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { selectedProducts, excludedProducts, sendTime, ...rest } = values;

      const products: any[] = [];
      const productList = applyTo === "selected" ? selectedProducts : excludedProducts;
      const productType = applyTo === "selected" ? "include" : "exclude";

      productList?.forEach((val: string) => {
        const isCombo = val.startsWith("c_");
        const id = val.substring(2);
        products.push({
          productId: isCombo ? undefined : id,
          comboProductId: isCombo ? id : undefined,
          type: productType,
        });
      });

      const payload: ISmsRuleRequest = {
        ...rest,
        sendTime: sendTime ? sendTime.format("HH:mm:ss") : undefined,
        products,
      };

      if (selectedRule) {
        await updateRule({ id: selectedRule.id, data: payload }).unwrap();
        toast.success("Rule updated successfully!");
      } else {
        await createRule(payload).unwrap();
        toast.success("Rule created successfully!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save rule.");
    }
  };

  return (
    <Modal
      title={selectedRule ? "Edit SMS Rule" : "Create SMS Rule"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isCreating || isUpdating}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isActive: true, applyTo: "all" }}
        onValuesChange={(changed) => {
          if (changed.applyTo) setApplyTo(changed.applyTo);
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Rule Name"
              rules={[{ required: true, message: "Please enter rule name" }]}
            >
              <Input placeholder="Enter rule name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Rule Type"
              rules={[{ required: true, message: "Please select rule type" }]}
            >
              <Select placeholder="Select type">
                <Select.Option value="after_purchase">After Purchase</Select.Option>
                <Select.Option value="before_expiry">Before Expiry</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="durationDays"
              label="Duration Days"
              rules={[{ required: true, message: "Please enter duration days" }]}
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="Days after purchase / before expiry"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sendTime" label="Send Time">
              <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="message"
          label="SMS Message"
          extra="Variables: {{name}}, {{order_id}}, {{Product Name}}"
          rules={[{ required: true, message: "Please enter message" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Hello {{name}}, your product {{Product Name}} is active."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="applyTo" label="Apply To" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="all">All Products</Select.Option>
                <Select.Option value="selected">Selected Products</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Col>
        </Row>

        {applyTo === "selected" ? (
          <Form.Item
            name="selectedProducts"
            label="Select Products"
            rules={[{ required: true, message: "Please select at least one product" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select products"
              options={productOptions}
              loading={productsLoading || comboLoading}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        ) : (
          <Form.Item name="excludedProducts" label="Exclusion (Optional)">
            <Select
              mode="multiple"
              placeholder="Select products to exclude"
              options={productOptions}
              loading={productsLoading || comboLoading}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default SmsRuleModal;
