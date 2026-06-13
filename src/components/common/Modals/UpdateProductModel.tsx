import { Button, Card, Form, Input, InputNumber, Modal, Select } from "antd";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { useGetAllBrandsQuery } from "../../../redux/features/brand/brandApi";
import { useUpdateProductMutation } from "../../../redux/features/product/productApi";
import { useProductCategoryListQuery } from "../../../redux/features/productCategories/productCategoriesApi";
import { useUnitListQuery } from "../../../redux/features/units/unitsApi";
import { IBrand } from "../../../types/brands";
import { ICategory } from "../../../types/category";
import { IProductData } from "../../../types/product";
import { IUnit } from "../../../types/units";
import FormToggle from "../Forms/SwitchStatus2";

const { Option } = Select;

// ✅ Form type
interface IProductForm {
  id?: string;
  name: string;
  categoryId: string;
  brandId: string;
  baseUnitId: string;
  sku?: string;
  description?: string;
  isActive: boolean;
  variants: {
    unitId?: string;
    conversionFactor?: number;
    sellingPrice?: number;
    minStock?: number;
    maxStock?: number;
  }[];
}

interface UpdateProductModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IProductData; // existing product data
}

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IProductForm>();

  // API hooks
  const { data: categoriesData, isLoading: categoryLoading } =
    useProductCategoryListQuery(undefined);
  const { data: brandsData, isLoading: brandLoading } =
    useGetAllBrandsQuery(undefined);
  const { data: unitsData, isLoading: unitLoading } =
    useUnitListQuery(undefined);
  const [updateProduct, { isLoading: productLoading }] =
    useUpdateProductMutation();

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const units = unitsData?.data || [];

  // Prefill form
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        id: data.id,
        name: data.name,
        categoryId: data.category?.id || "", // ✅ use id
        brandId: data.brand?.id || "", // ✅ use id
        baseUnitId: data.baseUnit?.id || "", // ✅ use id
        description: data.description,
        isActive: data.isActive,
        variants:
          data.variants && data.variants.length > 0 ? data.variants : [{}],
      });
    }
  }, [data, form]);

  // Submit
  const onFinish = async (values: IProductForm) => {
    try {
      const updateInput = {
        id: data.id,
        data: values,
      };

      const res = await updateProduct(updateInput).unwrap();

      if (res.success) {
        toast.success("Product updated successfully!");
        form.resetFields();
        setOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err.message || "Something went wrong.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={false}
      width={950}
      title={
        <div className="mb-3">
          <h1 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white/90">
            Update Product
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update the details of the product.
          </p>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Product Name and SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the product name." },
            ]}
          >
            <Input placeholder="e.g., Apple Juice" />
          </Form.Item>
          
          <Form.Item label="Product Sku" tooltip="Example AF-01" name="sku">
            <Input placeholder="e.g., AF-01" />
          </Form.Item>
        </div>

        {/* Category, Brand, Base Unit */}
        <div className="flex flex-wrap gap-4">
          <Form.Item
            className="flex-1 min-w-[200px]"
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: "Please select a category." }]}
          >
            <Select
              placeholder="Select category"
              loading={categoryLoading}
              disabled={categoryLoading}
            >
              {categories.map((category: ICategory) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            className="flex-1 min-w-[200px]"
            label="Brand"
            name="brandId"
            rules={[{ required: true, message: "Please select a brand." }]}
          >
            <Select
              placeholder="Select brand"
              loading={brandLoading}
              disabled={brandLoading}
            >
              {brands.map((brand: IBrand) => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            className="flex-1 min-w-[200px]"
            label="Base Unit"
            name="baseUnitId"
            rules={[{ required: true, message: "Please select a base unit." }]}
          >
            <Select
              placeholder="Select unit"
              loading={unitLoading}
              disabled={unitLoading}
            >
              {units.map((unit: IUnit) => (
                <Option key={unit.id} value={unit.id}>
                  {unit.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Enter product description..." rows={5} />
        </Form.Item>

        {/* Variants */}
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <Card title="Product Variants" className="space-y-3">
              <div className="grid gap-3">
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    title={`${key + 1}. Product Variant`}
                    extra={
                      <Button
                        danger
                        type="text"
                        icon={<IoClose />}
                        onClick={() => remove(name)}
                      />
                    }
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      <Form.Item
                        {...restField}
                        label="Variant Name"
                        name={[name, "name"]}
                      >
                        <Input placeholder="Enter variant name" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Conversion Factor"
                        name={[name, "conversionFactor"]}
                      >
                        <InputNumber
                          type="number"
                          min={1}
                          style={{ width: "100%" }}
                          placeholder="Enter conversion"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Selling Price"
                        name={[name, "sellingPrice"]}
                      >
                        <InputNumber
                          type="number"
                          min={0}
                          style={{ width: "100%" }}
                          placeholder="Enter price"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Minimum Stock"
                        name={[name, "minStock"]}
                      >
                        <InputNumber
                          type="number"
                          min={0}
                          style={{ width: "100%" }}
                          placeholder="Enter min stock"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Maximum Stock"
                        name={[name, "maxStock"]}
                      >
                        <InputNumber
                          type="number"
                          min={0}
                          style={{ width: "100%" }}
                          placeholder="Enter max stock"
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                className="mt-4"
              >
                + Add Variant
              </Button>
            </Card>
          )}
        </Form.List>

        {/* Status */}
        <Form.Item
          style={{ marginTop: "22px" }}
          label="Active Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status." }]}
        >
          <FormToggle defaultChecked size="default" />
        </Form.Item>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <Button onClick={handleCancel} type="default" className="px-5!">
            Cancel
          </Button>
          <Button
            loading={productLoading}
            type="primary"
            htmlType="submit"
            className="px-5!"
          >
            Update Product
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateProductModal;
