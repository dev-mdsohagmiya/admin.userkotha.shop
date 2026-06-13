import { Button, Card, Divider, Form, Input, InputNumber, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useGetAllBrandsQuery } from "../../redux/features/brand/brandApi";
import {
  useGetComboProductByIdQuery,
  useUpdateComboProductMutation,
} from "../../redux/features/comboProduct/comboProductApi";
import {
  useGetProductByIdQuery,
  useProductListQuery,
} from "../../redux/features/product/productApi";
import { useProductCategoryListQuery } from "../../redux/features/productCategories/productCategoriesApi";
import { useUnitListQuery } from "../../redux/features/units/unitsApi";

import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import ImageUploader from "../../components/shared/ImageUploader";

import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import { useVatListQuery } from "../../redux/features/vat/vatApi";
import { IBrand } from "../../types/brands";
import { ICategory } from "../../types/category";
import { IComboProduct, IComboProductVariant } from "../../types/comboProduct";
import { IProduct, IProductVariant } from "../../types/product";
import { IUnit } from "../../types/units";

import { Plus } from "lucide-react";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { FormRichTextEditor } from "../../components/common/Forms";
import { CreateUnitsModal } from "../../components/common/Modals";
import CreateBrandModal from "../../components/common/Modals/CreateBrandModel";
import CreateProductCategoryModel from "../../components/common/Modals/Product-category/CreateProductCategoryModel";
import CreateProductTypeModal from "../../components/common/Modals/ProductType/CreateProductTypeModal";
import ProductFormSkeleton from "../../components/skeleton/ProductFormSkeleton";
import { useGetAllProductTypeQuery } from "../../redux/features/ptoductType/proudctTypeApi";

const { Option } = Select;

const ComboProductItemRow = ({
  name,
  prodName,
  restProd,
  removeProduct,
  products,
  productsLoading,
  form,
}: {
  name: number;
  prodName: number;
  restProd: any;
  removeProduct: (name: number) => void;
  products: IProduct[];
  productsLoading: boolean;
  form: any;
}) => {
  const productId = Form.useWatch(
    ["variants", name, "items", prodName, "productId"],
    form,
  );
  const initialProductName = Form.useWatch(
    ["variants", name, "items", prodName, "productName"],
    form,
  );
  const variantId = Form.useWatch(
    ["variants", name, "items", prodName, "variantId"],
    form,
  );
  const initialVariantName = Form.useWatch(
    ["variants", name, "items", prodName, "variantName"],
    form,
  );

  const { data: productData, isLoading: variantLoading } =
    useGetProductByIdQuery(productId!, {
      skip: !productId,
    });

  const variants: IProductVariant[] = productData?.data?.variants ?? [];

  return (
    <Card
      className="!mb-4"
      title={`Product ${prodName + 1}`}
      extra={
        <Button
          type="text"
          danger
          icon={<IoClose />}
          onClick={() => removeProduct(prodName)}
        />
      }
    >
      <div className="grid grid-cols-1 -mb-6 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Form.Item
          {...restProd}
          label="Product"
          name={[prodName, "productId"]}
          rules={[
            {
              required: true,
              message: "Select a product!",
            },
          ]}
        >
          <Select
            placeholder="Select product"
            loading={productsLoading}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {products.length > 0 ? (
              products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))
            ) : productId && initialProductName ? (
              <Option key={productId} value={productId}>
                {initialProductName}
              </Option>
            ) : null}
          </Select>
        </Form.Item>

        <Form.Item
          {...restProd}
          label="Variant"
          name={[prodName, "variantId"]}
          rules={[
            {
              required: true,
              message: "Select a variant!",
            },
          ]}
        >
          <Select
            placeholder={
              variantLoading
                ? "Loading variants..."
                : productId
                  ? "Select variant"
                  : "Select product first"
            }
            loading={variantLoading}
            disabled={!productId}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {variants.length > 0 ? (
              variants.map((variant) => (
                <Option key={variant.id} value={variant.id}>
                  {variant.name}
                </Option>
              ))
            ) : variantId && initialVariantName ? (
              <Option key={variantId} value={variantId}>
                {initialVariantName}
              </Option>
            ) : null}
          </Select>
        </Form.Item>

        <Form.Item
          {...restProd}
          label="Qty"
          name={[prodName, "quantity"]}
          rules={[
            {
              required: true,
              message: "Enter quantity!",
            },
          ]}
        >
          <InputNumber
            type="number"
            min={1}
            style={{ width: "100%" }}
            placeholder="e.g., 10"
          />
        </Form.Item>
      </div>
    </Card>
  );
};

const UpdateComboProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<IComboProduct>();

  // API calls
  const { data: categoriesData, isLoading: categoryLoading } =
    useProductCategoryListQuery([{ name: "isActive", value: true }]);
  const { data: brandsData, isLoading: brandLoading } = useGetAllBrandsQuery([
    { name: "isActive", value: true },
  ]);
  const { data: unitsData, isLoading: unitLoading } = useUnitListQuery([
    { name: "isActive", value: true },
  ]);
  const { data: productsData, isLoading: productsLoading } =
    useProductListQuery(undefined);

  // Fetch product types
  const { data: productTypesData, isLoading: typeLoading } =
    useGetAllProductTypeQuery([{ name: "isActive", value: true }]);

  // Fetch combo product by id
  const { data: comboProductData, isLoading: comboProductLoading } =
    useGetComboProductByIdQuery(id!, {
      skip: !id,
    });

  const [updateComboProduct, { isLoading: isUpdating }] =
    useUpdateComboProductMutation();

  // custom modal states
  const [openCreateUnitsModal, setOpenCreateUnitsModal] = useState(false);
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);
  const [openCreateBrandModal, setOpenCreateBrandModal] = useState(false);
  const [openCreateProductTypeModal, setOpenCreateProductTypeModal] =
    useState(false);
  // Extract data safely
  const categories: ICategory[] = categoriesData?.data ?? [];
  const brands: IBrand[] = brandsData?.data ?? [];
  const units: IUnit[] = unitsData?.data ?? [];
  const products: IProduct[] = useMemo(
    () => productsData?.data ?? [],
    [productsData],
  );

  const comboProduct = comboProductData?.data;
  const productTypes = useMemo(
    () => productTypesData?.data || [],
    [productTypesData],
  );

  const { data: vatData } = useVatListQuery([
    { name: "limit", value: "20" },
    { name: "isActive", value: true },
  ]);
  const taxes = vatData?.data || [];

  // Set default form values after fetching combo product
  useEffect(() => {
    if (!comboProduct) return;

    console.log("comboProduct Data", products);

    // Only map variants if comboProduct has them
    const formattedVariants: IComboProductVariant[] =
      comboProduct.variants?.map((v: any) => {
        const variant: any = {
          name: v.name || "",
          conversionFactor: v.conversionFactor || 1,
          sellingPrice: v.sellingPrice || 0,
          discountedPrice: v.discountedPrice || 0,
          minStock: v.minStock || 0,
          maxStock: v.maxStock || 0,
          currentStock: v.currentStock || 0,
          thumbnailId: v.thumbnail?.id || "",
          imageIds: v.images?.map((img: any) => img.id).filter(Boolean) || [],
          vatId: v.vatId || "",
          isActive: v.isActive ?? true,
          isDeliveryChargeFree: v.isDeliveryChargeFree || false,
          isDefault: v.isDefault || false,
          sku: v.sku || "",
          items:
            v.items?.map((item: any) => ({
              productId: item.product?.id || "",
              productName: item.product?.name || "",
              quantity: item.quantity || 1,
              variantId: item.variant?.id || "",
              variantName: item.variant?.name || "",
            })) || [],
        };

        if (v.id) variant.id = v.id;

        return variant;
      }) || [];

    const defaultValues: IComboProduct = {
      id: comboProduct.id,
      name: comboProduct.name || "",
      categoryId: comboProduct.category?.id || undefined,
      brandId: comboProduct.brand?.id || undefined,
      baseUnitId: comboProduct.baseUnit?.id || undefined,
      thumbnailId: comboProduct.thumbnail?.id || "",
      imageIds: comboProduct.images?.map((img: any) => img.id) || [],
      shortDesc: comboProduct.shortDesc || "",
      detailedDesc: comboProduct.detailedDesc || "",
      isActive: comboProduct.isActive ?? true,
      isFeatured: comboProduct.isFeatured ?? false,
      isPlan: comboProduct.isPlan ?? false,
      variants: formattedVariants, // This will be empty if no existing variants
      typeId: comboProduct.types?.map((t: any) => t.id) || [],
      slug: comboProduct.slug || "",
      sku: comboProduct.sku || "",
    };

    console.log("Combo Product Default Values:", defaultValues);

    form.setFieldsValue(defaultValues);
  }, [comboProduct, form, products]);

  const onFinish = async (
    values: IComboProduct,
    status: "PUBLISHED" | "DRAFT" = "PUBLISHED",
  ) => {
    console.log("OnFinish Values:", values);
    try {
      // Clean up temporary fields before sending to backend
      const cleanedValues = {
        ...values,
        variants: values.variants?.map((v) => ({
          ...v,
          items: v.items?.map((item: any) => {
            const cleanedItem = { ...item };
            delete cleanedItem.variantName;
            delete cleanedItem.productName;
            return cleanedItem;
          }),
        })),
      };

      const payload = {
        id: comboProduct?.id,
        data: { ...cleanedValues, status },
      };
      const res = await updateComboProduct(payload).unwrap();
      if (res.success) {
        toast.success(
          res.message ||
            `Combo product ${status === "DRAFT" ? "saved as draft" : "updated"} successfully!`,
        );
      }
    } catch (error: any) {
      const message =
        error?.data?.message ?? error?.message ?? "Something went wrong!";
      toast.error(message);
    }
  };

  if (
    categoryLoading ||
    brandLoading ||
    unitLoading ||
    comboProductLoading ||
    typeLoading
  ) {
    return <ProductFormSkeleton />;
  }

  return (
    <div className="">
      <PageMeta
        title={`${comboProduct?.name || "Update Combo Product"} | ERP`}
        description="Update Combo Product"
      />
      <div className="!mt-3">
        {" "}
        <PageHeader
          title="Update Combo Product"
          subtitle="Edit the details to update the combo product."
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Products", path: "/products" },
            { title: "Combo Products", path: "/combo-products" },
            { title: "Update Combo Product" },
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
                  window.open(`/quick-view/combo/preview`, "_blank");
                }}
              >
                Quick View
              </Button>
              <Link to="/create-combo-product">
                <Button type="default" className="flex items-center gap-2">
                  Add Combo Product
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onFinish(values, "PUBLISHED")}
        initialValues={{
          variants: [{ items: [{}] }],
          isActive: true,
          isFeatured: false,
        }}
      >
        {/* Product Name, Slug, Sku, and Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the product name." },
            ]}
          >
            <Input
              placeholder="e.g., Honey Combo"
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
            <Input placeholder="e.g., honey-combo" />
          </Form.Item>
          <Form.Item
            label="Combo Product Sku"
            tooltip="Example CP-01"
            name="sku"
          >
            <Input placeholder="e.g., CP-01" />
          </Form.Item>
        </div>
        {/* Category, Brand, Unit */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Form.Item
            className="flex-1 min-w-[200px]"
            label="Product Type"
            name="typeId"
            rules={[
              { required: true, message: "Please select at least one type" },
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
              {productTypes.map((type: { id: string; name: string }) => (
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

        {/* Images */}

        {/* Single uploader - takes partial width */}

        <Form.Item
          name={"thumbnailId"}
          label="Thumbnail"
          rules={[
            { required: true, message: "Please enter the category image!" },
          ]}
        >
          <ImageUploader fieldPath="thumbnailId" form={form} />
        </Form.Item>

        {/* Descriptions */}
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
          height={300}
          rules={[
            {
              required: true,
              message: "Please enter the detailed description.",
            },
          ]}
          placeholder="Enter detailed description"
        />

        {/* Variants */}
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <Card title="Product Variants" className="space-y-3 ">
              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  className="!mb-4"
                  key={key}
                  title={`Variant ${index + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<IoClose />}
                      onClick={() => remove(name)}
                    />
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      {...restField}
                      label="Variant Name"
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
                  </div>

                  {/* Items inside Variant */}
                  <Form.List name={[name, "items"]}>
                    {(
                      productFields,
                      { add: addProduct, remove: removeProduct },
                    ) => (
                      <Card
                        title="Products"
                        extra={
                          <Button
                            type="primary"
                            onClick={() => addProduct()}
                            block
                          >
                            + Add Product
                          </Button>
                        }
                        className="space-y-3 !mb-4"
                      >
                        {productFields.map(
                          ({ key: prodKey, name: prodName, ...restProd }) => (
                            <ComboProductItemRow
                              key={prodKey}
                              name={name}
                              prodName={prodName}
                              restProd={restProd}
                              removeProduct={removeProduct}
                              products={products}
                              productsLoading={productsLoading}
                              form={form}
                            />
                          ),
                        )}
                      </Card>
                    )}
                  </Form.List>

                  {/* Pricing & Stock */}
                  <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Form.Item
                        {...restField}
                        label="Conversion Factor"
                        name={[name, "conversionFactor"]}
                        rules={[
                          {
                            required: true,
                            message: "Enter Conversion Factor.",
                          },
                        ]}
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
                                  "Add selling price first.",
                                );
                              if (value && selling && value >= selling)
                                return Promise.reject(
                                  "Discounted price must be less than selling price.",
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                  "Current stock cannot be less than min.",
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
                          {taxes?.map(
                            (tax: { id: string; taxName: string }) => (
                              <Option key={tax.id} value={tax.id}>
                                {tax.taxName}
                              </Option>
                            ),
                          )}
                        </Select>
                      </Form.Item>
                    </div>
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

                  {/* Variant Images */}
                  <div className="flex -mb-8 gap-4">
                    <Form.Item
                      name={[name, "thumbnailId"]}
                      label="Thumbnail"
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

                    <Divider
                      type="vertical"
                      size="large"
                      style={{ height: "170px" }}
                    />

                    <Form.Item
                      name={[name, "imageIds"]}
                      tooltip="Upload multiple gallery images (Max 5)."
                      label="Gallery Images"
                      className="w-full"
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
                        multiple={true}
                      />
                    </Form.Item>
                  </div>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    name: "", // Variant Name
                    conversionFactor: 0, // Default conversion
                    sellingPrice: 0,
                    discountedPrice: 0,
                    minStock: 0,
                    maxStock: 0,
                    currentStock: 0,
                    thumbnailId: "",
                    imageIds: [],
                    vatId: "",
                    isDefault: false,
                    items: [{}], // ✅ Default items array
                  })
                }
                block
              >
                + Add Variant
              </Button>
            </Card>
          )}
        </Form.List>

        {/* Featured Switch */}
        <div className="!mt-5">
          <Form.Item
            label="Featured Product"
            name="isFeatured"
            tooltip="Enable if this product should be featured"
            valuePropName="checked"
          >
            <SwitchStatus2 size="default" />
          </Form.Item>
          <Form.Item
            label="Is Plan"
            name="isPlan"
            tooltip="Enable if this product is a production plan"
            valuePropName="checked"
          >
            <SwitchStatus2 size="default" />
          </Form.Item>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="default" onClick={() => navigate("/combo-products")}>
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
            loading={isUpdating}
          >
            Save as Draft
          </Button>
          <Button type="primary" htmlType="submit" loading={isUpdating}>
            Update Combo Product
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

export default UpdateComboProduct;
