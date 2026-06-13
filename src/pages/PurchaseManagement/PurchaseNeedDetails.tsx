import {
  ArrowLeftOutlined,
  // PrinterOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Button, Card, Descriptions, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
// import PrintComponent, {
//   PrintConfig,
// } from "../../components/common/PrintComponent";
import CreatePurchaseFromNeedModal from "../../components/common/Modals/CreatePurchaseFromNeedModal";
import { useGetPurchaseNeedByIdQuery } from "../../redux/features/purchases-management/purchasesManagementApi";
import SupplierInvoicesPrint from "../../components/common/CommonPrintCsvAndPdf/SupplierInvoicesPrint";
import PurchaseNeedDetailsSkeleton from "../../components/skeleton/PurchaseNeedDetailsSkeleton";

interface PurchaseNeedItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  remark?: string;
}

const PurchaseNeedDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openCreatePurchaseModal, setOpenCreatePurchaseModal] = useState(false);

  // API hooks
  const {
    data: needData,
    isLoading,
    error,
  } = useGetPurchaseNeedByIdQuery(id!, {
    skip: !id,
  });

  const purchaseNeed = needData?.data;

  if (isLoading) {
    return <PurchaseNeedDetailsSkeleton />;
  }

  if (error || !purchaseNeed) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageMeta
          title="Purchase Need Not Found | ERP"
          description="Purchase need details"
        />
        <PageHeader
          title="Purchase Need Not Found"
          subtitle="The requested purchase need could not be found"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Purchase Need", path: "/purchase-need" },
            { title: "Not Found" },
          ]}
        />
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Purchase need not found.</p>
            <Button onClick={() => navigate("/purchase-need")}>
              Back to Purchase Needs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // const printConfig: PrintConfig = {
  //   type: "custom",
  //   title: `Purchase Need - ${purchaseNeed.id}`,
  //   companyName: "UserKotha.Shop Industries",
  //   documentTitle: "Purchase Need Request",
  //   headerInfo: [
  //     { label: "Supplier Name", value: purchaseNeed.supplierName },
  //     {
  //       label: "Contact Person",
  //       value: purchaseNeed?.supplierContactPerson as string,
  //     },
  //     { label: "Address", value: purchaseNeed?.supplierAddress as string },
  //     { label: "Request ID", value: purchaseNeed.id },
  //     {
  //       label: "Date",
  //       value: dayjs(purchaseNeed.createdAt).format("DD/MM/YYYY"),
  //     },
  //     { label: "Status", value: purchaseNeed.status.toUpperCase() },
  //   ],
  //   tableData: {
  //     columns: [
  //       { title: "SL", key: "index" },
  //       { title: "Material Name", key: "materialName" },
  //       { title: "Qty", key: "quantity" },
  //       {
  //         title: "Unit Price",
  //         key: "unitPrice",
  //         render: (price: number) => `${price.toFixed(2)}/-`,
  //       },
  //       {
  //         title: "Total Price",
  //         key: "totalPrice",
  //         render: (total: number) => `${total.toFixed(2)}/-`,
  //       },
  //       { title: "Remark", key: "remark" },
  //     ],
  //     data: purchaseNeed.items.map((item: any, index: number) => ({
  //       ...item,
  //       index: index + 1,
  //       remark: "", // Remarks not available in current type
  //     })),
  //   },
  //   summaryData: [
  //     { label: "Total Materials", value: purchaseNeed.totalMaterials },
  //     { label: "Total Quantity", value: purchaseNeed.totalQty },
  //     {
  //       label: "Total Price",
  //       value: `${purchaseNeed.totalPrice.toFixed(2)}/-`,
  //       isTotal: true,
  //     },
  //   ],
  // };

  const handleCreatePurchase = () => {
    if (!purchaseNeed) return;

    setOpenCreatePurchaseModal(true);
  };

  const itemColumns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: PurchaseNeedItem, index: number) => (
        <>#{index + 1}</>
      ),
    },
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => `${price.toFixed(2)}/-`,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total: number) => `${total.toFixed(2)}/-`,
    },
    // {
    //   title: "Remark",
    //   dataIndex: "remark",
    //   key: "remark",
    // },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageMeta
        title={`Purchase Need ${purchaseNeed.needId} | ERP`}
        description="Purchase need details"
      />

      <PageHeader
        title={`Purchase Need ${purchaseNeed.needId}`}
        subtitle="Purchase need request details"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Purchase Need", path: "/purchase-need" },
          { title: purchaseNeed.needId },
        ]}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/purchase-need")}
            >
              Back
            </Button>

            <div>
              <SupplierInvoicesPrint purchaseNeed={purchaseNeed} />
            </div>

            <Button
              icon={<ShoppingCartOutlined />}
              type="primary"
              onClick={handleCreatePurchase}
            >
              Create Purchase
            </Button>
          </Space>
        }
      />

      {/* Supplier Information */}
      <Card style={{ marginBottom: 24 }} title="Supplier Information">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Supplier Name">
            {purchaseNeed.supplierName}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Person">
            {purchaseNeed.supplierContactPerson || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {purchaseNeed.supplierAddress || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {dayjs(purchaseNeed.createdAt).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                purchaseNeed.status === "pending"
                  ? "orange"
                  : purchaseNeed.status === "ordered"
                    ? "blue"
                    : "green"
              }
            >
              {purchaseNeed.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Items Table */}
      <Card style={{ marginBottom: 24 }} title="Required Materials">
        <Table
          columns={itemColumns}
          dataSource={purchaseNeed.items}
          rowKey="materialId"
          pagination={false}
        />
      </Card>

      {/* Summary */}
      <Card title="Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {purchaseNeed.totalMaterials}
            </div>
            <div className="text-gray-600">Total Materials</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{purchaseNeed.totalQty}</div>
            <div className="text-gray-600">Total Quantity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {purchaseNeed.totalPrice.toFixed(2)}/-
            </div>
            <div className="text-gray-600">Total Price</div>
          </div>
        </div>
      </Card>

      {/* Create Purchase Modal */}
      <CreatePurchaseFromNeedModal
        open={openCreatePurchaseModal}
        setOpen={setOpenCreatePurchaseModal}
        purchaseNeed={purchaseNeed}
      />
    </div>
  );
};

export default PurchaseNeedDetails;
