import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { FaPiggyBank } from "react-icons/fa6";
import { FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { MdOutlinePayment } from "react-icons/md";
import { TbCoinTakaFilled } from "react-icons/tb";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import PageMeta from "../../components/common/Meta/PageMeta";
import PaymentModal from "../../components/common/Modals/PaymentModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import { DataTable } from "../../components/common/Tables";

import {
  useGetSupplierByIdQuery,
  useSupplierPurchaseHistoryListQuery,
} from "../../redux/features/suppliers/suppliersApi";
import { useGetPaymentsBySupplierQuery } from "../../redux/features/supplierPayment/supplierPaymentApi";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import SupplierDetailsSkeleton from "../../components/skeleton/SupplierDetailsSkeleton";

const { Title, Text } = Typography;
import { DisplayCurrency } from "../../utils/currency";

const SupplierDetails = () => {
  const { id } = useParams();
  const {
    data: supplierInfo,
    isLoading,
    refetch: refetchSupplier,
  } = useGetSupplierByIdQuery(id as string);
  const supplier = supplierInfo?.data;

  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentLimit, setPaymentLimit] = useState(10);

  const {
    data: supplierPurchaseHistory,
    isLoading: supplierPurchaseHistoryLoading,
  } = useSupplierPurchaseHistoryListQuery({
    id: id as string,
    args: [
      { name: "page", value: historyPage.toString() },
      { name: "limit", value: historyLimit.toString() },
    ],
  });

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useGetPaymentsBySupplierQuery({
    supplierId: id as string,
    args: [
      { name: "page", value: paymentPage.toString() },
      { name: "limit", value: paymentLimit.toString() },
    ],
  });

  const histories = supplierPurchaseHistory?.data || [];
  const metaHistones = supplierPurchaseHistory?.meta || [];

  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("purchases");
  const navigate = useNavigate();

  const totalPurchaseAmount = histories.reduce(
    (acc: any, item: { totalAmount: any }) => acc + item.totalAmount,
    0,
  );
  const totalPaidAmount = histories.reduce(
    (acc: any, item: { paidAmount: any }) => acc + item.paidAmount,
    0,
  );
  const totalDue = histories.reduce(
    (acc: any, item: { dueAmount: any }) => acc + item.dueAmount,
    0,
  );

  if (isLoading) return <SupplierDetailsSkeleton />;
  if (!supplier)
    return (
      <div className="text-center py-8">
        <Title level={3}>Supplier not found</Title>
        <Button onClick={() => navigate("/suppliers")}>
          Back to Suppliers
        </Button>
      </div>
    );

  const purchaseColumns = [
    {
      title: "SL",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => `#${index + 1}`,
    },
    {
      title: "PO ID",
      dataIndex: "purchaseId",
      key: "purchaseId",
      width: 120,
      render: (purchaseId: string) => <Tag color="blue">{purchaseId}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      width: 120,
      render: (purchaseDate: string) =>
        new Date(purchaseDate).toLocaleDateString(),
    },
    {
      title: "Total Items",
      dataIndex: "totalItems",
      key: "totalItems",
      width: 100,
      render: (totalItems: any[]) => totalItems || 0,
    },
    {
      title: "Total Price",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 240,
      render: (amount: number) => (
        <Text strong style={{ whiteSpace: "nowrap" }}>
          <DisplayCurrency amount={amount} />
        </Text>
      ),
    },
    {
      title: "Paid",
      key: "paidAmount",
      width: 120,
      render: (_: any, record: any) => {
        const paid = record.paidAmount;
        return (
          <Text type="success" style={{ whiteSpace: "nowrap" }}>
            <DisplayCurrency amount={paid} />
          </Text>
        );
      },
    },
    {
      title: "Due",
      key: "dueAmount",
      width: 120,
      render: (_: any, record: any) => {
        const due = record.dueAmount;
        return (
          <Text
            strong
            type={due > 0 ? "danger" : "success"}
            style={{ whiteSpace: "nowrap" }}
          >
            <DisplayCurrency amount={due} />
          </Text>
        );
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          {/* <Button
            size="small"
            icon={<FiEye />}
            onClick={() => toast.info("Purchase invoice page coming soon!")}
          ></Button> */}
          {record.dueAmount !== 0 && (
            <Button
              size="small"
              type="primary"
              icon={<MdOutlinePayment />}
              onClick={() => setOpenPaymentModal(true)}
            ></Button>
          )}
        </Space>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: "SL",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => `#${index + 1}`,
    },
    {
      title: "Payment ID",
      dataIndex: "paymentId",
      key: "paymentId",
      width: 120,
      render: (paymentId: string) => <Tag color="green">{paymentId}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => (
        <Text strong type="success">
          <DisplayCurrency amount={amount} />
        </Text>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (method: string) => (
        <Tag color="blue">{method?.replace("_", " ").toUpperCase()}</Tag>
      ),
    },
    {
      title: "Type",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "full" ? "green" : "orange"}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Bank Name",
      dataIndex: "bankName",
      key: "bankName",
      width: 150,
      render: (bankName: string) => bankName || "N/A",
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 150,
      render: (transactionId: string) => transactionId || "N/A",
    },
    {
      title: "Slip",
      dataIndex: "slipNumber",
      key: "slipNumber",
      width: 120,
      render: (slipNumber: string) =>
        slipNumber ? (
          <Button size="small" type="link">
            View Slip
          </Button>
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <div>
      <PageMeta
        title={`${supplier.name} | Supplier Details`}
        description="Supplier details and transaction history"
      />
      <PageHeader
        title="Supplier Details"
        subtitle="Detailed information and transaction history"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Suppliers", path: "/suppliers" },
          { title: supplier.name, path: `/suppliers/${supplier.id}` },
        ]}
        extra={
          <CustomActionButton
            text="Make Payment"
            type="primary"
            icon={<TbCoinTakaFilled />}
            onClick={() => setOpenPaymentModal(true)}
            disabled={supplier.totalDue <= 0}
          ></CustomActionButton>
        }
      />

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <PageHeaderCard
            icon={<TbCoinTakaFilled className="text-white text-2xl" />}
            title="Total Purchases"
            value={<DisplayCurrency amount={totalPurchaseAmount} />}
            color="green"
          />
        </Col>
        <Col xs={24} sm={8}>
          <PageHeaderCard
            icon={<TbCoinTakaFilled className="text-white text-2xl" />}
            title="Total Paid"
            value={<DisplayCurrency amount={totalPaidAmount} />}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={8}>
          <PageHeaderCard
            icon={<TbCoinTakaFilled className="text-white text-2xl" />}
            title="Total Due"
            value={<DisplayCurrency amount={totalDue} />}
            color="purple"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Supplier Information" className="h-fit">
            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={
                  <Space>
                    <FiUser />
                    <span>Contact Person</span>
                  </Space>
                }
              >
                {supplier.contactPerson || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <FiPhone />
                    <span>Phone</span>
                  </Space>
                }
              >
                {supplier.phone || "N/A"}
                {supplier.alternativePhone && (
                  <div>
                    <Text type="secondary">
                      Alt: {supplier.alternativePhone}
                    </Text>
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <FiMail />
                    <span>Email</span>
                  </Space>
                }
              >
                {supplier.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag
                  color={supplier.type === "raw_material" ? "blue" : "green"}
                >
                  {supplier.type?.replace("_", " ").toUpperCase() || "N/A"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={supplier.status === "active" ? "green" : "red"}>
                  {supplier.status?.toUpperCase() || "N/A"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>
              <FiMapPin className="inline mr-2" />
              Address
            </Title>
            <div className="mt-2">
              <Text>{supplier.addressLine1 || "N/A"}</Text>
              {supplier.addressLine2 && <div>{supplier.addressLine2}</div>}
              <div>
                <Text>
                  {supplier.city}, {supplier.district}, {supplier.country}
                </Text>
              </div>
              <Text>Postal Code: {supplier.postalCode || "N/A"}</Text>
            </div>

            {supplier.bankName && (
              <>
                <Divider />
                <Title level={5}>
                  <FaPiggyBank className="inline mr-2" />
                  Bank Information
                </Title>
                <div className="mt-2">
                  <Text strong>Bank: </Text>
                  <Text>{supplier.bankName}</Text>
                  <br />
                  <Text strong>Account: </Text>
                  <Text>
                    {supplier.accountName} ({supplier.accountNumber})
                  </Text>
                  <br />
                  {supplier.branchName && (
                    <>
                      <Text strong>Branch: </Text>
                      <Text>{supplier.branchName}</Text>
                      <br />
                    </>
                  )}
                  {supplier.routingCode && (
                    <>
                      <Text strong>Routing: </Text>
                      <Text>{supplier.routingCode}</Text>
                    </>
                  )}
                </div>
              </>
            )}

            {supplier.notes && (
              <>
                <Divider />
                <Title level={5}>Notes</Title>
                <Text type="secondary">{supplier.notes}</Text>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <Tabs.TabPane tab="Purchase History" key="purchases">
                <DataTable
                  data={histories || []}
                  columns={purchaseColumns}
                  loading={supplierPurchaseHistoryLoading}
                  rowKey="id"
                  isPaginate={metaHistones.total > 10}
                  setCurrentPage={setHistoryPage}
                  page={historyPage}
                  limit={historyLimit}
                  setLimit={setHistoryLimit}
                  showSizeChanger={metaHistones?.total > 10 && true}
                  total={metaHistones?.total || 0}
                />
              </Tabs.TabPane>

              <Tabs.TabPane tab="Payment History" key="payments">
                <DataTable
                  data={paymentsData?.data || []}
                  columns={paymentColumns}
                  loading={paymentsLoading}
                  rowKey="id"
                  isPaginate={paymentsData?.meta?.total > 10}
                  currentPage={paymentPage}
                  setCurrentPage={setPaymentPage}
                  limit={paymentLimit}
                  setLimit={setPaymentLimit}
                  showSizeChanger={paymentsData?.meta?.total > 10}
                  total={paymentsData?.meta?.total || 0}
                />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {openPaymentModal && (
        <PaymentModal
          open={openPaymentModal}
          setOpen={setOpenPaymentModal}
          supplier={supplier}
          onSuccess={() => {
            setOpenPaymentModal(false);
            refetchSupplier();
            refetchPayments();
            toast.success("Payment recorded successfully");
          }}
        />
      )}
    </div>
  );
};

export default SupplierDetails;
