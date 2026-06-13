import {
  Alert,
  Button,
  Card,
  Descriptions,
  Modal,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import { purchaseOrderStorage } from "../../../../moc/localStorageUtils";
import { DisplayCurrency } from "../../../../utils/currency";

const { Title, Text } = Typography;

interface PODetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  purchaseOrder: any;
  onStatusChange: () => void;
}

const PODetailsModal: React.FC<PODetailsModalProps> = ({
  open,
  setOpen,
  purchaseOrder,
  onStatusChange,
}) => {
  const handleStatusUpdate = (newStatus: string) => {
    const updated = purchaseOrderStorage.updatePOStatus(
      purchaseOrder.id,
      newStatus as any,
    );
    if (updated) {
      toast.success(
        `PO ${purchaseOrder.poNumber} status updated to ${newStatus}!`,
      );
      onStatusChange();
    }
  };

  const getCurrentStep = () => {
    switch (purchaseOrder.status) {
      case "draft":
        return 0;
      case "sent":
        return 1;
      case "confirmed":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  const itemColumns = [
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: any) => (
        <Text strong>
          {quantity} {record.unit}
        </Text>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => <DisplayCurrency amount={price} />,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => (
        <Text strong>
          <DisplayCurrency amount={price} />
        </Text>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "default";
      case "sent":
        return "blue";
      case "confirmed":
        return "orange";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  // Simple steps without icons first
  const stepItems = [
    {
      title: "Draft",
    },
    {
      title: "Sent",
    },
    {
      title: "Confirmed",
    },
    {
      title: "Delivered",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1000}
      title={
        <div>
          <Title level={4} className="mb-0">
            Purchase Order - {purchaseOrder.poNumber}
          </Title>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Steps - Simplified without icons */}
        <Card>
          <Steps current={getCurrentStep()} size="small" items={stepItems} />
        </Card>

        {/* Status Alert */}
        <Alert
          message={`Purchase Order is ${purchaseOrder.status.toUpperCase()}`}
          type={
            purchaseOrder.status === "delivered"
              ? "success"
              : purchaseOrder.status === "confirmed"
                ? "warning"
                : purchaseOrder.status === "sent"
                  ? "info"
                  : "info"
          }
          showIcon
          action={
            <Space>
              {purchaseOrder.status === "draft" && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleStatusUpdate("sent")}
                >
                  Mark as Sent
                </Button>
              )}
              {purchaseOrder.status === "sent" && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleStatusUpdate("confirmed")}
                >
                  Mark as Confirmed
                </Button>
              )}
              {purchaseOrder.status === "confirmed" && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleStatusUpdate("delivered")}
                >
                  Mark as Delivered
                </Button>
              )}
            </Space>
          }
        />

        {/* Basic Information */}
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="PO Number">
            <Tag color="blue">{purchaseOrder.poNumber}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Requisition">
            {purchaseOrder.requisitionNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">
            {purchaseOrder.supplierName}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(purchaseOrder.status)}>
              {purchaseOrder.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="PO Date">
            {new Date(purchaseOrder.poDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Expected Delivery">
            {new Date(purchaseOrder.expectedDelivery).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount" span={2}>
            <Title level={4} className="text-green-600 mb-0">
              <DisplayCurrency amount={purchaseOrder.totalAmount} />
            </Title>
          </Descriptions.Item>
          {purchaseOrder.notes && (
            <Descriptions.Item label="Notes" span={2}>
              {purchaseOrder.notes}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* PO Items */}
        <Card title="Order Items">
          <Table
            dataSource={purchaseOrder.items}
            columns={itemColumns}
            rowKey="id"
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Grand Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>
                      <DisplayCurrency amount={purchaseOrder.totalAmount} />
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => setOpen(false)}>Close</Button>

          {purchaseOrder.status === "draft" && (
            <Button type="primary" onClick={() => handleStatusUpdate("sent")}>
              Mark as Sent to Supplier
            </Button>
          )}

          {purchaseOrder.status === "sent" && (
            <Button
              type="primary"
              onClick={() => handleStatusUpdate("confirmed")}
            >
              Mark as Confirmed
            </Button>
          )}

          {purchaseOrder.status === "confirmed" && (
            <Button
              type="primary"
              onClick={() => handleStatusUpdate("delivered")}
            >
              Mark as Delivered
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PODetailsModal;
