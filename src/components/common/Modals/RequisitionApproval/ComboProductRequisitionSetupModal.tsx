import React, { useState, useEffect, useCallback } from "react";
import { Modal, Card, Table, Space, message, Input, Button, Tag } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import {
  IComboProductData,
  IComboProductVariant,
  IComboVariantBreakdown,
  IProductVariantRequirement,
} from "../../../../types/comboProduct";
import {
  useCreateComboProductRequisitionMutation,
  useGetComboProductByIdQuery,
} from "../../../../redux/features/comboProduct/comboProductApi";
import ProductionRequisitionSkeleton from "../../../skeleton/ProductionRequisitionSkeleton";

const { TextArea } = Input;

interface ComboProductRequisitionSetupModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  comboProduct?: IComboProductData | any;
  comboProductId?: string;
  onSuccess?: () => void;
  productionId?: string;
  productionNumber?: string;
  planItems?: Array<{ comboVariantId: string; plannedQty: number }>;
}

const ComboProductRequisitionSetupModal: React.FC<
  ComboProductRequisitionSetupModalProps
> = ({
  open,
  setOpen,
  comboProduct,
  comboProductId,
  onSuccess,
  productionId,
  productionNumber,
  planItems,
}) => {
  const [createComboRequisition, { isLoading }] =
    useCreateComboProductRequisitionMutation();

  // Fetch full combo product details with populated variants
  const { data: fullComboProductData, isLoading: isLoadingComboProduct } =
    useGetComboProductByIdQuery(comboProductId || comboProduct?.id || "", {
      skip: !comboProductId && !comboProduct?.id,
    });

  const fullComboProduct = fullComboProductData?.data || comboProduct;

  console.log("fullComboProduct", fullComboProduct);

  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [variantBreakdown, setVariantBreakdown] = useState<
    IComboVariantBreakdown[]
  >([]);
  
  const [productVariantRequirements, setProductVariantRequirements] = useState<
    IProductVariantRequirement[]
  >([]);

  const [packagingRequirements, setPackagingRequirements] = useState<any[]>([]);

  const calculateRequirements = useCallback(() => {
    if (!fullComboProduct?.variants || !planItems) {
      return;
    }

    const breakdown: IComboVariantBreakdown[] = [];
    const requirements: {
      [key: string]: IProductVariantRequirement;
    } = {};
    const pkgRequirements: {
      [key: string]: any;
    } = {};

    planItems.forEach((planItem) => {
      const comboVariant = fullComboProduct.variants.find(
        (v: IComboProductVariant) => v.id === planItem.comboVariantId,
      );

      if (!comboVariant) {
        return;
      }

      // Handle Product Variant Items
      const variantItems = (comboVariant.items || []).map((item: any) => {
        return {
          productId: item.productId,
          productName: item.product?.name || "Unknown Product",
          variantId: item.variantId,
          variantName: item.variant?.name || "Unknown Variant",
          quantity: item.quantity * planItem.plannedQty,
        };
      });

      breakdown.push({
        comboVariantId: comboVariant.id!,
        comboVariantName: comboVariant.name,
        batchSize: planItem.plannedQty,
        items: variantItems,
      });

      // Calculate total product requirements
      variantItems.forEach((item: any) => {
        const key = `${item.productId}-${item.variantId}`;
        if (!requirements[key]) {
          requirements[key] = {
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantName: item.variantName,
            requiredQuantity: 0,
            comboVariants: [],
          };
        }

        requirements[key].requiredQuantity += item.quantity;
        requirements[key].comboVariants.push({
          comboVariantId: comboVariant.id!,
          comboVariantName: comboVariant.name,
          batchSize: planItem.plannedQty,
          requiredQuantity: item.quantity,
        });
      });

      // Calculate Packaging BOM Requirements
      if (comboVariant.packagingBOM && comboVariant.packagingBOM.length > 0) {
        comboVariant.packagingBOM.forEach((pkg: any) => {
          const key = pkg.materialId;
          const requiredQty = (pkg.percentage || 0) * planItem.plannedQty;

          if (!pkgRequirements[key]) {
            pkgRequirements[key] = {
              materialId: pkg.materialId,
              materialName: pkg.materialName,
              unitName: pkg.unitName,
              requiredQuantity: 0,
              currentStock: pkg.currentStock || 0,
              category: pkg.category,
              comboVariants: [],
            };
          }

          pkgRequirements[key].requiredQuantity += requiredQty;
          pkgRequirements[key].comboVariants.push({
            comboVariantId: comboVariant.id!,
            comboVariantName: comboVariant.name,
            batchSize: planItem.plannedQty,
            requiredQuantity: requiredQty,
          });
        });
      }
    });

    setVariantBreakdown(breakdown);
    setProductVariantRequirements(Object.values(requirements));
    setPackagingRequirements(Object.values(pkgRequirements));
  }, [fullComboProduct, planItems]);

  useEffect(() => {
    if (fullComboProduct && planItems && planItems.length > 0) {
      calculateRequirements();

      // Set default purpose
      if (productionNumber) {
        setPurpose(
          `Production of ${fullComboProduct.name} for ${productionNumber}`,
        );
      } else {
        setPurpose(`Production of ${fullComboProduct.name}`);
      }
    }
  }, [fullComboProduct, planItems, productionNumber, calculateRequirements]);

  const handleSubmit = async () => {
    if (!comboProductId && !fullComboProduct?.id) {
      message.error("Combo product ID is required");
      return;
    }

    if (planItems && planItems.length === 0) {
      message.error("Please add at least one combo variant");
      return;
    }

    try {
      const payload = {
        comboProductId: comboProductId || fullComboProduct.id,
        productionId,
        comboVariants: planItems!.map((item) => ({
          comboVariantId: item.comboVariantId,
          batchSize: item.plannedQty,
        })),
        purpose: purpose || undefined,
        notes: notes || undefined,
      };

      // Unified API call (Backend handles both product items and packaging materials)
      await createComboRequisition(payload).unwrap();

      message.success("All requisitions (Products + Packaging) created successfully!");
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      message.error(
        error?.data?.message || "Failed to create requisitions",
      );
    }
  };

  const totalBatchSize =
    planItems?.reduce((sum, item) => sum + item.plannedQty, 0) || 0;

  // Show loader while fetching combo product details
  if (isLoadingComboProduct) {
    return (
      <Modal
        title="Loading Requisition Data..."
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1000}
      >
        <ProductionRequisitionSkeleton />
      </Modal>
    );
  }

  const variantBreakdownColumns = [
    {
      title: "Combo Variant",
      dataIndex: "comboVariantName",
      key: "comboVariantName",
      render: (name: string, record: IComboVariantBreakdown) => (
        <div>
          <div className="font-medium">{name}</div>
          <Tag color="blue" className="mt-1">
            Batch: {record.batchSize}
          </Tag>
        </div>
      ),
    },
    {
      title: "Required Product Variants",
      key: "items",
      render: (_: any, record: IComboVariantBreakdown) => (
        <div className="space-y-1">
          {record.items.map((item, idx) => (
            <div key={idx} className="text-sm">
              <span className="font-medium">{item.productName}</span>
              <span className="text-gray-500"> - {item.variantName}</span>
              <span className="text-green-600 font-semibold ml-2">
                × {item.quantity}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const requirementsColumns = [
    {
      title: "Product Variant",
      key: "variant",
      render: (_: any, record: IProductVariantRequirement) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <Tag color="green" className="mt-1">
            {record.variantName}
          </Tag>
        </div>
      ),
    },
    {
      title: "Total Required",
      dataIndex: "requiredQuantity",
      key: "requiredQuantity",
      render: (qty: number) => (
        <span className="font-semibold text-lg">{qty}</span>
      ),
    },
    {
      title: "Used In",
      key: "comboVariants",
      render: (_: any, record: IProductVariantRequirement) => (
        <div className="space-y-1">
          {record.comboVariants.map((cv, idx) => (
            <div key={idx} className="text-sm text-gray-600">
              {cv.comboVariantName}: {cv.batchSize} ×{" "}
              {cv.batchSize > 0 ? (cv.requiredQuantity / cv.batchSize).toFixed(2) : 0} = {cv.requiredQuantity}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const packagingColumns = [
    {
      title: "Packaging Material",
      key: "material",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.materialName}</div>
          <Tag color="purple" className="mt-1">
            {record.category}
          </Tag>
        </div>
      ),
    },
    {
      title: "Required Quantity",
      key: "requiredQuantity",
      render: (_: any, record: any) => (
        <div>
          <span className="font-semibold text-lg">
            {record.requiredQuantity} {record.unitName}
          </span>
          <div className="text-xs text-gray-500">
            Stock: {record.currentStock} {record.unitName}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => {
        const isLow = record.currentStock < record.requiredQuantity;
        return (
          <Tag color={isLow ? "red" : "green"}>
            {isLow ? "Insufficient Stock" : "Available"}
          </Tag>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div>
          <h3 className="text-xl font-semibold">
            Combo Product Requisition Setup
          </h3>
          {productionNumber && (
            <div className="text-sm text-gray-500 mt-1">
              Production: {productionNumber}
            </div>
          )}
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      width={1000}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Create Requisition
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Header Info */}
        <Card size="small">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Combo Product</div>
              <div className="font-semibold">{fullComboProduct?.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Batch Size</div>
              <div className="font-semibold text-lg text-green-600">
                {totalBatchSize} {fullComboProduct?.baseUnit?.name || "units"}
              </div>
            </div>
          </div>
        </Card>

        {/* Variant Breakdown */}
        <Card title="Combo Variant Breakdown" size="small">
          {variantBreakdown.length > 0 ? (
            <Table
              columns={variantBreakdownColumns}
              dataSource={variantBreakdown}
              rowKey="comboVariantId"
              pagination={false}
              size="small"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-exclamation-circle text-4xl mb-2 block"></i>
              <p className="text-lg font-medium">
                No variant breakdown available
              </p>
              <p className="text-sm">
                Plan items or combo variant details may be missing.
              </p>
            </div>
          )}
        </Card>

        {/* Product Variant Requirements Summary */}
        <Card title="Product Variant Requirements (Total)" size="small">
          {productVariantRequirements.length > 0 ? (
            <>
              <Table
                columns={requirementsColumns}
                dataSource={productVariantRequirements}
                rowKey={(record) => `${record.productId}-${record.variantId}`}
                pagination={false}
                size="small"
              />
              <div className="mt-4 bg-gray-50 p-3 rounded">
                <Space>
                  <span className="font-medium">
                    Total Unique Product Variants:{" "}
                    {productVariantRequirements.length}
                  </span>
                  <span className="font-medium">
                    Total Items:{" "}
                    {productVariantRequirements.reduce(
                      (sum, r) => sum + r.requiredQuantity,
                      0,
                    )}
                  </span>
                </Space>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-exclamation-circle text-4xl mb-2 block"></i>
              <p className="text-lg font-medium">No requirements calculated</p>
              <p className="text-sm">
                Combo variants may not have product items configured.
              </p>
            </div>
          )}
        </Card>

        {/* Packaging Materials Requirements Section */}
        <Card title="Packaging Material Requirements (Total)" size="small">
          {packagingRequirements.length > 0 ? (
            <>
              <Table
                columns={packagingColumns}
                dataSource={packagingRequirements}
                rowKey="materialId"
                pagination={false}
                size="small"
              />
              <div className="mt-4 bg-purple-50 p-3 rounded">
                <Space>
                  <span className="font-medium text-purple-900">
                    Total Packaging Items: {packagingRequirements.length}
                  </span>
                </Space>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <SettingOutlined className="text-4xl mb-2 block" />
              <p className="text-lg font-medium">No packaging materials required</p>
              <p className="text-sm">
                Combo variants may not have packaging BOM configured.
              </p>
            </div>
          )}
        </Card>

        {/* Purpose & Notes */}
        <Card title="Additional Information" size="small">
          <Space direction="vertical" className="w-full">
            <div>
              <label className="block text-sm font-medium mb-1">
                Purpose <span className="text-red-500">*</span>
              </label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter purpose of requisition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </Space>
        </Card>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-info-circle text-blue-600 text-xl mt-1"></i>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                About Combo Product Requisitions
              </h4>
              <p className="text-sm text-blue-800">
                This requisition will reserve the required product variants from
                inventory. Once approved, the variants will be deducted from
                stock and allocated for this combo product production. Make sure
                sufficient stock is available before creating the requisition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ComboProductRequisitionSetupModal;
