import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Table,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useCreatePurchaseReturnMutation } from "../../../redux/features/purchases-management/purchasesManagementApi";
import { IPurchase } from "../../../types/purchase";
import { DisplayCurrency } from "../../../utils/currency";

interface ReturnPurchaseModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseData?: IPurchase;
  onSuccess?: () => void;
}

const ReturnPurchaseModal: React.FC<ReturnPurchaseModalProps> = ({
  open,
  setOpen,
  purchaseData,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);

  // API hook
  const [createPurchaseReturn, { isLoading }] =
    useCreatePurchaseReturnMutation();

  useEffect(() => {
    if (open && purchaseData?.items) {
      // Initialize return items with purchased items
      const initialFields: any = {};
      const initialReturnItems = purchaseData.items.map((item) => {
        initialFields[`return_qty_${item.id}`] = 0;
        return {
          ...item,
          returnQuantity: 0,
          returnAmount: 0,
        };
      });
      setReturnItems(initialReturnItems);
      setTotalReturnAmount(0);
      form.resetFields();
      form.setFieldsValue(initialFields);
    }
  }, [open, purchaseData, form]);

  const handleReturnQuantityChange = (
    itemId: string,
    returnQuantity: number,
  ) => {
    const updatedItems = returnItems.map((item) => {
      if (item.id === itemId) {
        // Find the correct quantity field
        // const availableQuantity =
        //   item.quantity ||
        //   item.qty ||
        //   item.orderedQuantity ||
        //   item.orderQuantity ||
        //   0;

        // Allow invalid value to be set so form validation can catch and show error
        const validReturnQuantity = Math.max(0, returnQuantity);

        // Update form value
        form.setFieldsValue({
          [`return_qty_${itemId}`]: validReturnQuantity,
        });

        const returnAmount = validReturnQuantity * item.unitPrice;
        return {
          ...item,
          returnQuantity: validReturnQuantity,
          returnAmount,
        };
      }
      return item;
    });
    setReturnItems(updatedItems);

    // Calculate total return amount
    const total = updatedItems.reduce(
      (sum, item) => sum + item.returnAmount,
      0,
    );
    setTotalReturnAmount(total);
  };

  const handleSubmit = async (values: any) => {
    if (!purchaseData) return;

    try {
      // Filter items that have return quantity > 0
      const itemsToReturn = returnItems.filter(
        (item) => item.returnQuantity > 0,
      );

      if (itemsToReturn.length === 0) {
        message.warning("Please select at least one item to return");
        return;
      }

      // Validate required fields
      if (!purchaseData.warehouseId) {
        message.error("Warehouse information is missing for this purchase");
        console.error("Missing warehouseId in purchaseData:", purchaseData);
        return;
      }

      if (!purchaseData.supplierId) {
        message.error("Supplier information is missing for this purchase");
        console.error("Missing supplierId in purchaseData:", purchaseData);
        return;
      }

      // Prepare return data for API matching the new format
      const category =
        purchaseData.purchaseType === "Packaging Material"
          ? "Packaging"
          : "Production";

      const returnData = {
        purchaseId: purchaseData.id,
        supplierId: purchaseData.supplierId,
        warehouseId: purchaseData.warehouseId,
        category: category,
        returnReason: values.reason || "",
        returnDate: new Date().toISOString(),
        items: itemsToReturn.map((item) => ({
          materialId: item.materialId,
          returnQty: item.returnQuantity,
          unitPrice: item.unitPrice,
          remark: values[`remark_${item.id}`] || "",
        })),
        discountGiven: parseFloat(values.discountGiven || 0),
        paidAmount: parseFloat(values.paidAmount || 0),
        notes: values.notes || "",
      };

      // Call API to create purchase return
      await createPurchaseReturn(returnData).unwrap();
      message.success("Purchase return created successfully");
      form.resetFields();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("❌ Error creating return:", error);
      message.error(error?.data?.message || "Failed to create purchase return");
    }
  };

  const columns = [
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
      render: (_: any, record: any) => record.material?.name || "N/A",
    },
    {
      title: "Purchased Qty",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number, record: any) =>
        `${qty} ${record.unit?.symbol || record.unit?.name || "Unit"}`,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => <DisplayCurrency amount={price} />,
    },
    {
      title: "Return Quantity",
      key: "returnQuantity",
      render: (_: any, record: any) => {
        // Try different possible field names
        const availableQuantity =
          record.quantity ||
          record.qty ||
          record.orderedQuantity ||
          record.orderQuantity ||
          0;

        return (
          <Form.Item
            name={`return_qty_${record.id}`}
            initialValue={record.returnQuantity}
            style={{ marginBottom: 0 }}
            rules={[
              {
                validator: (_, value) => {
                  if (value > availableQuantity) {
                    return Promise.reject(
                      new Error(
                        `Return quantity cannot exceed ${availableQuantity}`,
                      ),
                    );
                  }
                  if (value < 0) {
                    return Promise.reject(
                      new Error("Return quantity cannot be negative"),
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
              // Removed max prop to allow validation error to show
              value={record.returnQuantity}
              onChange={(value) =>
                handleReturnQuantityChange(record.id, value || 0)
              }
              style={{ width: "100%" }}
              placeholder="Enter return qty"
              status={record.returnQuantity > availableQuantity ? "error" : ""}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Return Amount",
      key: "returnAmount",
      render: (_: any, record: any) => (
        <DisplayCurrency amount={record.returnAmount} />
      ),
    },
    {
      title: "Remark",
      key: "remark",
      render: (_: any, record: any) => (
        <Form.Item
          name={`remark_${record.id}`}
          style={{ marginBottom: 0 }}
          initialValue=""
        >
          <Input placeholder="Enter remark" size="small" />
        </Form.Item>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1000}
      title={`Return Purchase - ${purchaseData?.purchaseId}`}
      className="rounded-xl shadow-2xl"
      style={{ padding: "20px" }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Purchase Info */}
        <Card style={{ marginBottom: 24 }} title="Purchase Information">
          {/* Show warning if warehouse or supplier is missing */}
          {(!purchaseData?.warehouseId || !purchaseData?.supplierId) && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded"
              style={{ color: "#dc2626" }}
            >
              <strong>⚠️ Warning:</strong> Missing required information:
              {!purchaseData?.warehouseId && <span> Warehouse</span>}
              {!purchaseData?.supplierId && <span> Supplier</span>}. Please
              ensure purchase has complete information.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Purchase ID:</strong> {purchaseData?.purchaseId}
            </div>
            <div>
              <strong>Supplier:</strong>{" "}
              {purchaseData?.supplier?.name ||
                purchaseData?.supplierName ||
                "⚠️ Missing"}
            </div>
            <div>
              <strong>Supplier Code:</strong>{" "}
              {purchaseData?.supplier?.supplierCode || "N/A"}
            </div>
            <div>
              <strong>Warehouse Name:</strong>{" "}
              {purchaseData?.warehouseName || "⚠️ Missing"}
            </div>
            <div>
              <strong>Contact Person:</strong>{" "}
              {purchaseData?.supplier?.contactPerson || "N/A"}
            </div>
            <div>
              <strong>Supplier Phone:</strong>{" "}
              {purchaseData?.supplier?.phone1 || "N/A"}
            </div>
            <div>
              <strong>Supplier Email:</strong>{" "}
              {purchaseData?.supplier?.email || "N/A"}
            </div>
            <div>
              <strong>Purchase Date:</strong>{" "}
              {purchaseData?.purchaseDate
                ? dayjs(purchaseData.purchaseDate).format("DD/MM/YYYY")
                : "—"}
            </div>
            <div>
              <strong>Invoice No:</strong> {purchaseData?.invoiceNo || "N/A"}
            </div>
            <div>
              <strong>Purchase Type:</strong>{" "}
              {purchaseData?.purchaseType || "N/A"}
            </div>
            <div>
              <strong>Grand Total:</strong>{" "}
              {purchaseData?.grandTotal ? (
                <DisplayCurrency amount={purchaseData.grandTotal} />
              ) : (
                "N/A"
              )}
            </div>
            <div>
              <strong>Payment Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  purchaseData?.paymentStatus === "Paid"
                    ? "bg-green-100 text-green-800"
                    : purchaseData?.paymentStatus === "Partial"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {purchaseData?.paymentStatus || "N/A"}
              </span>
            </div>
          </div>
        </Card>

        {/* Return Items */}
        <Card style={{ marginBottom: 24 }} title="Return Items">
          <Table
            columns={columns}
            dataSource={returnItems}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        {/* Return Summary */}
        <Card style={{ marginBottom: 24 }} title="Return Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-3">Items to Return</h4>
              <div className="space-y-2">
                {returnItems
                  .filter((item) => item.returnQuantity > 0)
                  .map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.material?.name || "N/A"}:</span>
                      <span>
                        {item.returnQuantity}{" "}
                        {item.unit?.symbol || item.unit?.name || "Unit"} @
                        <DisplayCurrency amount={item.unitPrice} />
                      </span>
                    </div>
                  ))}
                <Divider />
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span>
                    {
                      returnItems.filter((item) => item.returnQuantity > 0)
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span>
                    {returnItems
                      .filter((item) => item.returnQuantity > 0)
                      .reduce((sum, item) => sum + item.returnQuantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Return Amount:</span>
                  <span>
                    <DisplayCurrency amount={totalReturnAmount} />
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Form.Item
                label="Return Reason"
                name="reason"
                rules={[
                  { required: true, message: "Please enter return reason" },
                ]}
              >
                <Input.TextArea
                  placeholder="Enter reason for return"
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                label="Discount Given"
                name="discountGiven"
                initialValue={0}
                rules={[
                  { required: true, message: "Please enter discount amount" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter discount amount"
                  prefix="TK"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Paid Amount"
                name="paidAmount"
                initialValue={0}
                rules={[
                  { required: true, message: "Please enter paid amount" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter paid amount"
                  prefix="TK"
                  precision={2}
                />
              </Form.Item>

              <Form.Item label="Additional Notes" name="notes">
                <Input.TextArea
                  placeholder="Additional notes (optional)"
                  rows={2}
                />
              </Form.Item>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={
              totalReturnAmount === 0 ||
              !purchaseData?.warehouseId ||
              !purchaseData?.supplierId
            }
            title={
              !purchaseData?.warehouseId || !purchaseData?.supplierId
                ? "Missing required purchase information (warehouse/supplier)"
                : ""
            }
          >
            Confirm Return
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ReturnPurchaseModal;
