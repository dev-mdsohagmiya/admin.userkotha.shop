import { Button, Card, Divider, Form, Input, InputNumber, Select } from "antd";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useGetAllBrandsQuery } from "../../redux/features/brand/brandApi";
import { useCreateProductMutation } from "../../redux/features/product/productApi";
import { useUnitListQuery } from "../../redux/features/units/unitsApi";

import ImageUploader from "../../components/shared/ImageUploader";

import { Plus } from "lucide-react";
import { useState } from "react";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { FormRichTextEditor } from "../../components/common/Forms";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import { CreateUnitsModal } from "../../components/common/Modals";
import CreateBrandModal from "../../components/common/Modals/CreateBrandModel";
import CreateProductCategoryModel from "../../components/common/Modals/Product-category/CreateProductCategoryModel";
import CreateProductTypeModal from "../../components/common/Modals/ProductType/CreateProductTypeModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import ProductFormSkeleton from "../../components/skeleton/ProductFormSkeleton";
import { useProductCategoryListQuery } from "../../redux/features/productCategories/productCategoriesApi";
import { useGetAllProductTypeQuery } from "../../redux/features/ptoductType/proudctTypeApi";
import { useVatListQuery } from "../../redux/features/vat/vatApi";
import { IBrand } from "../../types/brands";
import { ICategory } from "../../types/category";
import { IProduct } from "../../types/product";
import { IUnit } from "../../types/units";

const { Option } = Select;

