import { Card, Descriptions, Divider, Modal, Table, Tag } from "antd";
import dayjs from "dayjs";
import React from "react";
import { IPurchase } from "../../../types/purchase";
import PageMeta from "../Meta/PageMeta";

interface DetailsPurchaseModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: IPurchase;
}

const DetailsPurchaseModal: React.FC<DetailsPurchaseModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "green";
      case "Due":
        return "red";
      case "Partial":
        return "orange";
      default:
        return "default";
    }
  };

  const itemColumns = [
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number, record: any) => `${qty} ${record.unit}`,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total: number) => `$${total.toFixed(2)}`,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={900}
      className="rounded-xl shadow-2xl"
      bodyStyle={{ padding: "20px" }}
    >
      <PageMeta
        title="Purchase Details"
        description="View details of the purchase order."
      />

      {/* Header */}
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              Purchase Details - {data?.purchaseId}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Purchase Date:{" "}
              {data?.purchaseDate
                ? dayjs(data.purchaseDate).format("DD/MM/YYYY")
                : "—"}
            </p>
          </div>
          {data?.paymentStatus && (
            <Tag
              color={getPaymentStatusColor(data.paymentStatus)}
              className="text-lg px-3 py-1"
            >
              {data.paymentStatus}
            </Tag>
          )}
        </div>
      </div>

      {/* Purchase Summary */}
      <Card style={{ marginBottom: 24 }} title="Purchase Summary">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Purchase ID">
            {data?.purchaseId}
          </Descriptions.Item>
          <Descriptions.Item label="Invoice No">
            {data?.invoiceNo}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">
            {data?.supplierName}
          </Descriptions.Item>
          <Descriptions.Item label="Purchase Type">
            {data?.purchaseType}
          </Descriptions.Item>
          <Descriptions.Item label="Warehouse">
            {data?.warehouseName}
          </Descriptions.Item>
          <Descriptions.Item label="Purchase By">
            {data?.purchaseBy || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {data?.createdBy.name}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                data?.status === "Active"
                  ? "green"
                  : data?.status === "Cancel"
                  ? "red"
                  : "orange"
              }
            >
              {data?.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Purchase Items */}
      {data?.items && data.items.length > 0 && (
        <Card
          style={{ marginBottom: 24 }}
          title={`Purchase Items (${data.items.length})`}
        >
          <Table
            columns={itemColumns}
            dataSource={data.items}
            rowKey="id"
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Subtotal</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <strong>${data.subTotal.toFixed(2)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      )}

      {/* Financial Summary */}
      <Card title="Financial Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Purchase Amount Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Purchase Amount:</span>
                <span>${data?.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({data?.discountType}):</span>
                <span>-${(data?.discountValue || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT ({data?.vatPercentage}%):</span>
                <span>
                  $
                  {(
                    ((data?.subTotal || 0) - (data?.discountValue || 0)) *
                    ((data?.vatPercentage || 0) / 100)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Other Charges:</span>
                <span>${(data?.otherCharges || 0).toFixed(2)}</span>
              </div>
              <Divider />
              <div className="flex justify-between font-semibold">
                <span>Grand Total:</span>
                <span>${(data?.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span>${(data?.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Amount:</span>
                <span>${(data?.dueAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Tag color={getPaymentStatusColor(data?.paymentStatus || "")}>
                  {data?.paymentStatus}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {data?.notes && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Notes:{" "}
            </span>
            <p className="inline italic text-gray-700 dark:text-gray-300">
              {data.notes}
            </p>
          </div>
        )}
      </Card>
    </Modal>
  );
};

export default DetailsPurchaseModal;
