import { Modal, Descriptions, Tag, Table } from "antd";
import React from "react";
import { TbCurrencyTaka } from "react-icons/tb";

interface OrderDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderId: string | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  open,
  setOpen,
  orderId,
}) => {
  // TODO: Fetch order details from API
  const orderData = {
    orderId: orderId || "N/A",
    customerName: "John Doe",
    email: "john@example.com",
    phone: "+880 1234567890",
    status: "processing",
    totalAmount: 5000,
    orderDate: "2026-01-16",
    deliveryAddress: "123 Main Street, Dhaka, Bangladesh",
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "orange",
      hold: "red",
      processing: "blue",
      shipped: "purple",
      delivered: "green",
      cancelled: "default",
    };
    return colors[status] || "default";
  };

  const orderItems = [
    {
      key: "1",
      product: "Product 1",
      quantity: 2,
      price: 1500,
      total: 3000,
    },
    {
      key: "2",
      product: "Product 2",
      quantity: 1,
      price: 2000,
      total: 2000,
    },
  ];

  const columns = [
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
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <span className="flex items-center">
          <TbCurrencyTaka />
          {price.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => (
        <span className="flex items-center">
          <TbCurrencyTaka />
          {total.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title="Order Details"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={800}
    >
      <div className="space-y-4">
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Order ID">
            {orderData.orderId}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(orderData.status)}>
              {orderData.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Customer Name">
            {orderData.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{orderData.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{orderData.phone}</Descriptions.Item>
          <Descriptions.Item label="Order Date">
            {orderData.orderDate}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Address" span={2}>
            {orderData.deliveryAddress}
          </Descriptions.Item>
        </Descriptions>

        <div className="gap-4">
          <h3 className="text-lg font-semibold mb-2">Order Items</h3>
          <Table
            dataSource={orderItems}
            columns={columns}
            pagination={false}
            size="middle"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600 flex items-center">
            <TbCurrencyTaka />
            {orderData.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
