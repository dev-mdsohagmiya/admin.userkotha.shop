import { Button, Card, Space, Table } from "antd";
import dayjs from "dayjs";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useGetPurchaseReturnByIdQuery } from "../../redux/features/purchases-management/purchasesManagementApi";
import PurchaseReturnViewSkeleton from "../../components/skeleton/PurchaseReturnViewSkeleton";
import { DisplayCurrency } from "../../utils/currency";
import PurchaseReturnPrint from "../../components/common/CommonPrintCsvAndPdf/PurchaseReturnPrint";

const PurchaseReturnView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // API hook
  const {
    data: returnDataResponse,
    isLoading,
    error,
  } = useGetPurchaseReturnByIdQuery(id!, {
    skip: !id,
  });

  const returnData = returnDataResponse?.data;

  if (isLoading) {
    return <PurchaseReturnViewSkeleton />;
  }

  if (error || !returnData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600">
          Return not found
        </h2>
        <Button onClick={() => navigate("/purchase-returns")} className="mt-4">
          Back to Returns
        </Button>
      </div>
    );
  }

  const itemColumns = [
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Purchase Qty",
      dataIndex: "purchaseQty",
      key: "purchaseQty",
    },
    {
      title: "Return Qty",
      dataIndex: "returnQty",
      key: "returnQty",
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
      render: (total: number) => <DisplayCurrency amount={total} />,
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
    },
  ];

  return (
    <div className="mx-auto">
      <PageMeta
        title={`Return ${returnData.returnId} | ERP`}
        description="Purchase return details"
      />

      <PageHeader
        title={`Return ${returnData.returnId}`}
        subtitle="Purchase return details"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Purchase Returns", path: "/purchase-returns" },
          { title: returnData.returnId },
        ]}
        extra={
          <Space>
            <PurchaseReturnPrint returnData={returnData} />
          </Space>
        }
      />

      {/* Return Summary */}
      {/* Return Summary - Compact */}
      <div className="mb-4">
        <Card className="border rounded-md bg-white">
          <div className=" border-b border-gray-100 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">
              Return Summary
            </h3>
          </div>
          <div className="">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Return ID</p>
                <p className="text-sm font-semibold text-gray-900">
                  {returnData.returnId}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Return Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {dayjs(returnData.returnDate).format("DD/MM/YYYY")}
                </p>
              </div>
              {/* <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Purchase ID</p>
                <p className="text-sm font-semibold text-gray-900">
                  {returnData.purchaseId}
                </p>
              </div> */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Supplier</p>
                <p className="text-sm font-semibold text-gray-900">
                  {returnData.supplierName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Warehouse</p>
                <p className="text-sm font-semibold text-gray-900">
                  {returnData.warehouseName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Category</p>
                <p className="text-sm font-semibold text-gray-900">
                  {returnData.category}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Return Reason
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {returnData.returnReason}
                </p>
              </div>
              {/* <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Created By</p>
                <p className="text-sm font-semibold text-gray-900">
                  {returnData.createdBy}
                </p>
              </div> */}
              {/* <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Created Date
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {dayjs(returnData.createdAt).format("DD/MM/YYYY")}
                </p>
              </div> */}
            </div>
          </div>
        </Card>
      </div>

      {/* Returned Item List - Compact */}
      <div className="mb-4">
        <Card className="border rounded-md bg-white">
          <div className=" pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Returned Items
              </h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                {returnData.items?.length || 0} items
              </span>
            </div>
          </div>
          <div className="">
            <Table
              columns={itemColumns}
              dataSource={returnData.items}
              rowKey="materialId"
              pagination={false}
              size="small"
              className="compact-table"
            />
          </div>
        </Card>
      </div>

      {/* Financial Summary - Compact */}
      <div className="mb-6">
        <Card className="border  rounded-md bg-white">
          <div className="pb-4 border-b border-gray-100 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Summary
            </h3>
          </div>
          <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Return Calculation */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">
                  Return Calculation
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Purchase Amount</span>
                    <span className="font-medium text-gray-900">
                      <DisplayCurrency amount={returnData.purchaseAmount} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Discount Given</span>
                    <span className="font-medium text-red-600">
                      -<DisplayCurrency amount={returnData.discountGiven} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Return Amount</span>
                    <span className="font-medium text-red-600">
                      -<DisplayCurrency amount={returnData.returnAmount} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Discount Adjustment</span>
                    <span className="font-medium text-red-600">
                      -
                      <DisplayCurrency amount={returnData.discountAdjustment} />
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-900">
                        Net Purchase
                      </span>
                      <span className="font-semibold text-blue-600">
                        <DisplayCurrency
                          amount={returnData.netPurchaseAfterReturn}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">
                  Payment Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Paid Amount</span>
                    <span className="font-medium text-green-600">
                      <DisplayCurrency amount={returnData.paidAmount} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Due Balance</span>
                    <span className="font-medium text-orange-600">
                      <DisplayCurrency amount={returnData.dueSupplierBalance} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        :global(.compact-table .ant-table-thead > tr > th) {
          background-color: #f8fafc;
          color: #374151;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 12px;
          font-size: 12px;
        }

        :global(.compact-table .ant-table-tbody > tr > td) {
          border-bottom: 1px solid #f3f4f6;
          padding: 8px 12px;
          font-size: 12px;
        }

        :global(.compact-table .ant-table-tbody > tr:hover > td) {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default PurchaseReturnView;
