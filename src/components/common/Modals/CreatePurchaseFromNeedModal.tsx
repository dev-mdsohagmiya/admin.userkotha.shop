import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useWarehouseListQuery } from "../../../redux/features/warehouses/warehousesApi";
import { useCreatePurchaseFromNeedMutation } from "../../../redux/features/purchases-management/purchasesManagementApi";
import { IPurchase, IPurchaseNeed } from "../../../types/purchase";
import ImageUploader from "../../shared/ImageUploader";
import { useSupplierListQuery } from "../../../redux/features/suppliers/suppliersApi";
import { IMaterial } from "../../../types/material";
import { useGetMaterialsQuery } from "../../../redux/features/material/materialApi";

const { Option } = Select;

interface CreatePurchaseFromNeedModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseNeed: IPurchaseNeed;
}

const CreatePurchaseFromNeedModal: React.FC<
  CreatePurchaseFromNeedModalProps
> = ({ open, setOpen, purchaseNeed }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [purchaseType, setPurchaseType] = useState<string>("raw");
  // ✅ Queries
  const { data: warehouseData, isLoading: warehouseLoading } =
    useWarehouseListQuery([{ name: "limit", value: "500" }]);
  const { data: supplierData, isLoading: supplierLoading } =
    useSupplierListQuery([
      { name: "limit", value: "500" },
      { name: "type", value: purchaseType },
    ]);
  const { data: rawMaterialData, isLoading: rawMaterialLoading } =
    useGetMaterialsQuery([
      { name: "limit", value: "5000" },
      { name: "type", value: purchaseType },
    ]);

  const warehouses = warehouseData?.data?.data || [];
  const suppliers = supplierData?.data || [];
  const rawMaterials = rawMaterialData?.data || [];

  const [createPurchaseFromNeed, { isLoading }] =
    useCreatePurchaseFromNeedMutation();

  // ✅ Set initial form values when modal opens
  useEffect(() => {
    if (open && purchaseNeed) {
      const initialItems = purchaseNeed.items.map((item) => ({
        materialId: { value: item.materialId, label: item.materialName },
        materialName: item?.materialName || "Unknown Material", // store the name separately
        quantity: parseFloat(Number(item.quantity).toFixed(2)),
        unitPrice: item.unitPrice,
        discount: 0,
        totalPrice: parseFloat(Number(item.totalPrice).toFixed(2)),
      }));
      form.setFieldsValue({
        purchaseDate: dayjs(),
        purchaseType: "raw", // Default to Raw Material, can be changed by user
        supplierId: purchaseNeed.supplierId,
        invoiceNo: "",
        referenceNo: "",
        discountType: "Fixed",
        discountValue: 0,
        vatPercentage: 0,
        otherCharges: 0,
        paidAmount: 0,
        notes: "",
        items: initialItems,
      });

      // Calculate initial totals
      const totals = calculateTotals({ items: initialItems });
      setSubtotal(totals.subtotal);
      setGrandTotal(totals.grandTotal);
      setDueAmount(totals.dueAmount);
    }
  }, [open, purchaseNeed, form]);

  // ✅ Calculate totals dynamically
  const calculateTotals = (values: any) => {
    const items = values.items || [];
    let newSubtotal = 0;

    items.forEach((item: any) => {
      if (item?.quantity && item?.unitPrice) {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount) || 0;
        const itemTotal = quantity * unitPrice - discount;
        newSubtotal += Math.max(0, itemTotal);
      }
    });

    const discountType = values.discountType || "Fixed";
    const discountValue = Number(values.discountValue) || 0;
    const discountAmount =
      discountType === "Percentage"
        ? (newSubtotal * discountValue) / 100
        : discountValue;

    const vatAmount =
      ((Number(values.vatPercentage) || 0) / 100) *
      (newSubtotal - discountAmount);
    const otherCharges = Number(values.otherCharges) || 0;

    const newGrandTotal =
      newSubtotal - discountAmount + vatAmount + otherCharges;
    const paidAmount = Number(values.paidAmount) || 0;
    const newDueAmount = Math.max(0, newGrandTotal - paidAmount);

    return {
      subtotal: newSubtotal,
      grandTotal: newGrandTotal,
      dueAmount: newDueAmount,
    };
  };

  // ✅ Handle form value changes
  const onFormValuesChange = (_: any, allValues: any) => {
    const totals = calculateTotals(allValues);
    setSubtotal(totals.subtotal);
    setGrandTotal(totals.grandTotal);
    setDueAmount(totals.dueAmount);
  };

  // ✅ Handle submit
  const onFinish = async (values: IPurchase) => {
    const formattedValues = {
      ...values,
      discountValue: Number(values.discountValue) || 0,
      vatPercentage: Number(values.vatPercentage) || 0,
      otherCharges: Number(values.otherCharges) || 0,
      paidAmount: Number(values.paidAmount) || 0,
      items: (values.items || []).map((item: any) => ({
        ...item,
        materialId: item.materialId?.value || item.materialId,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        discount: Number(item.discount) || 0,
      })),
    };

    try {
      const res = await createPurchaseFromNeed({
        needId: purchaseNeed.id,
        data: formattedValues,
      }).unwrap();
      if (res?.success) {
        message.success("Purchase created successfully!");
        form.resetFields();
        setOpen(false);
        // Navigate to the created purchase
        navigate(`/purchases/${res.data.id}`);
      } else {
        message.error(res?.message || "Failed to create purchase");
      }
    } catch (err: any) {
      message.error(err?.data?.message || "Something went wrong!");
      console.error(err);
    }
  };

  // ✅ Handle cancel
  const handleCancel = () => {
    form.resetFields();
    setSubtotal(0);
    setGrandTotal(0);
    setDueAmount(0);
    setOpen(false);
  };

  return (
    <Modal open={open} onCancel={handleCancel} footer={false} width={1200}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={onFormValuesChange}
        initialValues={{
          purchaseDate: dayjs(),
          purchaseType: "Raw Material",
          discountType: "Fixed",
          items: [{}],
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Create Purchase</h1>
          <p className="text-sm text-gray-500">
            Fill out the details to create a new purchase.
          </p>
        </div>

        {/* Invoice Image */}
        <Col span={8}>
          <Form.Item name="invoiceImage" label="Invoice Image">
            <ImageUploader fieldPath="invoiceImage" form={form} />
          </Form.Item>
        </Col>

        {/* Purchase Info */}
        <Card title="Purchase Information" className="mb-4 !border ">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Purchase Date"
                name="purchaseDate"
                rules={[{ required: true, message: "Select purchase date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Purchase Type"
                name="purchaseType"
                rules={[{ required: true, message: "Select purchase type" }]}
              >
                <Select
                  placeholder="Select type"
                  onChange={(value) => setPurchaseType(value)}
                >
                  <Option value="raw">Raw Material</Option>
                  <Option value="packaging">Packaging Material</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Invoice No"
                name="invoiceNo"
                rules={[{ required: true, message: "Enter invoice number" }]}
              >
                <Input placeholder="Supplier invoice/reference number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Supplier"
                name="supplierId"
                rules={[{ required: true, message: "Select supplier" }]}
              >
                <Select
                  placeholder="Select supplier"
                  loading={supplierLoading}
                  disabled={supplierLoading}
                >
                  {suppliers.map((s: { id: string; name: string }) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Warehouse"
                name="warehouseId"
                rules={[{ required: true, message: "Select warehouseId" }]}
              >
                <Select
                  placeholder="Select warehouseId"
                  loading={warehouseLoading}
                  disabled={warehouseLoading}
                >
                  {warehouses.map((s: { id: string; name: string }) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Reference No" name="referenceNo">
                <Input placeholder="Optional internal reference" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Items */}
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  title={`Item ${index + 1}`}
                  className="!flex !flex-col !gap-4 !my-4"
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<IoClose />}
                      onClick={() => remove(name)}
                    />
                  }
                >
                  <div className="grid grid-cols-5 gap-3">
                    {/* Raw Material */}
                    <Form.Item
                      {...restField}
                      label={
                        purchaseType === "raw"
                          ? "Raw Material"
                          : "Packaging Material"
                      }
                      name={[name, "materialId"]}
                      rules={[{ required: true, message: "Select material" }]}
                    >
                      <Select
                        placeholder="Select material"
                        loading={rawMaterialLoading}
                        showSearch
                        labelInValue
                        optionFilterProp="label"
                        onChange={(val: { value: string; label: string }) => {
                          const selectedMaterial = rawMaterials.find(
                            (m: { id: any }) => m.id === val.value,
                          );
                          if (selectedMaterial) {
                            const items = form.getFieldValue("items") || [];
                            const newItems = [...items];
                            newItems[name] = {
                              ...newItems[name],
                              materialId: val,
                              materialName: selectedMaterial.name,
                              type: selectedMaterial.type,
                              unitId: selectedMaterial.unit?.id,
                            };
                            form.setFieldsValue({ items: newItems });
                          }
                        }}
                        options={rawMaterials.map((m: IMaterial) => ({
                          label: m.name,
                          value: m.id,
                        }))}
                      />
                    </Form.Item>

                    {/* Quantity */}
                    <Form.Item
                      {...restField}
                      label="Quantity"
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Enter quantity" }]}
                    >
                      <InputNumber
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    {/* Unit Price */}
                    <Form.Item
                      {...restField}
                      label="Unit Price"
                      name={[name, "unitPrice"]}
                      rules={[{ required: true, message: "Enter unit price" }]}
                    >
                      <InputNumber
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    {/* Discount */}
                    <Form.Item
                      {...restField}
                      label="Discount"
                      name={[name, "discount"]}
                      rules={[
                        {
                          validator: (_, value) => {
                            const items = form.getFieldValue("items") || [];
                            const currentItem = items[name] || {};
                            const quantity = Number(currentItem.quantity) || 0;
                            const unitPrice =
                              Number(currentItem.unitPrice) || 0;
                            const maxDiscount = quantity * unitPrice;

                            if (value > maxDiscount) {
                              return Promise.reject(
                                new Error(
                                  "Discount cannot exceed item total price",
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    {/* Total Price */}
                    <Form.Item
                      label="Total Price"
                      shouldUpdate={(prevValues, curValues) => {
                        const prev = prevValues.items?.[name] || {};
                        const curr = curValues.items?.[name] || {};
                        return (
                          prev.quantity !== curr.quantity ||
                          prev.unitPrice !== curr.unitPrice ||
                          prev.discount !== curr.discount
                        );
                      }}
                    >
                      {({ getFieldValue, setFieldsValue }) => {
                        const items = getFieldValue("items") || [];
                        const currentItem = items[name] || {};

                        const quantity = Number(currentItem.quantity) || 0;
                        const unitPrice = Number(currentItem.unitPrice) || 0;
                        const discount = Number(currentItem.discount) || 0;

                        const total = Math.max(
                          0,
                          quantity * unitPrice - discount,
                        );

                        // Update the form field for totalPrice
                        if (currentItem.totalPrice !== total) {
                          const newItems = [...items];
                          newItems[name] = {
                            ...currentItem,
                            totalPrice: total,
                          };
                          setFieldsValue({ items: newItems });
                        }

                        return (
                          <InputNumber
                            type="number"
                            value={total.toFixed(2)}
                            disabled
                            style={{ width: "100%" }}
                          />
                        );
                      }}
                    </Form.Item>
                  </div>
                </Card>
              ))}

              <Button type="dashed" onClick={() => add()} block>
                + Add Item
              </Button>
            </>
          )}
        </Form.List>

        {/* Payment & Summary */}
        <Card title="Payment & Summary" className="!my-4">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Discount Type" name="discountType">
                <Select>
                  <Option value="Fixed">Fixed</Option>
                  <Option value="Percentage">Percentage</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Discount Value"
                name="discountValue"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined) return Promise.resolve();

                      const vat =
                        Number(form.getFieldValue("vatPercentage")) || 0;
                      const otherCharges =
                        Number(form.getFieldValue("otherCharges")) || 0;
                      const discountType =
                        form.getFieldValue("discountType") || "Fixed";

                      // subtotal state থেকে আসবে
                      let discountAmount = 0;
                      if (discountType === "Percentage") {
                        discountAmount = (subtotal * value) / 100;
                      } else {
                        discountAmount = value;
                      }

                      const grandTotal =
                        subtotal -
                        discountAmount +
                        (subtotal - discountAmount) * (vat / 100) +
                        otherCharges;

                      if (grandTotal < 0) {
                        return Promise.reject(
                          new Error("Discount cannot exceed grand total"),
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber type="number" min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="VAT (%)" name="vatPercentage">
                <InputNumber
                  type="number"
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Other Charges" name="otherCharges">
                <InputNumber type="number" min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col span={6}>
              <strong>Subtotal:</strong> {subtotal.toFixed(2)}
            </Col>
            <Col span={6}>
              <strong>Grand Total:</strong> {grandTotal.toFixed(2)}
            </Col>
            <Col span={6}>
              <Form.Item
                label="Paid Amount"
                name="paidAmount"
                rules={[
                  {
                    validator: (_, value) => {
                      // যদি কিছু না দেওয়া হয়, তাহলে ঠিক আছে
                      if (value === undefined) {
                        return Promise.resolve();
                      }

                      // Paid amount যদি গ্র্যান্ড টোটাল ছাড়িয়ে যায়
                      if (value >= grandTotal + 1) {
                        return Promise.reject(
                          new Error("Paid amount cannot exceed grand total"),
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber type="number" min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <strong>Due:</strong>{" "}
              <span className="text-red-600">{dueAmount.toFixed(2)}</span>
            </Col>
          </Row>
        </Card>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Enter additional notes..." />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create Purchase
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePurchaseFromNeedModal;
