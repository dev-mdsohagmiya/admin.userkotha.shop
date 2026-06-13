import { Button, Card, Form, Input, InputNumber, Modal, Select } from "antd";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetAllBrandsQuery } from "../../../redux/features/brand/brandApi";
import { useCreateProductMutation } from "../../../redux/features/product/productApi";
import { useProductCategoryListQuery } from "../../../redux/features/productCategories/productCategoriesApi";
import { useUnitListQuery } from "../../../redux/features/units/unitsApi";
import { IBrand } from "../../../types/brands";
import { ICategory } from "../../../types/category";
import { IProduct } from "../../../types/product";
import { IUnit } from "../../../types/units";
import FormToggle from "../Forms/SwitchStatus2";

const { Option } = Select;

interface CreateProductModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  open,
  setOpen,
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm<IProduct>();

  // 🔹 API hooks
  const { data: categoriesData, isLoading: categoryLoading } =
    useProductCategoryListQuery([{ name: "isActive", value: true }]);
  const { data: brandsData, isLoading: brandLoading } = useGetAllBrandsQuery([
    { name: "isActive", value: true },
  ]);
  const { data: unitsData, isLoading: unitLoading } = useUnitListQuery([
    { name: "isActive", value: true },
  ]);
  const [createProduct, { isLoading: productLoading }] =
    useCreateProductMutation();

  // 🔹 Extract data
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const units = unitsData?.data || [];

  // ✅ Handle form submit
  const onFinish = async (values: IProduct) => {
    try {
      const res = await createProduct(values).unwrap();
      if (res.success) {
        toast.success("Product created successfully!");
        form.resetFields();
        setOpen(false);
        navigate("/products");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  // 🔁 Handle cancel
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
            Create Product
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill out the details to create a new product.
          </p>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ variants: [{}], isActive: true }}
      >
        {/* 🏷 Product Name */}
        <Form.Item
          label="Product Name"
          name="name"
          rules={[
            { required: true, message: "Please enter the product name." },
          ]}
        >
          <Input placeholder="e.g., Apple Juice" />
        </Form.Item>

        {/* 🧩 Category, Brand, Base Unit */}
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
                <Select.Option key={unit.id} value={unit.id}>
                  {unit.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* 📝 Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Enter product description..." rows={5} />
        </Form.Item>

        {/* 🧱 Product Variants */}
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
                          min={1}
                          style={{ width: "100%" }}
                          placeholder="Enter conversion"
                          type="number"
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
                          min={0}
                          style={{ width: "100%" }}
                          placeholder="Enter max stock"
                          type="number"
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

        {/* 🔘 Status */}
        <Form.Item
          label="Active Status"
          name="isActive"
          style={{ marginTop: "22px" }}
          rules={[{ required: true, message: "Please select status." }]}
        >
          <FormToggle defaultChecked size="default" />
        </Form.Item>

        {/* 🚀 Actions */}
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
            Create Product
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateProductModal;
