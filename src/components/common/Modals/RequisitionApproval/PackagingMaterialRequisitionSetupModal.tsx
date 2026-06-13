import {
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetProductByIdQuery,
  useGetProductPackagingMaterialBOMQuery,
  useProductListQuery,
} from "../../../../redux/features/product/productApi";
import { useCreatePackagingRequisitionMutation } from "../../../../redux/features/requisition/requisitionApi";
import {
  PackagingMaterialRequirement,
  RequisitionSetupModalProps,
} from "../../../../types/requisition";
import { DataTable } from "../../Tables";
import PackagingMaterialBOMSetupModal_Manage from "../BOM/PackagingMaterialBOMSetupModal";
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PackagingMaterialRequisitionSetupModal: React.FC<
  RequisitionSetupModalProps
> = ({
  open,
  setOpen,
  product = {},
  createDropdownProduct,
  initialBatchSize,
  readOnlyBatchSize = false,
  onSuccess,
  productionId,
  productionNumber,
  planItems, // Add planItems prop
}) => {
  const { data: productData } = useProductListQuery(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const [batchSize, setBatchSize] = useState<number | null>(
    initialBatchSize || null,
  );
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [openBOMSetup, setOpenBOMSetup] = useState(false);
  const navigation = useNavigate();

  // Get full product details including variants
  const productId = product?.id || selectedProductId;

  const { data: fullProductData } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  const fullProduct = fullProductData?.data;

  // Auto-fill purpose when component mounts or productionNumber changes
  React.useEffect(() => {
    if (productionId) {
      setPurpose(
        `Packaging materials for production ${productionNumber || ""}`,
      );
    }
  }, [productionId, productionNumber]);

  const { data: bomData, isLoading: isBomLoading } =
    useGetProductPackagingMaterialBOMQuery(
      {
        productId: productId as string,
        // Don't pass selectedVariantId to fetch all BOMs for all variants
      },
      {
        skip: !productId,
      },
    );

  const productByBom = bomData?.data || [];

  const [createPackagingRequisition, { isLoading: creating }] =
    useCreatePackagingRequisitionMutation();

  const products = productData?.data || [];

  // Helper function to get planned quantity for a specific variant
  const getVariantPlannedQty = (variantId: string): number => {
    if (planItems && planItems.length > 0) {
      const planItem = planItems.find((item) => item.variantId === variantId);
      return planItem?.plannedQty || 0;
    }
    // Fallback: if no planItems, use the total batchSize (old behavior)
    return batchSize || 0;
  };

  // Calculate total quantity to request based on variant-specific planned quantity and quantity per unit
  // Note: 'percentage' field now stores quantity per unit (not actual percentage)
  const calculateQuantityToRequest = (item: PackagingMaterialRequirement) => {
    const variantPlannedQty = getVariantPlannedQty(item.variantId);
    return variantPlannedQty ? Number(variantPlannedQty) * item.percentage : 0;
  };

  // Filter BOM items to only show materials for variants with planned quantity > 0
  const filteredProductByBom = productByBom.filter(
    (item: PackagingMaterialRequirement) => {
      const variantPlannedQty = getVariantPlannedQty(item.variantId);
      return variantPlannedQty > 0;
    },
  );

  // Total requested quantity
  const totalRequested = filteredProductByBom.reduce(
    (sum: number, item: PackagingMaterialRequirement) =>
      sum + calculateQuantityToRequest(item),
    0,
  );

  // Number of items to request
  const itemsToRequest = filteredProductByBom.filter(
    (item: PackagingMaterialRequirement) =>
      calculateQuantityToRequest(item) > 0,
  ).length;

  const handleCreateRequisition = async () => {
    if (!batchSize) {
      message.error("Please enter batch size");
      return;
    }
    if (!purpose.trim()) {
      message.error("Please enter purpose");
      return;
    }

    // Group BOMs by variant to create variant-specific requisition data
    // Only include variants with planned quantity > 0
    const variantsData = filteredProductByBom.reduce((acc: any[], bom: any) => {
      const existingVariant = acc.find((v) => v.variantId === bom.variantId);
      if (!existingVariant) {
        // Use variant-specific planned quantity if available
        const variantBatchSize = getVariantPlannedQty(bom.variantId);
        if (variantBatchSize > 0) {
          acc.push({
            variantId: bom.variantId,
            batchSize: variantBatchSize,
          });
        }
      }
      return acc;
    }, []);

    const data = {
      productId: productId,
      variants: variantsData.length > 0 ? variantsData : [],
      purpose,
      productionId,
      notes,
    };

    try {
      const res = await createPackagingRequisition(data).unwrap();

      if (res?.success) {
        toast.success(
          res.message || "Packaging requisition created successfully!",
        );
        setOpen(false);
        navigation("/productions");
        onSuccess?.();
      } else {
        toast.error(res?.message || "Failed to create requisition");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const columns = [
    {
      title: "Variant",
      dataIndex: "variantName",
      key: "variantName",
      render: (_: any, record: PackagingMaterialRequirement) => (
        <div>
          <Tag color="blue">{record.variantName}</Tag>
          {planItems && (
            <div className="text-xs text-gray-500 mt-1">
              Qty: {getVariantPlannedQty(record.variantId)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      render: (_: any, record: PackagingMaterialRequirement) => (
        <>{record.materialName}</>
      ),
    },
    {
      title: "Quantity per Unit",
      dataIndex: "percentage",
      key: "percentage",
      render: (_: any, record: PackagingMaterialRequirement) => (
        <span>
          {record.percentage} {record.unit}
        </span>
      ),
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock: number, record: PackagingMaterialRequirement) => (
        <Tag
          style={{
            backgroundColor:
              stock < calculateQuantityToRequest(record) ? "red" : "green",
            color: "#fff",
          }}
        >
          {stock.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Quantity to Request",
      key: "quantityToRequest",
      render: (_: any, record: PackagingMaterialRequirement) => (
        <span>
          {calculateQuantityToRequest(record).toFixed(2)} {record.unit}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={1000}
      title={
        <div>
          <Title level={4}>
            Setup Packaging Requisition - {fullProduct?.name || product?.name}
          </Title>
          <Text type="secondary">
            Packaging materials auto-configured based on variant BOM
          </Text>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Production Details */}
        <Card title="Production Details" size="small">
          <div className="space-y-4">
            {/* Show all variants with BOMs */}
            {productByBom.length > 0 && (
              <div>
                <Text strong>Variants with BOM configured:</Text>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {[...new Set(productByBom.map((bom: any) => bom.variantId))]
                    .filter((variantId: any) => {
                      // Only show variants that have planned quantity > 0
                      const plannedQty = getVariantPlannedQty(variantId);
                      return plannedQty > 0;
                    })
                    .map((variantId: any) => {
                      const variantName = productByBom.find(
                        (bom: any) => bom.variantId === variantId,
                      )?.variantName;
                      const plannedQty = getVariantPlannedQty(variantId);
                      return (
                        <Tag key={variantId} color="blue">
                          {variantName || "Variant"}
                          {planItems &&
                            plannedQty > 0 &&
                            ` (Qty: ${plannedQty})`}
                        </Tag>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="flex gap-10 mt-5">
              {createDropdownProduct && (
                <div>
                  <Select
                    value={selectedProductId}
                    onChange={setSelectedProductId}
                    className="w-80"
                    placeholder="Select product"
                  >
                    {products.map((p: any) => (
                      <Option key={p.id} value={p.id}>
                        {p.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <Text strong>Batch Size:</Text>
                <InputNumber
                  min={1}
                  max={10000}
                  value={batchSize}
                  onChange={(value: number | null) => setBatchSize(value)}
                  placeholder="Enter batch size"
                  style={{ width: "150px", marginLeft: "8px" }}
                  disabled={readOnlyBatchSize}
                />
                <Text type="secondary" style={{ marginLeft: "8px" }}>
                  kg
                </Text>
              </div>
            </div>

            <div>
              <Text strong>Purpose:</Text>
              <TextArea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter the purpose..."
                rows={3}
                style={{ marginTop: "8px" }}
              />
            </div>
          </div>
        </Card>

        {/* Material Requirements */}
        <Card
          className="mt-5!"
          title="Auto-Configured Packaging Materials"
          extra={
            <Space>
              <Text>Items: {itemsToRequest}</Text>
              <Tag color="blue">Total: {totalRequested.toFixed(2)}</Tag>
            </Space>
          }
        >
          <DataTable
            data={filteredProductByBom}
            loading={isBomLoading}
            columns={columns}
            rowKey="materialId"
            pagination={false}
            locale={{
              emptyText: (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <div className="mb-3">
                    <Text type="secondary" className="block text-sm">
                      No packaging materials configured for this product.
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => setOpenBOMSetup(true)}
                  >
                    Manage Packaging BOM
                  </Button>
                </div>
              ),
            }}
          />
        </Card>

        {openBOMSetup && (
          <PackagingMaterialBOMSetupModal_Manage
            open={openBOMSetup}
            setOpen={setOpenBOMSetup}
            product={fullProduct || product}
          />
        )}

        {/* Notes + Buttons */}
        <div className="mt-4">
          <Text strong>Notes (optional):</Text>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            rows={4}
            style={{ marginTop: "8px" }}
          />
        </div>

        <div className="flex justify-end items-center mt-8!">
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={creating}
              onClick={handleCreateRequisition}
              disabled={!batchSize || filteredProductByBom.length === 0}
            >
              Create Requisition
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

// Component to show recent requisitions
export default PackagingMaterialRequisitionSetupModal;
