import { Button, Card, Form, InputNumber, Modal, Select } from "antd";
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useCreatePackagingBOMMutation,
  useDeletePackagingBOMMutation,
  useUpdatePackagingBOMMutation,
} from "../../../../redux/features/comboProduct/comboProductApi";
import { useGetMaterialsQuery } from "../../../../redux/features/material/materialApi";
import { IPackagingBOM } from "../../../../types/comboProduct";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  comboProductId: string;
  comboVariantId: string;
  existingBOMs?: IPackagingBOM[];
  onSuccess?: () => void;
}

interface BOMFormItem {
  id?: string;
  materialId: string;
  quantity: number;
}

const PackagingBOMModal: React.FC<Props> = ({
  open,
  setOpen,
  comboProductId,
  comboVariantId,
  existingBOMs,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<BOMFormItem[]>([
    { materialId: "", quantity: 1 },
  ]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<
    Record<number, string | null>
  >({});

  const [createBOM, { isLoading: isCreating }] =
    useCreatePackagingBOMMutation();
  const [updateBOM, { isLoading: isUpdating }] =
    useUpdatePackagingBOMMutation();
  const [deleteBOM, { isLoading: isDeleting }] =
    useDeletePackagingBOMMutation();

  // Fetch packaging materials
  const { data: materialsResponse, isLoading: isLoadingMaterials } =
    useGetMaterialsQuery([
      { name: "type", value: "packaging" },
      { name: "isActive", value: "true" },
      { name: "page", value: 1 },
    ]);

  const materials = useMemo(
    () => materialsResponse?.data || [],
    [materialsResponse],
  );

  // Extract unique categories from loaded materials
  const categories = useMemo(() => {
    const cats = new Map();
    materials.forEach((m: any) => {
      if (m.category && m.category.id) {
        cats.set(m.category.id, m.category);
      }
    });
    return Array.from(cats.values());
  }, [materials]);

  useEffect(() => {
    if (existingBOMs && existingBOMs.length > 0) {
      // Edit mode - multiple items
      const initialItems = existingBOMs.map((bom) => ({
        id: bom.id,
        materialId: bom.materialId,
        quantity: (bom as any).percentage || 1,
      }));
      setItems(initialItems);
      form.setFieldsValue({
        items: initialItems,
      });

      if (materials.length > 0) {
        const categoryIdsMap: Record<number, string | null> = {};
        initialItems.forEach((item, index) => {
          const material = materials.find((m: any) => m.id === item.materialId);
          if (material?.category?.id) {
            categoryIdsMap[index] = material.category.id;
          }
        });
        setSelectedCategoryIds(categoryIdsMap);
      }
    } else {
      // Add mode - single empty
      setItems([{ materialId: "", quantity: 1 }]);
      form.resetFields();
      setSelectedCategoryIds({});
    }
  }, [existingBOMs, form, open, materials]);

  const handleAddItem = () => {
    setItems([...items, { materialId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setFieldsValue({ items: newItems });
    }
  };

  // Get available materials for a specific dropdown (exclude already selected materials)
  const getAvailableMaterials = (currentIndex: number) => {
    const formValues = form.getFieldsValue();
    const selectedMaterialIds =
      formValues.items
        ?.map((item: BOMFormItem, idx: number) =>
          idx !== currentIndex ? item?.materialId : null,
        )
        .filter(Boolean) || [];

    return materials.filter(
      (material: any) => !selectedMaterialIds.includes(material.id),
    );
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const formValues = form.getFieldsValue();

      const existingBOMIds = existingBOMs?.map((b) => b.id) || [];
      const currentIds = formValues.items
        .map((i: BOMFormItem) => i.id)
        .filter(Boolean);
      const idsToDelete = existingBOMIds.filter(
        (id) => !currentIds.includes(id),
      );

      const newItems = formValues.items.filter((i: BOMFormItem) => !i.id);
      const updatedItems = formValues.items.filter((i: BOMFormItem) => i.id);

      // 1. Delete removed items
      if (idsToDelete.length > 0) {
        // filter out undefined values to be safe
        const validIdsToDelete = idsToDelete.filter(
          (id) => id !== undefined,
        ) as string[];
        await Promise.all(validIdsToDelete.map((id) => deleteBOM(id).unwrap()));
      }

      // 2. Update existing items
      if (updatedItems.length > 0) {
        await Promise.all(
          updatedItems.map((item: BOMFormItem) =>
            updateBOM({
              bomId: item.id!,
              data: {
                percentage: item.quantity,
                wastage: 0,
              },
            }).unwrap(),
          ),
        );
      }

      // 3. Create new items
      if (newItems.length > 0) {
        const payload = {
          comboProductId,
          comboVariantId,
          items: newItems.map((item: BOMFormItem) => ({
            materialId: item.materialId,
            percentage: item.quantity,
            wastage: 0,
          })),
        };
        await createBOM(payload).unwrap();
      }

      toast.success(
        `Packaging BOM ${existingBOMs && existingBOMs.length > 0 ? "updated" : "added"} successfully`,
      );
      onSuccess?.();
      setOpen(false);
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.errorFields) {
        toast.error("Please fill all required fields");
      } else {
        toast.error("Failed to save packaging BOM");
      }
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
    setSelectedCategoryIds({});
    setItems([{ materialId: "", quantity: 1 }]);
  };

  return (
    <Modal
      title={
        <div className="">
          <span>
            {existingBOMs && existingBOMs.length > 0 ? "Edit" : "Setup"}{" "}
            Packaging BOM
          </span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isCreating || isUpdating || isDeleting}
          onClick={handleSubmit}
        >
          {existingBOMs && existingBOMs.length > 0 ? "Update" : "Save"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="!space-y-4 !mt-4">
          {items.map((item, index) => (
            <Card
              key={index}
              size="small"
              title={`Material ${index + 1}`}
              extra={
                items.length > 1 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleRemoveItem(index)}
                  />
                )
              }
            >
              <div className="hidden">
                {/* Hidden input to keep track of id */}
                <Form.Item name={["items", index, "id"]} hidden>
                  <input type="hidden" />
                </Form.Item>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Form.Item label="Category">
                  <Select
                    showSearch
                    placeholder="Select Category"
                    allowClear
                    value={selectedCategoryIds[index] || null}
                    onChange={(val) => {
                      setSelectedCategoryIds((prev) => ({
                        ...prev,
                        [index]: val,
                      }));
                    }}
                    optionFilterProp="children"
                  >
                    {categories.map((cat: any) => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Packaging Material"
                  name={["items", index, "materialId"]}
                  rules={[
                    {
                      required: true,
                      message: "Please select a material",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select material"
                    showSearch
                    optionLabelProp="label"
                    filterOption={(input, option: any) =>
                      (option?.["data-search"] || "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    loading={isLoadingMaterials}
                    disabled={!!item.id} // Disable changing material if it's already created
                    onChange={() => form.validateFields()}
                  >
                    {(item.id ? materials : getAvailableMaterials(index))
                      .filter(
                        (material: any) =>
                          !selectedCategoryIds[index] ||
                          material.category?.id === selectedCategoryIds[index],
                      )
                      .map((material: any) => (
                        <Select.Option
                          key={material.id}
                          value={material.id}
                          label={material.name}
                          data-search={`${material.name} ${material?.category?.name || ""}`}
                        >
                          <div className="flex flex-col">
                            <span>{material.name}</span>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                              <span>{material?.category?.name || "N/A"}</span>
                              <span>
                                Stock: {material.currentStock}{" "}
                                {material.unit?.symbol || ""}
                              </span>
                            </div>
                          </div>
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Quantity per Unit"
                  name={["items", index, "quantity"]}
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                    {
                      type: "number",
                      min: 1,
                      message: "Must be at least 1",
                    },
                  ]}
                  tooltip="Quantity of material needed per combo product unit"
                >
                  <InputNumber
                    placeholder="1"
                    min={1}
                    step={1}
                    precision={0}
                    className="w-full!"
                  />
                </Form.Item>
              </div>
            </Card>
          ))}
        </div>

        {!(existingBOMs && existingBOMs.length > 0) && (
          <Button
            type="dashed"
            onClick={handleAddItem}
            icon={<Plus className="w-4 h-4" />}
            className="w-full mt-4"
          >
            Add Another Material
          </Button>
        )}
      </Form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 mb-2 font-medium">
          💡 Packaging BOM Guide:
        </p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>
            <strong>Quantity = Material per product:</strong> Enter the amount
            of packaging material needed per combo product unit
          </li>
          <li>
            <strong>Example:</strong> If you need 2 ribbons per gift box, enter
            quantity as 2
          </li>
          <li>Each variant can have different packaging materials</li>
          <li>Only materials marked as "Packaging" type can be selected</li>
        </ul>
      </div>
    </Modal>
  );
};

export default PackagingBOMModal;
