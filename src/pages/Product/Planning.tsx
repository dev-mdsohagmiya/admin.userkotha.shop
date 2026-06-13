import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Table,
  InputNumber,
  Space,
  Tooltip,
  DatePicker,
  Skeleton,
} from "antd";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import {
  useGetProductByIdQuery,
  useGetProductRawMaterialBOMQuery,
  useGetProductPackagingMaterialBOMQuery,
  useCreateProductionPlanMutation,
} from "../../redux/features/product/productApi";
import { DataTable } from "../../components/common/Tables";
import PackagingBOMSetupModal from "../../components/common/Modals/BOM/PackagingMaterialBOMSetupModal";
import RawMaterialBOMSetupModal from "../../components/common/Modals/BOM/RawMaterialBOMSetupModal";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useGetMaterialsQuery } from "../../redux/features/material/materialApi";
import CurrencyIcon from "../../components/common/CurrencyIcon";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import { Scale, Package, Banknote, Calendar } from "lucide-react";

interface VariantQty {
  variantId: string;
  variantName: string;
  conversionFactor: number;
  qty: number;
}

const Planning: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: productData,
    isLoading: productLoading,
    isFetching: productFetching,
  } = useGetProductByIdQuery(id!, { skip: !id });
  const product = productData?.data;

  // Raw Material Data
  const { data: rawBomData, isLoading: rawBomLoading, isFetching: rawBomFetching } =
    useGetProductRawMaterialBOMQuery(product?.id, { skip: !product?.id });
  const rawMaterials = rawBomData?.data || [];

  const [variantQtys, setVariantQtys] = useState<VariantQty[]>([]);
  const [openPackagingBOMSetup, setOpenPackagingBOMSetup] = useState(false);
  const [openRawMaterialBOMSetup, setOpenRawMaterialBOMSetup] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [planDate, setPlanDate] = useState<dayjs.Dayjs>(dayjs());

  // Packaging Material Data
  const {
    data: packagingBomData,
    isLoading: packagingBomLoading,
    isFetching: packagingIsFetching,
  } = useGetProductPackagingMaterialBOMQuery(
    {
      productId: product?.id,
      selectedVariantId,
    },
    { skip: !product?.id },
  );
  const packagingMaterials = packagingBomData?.data || [];

  // Fetch all materials to get costs
  const { data: allMaterialsData } = useGetMaterialsQuery([
    { name: "isActive", value: true },
  ]);
  const allMaterials = useMemo(
    () => allMaterialsData?.data || [],
    [allMaterialsData],
  );

  const getMaterialCost = (materialId: string) => {
    const material = allMaterials.find((m: any) => m.id === materialId);
    return material?.costPerUnit || 0;
  };

  // Initialize Variant Quantities
  useEffect(() => {
    if (product?.variants) {
      const initialQtys = product.variants.map((variant: any) => ({
        variantId: variant.id,
        variantName: variant.name,
        conversionFactor: variant.conversionFactor || 1,
        qty: 0,
      }));
      setVariantQtys(initialQtys);
    }
  }, [product]);

  // Set default selected variant if none selected
  useEffect(() => {
    if (
      product?.variants &&
      product.variants.length > 0 &&
      !selectedVariantId
    ) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  // Calculate total quantity in base unit (kg)
  const totalQty = variantQtys.reduce((sum, item) => {
    const qtyInKg = (item.qty * item.conversionFactor) / 1000;
    return sum + qtyInKg;
  }, 0);

  const handleQtyChange = (variantId: string, qty: number | null) => {
    setVariantQtys((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, qty: qty || 0 } : item,
      ),
    );
  };

  const PlanningSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton.Button active size="large" style={{ width: 200 }} />
          <Skeleton.Button active size="small" style={{ width: 300 }} />
        </div>
        <Skeleton.Button active size="large" style={{ width: 150 }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} size="small" className="border-none shadow-sm">
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </div>

      <Card size="small" className="shadow-sm">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>

      <Card size="small" className="shadow-sm">
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </div>
  );

  const [createProductionPlan, { isLoading: isCreatingPlan }] =
    useCreateProductionPlanMutation();

  if (productLoading || productFetching) {
    return <PlanningSkeleton />;
  }

  const planningColumns = [
    {
      title: "Variant",
      dataIndex: "variantName",
      key: "variantName",
    },
    {
      title: "Conversion Factor (g)",
      dataIndex: "conversionFactor",
      key: "conversionFactor",
      render: (cf: number) => `${cf}g`,
    },
    {
      title: "Planned Qty",
      key: "qty",
      render: (_: any, record: VariantQty) => (
        <InputNumber
          min={0}
          value={record.qty}
          onChange={(value) => handleQtyChange(record.variantId, value)}
          placeholder="Enter qty"
        />
      ),
    },
    {
      title: "Total (kg)",
      key: "totalKg",
      render: (_: any, record: VariantQty) => {
        const totalKg = (record.qty * record.conversionFactor) / 1000;
        return <strong>{totalKg.toFixed(3)} kg</strong>;
      },
    },
  ];

  /* --- Raw Material Logic --- */
  const calculateRawQuantityToRequest = (item: any) => {
    return totalQty ? (totalQty * item.percentage) / 100 : 0;
  };

  const rawEstimatedCost = rawMaterials.reduce((sum: number, item: any) => {
    const qty = calculateRawQuantityToRequest(item);
    return sum + qty * getMaterialCost(item.materialId);
  }, 0);

  const rawItemsToRequest = rawMaterials.filter(
    (item: any) => calculateRawQuantityToRequest(item) > 0,
  ).length;

  const rawColumns = [
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      render: (name: string, record: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            {record.unit}
          </span>
        </div>
      ),
    },
    {
      title: "Required (%)",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: number) => (
        <span className="font-semibold text-gray-700">{percentage}%</span>
      ),
    },
    {
      title: "Quantity to Request",
      key: "quantityToRequest",
      render: (_: any, record: any) => (
        <span className="font-bold text-primary">
          {calculateRawQuantityToRequest(record).toFixed(2)} {record.unit}
        </span>
      ),
    },
    {
      title: "Rate",
      key: "rate",
      render: (_: any, record: any) => (
        <span className="text-gray-500">
          <CurrencyIcon size={12} className="inline-block mr-1" />
          {getMaterialCost(record.materialId).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Est. Cost",
      key: "estCost",
      render: (_: any, record: any) => {
        const cost =
          calculateRawQuantityToRequest(record) *
          getMaterialCost(record.materialId);
        return (
          <span className="font-semibold text-gray-900">
            <CurrencyIcon size={13} className="inline-block mr-1" />
            {cost.toFixed(2)}
          </span>
        );
      },
    },
  ];

  /* --- Packaging Material Logic --- */
  const calculatePackagingQuantityToRequest = (item: any) => {
    const variantPlannedQty = variantQtys.find(
      (v) => v.variantId === selectedVariantId,
    );
    if (!variantPlannedQty || variantPlannedQty.qty === 0) return 0;
    return variantPlannedQty.qty * item.percentage;
  };

  const packagingItemsToRequest = packagingMaterials.filter(
    (item: any) => calculatePackagingQuantityToRequest(item) > 0,
  ).length;

  const packagingEstimatedCost = packagingMaterials.reduce(
    (sum: number, item: any) => {
      const qty = calculatePackagingQuantityToRequest(item);
      return sum + qty * getMaterialCost(item.materialId);
    },
    0,
  );

  const packagingColumns = [
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      render: (name: string, record: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            {record.unit}
          </span>
        </div>
      ),
    },
    {
      title: "Qty per Unit",
      dataIndex: "percentage",
      key: "qtyPerUnit",
      render: (percentage: number, record: any) => (
        <span className="text-gray-700 font-medium">
          {percentage} {record.unit}
        </span>
      ),
    },
    {
      title: "Quantity to Request",
      key: "quantityToRequest",
      render: (_: any, record: any) => (
        <span className="font-bold text-primary">
          {calculatePackagingQuantityToRequest(record).toFixed(2)} {record.unit}
        </span>
      ),
    },
    {
      title: "Rate",
      key: "rate",
      render: (_: any, record: any) => (
        <span className="text-gray-500">
          <CurrencyIcon size={12} className="inline-block mr-1" />
          {getMaterialCost(record.materialId).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Est. Cost",
      key: "estCost",
      render: (_: any, record: any) => {
        const cost =
          calculatePackagingQuantityToRequest(record) *
          getMaterialCost(record.materialId);
        return (
          <span className="font-semibold text-gray-900">
            <CurrencyIcon size={13} className="inline-block mr-1" />
            {cost.toFixed(2)}
          </span>
        );
      },
    },
  ];

  const handlePlan = async () => {
    const itemsToPlan = variantQtys
      .filter((item) => item.qty > 0)
      .map((item) => ({
        variantId: item.variantId,
        plannedQty: item.qty,
      }));

    if (itemsToPlan.length === 0) {
      toast.warning("Please enter quantities for at least one variant");
      return;
    }

    try {
      await createProductionPlan({
        productId: id!,
        items: itemsToPlan,
        startDate: planDate.toISOString(),
      }).unwrap();
      toast.success("Production plan created successfully!");
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create production plan");
    }
  };

  return (
    <div>
      <PageMeta title="Planning | ERP" description="Product Planning" />

      <PageHeader
        title="Planning"
        subtitle={`Planning for ${product?.name}`}
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Products", path: "/products" },
          { title: product?.name || "Product", path: `/product/${id}` },
          { title: "Planning" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <PageHeaderCard
          icon={<Scale className="text-white" />}
          color="blue"
          title="Total Batch Size"
          value={`${totalQty.toFixed(2)} kg`}
        />
        <PageHeaderCard
          icon={<Package className="text-white" />}
          color="purple"
          title="Materials"
          value={`${rawItemsToRequest} Raw / ${packagingMaterials.length > 0 ? 1 : 0} Pkg`}
        />
        <PageHeaderCard
          icon={<Banknote className="text-white" />}
          color="green"
          title="Raw Material Cost"
          value={
            <div className="flex items-center">
              <CurrencyIcon size={20} className="mr-1" />
              {rawEstimatedCost.toFixed(2)}
            </div>
          }
        />
        <PageHeaderCard
          icon={<Banknote className="text-white" />}
          color="cyan"
          title="Packaging Cost"
          value={
            <div className="flex items-center">
              <CurrencyIcon size={20} className="mr-1" />
              {packagingEstimatedCost.toFixed(2)}
            </div>
          }
        />
        <PageHeaderCard
          icon={<Calendar className="text-white" />}
          color="orange"
          title="Planned Date"
          value={planDate.format("DD MMM, YYYY")}
        />
      </div>

      <div className="mb-6">
        <PageHeaderCard
          icon={<Banknote className="text-white" />}
          color="indigo"
          title="Total Estimated Production Cost"
          value={
            <div className="flex items-center">
              <CurrencyIcon size={24} className="mr-1" />
              {(rawEstimatedCost + packagingEstimatedCost).toFixed(2)}
            </div>
          }
        />
      </div>

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
              <strong>Total Batch Size: {totalQty.toFixed(3)} kg</strong>
            </div>
          </div>
          <Table
            columns={planningColumns}
            dataSource={variantQtys}
            rowKey="variantId"
            pagination={false}
          />
        </Card>

        {/* Raw Material Requisition Card */}
        {rawBomLoading || rawBomFetching ? (
          <Card title="Raw Material Requisition" size="small">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        ) : !rawBomLoading && rawMaterials.length === 0 ? (
          <Card title="Raw Material Requisition" size="small">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <i className="fa-solid fa-exclamation-triangle text-4xl mb-2 block"></i>
                <p className="text-lg font-medium">BOM is not configured yet</p>
                <p className="text-sm">
                  Please configure the Bill of Materials for raw materials.
                </p>
              </div>
              <Button
                type="primary"
                onClick={() => setOpenRawMaterialBOMSetup(true)}
              >
                Configure BOM
              </Button>
            </div>
          </Card>
        ) : (
          <Card title="Raw Material Requisition" size="small">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <strong>Batch Size: {totalQty.toFixed(3)} kg</strong>
              </div>
              <Button
                type="primary"
                size="middle"
                onClick={() => {
                  setOpenRawMaterialBOMSetup(true);
                }}
              >
                Update Raw Material BOM
              </Button>
            </div>
            <DataTable
              data={rawMaterials}
              loading={rawBomLoading}
              columns={rawColumns}
              rowKey="materialId"
              pagination={false}
            />
            <div className="mt-4">
              <Space size="large">
                <span>Items: {rawItemsToRequest}</span>
                <span className="flex items-center font-semibold text-gray-900">
                  Total Cost:
                  <CurrencyIcon size={14} className="inline-block mx-1" />
                  {rawEstimatedCost.toFixed(2)}
                </span>
              </Space>
            </div>
          </Card>
        )}

        {/* Packaging Material Requisition Card */}
        <Card title="Packaging Material Requisition" size="small">
          <div className="mb-4">
            <div className="flex justify-between flex-wrap mb-5 mt-2 gap-2">
              <div className="flex gap-2">
                {product?.variants?.map((variant: any) => {
                  const isSelected = variant.id === selectedVariantId;

                  return (
                    <div
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`flex gap-2 items-center justify-center p-1 w-20 rounded border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-green-600 bg-green-50 shadow-sm"
                          : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
                      }`}
                    >
                      <h4
                        className={`text-xs font-medium truncate ${
                          isSelected ? "text-green-700" : "text-gray-800"
                        }`}
                      >
                        {variant.name || "Variant"}
                      </h4>
                      {isSelected && (
                        <IoCheckmarkCircleOutline className="text-green-600 text-sm " />
                      )}
                    </div>
                  );
                })}
              </div>

              {packagingMaterials.length > 0 && (
                <Tooltip
                  title={
                    "Please select a variant before updating Packaging Material BOM"
                  }
                >
                  <Button
                    size="middle"
                    type="primary"
                    onClick={() => {
                      if (!selectedVariantId) return;
                      setOpenPackagingBOMSetup(true);
                    }}
                  >
                    Update Packaging Material BOM
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>

          {packagingBomLoading || packagingIsFetching ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : packagingMaterials.length > 0 ? (
            <>
              <DataTable
                data={packagingMaterials}
                loading={packagingBomLoading || packagingIsFetching}
                columns={packagingColumns}
                rowKey="materialId"
                pagination={false}
              />
              <div className="mt-4">
                <Space size="large">
                  <span>Items: {packagingItemsToRequest}</span>
                  <span className="flex items-center font-semibold text-gray-900">
                    Total Cost:
                    <CurrencyIcon size={14} className="inline-block mx-1" />
                    {packagingEstimatedCost.toFixed(2)}
                  </span>
                </Space>
              </div>
            </>
          ) : (
            <Card size="small">
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <i className="fa-solid fa-exclamation-triangle text-4xl mb-2 block"></i>
                  <p className="text-lg font-medium">
                    BOM is not configured yet
                  </p>
                  <p className="text-sm">
                    Please configure the Bill of Materials for packaging
                    materials.
                  </p>
                </div>
                <Button
                  type="primary"
                  onClick={() => setOpenPackagingBOMSetup(true)}
                >
                  Configure BOM
                </Button>
              </div>
            </Card>
          )}
        </Card>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="primary" onClick={handlePlan} loading={isCreatingPlan}>
            Plan
          </Button>
        </div>
      </div>

      {openPackagingBOMSetup && (
        <PackagingBOMSetupModal
          open={openPackagingBOMSetup}
          setOpen={setOpenPackagingBOMSetup}
          variantIdPus={selectedVariantId}
          product={product}
        />
      )}

      {openRawMaterialBOMSetup && (
        <RawMaterialBOMSetupModal
          open={openRawMaterialBOMSetup}
          setOpen={setOpenRawMaterialBOMSetup}
          product={product}
        />
      )}
    </div>
  );
};

export default Planning;
