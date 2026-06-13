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
import { AlertTriangle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { BOMItem } from "../../../../moc/localStorageUtils";
import { useGetMaterialsQuery } from "../../../../redux/features/material/materialApi";
import {
  useGetProductRawMaterialBOMQuery,
  useUpdateRawMaterialBOMMutation,
} from "../../../../redux/features/product/productApi";
import { IProductData } from "../../../../types/product";

const { Title, Text } = Typography;
const { Option } = Select;

interface RawMaterialBOMSetupModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product: Pick<IProductData, "id" | "name">;
}

const RawMaterialBOMSetupModal: React.FC<RawMaterialBOMSetupModalProps> = ({
  open,
  setOpen,
  product,
}) => {
  const [form] = Form.useForm();
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // 🔹 Raw material list
  const { data: rawMaterialData, isLoading: isRawMaterialLoading } =
    useGetMaterialsQuery([
      { name: "type", value: "raw" },
      { name: "isActive", value: true },
    ]);
  const rawMaterials = useMemo(
    () => rawMaterialData?.data || [],
    [rawMaterialData],
  );

  // 🔹 Extract unique categories from loaded materials
  const categories = useMemo(() => {
    const cats = new Map();
    rawMaterials.forEach((m: any) => {
      if (m.category && m.category.id) {
        cats.set(m.category.id, m.category);
      }
    });
    return Array.from(cats.values());
  }, [rawMaterials]);

  // 🔹 BOM API hooks
  const [updateBOM, { isLoading: bomSaving }] =
    useUpdateRawMaterialBOMMutation();
  const {
    data: bomData,
    isLoading: isBomLoading,
    refetch,
  } = useGetProductRawMaterialBOMQuery(product?.id);
  const productByBom = React.useMemo(() => bomData?.data || [], [bomData]);

  // 🔹 Load existing BOM from backend (if any)
  useEffect(() => {
    if (productByBom && productByBom.length > 0) {
      setBomItems(productByBom);
    } else {
      setBomItems([]);
    }
  }, [productByBom]);

  // 🔹 Calculate totals
  const calculateTotalPercentage = () => {
    return bomItems.reduce((total, item) => total + item.percentage, 0);
  };

  const calculateRemainingPercentage = () => {
    return 100 - calculateTotalPercentage();
  };

  // 🔹 Add or update item
  const handleAddItem = (values: any) => {
    const { materialId, percentage } = values;
    const selectedMaterial = rawMaterials.find((m: any) => m.id === materialId);
    if (!selectedMaterial) return;

    const newItem: BOMItem = {
      materialId: selectedMaterial.id,
      percentage: parseFloat(percentage),
      type: "raw",
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
    const totalPercentage = calculateTotalPercentage();

    if (totalPercentage !== 100) {
      message.error(
        `Total percentage must be 100%. Current: ${totalPercentage}%`,
      );
      return;
    }
    if (bomItems.length === 0) {
      message.error("Please add at least one material to BOM");
      return;
    }

    try {
      const payload = {
        productId: product.id,
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

  // 🔹 Custom validation for percentages
  const validatePercentage = (_: any, value: number) => {
    const remaining = calculateRemainingPercentage();

    if (editingItem) {
      const currentTotal = calculateTotalPercentage();
      const remainingWithEdit = 100 - (currentTotal - editingItem.percentage);
      if (value > remainingWithEdit)
        return Promise.reject(
          new Error(
            `Max ${remainingWithEdit.toFixed(1)}% allowed when editing`,
          ),
        );
    } else if (value > remaining)
      return Promise.reject(new Error(`Max ${remaining.toFixed(1)}% allowed`));

    if (value <= 0) return Promise.reject(new Error("Must be greater than 0"));
    if (value > 100) return Promise.reject(new Error("Cannot exceed 100%"));

    return Promise.resolve();
  };

  // 🔹 Table columns
  const columns = [
    {
      title: "Raw Material",
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
      title: "Percentage (%)",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: number) => (
        <Tag className="bg-primary! text-white!">{percentage}%</Tag>
      ),
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

  const totalPercentage = calculateTotalPercentage();
  const remainingPercentage = calculateRemainingPercentage();
  const percentageStatus = totalPercentage === 100 ? "success" : "error";

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
            Configure Raw Material BOM - {product.name}
          </Title>
          <Text type="secondary">
            Set up the Bill of Materials with percentages for ingredients
          </Text>
        </div>
      }
    >
      {isRawMaterialLoading || isBomLoading ? (
        <div className="space-y-6">
          <Card size="small">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
          <Card size="small">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </div>
      ) : (
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
                label="Raw  Material"
                name="materialId"
                rules={[{ required: true, message: "Please select material" }]}
              >
                <Select
                  showSearch
                  placeholder="Select Raw Material"
                  loading={isRawMaterialLoading}
                  optionFilterProp="label" // use label for searching
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
                              item.materialId !== editingItem?.materialId, // allow current editing item
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
                label="Percentage (%)"
                name="percentage"
                rules={[
                  { required: true, message: "Enter percentage" },
                  { validator: validatePercentage },
                ]}
                help={
                  editingItem
                    ? `Remaining after edit: ${(
                        100 -
                        (calculateTotalPercentage() - editingItem.percentage)
                      ).toFixed(1)}%`
                    : `Remaining: ${remainingPercentage.toFixed(1)}%`
                }
              >
                <InputNumber
                  placeholder="e.g., 25.5"
                  min={0.1}
                  type="number"
                  max={100}
                  step={0.1}
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
                  <Text>Total Percentage:</Text>
                  <Tag
                    style={{ backgroundColor: percentageStatus }}
                    className="w-24 h-6 rounded"
                  >
                    {totalPercentage}%
                  </Tag>
                  <Text
                    type={percentageStatus === "success" ? "success" : "danger"}
                  >
                    {remainingPercentage}% remaining
                  </Text>
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
              locale={{
                emptyText: (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-gray-100 rounded-2xl bg-white  transition-shadow duration-200">
                    <div className="w-10 h-10 mb-2 rounded-full bg-blue-50 flex items-center justify-center">
                      <AlertTriangle
                        name="clipboard-list"
                        className="w-10 h-10 text-gray-900"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No BOM Items Added Yet
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm text-sm leading-6">
                      Get started by adding your first bill of materials item to
                      create a comprehensive product structure.
                    </p>
                  </div>
                ),
              }}
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
              disabled={bomItems.length === 0 || totalPercentage !== 100}
            >
              {productByBom.length === 0 ? " Save BOM" : "Update BOM"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RawMaterialBOMSetupModal;
