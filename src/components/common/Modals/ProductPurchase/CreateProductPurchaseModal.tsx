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
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useCreateProductPurchaseMutation } from "../../../../redux/features/product-purchase/productPurchaseApi";
import { useSupplierListQuery } from "../../../../redux/features/suppliers/suppliersApi";
import { useProductListQuery } from "../../../../redux/features/product/productApi";
import { FiPlus } from "react-icons/fi";
import CurrencyIcon from "../../../common/CurrencyIcon";
import PageMeta from "../../Meta/PageMeta";

const { Option } = Select;
const { TextArea } = Input;

interface CreateProductPurchaseModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateProductPurchaseModal: React.FC<CreateProductPurchaseModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm();

  // ✅ API Queries
  const { data: supplierData, isLoading: supplierLoading } =
    useSupplierListQuery([
      { name: "limit", value: "500" },
      { name: "isActive", value: "true" },
    ]);
  const { data: productData, isLoading: productLoading } = useProductListQuery([
    { name: "limit", value: "5000" },
  ]);

  const suppliers = supplierData?.data || [];
  const products = productData?.data || [];

  const [createProductPurchase, { isLoading }] =
    useCreateProductPurchaseMutation();

  const calculateTotals = (values: any) => {
    const items = values.items || [];
    let currentSubtotal = 0;

    items.forEach((item: any) => {
      if (item?.quantity && item?.unitPrice) {
        currentSubtotal += Number(item.quantity) * Number(item.unitPrice);
      }
    });

    const discount = Number(values.discount) || 0;
    const tax = Number(values.tax) || 0;
    const total = currentSubtotal - discount + tax;

    return {
      subtotal: currentSubtotal,
      final: Math.max(0, total),
    };
  };

  const onFormValuesChange = (_: any, allValues: any) => {
    const totals = calculateTotals(allValues);
    form.setFieldsValue({ totalPayable: totals.final.toFixed(2) });
  };

  const onFinish = async (values: any) => {
    const totals = calculateTotals(values);

    const formattedValues = {
      supplierId: values.supplierId,
      purchaseDate: values.purchaseDate
        ? values.purchaseDate.format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      totalAmount: totals.subtotal,
      discount: values.discount ? Number(values.discount) : 0,
      tax: values.tax ? Number(values.tax) : 0,
      finalAmount: totals.final,
      paymentStatus: values.paymentStatus,
      paymentMethod: values.paymentMethod || undefined,
      remarks: values.remarks || undefined,
      items: (values.items || []).map((item: any) => ({
        productId: item.productId,
        quantity: Math.floor(Number(item.quantity)) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice:
          (Math.floor(Number(item.quantity)) || 0) *
          (Number(item.unitPrice) || 0),
      })),
    };

    try {
      const res = await createProductPurchase(formattedValues).unwrap();
      if (res?.success) {
        toast.success("Product purchase created successfully!");
        form.resetFields();
        setOpen(false);
      } else {
        toast.error(res?.message || "Failed to create purchase");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
      console.error(err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  // Sync initial total payable when modal opens
  useEffect(() => {
    if (open) {
      const initialValues = form.getFieldsValue();
      const totals = calculateTotals(initialValues);
      form.setFieldsValue({ totalPayable: totals.final.toFixed(2) });
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={false}
      width={900}
      centered={false}
      style={{ top: 20 }}
      styles={{ body: { paddingTop: 10 } }}
    >
      <PageMeta
        title="Create Product Purchase"
        description="Create a new product purchase"
      />

      <div className="mb-4">
        <h1 className="mb-0 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Create Product Purchase
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details below.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={onFormValuesChange}
        initialValues={{
          purchaseDate: dayjs(),
          items: [{}],
          discount: 0,
          tax: 0,
          totalPayable: "0.00",
        }}
      >
        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-transparent">
          <div className="-mb-5 -mt-1">
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item
                  label="Supplier"
                  name="supplierId"
                  rules={[{ required: true, message: "Select supplier" }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Select supplier"
                    loading={supplierLoading}
                    showSearch
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {suppliers.map((s: any) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label="Purchase Date"
                  name="purchaseDate"
                  rules={[{ required: true, message: "Select date" }]}
                  className="mb-0"
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-transparent">
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <table className="w-full border-collapse bg-white">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-200 last:border-r-0">
                        Product
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase w-[120px] border-r border-gray-200">
                        Qty
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase w-[150px] border-r border-gray-200">
                        Unit Price
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase w-[150px] border-r border-gray-200">
                        Total
                      </th>
                      <th className="px-4 py-4 w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }) => (
                      <tr
                        key={key}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/20 transition-colors"
                      >
                        <td className="p-3 border-r border-gray-200">
                          <Form.Item
                            {...restField}
                            name={[name, "productId"]}
                            rules={[{ required: true }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder="Select product"
                              loading={productLoading}
                              showSearch
                              optionFilterProp="children"
                              style={{ width: "100%" }}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)
                                  ?.toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            >
                              {products.map((p: any) => (
                                <Option key={p.id} value={p.id}>
                                  {p.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </td>
                        <td className="p-3 border-r border-gray-200">
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[{ required: true }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={1}
                              style={{ width: "100%" }}
                              className="text-center"
                              placeholder="0"
                            />
                          </Form.Item>
                        </td>
                        <td className="p-3 border-r border-gray-200">
                          <Form.Item
                            {...restField}
                            name={[name, "unitPrice"]}
                            rules={[{ required: true }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={0}
                              style={{ width: "100%" }}
                              placeholder="0.00"
                              prefix={<CurrencyIcon size={10} />}
                            />
                          </Form.Item>
                        </td>
                        <td className="p-3 border-r border-gray-200 font-medium bg-gray-50/30">
                          <Form.Item shouldUpdate noStyle>
                            {() => {
                              const qty =
                                form.getFieldValue([
                                  "items",
                                  name,
                                  "quantity",
                                ]) || 0;
                              const price =
                                form.getFieldValue([
                                  "items",
                                  name,
                                  "unitPrice",
                                ]) || 0;
                              return (
                                <div className="flex items-center gap-1 pl-2">
                                  <CurrencyIcon size={12} />
                                  <span>{(qty * price).toFixed(2)}</span>
                                </div>
                              );
                            }}
                          </Form.Item>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            type="text"
                            danger
                            icon={<IoTrashOutline size={18} />}
                            onClick={() => remove(name)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3 border-t border-gray-200 bg-white">
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<FiPlus />}
                    className="h-10 font-medium"
                    style={{ width: "100%" }}
                  >
                    Add Product Item
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-transparent">
          <Row gutter={12}>
            <Col span={4}>
              <Form.Item label="Discount" name="discount" className="mb-0">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  prefix={<CurrencyIcon size={11} />}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Tax" name="tax" className="mb-0">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  prefix={<CurrencyIcon size={11} />}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label="Payment Status"
                name="paymentStatus"
                className="mb-0"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  placeholder="Select Status"
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  <Option value="PAID">PAID</Option>
                  <Option value="PARTIAL">PARTIAL</Option>
                  <Option value="DUE">DUE</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label="Payment Method"
                name="paymentMethod"
                className="mb-0"
              >
                <Select
                  placeholder="Optional"
                  style={{ width: "100%" }}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  <Option value="CASH_ON_DELIVERY">CASH ON DELIVERY</Option>
                  <Option value="BIKASH">BIKASH</Option>
                  <Option value="NAGAD">NAGAD</Option>
                  <Option value="ROCKET">ROCKET</Option>
                  <Option value="BANK_TRANSFER">BANK TRANSFER</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Total Payable"
                name="totalPayable"
                className="mb-0"
              >
                <Input
                  readOnly
                  style={{ width: "100%" }}
                  className="font-black text-lg text-primary bg-primary/5 border-primary/20"
                  prefix={<CurrencyIcon size={14} className="mr-1" />}
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="-mt-3 -mb-5">
            <Form.Item label="Remarks" name="remarks" className="mb-0">
              <TextArea
                rows={5}
                style={{ width: "100%" }}
                placeholder="Internal notes..."
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end gap-2 w-full mt-4 border-t pt-4">
          <Button
            onClick={handleCancel}
            type="default"
            className="px-6 h-9 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="px-6 h-9 font-bold"
          >
            Create Purchase
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateProductPurchaseModal;
