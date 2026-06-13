import {
  Alert,
  Button,
  Descriptions,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { FileText, Package } from "lucide-react";
import { FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { requisitionStorage } from "../../../../moc/localStorageUtils";

const { Title, Text } = Typography;

interface RequisitionDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requisition: any;
  onStatusChange: () => void;
}

const RequisitionDetailsModal: React.FC<RequisitionDetailsModalProps> = ({
  open,
  setOpen,
  requisition,
  onStatusChange,
}) => {
  const handleApprove = () => {
    const updated = requisitionStorage.updateRequisitionStatus(
      requisition.id,
      "approved"
    );
    if (updated) {
      toast.success(`Requisition ${requisition.requisitionNumber} approved!`);
      onStatusChange();
      setOpen(false);
    }
  };

  const handleReject = () => {
    const updated = requisitionStorage.updateRequisitionStatus(
      requisition.id,
      "rejected"
    );
    if (updated) {
      toast.success(`Requisition ${requisition.requisitionNumber} rejected!`);
      onStatusChange();
      setOpen(false);
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
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
    },
    {
      title: "Type",
      dataIndex: "materialType",
      key: "materialType",
      render: (type: string) => (
        <Tag color={type === "raw" ? "blue" : "green"}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const totalQuantity = requisition.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1000}
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <Title level={4} className="mb-0">
            Requisition Details - {requisition.requisitionNumber}
          </Title>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Alert */}
        <Alert
          style={{ marginBottom: 16 }}
          message={`Requisition is ${requisition.status.toUpperCase()}`}
          type={getStatusColor(requisition.status) as any}
          showIcon
          action={
            requisition.status === "pending" && (
              <Space>
                <Button
                  size="small"
                  type="primary"
                  icon={<FiCheck />}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<FiX />}
                  onClick={handleReject}
                >
                  Reject
                </Button>
              </Space>
            )
          }
        />

        {/* Basic Information */}
        <Descriptions bordered column={2} size="small" className="">
          <Descriptions.Item label="Requisition Number" span={1}>
            <Tag color="blue">{requisition.requisitionNumber}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={1}>
            <Tag color={getStatusColor(requisition.status)}>
              {requisition.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Product" span={1}>
            {requisition.productName}
          </Descriptions.Item>
          <Descriptions.Item label="Batch Size" span={1}>
            {requisition.batchSize} units
          </Descriptions.Item>
          <Descriptions.Item label="Purpose" span={2}>
            {requisition.purpose}
          </Descriptions.Item>
          <Descriptions.Item label="Requested By" span={1}>
            {requisition.requestedBy}
          </Descriptions.Item>
          <Descriptions.Item label="Request Date" span={1}>
            {new Date(requisition.requisitionDate).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {/* Materials List */}
        <div className="mt-4">
          <Title level={5} className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Requested Materials ({requisition.items.length} items)
          </Title>
          <Table
            dataSource={requisition.items}
            columns={itemColumns}
            rowKey="id"
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{totalQuantity.toFixed(2)} units</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>

        {/* Action Buttons */}
        {requisition.status === "pending" && (
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button danger onClick={handleReject}>
              Reject Requisition
            </Button>
            <Button type="primary" onClick={handleApprove}>
              Approve Requisition
            </Button>
          </div>
        )}

        {requisition.status === "approved" && (
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Close</Button>
            <Button
              type="primary"
              onClick={() => toast.info("PO creation coming soon!")}
            >
              Create Purchase Order
            </Button>
          </div>
        )}

        {requisition.status === "rejected" && (
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RequisitionDetailsModal;
