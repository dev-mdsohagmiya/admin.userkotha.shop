import {
  Button,
  Card,
  Checkbox,
  Empty,
  InputNumber,
  Skeleton,
  Table,
  Tag,
  DatePicker,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "../../components/common/Loading";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import {
  useCreateComboProductionPlanMutation,
  useGetComboProductByIdQuery,
  useGetPackagingBOMQuery,
} from "../../redux/features/comboProduct/comboProductApi";
import { useGetProductPackagingMaterialBOMQuery } from "../../redux/features/product/productApi";
import { IComboProductVariant } from "../../types/comboProduct";

interface VariantQty {
  comboVariantId: string;
  variantName: string;
  qty: number;
}

interface PackagingBOMChecklistProps {
  productId: string;
  variantId: string;
  plannedQty: number;
  selected: string[];
  onChange: (selected: string[]) => void;
  onAvailableIdsLoad?: (ids: string[]) => void;
}

const PackagingBOMChecklist: React.FC<PackagingBOMChecklistProps> = ({
  productId,
  variantId,
  plannedQty,
  selected,
  onChange,
  onAvailableIdsLoad,
}) => {
  const { data, isLoading, isFetching } =
    useGetProductPackagingMaterialBOMQuery(
      { productId, selectedVariantId: variantId },
      { skip: !productId || !variantId },
    );

  const items: any[] = data?.data || [];

  const allIds = useMemo(
    () => items.map((it) => it.materialId || it.id).filter(Boolean),
    [items],
  );

  useEffect(() => {
    if (allIds.length > 0) {
      onAvailableIdsLoad?.(allIds);
      if (selected.length === 0) {
        onChange(allIds);
      }
    }
  }, [allIds.length]);

  if (isLoading || isFetching) {
    return (
      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Empty
          description="No packaging BOM configured for this variant"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const toggle = (id: string, checked: boolean) => {
    onChange(checked ? [...selected, id] : selected.filter((x) => x !== id));
  };

  const toggleAll = (checked: boolean) => {
    onChange(checked ? allIds : []);
  };

  const allChecked = selected.length === allIds.length && allIds.length > 0;
  const indeterminate = selected.length > 0 && selected.length < allIds.length;
  const selectedRequired = items
    .filter((it) => selected.includes(it.materialId || it.id))
    .reduce(
      (sum: number, it: any) => sum + plannedQty * (it.percentage || 0),
      0,
    );

  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-box text-purple-600"></i>
          <span className="font-semibold text-gray-800">
            Packaging Materials
          </span>
          <Tag color="purple" className="!m-0">
            {items.length} items
          </Tag>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Tag color="blue" className="!m-0">
            Selected: {selected.length}/{allIds.length}
          </Tag>
          <Checkbox
            checked={allChecked}
            indeterminate={indeterminate}
            onChange={(e) => toggleAll(e.target.checked)}
          >
            <span className="text-sm font-medium">Select All</span>
          </Checkbox>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item: any) => {
          const id = item.materialId || item.id;
          const isChecked = selected.includes(id);
          const perUnit = item.percentage || 0;
          const requiredQty = plannedQty * perUnit;
          const stock = item.currentStock || 0;
          const insufficient = isChecked && stock < requiredQty;
          const unit = item.unit || "units";

          return (
            <label
              key={id}
              className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                isChecked
                  ? insufficient
                    ? "bg-red-50 border-red-300 shadow-sm"
                    : "bg-white border-purple-400 shadow-sm"
                  : "bg-white border-gray-200 hover:border-purple-200"
              }`}
            >
              <Checkbox
                checked={isChecked}
                onChange={(e) => toggle(id, e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">
                  {item.materialName || "Unknown Material"}
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Tag color="geekblue" className="!m-0 !text-xs">
                    {perUnit} {unit}/unit
                  </Tag>
                  <Tag
                    color={insufficient ? "red" : "green"}
                    className="!m-0 !text-xs"
                  >
                    Need: {requiredQty.toFixed(2)} {unit}
                  </Tag>
                  <Tag
                    color={insufficient ? "red" : "default"}
                    className="!m-0 !text-xs"
                  >
                    Stock: {stock} {unit}
                  </Tag>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-gray-700">
            Total selected packaging required:
          </span>
          <Tag color="purple" className="!m-0 !text-sm !font-semibold">
            {selectedRequired.toFixed(2)} units
          </Tag>
        </div>
      )}
    </div>
  );
};

const ComboPlanning: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: comboProductData,
    isLoading: comboProductLoading,
    isFetching: comboProductFetching,
  } = useGetComboProductByIdQuery(id!);
  const comboProduct = comboProductData?.data;

  const [createComboProductionPlan, { isLoading: isCreatingPlan }] =
    useCreateComboProductionPlanMutation();

  // Fetch packaging BOM
  const { data: bomResponse, isLoading: bomLoading } = useGetPackagingBOMQuery(
    id || "",
    { skip: !id },
  );

  const bomItems = bomResponse?.data || [];

  const [variantQtys, setVariantQtys] = useState<VariantQty[]>([]);
  const [planDate, setPlanDate] = useState<dayjs.Dayjs>(dayjs());
  const [selectedPackaging, setSelectedPackaging] = useState<
    Record<string, string[]>
  >({});
  const [availablePackaging, setAvailablePackaging] = useState<
    Record<string, string[]>
  >({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const handlePackagingChange = (key: string, ids: string[]) => {
    setSelectedPackaging((prev) => ({ ...prev, [key]: ids }));
  };

  const handleAvailablePackagingLoad = (key: string, ids: string[]) => {
    setAvailablePackaging((prev) => {
      const existing = prev[key];
      if (existing && existing.length === ids.length) return prev;
      return { ...prev, [key]: ids };
    });
  };

  useEffect(() => {
    if (comboProduct?.variants) {
      const initialQtys = comboProduct.variants.map(
        (variant: IComboProductVariant) => ({
          comboVariantId: variant.id!,
          variantName: variant.name,
          qty: 0,
        }),
      );
      setVariantQtys(initialQtys);
    }
  }, [comboProduct]);

  const totalQty = variantQtys.reduce((sum, item) => sum + item.qty, 0);

  const handleQtyChange = (comboVariantId: string, qty: number | null) => {
    setVariantQtys((prev) =>
      prev.map((item) =>
        item.comboVariantId === comboVariantId
          ? { ...item, qty: qty || 0 }
          : item,
      ),
    );
  };

  const planningColumns = [
    {
      title: "Combo Variant",
      dataIndex: "variantName",
      key: "variantName",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Qty",
      key: "qty",
      render: (_: any, record: VariantQty) => (
        <InputNumber
          min={0}
          value={record.qty}
          onChange={(value) => handleQtyChange(record.comboVariantId, value)}
          placeholder="Enter qty"
          className="w-full"
        />
      ),
    },
  ];

  // Product Variant Requirements Card
  const ProductVariantRequirementsCard = () => {
    const calculateRequiredVariants = () => {
      const requirements: {
        [key: string]: {
          productName: string;
          variantName: string;
          conversionFactor: number;
          totalQty: number;
          totalQtyInBaseUnit: number;
          unit: string;
          baseUnit: string;
          details: Array<{
            comboVariantName: string;
            qty: number;
            requiredQty: number;
            requiredQtyInBaseUnit: number;
          }>;
        };
      } = {};

      variantQtys.forEach((variantQty) => {
        if (variantQty.qty === 0) return;

        const comboVariant = comboProduct?.variants?.find(
          (v: IComboProductVariant) => v.id === variantQty.comboVariantId,
        );

        if (comboVariant?.items) {
          comboVariant.items.forEach((item: any) => {
            const key = `${item.productId}-${item.variantId}`;
            // item.variant contains the product variant data with conversionFactor
            const productVariant = item.variant;
            const conversionFactor = productVariant?.conversionFactor || 1;
            const requiredQty = item.quantity * variantQty.qty;
            // Calculate quantity in base unit: (requiredQty * conversionFactor in grams) / 1000 = kg
            const requiredQtyInBaseUnit =
              (requiredQty * conversionFactor) / 1000;

            if (!requirements[key]) {
              requirements[key] = {
                productName: item.product?.name || "Unknown Product",
                variantName: productVariant?.name || "Unknown Variant",
                conversionFactor: conversionFactor,
                totalQty: 0,
                totalQtyInBaseUnit: 0,
                unit: productVariant?.unit?.name || "units",
                baseUnit: item.product?.baseUnit?.symbol || "kg",
                details: [],
              };
            }

            requirements[key].totalQty += requiredQty;
            requirements[key].totalQtyInBaseUnit += requiredQtyInBaseUnit;
            requirements[key].details.push({
              comboVariantName: comboVariant.name,
              qty: variantQty.qty,
              requiredQty,
              requiredQtyInBaseUnit,
            });
          });
        }
      });

      return Object.entries(requirements).map(([key, value]) => ({
        key,
        ...value,
      }));
    };

    const requirements = calculateRequiredVariants();

    const columns = [
      {
        title: "Product Variant",
        key: "variant",
        width: "30%",
        render: (_: any, record: any) => (
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-base text-gray-800">
              {record.productName}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Tag color="blue" className="!m-0">
                {record.variantName}
              </Tag>
              <Tag color="green" className="!m-0">
                {record.conversionFactor}g
              </Tag>
            </div>
          </div>
        ),
      },
      {
        title: "Required Quantity",
        key: "totalQty",
        width: "25%",
        render: (_: any, record: any) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-primary-600">
                {record.totalQty}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                {record.unit}
              </span>
            </div>
            <div className="flex items-baseline gap-1 text-sm">
              <span className="text-gray-500">=</span>
              <span className="font-semibold text-gray-700">
                {record.totalQtyInBaseUnit.toFixed(3)}
              </span>
              <span className="text-gray-500">{record.baseUnit}</span>
            </div>
          </div>
        ),
      },
      {
        title: "Calculation Breakdown",
        key: "breakdown",
        width: "45%",
        render: (_: any, record: any) => (
          <div className="space-y-2">
            {record.details.map((detail: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Tag color="purple" className="!m-0 font-medium">
                    {detail.comboVariantName}
                  </Tag>
                  <span className="text-sm text-gray-600">
                    {detail.qty} ×{" "}
                    {(detail.requiredQty / detail.qty).toFixed(2)} =
                  </span>
                  <span className="font-semibold text-gray-800">
                    {detail.requiredQty} {record.unit}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded border border-gray-200">
                  {detail.requiredQtyInBaseUnit.toFixed(3)} {record.baseUnit}
                </div>
              </div>
            ))}
          </div>
        ),
      },
    ];

    return (
      <Card title="Product Variant Requirements" size="small">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total Batch Size:</span>
            <span className="font-bold ">
              {totalQty} {comboProduct?.baseUnit?.name || "Units"}
            </span>
          </div>
        </div>
        {requirements.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={requirements}
              pagination={false}
              size="small"
              bordered
              expandable={{
                expandedRowKeys,
                onExpand: (expanded, record: any) => {
                  setExpandedRowKeys((prev) =>
                    expanded
                      ? [...prev, record.key]
                      : prev.filter((k) => k !== record.key),
                  );
                },
                expandedRowRender: (record: any) => {
                  const [productId, variantId] = record.key.split("-");
                  return (
                    <PackagingBOMChecklist
                      productId={productId}
                      variantId={variantId}
                      plannedQty={record.totalQty}
                      selected={selectedPackaging[record.key] || []}
                      onChange={(ids) =>
                        handlePackagingChange(record.key, ids)
                      }
                      onAvailableIdsLoad={(ids) =>
                        handleAvailablePackagingLoad(record.key, ids)
                      }
                    />
                  );
                },
                expandIcon: ({ expanded, onExpand, record }) => (
                  <Button
                    size="small"
                    shape="circle"
                    type={expanded ? "primary" : "default"}
                    icon={
                      <i
                        className={`fa-solid ${
                          expanded ? "fa-chevron-up" : "fa-box"
                        } text-xs`}
                      ></i>
                    }
                    onClick={(e) => onExpand(record, e)}
                  />
                ),
                rowExpandable: () => true,
              }}
            />
            <div className="mt-4 p-3 bg-linear-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Unique Product Variants:
                  </span>
                  <Tag color="blue" className="!text-base !px-3 !py-1">
                    {requirements.length}
                  </Tag>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Total Weight Required:
                  </span>
                  <Tag
                    color="green"
                    className="!text-base !px-3 !py-1 !font-bold"
                  >
                    {requirements
                      .reduce((sum, r) => sum + r.totalQtyInBaseUnit, 0)
                      .toFixed(3)}{" "}
                    kg
                  </Tag>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fa-solid fa-info-circle text-3xl mb-2 block"></i>
            <p>Enter quantities above to see required product variants</p>
          </div>
        )}
      </Card>
    );
  };

  // Packaging Requirements Card
  const PackagingRequirementsCard = () => {
    const calculatePackagingRequirements = () => {
      const requirements: {
        [materialId: string]: {
          materialName: string;
          totalQty: number;
          unit: string;
          currentStock: number;
          details: Array<{
            comboVariantName: string;
            qty: number;
            qtyPerUnit: number;
            requiredQty: number;
          }>;
        };
      } = {};

      variantQtys.forEach((variantQty) => {
        if (variantQty.qty === 0) return;

        // Find packaging BOM items for this variant
        const variantBOMItems = bomItems.filter(
          (bom: any) => bom.comboVariantId === variantQty.comboVariantId,
        );

        variantBOMItems.forEach((bomItem: any) => {
          const materialId = bomItem.materialId;
          const quantity = bomItem.percentage; // Backend sends 'percentage' as the quantity value
          const requiredQty = variantQty.qty * quantity;

          if (!requirements[materialId]) {
            requirements[materialId] = {
              materialName: bomItem.materialName || "Unknown Material",
              unit: bomItem.unit || "units",
              currentStock: bomItem.currentStock || 0,
              totalQty: 0,
              details: [],
            };
          }

          requirements[materialId].totalQty += requiredQty;
          requirements[materialId].details.push({
            comboVariantName: variantQty.variantName,
            qty: variantQty.qty,
            qtyPerUnit: quantity,
            requiredQty,
          });
        });
      });

      return Object.entries(requirements).map(([materialId, value]) => ({
        key: materialId,
        ...value,
      }));
    };

    const requirements = calculatePackagingRequirements();
    const hasPackagingBOM = bomItems.length > 0;

    const columns = [
      {
        title: "Packaging Material",
        key: "material",
        render: (_: any, record: any) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{record.materialName}</span>
          </div>
        ),
      },
      {
        title: "Current Stock",
        key: "stock",
        render: (_: any, record: any) => (
          <span
            className={
              record.currentStock < record.totalQty
                ? "text-red-600 font-semibold"
                : ""
            }
          >
            {record.currentStock} {record.unit}
          </span>
        ),
      },
      {
        title: "Required Quantity",
        dataIndex: "totalQty",
        key: "totalQty",
        render: (qty: number, record: any) => (
          <span className="font-semibold text-purple-700">
            {qty.toFixed(2)} {record.unit}
          </span>
        ),
      },
      {
        title: "Status",
        key: "status",
        render: (_: any, record: any) => {
          const sufficient = record.currentStock >= record.totalQty;
          return (
            <Tag color={sufficient ? "green" : "red"}>
              {sufficient ? "✓ Sufficient" : "⚠ Insufficient"}
            </Tag>
          );
        },
      },
      {
        title: "Breakdown",
        key: "breakdown",
        render: (_: any, record: any) => (
          <div className="space-y-1">
            {record.details.map((detail: any, idx: number) => (
              <div key={idx} className="text-sm text-gray-600">
                {detail.comboVariantName}: {detail.qty} × {detail.qtyPerUnit} ={" "}
                {detail.requiredQty.toFixed(2)}
              </div>
            ))}
          </div>
        ),
      },
    ];

    if (!hasPackagingBOM) {
      return (
        <Card
          title={
            <div className="">
              <span>Packaging Requirements</span>
            </div>
          }
          size="small"
        >
          <div className="text-center py-8">
            <i className="fa-solid fa-box-open text-gray-400 text-4xl mb-3 block"></i>
            <p className="text-gray-500 mb-3">No packaging BOM configured</p>
            <Button
              type="primary"
              onClick={() => navigate(`/combo-product/${id}/packaging-bom`)}
            >
              Configure Packaging BOM
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="">
              <span>Packaging Requirements</span>
            </div>
            <Button
              size="small"
              onClick={() => navigate(`/combo-product/${id}/packaging-bom`)}
            >
              Manage BOM
            </Button>
          </div>
        }
        size="small"
      >
        {requirements.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={requirements}
              pagination={false}
              size="small"
            />
            <div className="mt-4 flex justify-between items-center">
              <span>Total Packaging Materials: {requirements.length}</span>
              {requirements.some((r) => r.currentStock < r.totalQty) && (
                <Tag color="red">
                  <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                  Some materials have insufficient stock
                </Tag>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fa-solid fa-info-circle text-3xl mb-2 block"></i>
            <p>Enter quantities above to see packaging requirements</p>
          </div>
        )}
      </Card>
    );
  };

  const handlePlan = async () => {
    // Filter items with quantity > 0
    const itemsToPlan = variantQtys
      .filter((item) => item.qty > 0)
      .map((item) => {
        const comboVariant = comboProduct?.variants?.find(
          (v: IComboProductVariant) => v.id === item.comboVariantId,
        );

        const excludedMaterialIds: string[] = [];
        (comboVariant?.items || []).forEach((pi: any) => {
          const key = `${pi.productId}-${pi.variantId}`;
          const all = availablePackaging[key];
          if (!all || all.length === 0) return;
          const sel = selectedPackaging[key] || [];
          all
            .filter((materialId) => !sel.includes(materialId))
            .forEach((materialId) => {
              excludedMaterialIds.push(materialId);
            });
        });

        return {
          comboVariantId: item.comboVariantId,
          plannedQty: item.qty,
          excludedMaterialIds,
        };
      });

    if (itemsToPlan.length === 0) {
      toast.warning("Please enter quantities for at least one variant");
      return;
    }

    console.log("Planning with items:", itemsToPlan);

    try {
      await createComboProductionPlan({
        items: itemsToPlan,
        notes: `Production plan for ${comboProduct?.name}`,
        status: "active",
        startDate: planDate.toISOString(),
      }).unwrap();

      toast.success("Combo production plan created successfully!");
      navigate(-1); // Go back to previous page
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to create combo production plan",
      );
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (comboProductLoading || comboProductFetching || bomLoading) {
    return <Loader />;
  }

  return (
    <div>
      <PageMeta
        title="Combo Planning | ERP"
        description="Combo Product Planning"
      />

      <PageHeader
        title="Combo Product Planning"
        subtitle={`Planning for ${comboProduct?.name}`}
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Combo Products", path: "/combo-products" },
          {
            title: comboProduct?.name || "Combo Product",
            path: `/combo-product/${id}`,
          },
          { title: "Planning" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Planning Card */}
        <Card title="Planning" size="small">
          <div className="flex justify-end mb-4">
            <div className="text-right flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Plan Date:</span>
                <DatePicker
                  value={planDate}
                  onChange={(date) => setPlanDate(date || dayjs())}
                  format="YYYY-MM-DD"
                  allowClear={false}
                />
              </div>
              <strong>Total Qty: {totalQty}</strong>
            </div>
          </div>
          <Table
            columns={planningColumns}
            dataSource={variantQtys}
            rowKey="comboVariantId"
            pagination={false}
          />
        </Card>

        {/* Product Variant Requirements Card */}
        <ProductVariantRequirementsCard />

        {/* Packaging Requirements Card */}
        <PackagingRequirementsCard />

        {/* Info Card */}
        <Card size="small">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-info-circle text-blue-600 text-xl mt-1"></i>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  About Combo Product Planning
                </h4>
                <p className="text-sm text-blue-800">
                  Combo products are assembled from existing product variants in
                  your inventory. When you create a production plan, the system
                  will calculate the required quantities of each product variant
                  based on the combo composition. You'll need to create a
                  requisition to reserve these product variants before starting
                  production.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handlePlan}
            loading={isCreatingPlan}
            disabled={totalQty === 0}
          >
            Create Production Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComboPlanning;