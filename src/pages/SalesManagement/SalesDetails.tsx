import React from "react";
import { useParams } from "react-router-dom";
import { useGetSaleByIdQuery } from "../../redux/features/sales/salesApi";
import {
  Card,
  Table,
  Tag,
  Typography,
  Divider,
  Row,
  Col,
  Descriptions,
} from "antd";
import { Loader } from "../../components/common/Loading";
import SalesInvoicesPrint from "../../components/common/CommonPrintCsvAndPdf/SalesInvoicesPrint";

const { Title, Text } = Typography;

interface SaleItem {
  id: string;
  product: {
    name: string;
    category: {
      name: string;
    };
    brand: {
      name: string;
    };
  };
  variant: {
    name: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Customer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
}

interface SalesData {
  invoiceNumber: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paid: number;
  finalAmount: number;
  totalAmount: number;
  discount: number;
  deliveryCharge: number;
  otherCharge: number;
  otherChargeDescription?: string;
  items: SaleItem[];
  customer: Customer;
}

const SalesDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetSaleByIdQuery(id as string);
  const sales: SalesData | undefined = data?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(amount);
  };

  // Table columns
  const columns = [
    {
      title: "PRODUCT",
      dataIndex: "product",
      key: "product",
      width: "35%",
      render: (product: SaleItem["product"]) => {
        if (!product) return null;
        return (
          <div>
            <Text strong>{product.name}</Text>
            <div style={{ marginTop: 4 }}>
              <Tag  style={{ marginRight: 4, fontSize: "11px" , backgroundColor:'#1BA143' , color:'white'}}>
                {product.category?.name}
              </Tag>
              <Tag  style={{ marginRight: 4, fontSize: "11px" , backgroundColor:'#FD8000' , color:'white'}}>
                {product.brand?.name}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "VARIANT",
      dataIndex: "variant",
      key: "variant",
      width: "25%",
      render: (record: SaleItem) => (
        <div>
          <Text>{record?.variant?.name}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              SKU: {record?.variant?.sku}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "QTY",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
      align: "center" as const,
      render: (quantity: number) => (
        <Tag color="default" style={{ minWidth: 40, textAlign: "center" }}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: "PRICE",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: "15%",
      align: "right" as const,
      render: (price: number) => <Text>{formatCurrency(price)}</Text>,
    },
    {
      title: "TOTAL",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: "15%",
      align: "right" as const,
      render: (total: number) => <Text strong>{formatCurrency(total)}</Text>,
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (!sales) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Card>
          <Title level={4} type="secondary">
            Invoice not found
          </Title>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex justify-end my-4">
          <SalesInvoicesPrint invoice={sales} buttonType="true" />{" "}
        </div>

        <Row gutter={[16, 16]} justify="space-between" align="top">
          <Col>
            <div className="">
              <h3 className="text-xl font-semibold">AMZAD FOOD</h3>
              <p className="text-sm mt-1">ERP System Invoice</p>
            </div>
          </Col>
          <Col>
            <div style={{ textAlign: "right" }}>
              <h3 className="text-xl font-semibold">{sales.invoiceNumber}</h3>

              <div className="flex gap-2 mt-2">
                <span
                  style={{
                    backgroundColor:
                      sales.status === "completed" ? "green" : "#fa8c16",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {sales.status.charAt(0).toUpperCase() + sales.status.slice(1)}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Customer and Payment Information */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Customer Information" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">
                <Text strong>{sales.customer.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {sales.customer.phone}
              </Descriptions.Item>
              {sales.customer.email && (
                <Descriptions.Item label="Email">
                  {sales.customer.email}
                </Descriptions.Item>
              )}
              {sales.customer.address && (
                <Descriptions.Item label="Address">
                  {sales.customer.address}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Total Purchases">
                {sales.customer.totalPurchases || 0} items
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Payment Details" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Method">
                <span
                  style={{
                    backgroundColor:
                      sales.paymentMethod === "cash" ? "green" : "orange",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {sales.paymentMethod.charAt(0).toUpperCase() +
                    sales.paymentMethod.slice(1).toLowerCase()}
                </span>
              </Descriptions.Item>
              {sales.paid < sales.finalAmount && (
                <Descriptions.Item label="Paid Amount">
                  <Text className="font-semibold">
                    {formatCurrency(sales.finalAmount)}
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Payment Status">
                <p
                  color={
                    sales.paid >= sales.finalAmount ? "success" : "warning"
                  }
                >
                  {sales.paid >= sales.finalAmount
                    ? "Fully Paid"
                    : "Partial Payment"}
                </p>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Order Items Table */}
      <Card
        title={`Order Items (${sales.items.length} ${
          sales.items.length === 1 ? "item" : "items"
        })`}
      >
        <Table
          dataSource={sales.items}
          columns={columns}
          pagination={false}
          size="middle"
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </Card>

      <Row style={{ marginTop: "16px" }} justify="end">
        <Col xs={24} md={12} lg={8}>
          <Card size="small">
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Col>
                <Text>Subtotal:</Text>
              </Col>
              <Col>
                <Text>{formatCurrency(sales.totalAmount)}</Text>
              </Col>
            </Row>

            {sales.discount > 0 && (
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col>
                  <Text>Discount:</Text>
                </Col>
                <Col>
                  <Text type="danger">-{formatCurrency(sales.discount)}</Text>
                </Col>
              </Row>
            )}

            {sales.deliveryCharge > 0 && (
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col>
                  <Text>Delivery Charge:</Text>
                </Col>
                <Col>
                  <Text>+{formatCurrency(sales.deliveryCharge)}</Text>
                </Col>
              </Row>
            )}

            {sales.otherCharge > 0 && (
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col>
                  <Text>Other Charges:</Text>
                </Col>
                <Col>
                  <Text>+{formatCurrency(sales.otherCharge)}</Text>
                </Col>
              </Row>
            )}

            <Divider style={{ margin: "12px 0" }} />

            <Row justify="space-between">
              <Col>
                <Text strong>Grand Total:</Text>
              </Col>
              <Col>
                <h3 className="text-xl font-semibold">
                  {" "}
                  {formatCurrency(sales.finalAmount)}
                </h3>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Notes Section */}
      {sales.otherChargeDescription && (
        <>
          <Divider />
          <Card title="Additional Notes" size="small">
            <Text>{sales.otherChargeDescription}</Text>
          </Card>
        </>
      )}
    </div>
  );
};

export default SalesDetails;
