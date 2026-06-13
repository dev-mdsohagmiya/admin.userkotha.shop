import {
  EditOutlined,
  PrinterOutlined,
  RotateLeftOutlined,
} from "@ant-design/icons";
import { Button, Card, Descriptions, Divider, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import ReturnPurchaseModal from "../../components/common/Modals/ReturnPurchaseModal";
import UpdatePurchaseModal from "../../components/common/Modals/UpdatePurchaseModal";
import PurchasePaymentModal from "../../components/common/Modals/PurchasePaymentModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import PrintComponent from "../../components/common/PrintComponent";
import { useGetPurchaseByIdQuery } from "../../redux/features/purchases-management/purchasesManagementApi";
import PurchaseViewSkeleton from "../../components/skeleton/PurchaseViewSkeleton";
import { toast } from "react-toastify";
import { DisplayCurrency } from "../../utils/currency";

const PurchaseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // API hook
  const {
    data: purchaseData,
    isLoading,
    refetch: refetchPurchase,
  } = useGetPurchaseByIdQuery(id!, {
    skip: !id,
  });

  const purchase = purchaseData?.data;
  const payments = purchase?.paymentHistory || [];
  const returns = purchase?.returnHistory || [];

  const [openUpdatePurchase, setOpenUpdatePurchase] = useState(false);
  const [openReturnPurchase, setOpenReturnPurchase] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  if (isLoading) {
    return <PurchaseViewSkeleton />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "green";
      case "Cancel":
        return "red";
      case "Return":
        return "orange";
      default:
        return "default";
    }
  };

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

  // Calculate subtotal from items if not available
  const calculateSubtotal = () => {
    if (purchase?.subtotal) {
      return purchase.subtotal;
    }
    return (
      purchase?.items?.reduce(
        (total: number, item: any) => total + (item.totalPrice || 0),
        0,
      ) || 0
    );
  };

  // Calculate VAT amount
  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    const discount = purchase?.discountValue || 0;
    const vatPercentage = purchase?.vatPercentage || 0;
    return ((subtotal - discount) * vatPercentage) / 100;
  };

  const itemColumns = [
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
      render: (_: any, record: any) => record.material?.name || "N/A",
    },
    {
      title: "Purchase Qty",
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
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (discount: number) => <DisplayCurrency amount={discount || 0} />,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (_: any, record: any) => {
        const quantity = record.quantity || 0;
        const unitPrice = record.unitPrice || 0;
        const discount = record.discount || 0;
        const total = Math.max(0, quantity * unitPrice - discount);
        return <DisplayCurrency amount={total} />;
      },
    },
  ];

  const paymentColumns = [
    {
      title: "Payment ID",
      dataIndex: "paymentId",
      key: "paymentId",
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => <DisplayCurrency amount={amount} />,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => {
        const methodLabels: Record<string, string> = {
          bank_transfer: "Bank Transfer",
          cash: "Cash",
          check: "Check",
          digital_wallet: "Digital Wallet",
        };
        return methodLabels[method] || method;
      },
    },
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (type: string) => (
        <Tag color={type === "full" ? "green" : "orange"}>
          {type === "full" ? "Full" : "Partial"}
        </Tag>
      ),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (id: string) => id || "—",
    },
    {
      title: "Bank Name",
      dataIndex: "bankName",
      key: "bankName",
      render: (name: string) => name || "—",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "—",
    },
  ];

  const returnColumns = [
    {
      title: "Return ID",
      dataIndex: "returnId",
      key: "returnId",
      render: (returnId: string, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/purchase-returns/${record.id}`)}
        >
          {returnId}
        </Button>
      ),
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag color={category === "Production" ? "blue" : "orange"}>
          {category}
        </Tag>
      ),
    },
    {
      title: "Total Items",
      dataIndex: "totalItems",
      key: "totalItems",
    },
    {
      title: "Total Qty",
      dataIndex: "totalQty",
      key: "totalQty",
    },
    {
      title: "Return Amount",
      dataIndex: "returnAmount",
      key: "returnAmount",
      render: (amount: number) => <DisplayCurrency amount={amount} />,
    },
    {
      title: "Reason",
      dataIndex: "returnReason",
      key: "returnReason",
      ellipsis: true,
    },
  ];

  return (
    <div className="mx-auto ">
      <PageMeta
        title={`Purchase ${purchase?.purchaseId} | ERP`}
        description="Purchase details"
      />

      <PageHeader
        title={`Purchase ${purchase?.purchaseId}`}
        subtitle="Purchase details and invoice"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Purchases", path: "/purchases" },
          { title: purchase?.purchaseId },
        ]}
        extra={
          <Space>
            <PrintComponent config={{ type: "page" }}>
              <Button icon={<PrinterOutlined />}>Print</Button>
            </PrintComponent>
            <Button
              icon={<EditOutlined />}
              onClick={() => setOpenUpdatePurchase(true)}
            >
              Edit
            </Button>
            <Button
              type="primary"
              onClick={() => setOpenPaymentModal(true)}
              disabled={purchase?.paymentStatus === "Paid"}
            >
              Add Payment
            </Button>
            <Button
              icon={<RotateLeftOutlined />}
              onClick={() => setOpenReturnPurchase(true)}
            >
              Return
            </Button>
          </Space>
        }
      />

      {/* Purchase Summary */}
      <Card style={{ marginBottom: 24 }} title="Purchase Summary">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Purchase ID">
            {purchase?.purchaseId}
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {dayjs(purchase?.purchaseDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier Name">
            {purchase?.supplier?.name || purchase?.supplierName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier Code">
            {purchase?.supplier?.supplierCode || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Person">
            {purchase?.supplier?.contactPerson || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier Phone">
            {purchase?.supplier?.phone1 || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier Email">
            {purchase?.supplier?.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Purchase Type">
            {purchase?.purchaseType || "Raw Material"}
          </Descriptions.Item>
          <Descriptions.Item label="Invoice No">
            {purchase?.invoiceNo || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Warehouse">
            {purchase?.warehouseName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Purchase By">
            {purchase?.purchasedByName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(purchase?.status)}>
              {purchase?.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Purchase Items */}
      <Card style={{ marginBottom: 24 }} title="Purchase Items">
        <Table
          columns={itemColumns}
          dataSource={purchase?.items}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>
                <strong>Subtotal</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <strong>
                  <DisplayCurrency amount={calculateSubtotal()} />
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      {/* Payment History */}
      <Card style={{ marginBottom: 24 }} title="Payment History">
        {payments.length > 0 ? (
          <Table
            columns={paymentColumns}
            dataSource={payments}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No payments recorded yet.</p>
            <Button
              type="primary"
              onClick={() => setOpenPaymentModal(true)}
              disabled={purchase?.paymentStatus === "Paid"}
              className="mt-4"
            >
              Make First Payment
            </Button>
          </div>
        )}
      </Card>

      {/* Return / Adjustment History */}
  <div className="">
        <Card style={{ marginBottom: 24 }} title="Return / Adjustment History">
        {returns && returns.length > 0 ? (
          <Table
            columns={returnColumns}
            dataSource={returns}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No returns or adjustments found.</p>
          </div>
        )}
      </Card>
  </div>

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
                <span>
                  <DisplayCurrency amount={calculateSubtotal()} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({purchase?.discountType}):</span>
                <span>
                  -<DisplayCurrency amount={purchase?.discountValue || 0} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>VAT ({purchase?.vatPercentage}%):</span>
                <span>
                  <DisplayCurrency amount={calculateVAT()} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Other Charges:</span>
                <span>
                  <DisplayCurrency amount={purchase?.otherCharges} />
                </span>
              </div>
              <Divider />
              <div className="flex justify-between font-semibold">
                <span>Grand Total:</span>
                <span>
                  <DisplayCurrency amount={purchase?.grandTotal} />
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span>
                  <DisplayCurrency amount={purchase?.paidAmount} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Due Amount:</span>
                <span>
                  <DisplayCurrency amount={purchase?.dueAmount} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Tag color={getPaymentStatusColor(purchase?.paymentStatus)}>
                  {purchase?.paymentStatus}
                </Tag>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      {openUpdatePurchase && purchase && (
        <UpdatePurchaseModal
          open={openUpdatePurchase}
          setOpen={setOpenUpdatePurchase}
          data={purchase}
        />
      )}
      {openReturnPurchase && purchase && (
        <ReturnPurchaseModal
          open={openReturnPurchase}
          setOpen={setOpenReturnPurchase}
          purchaseData={purchase}
          onSuccess={() => {
            // Optionally refresh the page or show success message
            window.location.reload();
          }}
        />
      )}

      {/* Payment Modal */}
      {openPaymentModal && purchase && (
        <PurchasePaymentModal
          open={openPaymentModal}
          setOpen={setOpenPaymentModal}
          purchase={purchase}
          onSuccess={() => {
            setOpenPaymentModal(false);
            refetchPurchase();
            toast.success("Payment recorded successfully");
          }}
        />
      )}
    </div>
  );
};

export default PurchaseView;