const CreateProductPage: React.FC = () => {
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

  // custom modal states
  const [openCreateUnitsModal, setOpenCreateUnitsModal] = useState(false);
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);
  const [openCreateBrandModal, setOpenCreateBrandModal] = useState(false);
  const [openCreateProductTypeModal, setOpenCreateProductTypeModal] =
    useState(false);

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const units = unitsData?.data || [];
  const { data: vatData } = useVatListQuery([
    { name: "limit", value: "1000" },
    { name: "isActive", value: true },
  ]);
  const taxes = vatData?.data || [];

  const { data: productTypesData } = useGetAllProductTypeQuery([
    { name: "limit", value: "1000" },
    { name: "isActive", value: true },
  ]);
  const productTypes = productTypesData?.data || [];

  // ✅ Handle form submit
  const onFinish = async (
    values: any,
    status: "PUBLISHED" | "DRAFT" = "PUBLISHED",
  ) => {
    try {
      const res = await createProduct({
        ...values,
        isActive: true,
        status,
      }).unwrap();
      if (res.success) {
        toast.success(
          res.message ||
            `Product ${status === "DRAFT" ? "saved as draft" : "created"} successfully!`,
        );
        form.resetFields();
        navigate(`/product/update-product/${res.data.id}`);
      }
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  // ✅ Loading state
  if (categoryLoading || brandLoading || unitLoading) {
    return <ProductFormSkeleton />;
  }

  return (
    <div className="">
      <PageMeta title="Products | ERP" description="create  Products" />
      <div className="!mt-3">
        <PageHeader
          title="Create Product"
          subtitle="Create Products"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Products", path: "/products" },
            { title: "Create Product" },
          ]}
          extra={
            <div className="flex gap-2">
              <Button
                type="primary"
                onClick={() => {
                  const values = form.getFieldsValue(true);
                  localStorage.setItem(
                    "previewProductData",
                    JSON.stringify(values),
                  );
                  window.open(`/quick-view/product/preview`, "_blank");
                }}
              >
                Quick View
              </Button>
            </div>
          }
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onFinish(values, "PUBLISHED")}
        initialValues={{ variants: [{ isDefault: true }], isActive: true }}
      >
        {/* Product Name, Slug, Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the product name." },
            ]}
          >
            <Input
              placeholder="e.g., Apple Juice"
              onChange={(e) => {
                const name = e.target.value;
                const slug = name
                  .toLowerCase()
                  .replace(/ /g, "-")
                  .replace(/[^\w-]+/g, "");
                form.setFieldsValue({ slug });
              }}
            />
          </Form.Item>
          <Form.Item
            label="Product Slug"
            name="slug"
            rules={[
              { required: true, message: "Please enter the product slug." },
            ]}
          >
            <Input placeholder="e.g., apple-juice" />
          </Form.Item>
          <Form.Item label="Product Sku" tooltip="Example AF-01" name="sku">
            <Input placeholder="e.g., AF-01" />
          </Form.Item>
        </div>

        {/* Category, Brand, Unit */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <Form.Item
            label="Product Type"
            name="typeId"
            rules={[
              { required: true, message: "Please select the product type." },
            ]}
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select product types"
              loading={!productTypesData}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div>
                  {/* Button on top */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <CustomActionButton
                      type="dashed"
                      onClick={() => setOpenCreateProductTypeModal(true)}
                      icon={<Plus />}
                      text="Add Product Type"
                      width={"100%"}
                    ></CustomActionButton>
                  </div>

                  {/* Default options below */}
                  {menu}
                </div>
              )}
            >
              {productTypes.map((type: any) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            className="flex-1 min-w-[200px]"
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: "Please select a category." }]}
          >
            <Select
              placeholder="Select category"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div>
                  {/* Button on top */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <CustomActionButton
                      type="dashed"
                      onClick={() => setOpenCreateCategoryModal(true)}
                      icon={<Plus />}
                      text="Add Category"
                      width={"100%"}
                    ></CustomActionButton>
                  </div>

                  {/* Default options below */}
                  {menu}
                </div>
              )}
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
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div>
                  {/* Button on top */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <CustomActionButton
                      type="dashed"
                      onClick={() => setOpenCreateBrandModal(true)}
                      icon={<Plus />}
                      text="Add Brand"
                      width={"100%"}
                    ></CustomActionButton>
                  </div>

                  {/* Default options below */}
                  {menu}
                </div>
              )}
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
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div>
                  {/* Button on top */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <CustomActionButton
                      type="dashed"
                      onClick={() => setOpenCreateUnitsModal(true)}
                      icon={<Plus />}
                      text="Add Unit"
                      size="middle"
                      width={"100%"}
                    ></CustomActionButton>
                  </div>

                  {/* Default options below */}
                  {menu}
                </div>
              )}
            >
              {units.map((unit: IUnit) => (
                <Select.Option key={unit.id} value={unit.id}>
                  {unit.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="flex  gap-4">
          {/* Single uploader - takes partial width */}

          <Form.Item
            name={"thumbnailId"}
            label="Thumbnail"
            rules={[
              { required: true, message: "Please enter the thumbnail image!" },
            ]}
          >
            <ImageUploader fieldPath="thumbnailId" form={form} />
          </Form.Item>
        </div>

        {/* Short & Detailed Description */}
        <FormRichTextEditor
          label="Short Description"
          name="shortDesc"
          height={300}
          rules={[
            { required: true, message: "Please enter the short description." },
          ]}
          placeholder="Enter short description"
        />
        <FormRichTextEditor
          label="Detailed Description"
          name="detailedDesc"
          rules={[
            {
              required: true,
              message: "Please enter the detailed description.",
            },
          ]}
          placeholder="Enter detailed description"
        />

        {/* Product Variants */}
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <Card title="Product Variants" className="space-y-3">
              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  style={{ marginBottom: "16px" }}
                  key={key}
                  title={`Variant ${index + 1}`} // use index for numbering
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<IoClose />}
                      onClick={() => remove(name)}
                    />
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
                    <Form.Item
                      {...restField}
                      label="Name"
                      name={[name, "name"]}
                      rules={[
                        { required: true, message: "Enter variant name." },
                      ]}
                    >
                      <Input placeholder="Enter variant name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Variant Sku"
                      name={[name, "sku"]}
                      rules={[
                        { required: true, message: "Enter variant sku." },
                      ]}
                    >
                      <Input placeholder="Enter variant sku" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Conversion Factor"
                      name={[name, "conversionFactor"]}
                      rules={[
                        { required: true, message: "Enter conversion factor." },
                      ]}
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
                      rules={[
                        { required: true, message: "Enter selling price." },
                      ]}
                    >
                      <InputNumber
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Enter price"
                      />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 md:gap-4">
                    <Form.Item
                      {...restField}
                      label="Discounted Price"
                      name={[name, "discountedPrice"]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const selling = getFieldValue([
                              "variants",
                              name,
                              "sellingPrice",
                            ]);
                            if (value && !selling)
                              return Promise.reject(
                                new Error("Add selling price first."),
                              );
                            if (value && selling && value >= selling)
                              return Promise.reject(
                                new Error(
                                  "Discounted price must be less than selling price.",
                                ),
                              );
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Enter discount price"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Minimum Stock"
                      name={[name, "minStock"]}
                      rules={[
                        { required: true, message: "Enter minimum stock." },
                      ]}
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
                      label="Current Stock"
                      name={[name, "currentStock"]}
                      rules={[
                        { required: true, message: "Enter current stock." },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const min = getFieldValue([
                              "variants",
                              name,
                              "minStock",
                            ]);
                            if (value && min !== undefined && value < min)
                              return Promise.reject(
                                new Error(
                                  "Current stock cannot be less than minimum stock.",
                                ),
                              );
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Enter current stock"
                      />
                    </Form.Item>

                    {/* VAT Type Select */}
                    <Form.Item label="Vat" name={[name, "vatId"]}>
                      <Select
                        placeholder="Select VAT type"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {taxes?.map((tax: { id: string; taxName: string }) => (
                          <Option key={tax.id} value={tax.id}>
                            {tax.taxName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Duration Days"
                      name={[name, "durationDays"]}
                      tooltip="Service period in days (used for expiry-based SMS reminders)"
                    >
                      <InputNumber
                        type="number"
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="e.g., 30"
                      />
                    </Form.Item>

                    {/* Free Delivery Switch */}
                    {/* Free Delivery & Active Variant */}
                  </div>

                  {/* Free Delivery & Active Variant */}
                  <div className="flex gap-4 items-center mb-4">
                    <Form.Item
                      {...restField}
                      label="Free Delivery"
                      name={[name, "isDeliveryChargeFree"]}
                      tooltip="Enable if this variant has free delivery"
                      valuePropName="checked"
                      initialValue={false}
                      className="mb-0"
                    >
                      <SwitchStatus2 size="default" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Active Variant"
                      name={[name, "isDefault"]}
                      tooltip="Enable if this variant is the default active variant"
                      valuePropName="checked"
                      initialValue={false}
                      className="mb-0"
                    >
                      <SwitchStatus2 size="default" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Status"
                      name={[name, "isActive"]}
                      tooltip="Enable if this variant is active and available"
                      valuePropName="checked"
                      initialValue={true}
                      className="mb-0"
                    >
                      <SwitchStatus2 size="default" />
                    </Form.Item>
                  </div>

                  {/* Variant Image */}
                  <div className="flex gap-4 -mb-6">
                    {/* Single uploader */}
                    <Form.Item
                      name={[name, "thumbnailId"]}
                      label="Thumbnail"
                      className="w-[128px]"
                      tooltip="Upload only one thumbnail image."
                      rules={[
                        {
                          required: true,
                          message: "Please added thumbnail Image",
                        },
                      ]}
                    >
                      <ImageUploader
                        fieldPath={`variants.${name}.thumbnailId`}
                        form={form}
                        isThumbnail={true}
                      />
                    </Form.Item>
                    <Divider type="vertical" style={{ height: "150px" }} />
                    {/* Multiple uploader */}
                    <Form.Item
                      name={[name, "imageIds"]}
                      label="Gallery Images"
                      tooltip="Upload multiple gallery images (Max 5)."
                      className="flex-[2] min-w-[300px]"
                      rules={[
                        {
                          required: true,
                          message: "Please added gallery images",
                        },
                      ]}
                    >
                      <ImageUploader
                        fieldPath={`variants.${name}.imageIds`}
                        form={form}
                        multiple
                      />
                    </Form.Item>
                  </div>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => {
                  const variants = form.getFieldValue("variants") || [];
                  // Deselect all existing
                  variants.forEach((_: any, index: number) => {
                    form.setFields([
                      { name: ["variants", index, "isDefault"], value: false },
                    ]);
                  });
                  add({ isDefault: true });
                }}
                block
              >
                + Add Variant
              </Button>
            </Card>
          )}
        </Form.List>

        {/* Featured Switch */}
        <div className="mt-4">
          <Form.Item
            label="Featured Product"
            name="isFeatured"
            tooltip="Enable if this product should be featured"
            valuePropName="checked"
            initialValue={false}
          >
            <SwitchStatus2 size="default" />
          </Form.Item>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <Button type="default" onClick={() => navigate("/products")}>
            Cancel
          </Button>
          <Button
            type="default"
            className="bg-amber-500! text-white! hover:bg-amber-600! !border-none"
            onClick={() => {
              form
                .validateFields()
                .then((values) => onFinish(values, "DRAFT"))
                .catch((info) => {
                  console.log("Validate Failed:", info);
                  toast.error("Please fill all required fields");
                });
            }}
            loading={productLoading}
          >
            Save as Draft
          </Button>
          <Button type="primary" htmlType="submit" loading={productLoading}>
            Create Product
          </Button>
        </div>
      </Form>

      {/* add button */}
      {openCreateUnitsModal && (
        <CreateUnitsModal
          open={openCreateUnitsModal}
          setOpen={setOpenCreateUnitsModal}
        />
      )}
      {openCreateCategoryModal && (
        <CreateProductCategoryModel
          open={openCreateCategoryModal}
          setOpen={setOpenCreateCategoryModal}
        />
      )}
      {openCreateBrandModal && (
        <CreateBrandModal
          open={openCreateBrandModal}
          setOpen={setOpenCreateBrandModal}
        />
      )}
      {openCreateProductTypeModal && (
        <CreateProductTypeModal
          open={openCreateProductTypeModal}
          setOpen={setOpenCreateProductTypeModal}
        />
      )}
    </div>
  );
};

export default CreateProductPage;
