import { ShoppingCartOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  PurchaseOrderItem,
  purchaseOrderStorage,
  supplierStorage,
} from "../../../../moc/localStorageUtils";
import { DisplayCurrency } from "../../../../utils/currency";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CreatePurchaseOrderModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requisition: any;
}

interface POItemWithSupplier extends PurchaseOrderItem {
  availableSuppliers: any[];
  selectedSupplier?: string;
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  open,
  setOpen,
  requisition,
}) => {
  const [poItems, setPoItems] = useState<POItemWithSupplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [expectedDelivery, setExpectedDelivery] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Initialize PO items from requisition
  useEffect(() => {
    if (requisition) {
      const itemsWithSuppliers: POItemWithSupplier[] = requisition.items.map(
        (item: any) => {
          // const material = mockRawMaterials.find(
          //   (m) => m.id === item.materialId
          // );
          const availableSuppliers = supplierStorage
            .getAllSuppliers()
            .filter((sup) => sup?.materials?.includes(item.materialId));

          return {
            id: `po_item_${Date.now()}_${item.materialId}`,
            materialId: item.materialId,
            materialName: item.materialName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: 0,
            totalPrice: 0,
            availableSuppliers,
            selectedSupplier: availableSuppliers[0]?.id,
          };
        },
      );

      setPoItems(itemsWithSuppliers);

      // Set default expected delivery (7 days from now)
      const defaultDelivery = dayjs().add(7, "day").format("YYYY-MM-DD");
      setExpectedDelivery(defaultDelivery);
    }
  }, [requisition]);

  const handleUnitPriceChange = (materialId: string, unitPrice: number) => {
    setPoItems((prev) =>
      prev.map((item) => {
        if (item.materialId === materialId) {
          const totalPrice = item.quantity * unitPrice;
          return { ...item, unitPrice, totalPrice };
        }
        return item;
      }),
    );
  };

  const handleSupplierChange = (materialId: string, supplierId: string) => {
    setPoItems((prev) =>
      prev.map((item) => {
        if (item.materialId === materialId) {
          return { ...item, selectedSupplier: supplierId };
        }
        return item;
      }),
    );
  };

  const calculateTotals = () => {
    const subTotal = poItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = 0; // You can add discount logic later
    const totalAmount = subTotal - discount;

    return { subTotal, discount, totalAmount };
  };

  const canCreatePO = () => {
    return poItems.every((item) => item.unitPrice > 0 && item.selectedSupplier);
  };

  const handleCreatePO = async () => {
    if (!canCreatePO()) {
      toast.error("Please set unit prices and suppliers for all items");
      return;
    }

    if (!selectedSupplier) {
      toast.error("Please select a primary supplier");
      return;
    }

    try {
      const { subTotal, discount, totalAmount } = calculateTotals();

      const poItemsFinal: PurchaseOrderItem[] = poItems.map((item) => ({
        id: item.id,
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        supplierId: item.selectedSupplier,
      }));

      const supplier = supplierStorage.getSupplierById(selectedSupplier);

      const poData = {
        requisitionId: requisition.id,
        requisitionNumber: requisition.requisitionNumber,
        supplierId: selectedSupplier,
        supplierName: supplier?.name || "Unknown Supplier",
        poDate: new Date().toISOString(),
        expectedDelivery: expectedDelivery,
        status: "draft" as const,
        subTotal,
        discount,
        totalAmount,
        notes,
        items: poItemsFinal,
      };

      const po = purchaseOrderStorage.createPO(poData);

      toast.success(`Purchase Order ${po.poNumber} created successfully!`);
      setOpen(false);
    } catch (err: any) {
      toast.error("Failed to create purchase order");
      console.error(err);
    }
  };

  const columns = [
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      width: 200,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: POItemWithSupplier) => (
        <Text strong>
          {quantity} {record.unit}
        </Text>
      ),
      width: 120,
    },
    {
      title: "Supplier",
      key: "supplier",
      render: (_: any, record: POItemWithSupplier) => (
        <Select
          value={record.selectedSupplier}
          onChange={(value) => handleSupplierChange(record.materialId, value)}
          style={{ width: "200px" }}
          placeholder="Select Supplier"
        >
          {record.availableSuppliers.map((supplier) => (
            <Option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </Option>
          ))}
        </Select>
      ),
      width: 200,
    },
    {
      title: "Unit Price",
      key: "unitPrice",
      render: (_: any, record: POItemWithSupplier) => (
        <InputNumber
          value={record.unitPrice}
          onChange={(value) =>
            handleUnitPriceChange(record.materialId, value || 0)
          }
          placeholder="0.00"
          min={0}
          precision={2}
          style={{ width: "120px" }}
          addonBefore="TK"
        />
      ),
      width: 150,
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_: any, record: POItemWithSupplier) => (
        <Text strong>
          <DisplayCurrency amount={record.totalPrice} />
        </Text>
      ),
      width: 120,
    },
  ];

  const { subTotal, discount, totalAmount } = calculateTotals();
  const primarySupplier = supplierStorage.getSupplierById(selectedSupplier);

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1200}
      title={
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined />
          <Title level={4} className="mb-0">
            Create Purchase Order - {requisition?.requisitionNumber}
          </Title>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alert */}
        <Alert
          message="Create purchase order from approved requisition"
          description="Set suppliers and unit prices for each material. All items will be included in one PO."
          type="info"
          showIcon
        />

        {/* PO Header Information */}
        <Card title="Purchase Order Details" size="small">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Primary Supplier">
              <Select
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                placeholder="Select primary supplier"
                style={{ width: "100%" }}
              >
                {Array.from(
                  new Set(poItems.flatMap((item) => item.availableSuppliers)),
                ).map((supplier) => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Expected Delivery Date">
              <DatePicker
                value={expectedDelivery ? dayjs(expectedDelivery) : null}
                onChange={(date) =>
                  setExpectedDelivery(date?.format("YYYY-MM-DD") || "")
                }
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Product">
              <Input value={requisition?.productName} disabled />
            </Form.Item>
          </div>

          <Form.Item label="Notes">
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this purchase order..."
              rows={2}
            />
          </Form.Item>
        </Card>

        {/* Supplier Information */}
        {primarySupplier && (
          <Card title="Supplier Information" size="small">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text strong>Company: </Text>
                <Text>{primarySupplier.name}</Text>
              </div>
              <div>
                <Text strong>Contact: </Text>
                <Text>{primarySupplier.contactPerson}</Text>
              </div>
              <div>
                <Text strong>Email: </Text>
                <Text>{primarySupplier.email}</Text>
              </div>
              <div>
                <Text strong>Phone: </Text>
                <Text>{primarySupplier.phone}</Text>
              </div>
              <div className="col-span-2">
                <Text strong>Address: </Text>
                <Text>{primarySupplier.addressLine1}</Text>
              </div>
            </div>
          </Card>
        )}

        {/* PO Items */}
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Purchase Order Items</span>
              <Tag color="blue">{poItems.length} items</Tag>
            </div>
          }
        >
          <Table
            dataSource={poItems}
            columns={columns}
            rowKey="materialId"
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Total Amount</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>
                      <DisplayCurrency amount={totalAmount} />
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Order Summary */}
        <Card title="Order Summary" size="small">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <Text type="secondary">Sub Total</Text>
              <Title level={4} className="mt-1">
                <DisplayCurrency amount={subTotal} />
              </Title>
            </div>
            <div>
              <Text type="secondary">Discount</Text>
              <Title level={4} className="mt-1">
                <DisplayCurrency amount={discount} />
              </Title>
            </div>
            <div>
              <Text type="secondary">Total Amount</Text>
              <Title level={3} className="mt-1 text-green-600">
                <DisplayCurrency amount={totalAmount} />
              </Title>
            </div>
            <div>
              <Text type="secondary">Items</Text>
              <Title level={4} className="mt-1">
                {poItems.length}
              </Title>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Text type="secondary">
            {poItems.filter((item) => item.unitPrice > 0).length} of{" "}
            {poItems.length} items priced
          </Text>
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleCreatePO}
              disabled={!canCreatePO() || !selectedSupplier}
              icon={<ShoppingCartOutlined />}
            >
              Create Purchase Order
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePurchaseOrderModal;
