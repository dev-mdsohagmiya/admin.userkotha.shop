import {
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
  message,
  Skeleton,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { BOMItem } from "../../../../moc/localStorageUtils";
import { useGetMaterialsQuery } from "../../../../redux/features/material/materialApi";
import {
  useGetProductByIdQuery,
  useGetProductPackagingMaterialBOMQuery,
  useUpdatePackagingMaterialBOMMutation,
} from "../../../../redux/features/product/productApi";
import { IProductData } from "../../../../types/product";

const { Title, Text } = Typography;
const { Option } = Select;

interface RawMaterialBOMSetupModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product: Pick<IProductData, "id" | "name"> & { variants?: any[] };
  variantIdPus?: string; // optional
}

const PackagingMaterialBOMSetupModal: React.FC<
  RawMaterialBOMSetupModalProps
> = ({ open, setOpen, product, variantIdPus }) => {
  const [form] = Form.useForm();
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);

  // 🔹 Fetch full product details to get variants
  const { data: fullProductData } = useGetProductByIdQuery(product.id, {
    skip: !product.id,
  });

  const variants = useMemo(() => {
    return fullProductData?.data?.variants || product?.variants || [];
  }, [fullProductData, product]);

  // 🔹 Raw material list
  const { data: rawMaterialData, isLoading: isRawMaterialLoading } =
    useGetMaterialsQuery([
      { name: "limit", value: "50000" },
      { name: "type", value: "packaging" },
    ]);
  const rawMaterials = useMemo(
    () => rawMaterialData?.data || [],
    [rawMaterialData?.data],
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    typeof variantIdPus === "string" ? variantIdPus : (variants?.[0]?.id ?? ""),
  );

  // 🔹 Local state for category filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Extract unique categories from loaded materials
  const categories = useMemo(() => {
    const cats = new Map();
    rawMaterials.forEach((m: any) => {
      if (m.category && m.category.id) {
        cats.set(m.category.id, m.category);
      }
    });
    return Array.from(cats.values());
  }, [rawMaterials]);

  // Update selectedVariantId when variants are loaded
  useEffect(() => {
    if (!selectedVariantId && variants?.length > 0) {
      if (typeof variantIdPus === "string") {
        setSelectedVariantId(variantIdPus);
      } else {
        setSelectedVariantId(variants[0].id);
      }
    }
  }, [variants, selectedVariantId, variantIdPus]);

  const handleSelect = (id: string) => {
    setSelectedVariantId(id);
  };
  // 🔹 BOM API hooks
  const [updateBOM, { isLoading: bomSaving }] =
    useUpdatePackagingMaterialBOMMutation();

  // todo
  const {
    data: bomData,
    isLoading: isBomLoading,
    refetch,
  } = useGetProductPackagingMaterialBOMQuery({
    productId: product?.id,
    selectedVariantId,
  });

  const productByBom = useMemo(() => bomData?.data || [], [bomData]);

  // 🔹 Load existing BOM from backend (if any)
  useEffect(() => {
    if (productByBom && productByBom.length > 0) {
      setBomItems(productByBom);
    } else {
      setBomItems([]);
    }
  }, [productByBom]);

  // 🔹 Add or update item
  const handleAddItem = (values: any) => {
    const { materialId, quantity } = values;
    const selectedMaterial = rawMaterials.find((m: any) => m.id === materialId);
    if (!selectedMaterial) return;

    const newItem: BOMItem = {
      materialId: selectedMaterial.id,
      percentage: parseFloat(quantity), // Store quantity in percentage field for API
      variantId: selectedVariantId,
      type: "packaging",
      wastage: 0,
    };

    if (editingItem) {
      setBomItems((prev) =>
        prev.map((item) =>
          item.materialId === editingItem.materialId
            ? { ...item, ...newItem }
            : item,
        ),
      );
      setEditingItem(null);
    } else {
      const duplicate = bomItems.find((item) => item.materialId === materialId);
      if (duplicate) {
        message.error("This material is already added to BOM");
        return;
      }
      setBomItems((prev) => [...prev, newItem]);
    }

    form.resetFields();
  };

  // 🔹 Remove item
  const handleRemoveItem = (materialId: string) => {
    setBomItems((prev) =>
      prev.filter((item) => item.materialId !== materialId),
    );
  };

  // 🔹 Save BOM (create or update)
  const handleSaveBOM = async () => {
    if (bomItems.length === 0) {
      message.error("Please add at least one material to BOM");
      return;
    }

    try {
      const payload = {
        productId: product.id,
        variantId: selectedVariantId,
        data: bomItems,
      };

      const res = await updateBOM(payload).unwrap();

      if (res?.success) {
        toast.success(
          productByBom?.length > 0
            ? "BOM updated successfully!"
            : "BOM created successfully!",
        );
        refetch(); // refresh backend data
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error("Failed to save BOM");
      console.error(err);
    }
  };

  // 🔹 Custom validation for quantity
  const validateQuantity = (_: any, value: number) => {
    if (!value || value <= 0) {
      return Promise.reject(new Error("Must be greater than 0"));
    }
    return Promise.resolve();
  };

  // 🔹 Table columns
  const columns = [
    {
      title: "Packaging Material",
      key: "material",
      render: (_: any, record: BOMItem) => {
        const material = rawMaterials.find(
          (m: any) => m.id === record.materialId,
        );
        return (
          <span>
            {material?.name || "Unknown"}{" "}
            <Text type="secondary" style={{ fontSize: "12px" }}>
              ({material?.unit?.symbol || "pcs"})
            </Text>
          </span>
        );
      },
    },
    {
      title: "Quantity",
      dataIndex: "percentage",
      key: "quantity",
      render: (quantity: number, record: BOMItem) => {
        const material = rawMaterials.find(
          (m: any) => m.id === record.materialId,
        );
        return (
          <Tag className="bg-primary! text-white!">
            {quantity} {material?.unit?.symbol || "pcs"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BOMItem) => (
        <div className="flex gap-2">
          <Button
            size="small"
            danger
            onClick={() => handleRemoveItem(record.materialId)}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setEditingItem(null);
        setSelectedCategoryId(null);
        form.resetFields();
      }}
      footer={false}
      width={1000}
      title={
        <div>
          <Title level={4} className="mb-1">
            Configure Packaging BOM - {product.name}
          </Title>
          <Text type="secondary">
            Set up Bill of Packaging Materials with quantities per unit
          </Text>
        </div>
      }
    >
      {isRawMaterialLoading || isBomLoading ? (
        <div className="space-y-6">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton.Button
                key={i}
                active
                size="small"
                style={{ width: 100 }}
              />
            ))}
          </div>
          <Card size="small">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
          <Card size="small">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-800">Select Variant</h3>
          <div className="flex flex-wrap my-5 gap-2">
        {variants?.map((variant: any) => {
          const isSelected = variant.id === selectedVariantId;
          return (
            <div
              key={variant.id}
              onClick={() => handleSelect(variant.id)}
              className={`flex gap-2 items-center justify-center p-2 w-24 sm:w-28 rounded border cursor-pointer transition-all duration-200 ${
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
                <IoCheckmarkCircleOutline className="text-green-600 text-sm mt-1" />
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-6">
        {/* Add/Edit Form */}
        <Card
          title={editingItem ? "Edit BOM Item" : "Add BOM Item"}
          size="small"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddItem}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Form.Item label="Category">
              <Select
                showSearch
                placeholder="Select Category"
                allowClear
                value={selectedCategoryId}
                onChange={(val) => {
                  setSelectedCategoryId(val);
                  form.setFieldsValue({ materialId: undefined });
                }}
                optionFilterProp="children"
              >
                {categories.map((cat: any) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Packaging Material"
              name="materialId"
              rules={[{ required: true, message: "Please select material" }]}
            >
              <Select
                showSearch
                placeholder="Select Packaging Material"
                loading={isRawMaterialLoading}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {!isRawMaterialLoading &&
                  rawMaterials
                    ?.filter(
                      (material: any) =>
                        (!selectedCategoryId ||
                          material.category?.id === selectedCategoryId) &&
                        !bomItems.some(
                          (item) =>
                            item.materialId === material.id &&
                            item.materialId !== editingItem?.materialId,
                        ),
                    )
                    .map((material: any) => (
                      <Option
                        key={material.id}
                        value={material.id}
                        label={`${material.name} (${
                          material.unit?.symbol || "pcs"
                        }) - Stock: ${material.currentStock || 0}`}
                      >
                        {material.name} ({material.unit?.symbol || "pcs"}) -
                        Stock: {material.currentStock || 0}
                      </Option>
                    ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: "Enter quantity" },
                { validator: validateQuantity },
              ]}
              help="Enter the quantity needed per unit"
            >
              <InputNumber
                type="number"
                placeholder="e.g., 2"
                min={0.01}
                step={0.01}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label=" " className="flex items-end">
              <Button
                type={editingItem ? "default" : "primary"}
                htmlType="submit"
                block
              >
                {editingItem ? "Update" : "Add"} Item
              </Button>
              {editingItem && (
                <Button
                  className="mt-2"
                  onClick={() => {
                    setEditingItem(null);
                    form.resetFields();
                  }}
                  block
                >
                  Cancel Edit
                </Button>
              )}
            </Form.Item>
          </Form>
        </Card>

        {/* Table */}
        <Card
          style={{ marginTop: "16px" }}
          title={
            <div className="flex justify-between items-center">
              <span>BOM Items</span>
              <div className="flex items-center gap-2">
                <Text>Total Items:</Text>
                <Tag
                  style={{
                    backgroundColor: "#ff3d0a",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {bomItems.length}
                </Tag>
              </div>
            </div>
          }
        >
          <Table
            dataSource={bomItems}
            columns={columns}
            rowKey="materialId"
            pagination={false}
            loading={isBomLoading}
            locale={{ emptyText: "No BOM items added yet" }}
          />
        </Card>

        {/* Save/Cancel Buttons */}
          <div className="flex justify-end mt-4 gap-2">
            <Button
              onClick={() => {
                setOpen(false);
                setEditingItem(null);
                setSelectedCategoryId(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={bomSaving}
              onClick={handleSaveBOM}
              disabled={bomItems.length === 0}
            >
              {productByBom.length === 0 ? " Save BOM" : "Update BOM"}
            </Button>
          </div>
        </div>
      </>
      )}
    </Modal>
  );
};

export default PackagingMaterialBOMSetupModal;
