import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
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
  materialReceivingStorage,
  purchaseOrderStorage,
  ReceivedItem,
  stockStorage,
} from "../../../../moc/localStorageUtils";
import { DisplayCurrency } from "../../../../utils/currency";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface MaterialReceivingModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  purchaseOrder: any;
  onSuccess: () => void;
}

interface ReceivingItem extends ReceivedItem {
  quantityReceived: number;
  qualityStatus: "pending" | "passed" | "failed";
  notes?: string;
}

const MaterialReceivingModal: React.FC<MaterialReceivingModalProps> = ({
  open,
  setOpen,
  purchaseOrder,
  onSuccess,
}) => {
  const [receivingItems, setReceivingItems] = useState<ReceivingItem[]>([]);
  const [receivedBy, setReceivedBy] = useState<string>("");
  const [receivingDate, setReceivingDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Initialize receiving items from PO
  useEffect(() => {
    if (purchaseOrder) {
      const items: ReceivingItem[] = purchaseOrder.items.map((item: any) => ({
        id: `rec_item_${Date.now()}_${item.materialId}`,
        materialId: item.materialId,
        materialName: item.materialName,
        quantityOrdered: item.quantity,
        quantityReceived: item.quantity, // Default to full quantity
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        qualityStatus: "pending",
        notes: "",
      }));

      setReceivingItems(items);
      setReceivingDate(dayjs().format("YYYY-MM-DD"));
      setReceivedBy("Store Manager"); // Default, you can make this dynamic
    }
  }, [purchaseOrder]);

  const handleQuantityChange = (materialId: string, quantity: number) => {
    setReceivingItems((prev) =>
      prev.map((item) => {
        if (item.materialId === materialId) {
          const totalPrice = item.unitPrice * quantity;
          return { ...item, quantityReceived: quantity, totalPrice };
        }
        return item;
      }),
    );
  };

  const handleQualityStatusChange = (
    materialId: string,
    status: "pending" | "passed" | "failed",
  ) => {
    setReceivingItems((prev) =>
      prev.map((item) => {
        if (item.materialId === materialId) {
          return { ...item, qualityStatus: status };
        }
        return item;
      }),
    );
  };

  const handleNotesChange = (materialId: string, notes: string) => {
    setReceivingItems((prev) =>
      prev.map((item) => {
        if (item.materialId === materialId) {
          return { ...item, notes };
        }
        return item;
      }),
    );
  };

  const calculateReceivingStats = () => {
    const totalItems = receivingItems.length;
    const receivedItems = receivingItems.filter(
      (item) => item.quantityReceived > 0,
    ).length;
    const passedItems = receivingItems.filter(
      (item) => item.qualityStatus === "passed",
    ).length;
    const totalOrdered = receivingItems.reduce(
      (sum, item) => sum + item.quantityOrdered,
      0,
    );
    const totalReceived = receivingItems.reduce(
      (sum, item) => sum + item.quantityReceived,
      0,
    );

    const receivingPercentage =
      totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

    return {
      totalItems,
      receivedItems,
      passedItems,
      totalOrdered,
      totalReceived,
      receivingPercentage,
    };
  };

  const canCompleteReceiving = () => {
    return receivingItems.every(
      (item) => item.qualityStatus !== "pending" && item.quantityReceived >= 0,
    );
  };

  const handleCompleteReceiving = async () => {
    if (!canCompleteReceiving()) {
      toast.error(
        "Please set quality status for all items and ensure quantities are valid",
      );
      return;
    }

    if (!receivedBy.trim()) {
      toast.error("Please enter received by information");
      return;
    }

    try {
      // Create receiving record
      const receivingData = {
        poId: purchaseOrder.id,
        poNumber: purchaseOrder.poNumber,
        receivingDate: receivingDate,
        receivedBy: receivedBy,
        status: "completed" as const,
        items: receivingItems,
        notes: notes,
      };

      const receiving = materialReceivingStorage.createReceiving(receivingData);

      // Update stock levels for passed items
      const stockUpdates = stockStorage.receiveMaterials(receiving);

      // Update PO status to delivered if not already
      if (purchaseOrder.status !== "delivered") {
        purchaseOrderStorage.updatePOStatus(purchaseOrder.id, "delivered");
      }

      toast.success(
        <div>
          <div>Materials received successfully! {receiving.grnNumber}</div>
          <div>Stock updated for {stockUpdates.length} materials</div>
        </div>,
      );

      onSuccess();
      setOpen(false);
    } catch (err: any) {
      toast.error("Failed to complete material receiving");
      console.error(err);
    }
  };

  //   const getQualityStatusColor = (status: string) => {
  //     switch (status) {
  //       case "passed":
  //         return "green";
  //       case "failed":
  //         return "red";
  //       case "pending":
  //         return "orange";
  //       default:
  //         return "default";
  //     }
  //   };

  //   const getQualityStatusIcon = (status: string) => {
  //     switch (status) {
  //       case "passed":
  //         return <CheckCircleOutlined />;
  //       case "failed":
  //         return <CloseCircleOutlined />;
  //       case "pending":
  //         return <QuestionCircleOutlined />;
  //       default:
  //         return <QuestionCircleOutlined />;
  //     }
  //   };

  const columns = [
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      width: 200,
    },
    {
      title: "Ordered Qty",
      dataIndex: "quantityOrdered",
      key: "quantityOrdered",
      render: (quantity: number, record: ReceivingItem) => (
        <Text>
          {quantity} {record.unit}
        </Text>
      ),
      width: 120,
    },
    {
      title: "Received Qty",
      key: "quantityReceived",
      render: (_: any, record: ReceivingItem) => (
        <InputNumber
          value={record.quantityReceived}
          onChange={(value) =>
            handleQuantityChange(record.materialId, value || 0)
          }
          placeholder="0"
          min={0}
          max={record.quantityOrdered * 1.1} // Allow 10% overage
          precision={2}
          style={{ width: "120px" }}
        />
      ),
      width: 140,
    },
    {
      title: "Quality Status",
      key: "qualityStatus",
      render: (_: any, record: ReceivingItem) => (
        <Select
          value={record.qualityStatus}
          onChange={(value) =>
            handleQualityStatusChange(record.materialId, value)
          }
          style={{ width: "140px" }}
        >
          <Option value="pending">
            <Space>
              <QuestionCircleOutlined />
              <span>Pending</span>
            </Space>
          </Option>
          <Option value="passed">
            <Space>
              <CheckCircleOutlined />
              <span>Passed</span>
            </Space>
          </Option>
          <Option value="failed">
            <Space>
              <CloseCircleOutlined />
              <span>Failed</span>
            </Space>
          </Option>
        </Select>
      ),
      width: 160,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => <DisplayCurrency amount={price} />,
      width: 120,
    },
    {
      title: "Total Value",
      key: "totalPrice",
      render: (_: any, record: ReceivingItem) => (
        <Text strong>
          <DisplayCurrency amount={record.totalPrice} />
        </Text>
      ),
      width: 120,
    },
    {
      title: "Notes",
      key: "notes",
      render: (_: any, record: ReceivingItem) => (
        <Input
          value={record.notes}
          onChange={(e) => handleNotesChange(record.materialId, e.target.value)}
          placeholder="Quality notes..."
          style={{ width: "200px" }}
        />
      ),
    },
  ];

  const stats = calculateReceivingStats();

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1400}
      title={
        <div className="flex items-center gap-2">
          <TruckOutlined />
          <Title level={4} className="mb-0">
            Receive Materials - {purchaseOrder?.poNumber}
          </Title>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alert */}
        <Alert
          message="Material Receiving in Progress"
          description="Record received quantities and quality status for each material. Stock will be updated for items that pass quality check."
          type="info"
          showIcon
        />

        {/* Receiving Header */}
        <Card title="Receiving Details" size="small">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Received By" required>
              <Input
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Enter receiver name"
              />
            </Form.Item>

            <Form.Item label="Receiving Date">
              <DatePicker
                value={receivingDate ? dayjs(receivingDate) : null}
                onChange={(date) =>
                  setReceivingDate(date?.format("YYYY-MM-DD") || "")
                }
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Supplier">
              <Input value={purchaseOrder?.supplierName} disabled />
            </Form.Item>
          </div>

          <Form.Item label="Notes">
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any general notes for this receiving..."
              rows={2}
            />
          </Form.Item>
        </Card>

        {/* Receiving Statistics */}
        <Card title="Receiving Progress" size="small">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <Text type="secondary">Total Items</Text>
              <Title level={3} className="mt-1">
                {stats.totalItems}
              </Title>
            </div>
            <div>
              <Text type="secondary">Received</Text>
              <Title level={3} className="mt-1 text-primary-600">
                {stats.receivedItems}/{stats.totalItems}
              </Title>
            </div>
            <div>
              <Text type="secondary">Quality Passed</Text>
              <Title level={3} className="mt-1 text-green-600">
                {stats.passedItems}
              </Title>
            </div>
            <div>
              <Text type="secondary">Receiving Rate</Text>
              <div className="mt-1">
                <Progress
                  type="circle"
                  percent={Math.round(stats.receivingPercentage)}
                  size={60}
                  format={(percent) => `${percent}%`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Receiving Items */}
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Material Receiving Details</span>
              <Space>
                <Tag color="blue">{stats.totalItems} items</Tag>
                <Tag color="green">{stats.passedItems} passed</Tag>
                <Tag color="orange">
                  {stats.totalItems - stats.passedItems} pending
                </Tag>
              </Space>
            </div>
          }
        >
          <Table
            dataSource={receivingItems}
            columns={columns}
            rowKey="materialId"
            pagination={false}
            size="small"
            scroll={{ x: 1000 }}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <Text strong>Total Received Value</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>
                      <DisplayCurrency
                        amount={receivingItems.reduce(
                          (sum, item) => sum + item.totalPrice,
                          0,
                        )}
                      />
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Quality Guidelines */}
        <Card title="Quality Check Guidelines" size="small" type="inner">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Space>
                <CheckCircleOutlined className="text-green-600" />
                <Text strong>Passed:</Text>
              </Space>
              <Text type="secondary">
                {" "}
                Material meets all quality standards and can be accepted into
                stock.
              </Text>
            </div>
            <div>
              <Space>
                <CloseCircleOutlined className="text-red-600" />
                <Text strong>Failed:</Text>
              </Space>
              <Text type="secondary">
                {" "}
                Material does not meet quality standards. Do not accept into
                stock.
              </Text>
            </div>
            <div>
              <Space>
                <QuestionCircleOutlined className="text-orange-600" />
                <Text strong>Pending:</Text>
              </Space>
              <Text type="secondary">
                {" "}
                Quality check not yet performed or decision pending.
              </Text>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Text type="secondary">
            {stats.passedItems} of {stats.totalItems} items passed quality check
          </Text>
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleCompleteReceiving}
              disabled={!canCompleteReceiving() || !receivedBy.trim()}
              icon={<CheckCircleOutlined />}
            >
              Complete Receiving
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default MaterialReceivingModal;
