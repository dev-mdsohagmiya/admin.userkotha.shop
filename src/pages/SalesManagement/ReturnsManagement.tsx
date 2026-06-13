// File: src/pages/SalesManagement/components/ReturnsManagement.tsx
import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Modal,
} from "antd";
import { Search, RotateCcw, Eye, QrCode } from "lucide-react";
import { DisplayCurrency } from "../../utils/currency";

export const ReturnsManagement: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const returnReasons = [
    { value: "damaged", label: "Damaged Product", color: "red" },
    { value: "wrong_item", label: "Wrong Item", color: "orange" },
    { value: "customer_return", label: "Customer Return", color: "blue" },
    { value: "quality_issue", label: "Quality Issue", color: "volcano" },
  ];

  const returnsData = [
    {
      key: "1",
      returnId: "RET-2024-0001",
      invoiceId: "INV-2024-1001",
      customer: "John Doe",
      product: "Chocolate Bar",
      quantity: 2,
      reason: "damaged",
      amount: 400,
      status: "pending",
      date: "2024-12-01",
    },
  ];

  const columns = [
    {
      title: "Return ID",
      dataIndex: "returnId",
      key: "returnId",
    },
    {
      title: "Invoice",
      dataIndex: "invoiceId",
      key: "invoiceId",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (reason: string) => {
        const reasonObj = returnReasons.find((r) => r.value === reason);
        return <Tag color={reasonObj?.color}>{reasonObj?.label}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => <DisplayCurrency amount={amount} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="link" icon={<Eye size={14} />} />
          <Button type="link" icon={<RotateCcw size={14} />} />
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      {/* Header Actions */}

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search returns..."
            prefix={<Search size={16} />}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            options={[
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
            ]}
          />
          <DatePicker placeholder="Select date" />
        </div>
        <Space>
          <Button icon={<QrCode size={16} />}>Scan Return QR</Button>
          <Button
            type="primary"
            icon={<RotateCcw size={16} />}
            onClick={() => setIsReturnModalOpen(true)}
          >
            New Return
          </Button>
        </Space>
      </div>

      {/* Returns Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={returnsData}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* New Return Modal */}
      <Modal
        title="Process New Return"
        open={isReturnModalOpen}
        onCancel={() => setIsReturnModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Input placeholder="Enter Invoice ID or Scan QR" />
          <Select
            placeholder="Select Return Reason"
            options={returnReasons}
            style={{ width: "100%" }}
          />
          <Input placeholder="Quantity" type="number" />
          <Input.TextArea placeholder="Additional notes..." rows={3} />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
            <Button type="primary">Process Return</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
