import { DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  Menu,
  Modal,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import { Filter, Plus, RefreshCcw, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiEdit, FiEye, FiMoreVertical } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateProductModal from "../../components/common/Modals/CreateProductModel";
// Planning is handled on a separate page -> /product/:id/planning
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PackagingBOMSetupModal from "../../components/common/Modals/BOM/PackagingMaterialBOMSetupModal";
import RawMaterialBOMSetupModal from "../../components/common/Modals/BOM/RawMaterialBOMSetupModal";
import ReviewImageModal from "../../components/common/Modals/review/ReviewImageModal";
import UpdateProductModal from "../../components/common/Modals/UpdateProductModel";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useSidebar } from "../../context/SidebarContext";
import { bomStorage } from "../../moc/localStorageUtils";
import { useGetAllBrandsQuery } from "../../redux/features/brand/brandApi";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useLazyGetProductByIdQuery,
  useProductListQuery,
  useUpdateProductStatusMutation,
} from "../../redux/features/product/productApi";
import { useProductCategoryListQuery } from "../../redux/features/productCategories/productCategoriesApi";
import { useGetAllProductTypeQuery } from "../../redux/features/ptoductType/proudctTypeApi";
import { useUnitListQuery } from "../../redux/features/units/unitsApi";
import { IProduct, IProductData } from "../../types/product";
import { debounce } from "../../utils/debounce";
import { transformProductToDuplicatePayload } from "../../utils/duplicateHelpers";
import { useModulePermissions } from "../../hooks/usePermissions";

/** Row “…” menu — first group (before duplicate / edit / delete). */
const PRODUCT_MENU_TOP_ACTIONS = [
  "review image add",
  "update bom",
  "update packaging bom",
  "planning",
  "addons",
  "reviews",
] as const;

const ProductsList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // search
  const [searchText, setSearchText] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteProduct] = useDeleteProductMutation();
  const [selectedProduct, setSelectedProduct] = useState<IProductData | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("sku");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  // crate unit modal

  const [updateStatus] = useUpdateProductStatusMutation();
  // 🔹 API hooks
  const { data: categoriesData } = useProductCategoryListQuery(
    [categorySearch && { name: "search", value: categorySearch }].filter(
      Boolean,
    ),
  );
  const { data: brandsData } = useGetAllBrandsQuery(
    [brandSearch && { name: "search", value: brandSearch }].filter(Boolean),
  );
  const { data: unitsData } = useUnitListQuery(
    [unitSearch && { name: "search", value: unitSearch }].filter(Boolean),
  );

  // 🔹 Extract data
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData],
  );
  const brands = brandsData?.data || [];
  const units = unitsData?.data || [];

  // Fetch product types for tabs
  const { data: productTypesData } = useGetAllProductTypeQuery([
    { name: "isActive", value: true },
  ]);
  const productTypes = useMemo(
    () => productTypesData?.data || [],
    [productTypesData],
  );
  // data select

  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [openUpdateProduct, setOpenUpdateProduct] = useState(false);
  const [openBOMSetup, setOpenBOMSetup] = useState(false);
  const [openPackagingBOMSetup, setOpenPackagingBOMSetup] = useState(false);
  const [openReviewImage, setOpenReviewImage] = useState(false);
  const [selectedOneProductId, setSelectedOneProductId] = useState<
    string | null
  >(null);
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<string | null>(
    null,
  );
  // lazy query for duplication
  const [getProductDetails] = useLazyGetProductByIdQuery();
  const [createProduct] = useCreateProductMutation();
  // requisition setup removed from product list; planning page will be used instead
  // const [productsWithBOM, setProductsWithBOM] = useState<IProductData[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filteredCategory, setFilteredCategory] = useState<string[]>([]);
  const [filteredBrand, setFilteredBrand] = useState<string[]>([]);
  const [filteredUnit, setFilteredUnit] = useState<string[]>([]);
  const [filteredType, setFilteredType] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { isExpanded } = useSidebar();

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch,
    isFetching,
  } = useProductListQuery(
    [
      { name: "page", value: page },
      { name: "limit", value: limit },
      searchText && { name: "search", value: searchText },
      filteredUnit.length > 0 && { name: "baseUnit", value: filteredUnit },
      filteredBrand.length > 0 && { name: "brand", value: filteredBrand },
      (activeCategory !== "all" || filteredCategory.length > 0) && {
        name: "category",
        value: activeCategory !== "all" ? [activeCategory] : filteredCategory,
      },
      statusFilter !== "all" && { name: "isActive", value: statusFilter },
      filteredType !== "all" && { name: "type", value: filteredType },
      { name: "sortBy", value: sortBy },
      { name: "sortOrder", value: sortOrder },
    ].filter(Boolean),
  );

  // Permissions from GET /user/me when available (same source as ProtectedRoute)
  const { hasCreate, hasUpdate, hasDelete, allActions, isProfileLoading } =
    useModulePermissions("Products");

  const canDuplicateProduct =
    allActions.includes("duplicate product") && hasCreate;

  const hasTopMenuSection = useMemo(
    () => PRODUCT_MENU_TOP_ACTIONS.some((a) => allActions.includes(a)),
    [allActions],
  );

  const hasBottomMenuSection = useMemo(
    () => canDuplicateProduct || hasUpdate || hasDelete,
    [canDuplicateProduct, hasDelete, hasUpdate],
  );

  const canShowProductRowDropdown = useMemo(
    () => hasTopMenuSection || hasBottomMenuSection,
    [hasBottomMenuSection, hasTopMenuSection],
  );

  // const [sortColumn, setSortColumn] = useState<string | null>(null);
  const handelClear = () => {
    setFilteredCategory([]);
    setFilteredBrand([]);
    setFilteredUnit([]);
    setActiveCategory("all");
    const params = new URLSearchParams(searchParams);
    params.set("categoryTab", "all");
    setSearchParams(params);
  };

  // router

  const products = productsData?.data || [];
  const meta = productsData?.meta || [];

  useEffect(() => {
    const typeTabParam = searchParams.get("typeTab");
    if (!typeTabParam) return;

    const matchedType = productTypes.find(
      (type: { name: string; slug: string }) =>
        type.name?.toLowerCase() === typeTabParam.toLowerCase() ||
        type.slug?.toLowerCase() === typeTabParam.toLowerCase(),
    );

    if (matchedType && matchedType.slug !== filteredType) {
      setFilteredType(matchedType.slug);
    }
  }, [filteredType, productTypes, searchParams]);

  useEffect(() => {
    const categoryTabParam = searchParams.get("categoryTab");
    if (!categoryTabParam) return;

    const matchedCategory = categories.find(
      (category: any) =>
        category.name?.toLowerCase() === categoryTabParam.toLowerCase() ||
        category.id === categoryTabParam,
    );

    if (matchedCategory && matchedCategory.id !== activeCategory) {
      setActiveCategory(matchedCategory.id);
    }
  }, [activeCategory, categories, searchParams]);

  // select column

  // debounce search
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
    }),
  ).current;

  // Category
  const debounceCategorySearch = useRef(
    debounce((value) => {
      setCategorySearch(value);
    }),
  ).current;

  const debounceBrandSearch = useRef(
    debounce((value) => {
      setBrandSearch(value);
      setPage(1);
    }),
  ).current;
  const debounceUnitsSearch = useRef(
    debounce((value) => {
      setUnitSearch(value);
    }),
  ).current;

  const handleTableChange = (
    pagination: any,
    filters: any,
    sorter: any,
    extra: any,
  ) => {
    if (extra?.action === "sort") {
      if (sorter && sorter.order) {
        // Only set backend sorting for fields that the backend supports
        if (sorter.field === "createdAt" || sorter.field === "sku") {
          setSortBy(sorter.field as string);
          setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
        }
      } else {
        setSortBy("sku");
        setSortOrder("asc");
      }
      setPage(1);
    }
  };

  // select product
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteProduct(id).unwrap();
          if (res.success) {
            // Also delete associated BOM from localStorage
            bomStorage.deleteBOM(id);
            toast.success("Product deleted successfully.");
          }
        } catch (err: any) {
          console.error("Error deleting product:", err);
          const errorMessage =
            err?.data?.message || err?.message || "Failed to delete product.";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleStatusChange = async (id: string) => {
    try {
      setLoadingId(id);
      await updateStatus(id).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!allActions.includes("duplicate product")) {
      toast.error("You don't have permission to duplicate products.");
      return;
    }
    if (!hasCreate) {
      toast.error("You need create permission to duplicate a product.");
      return;
    }
    try {
      setDuplicateLoadingId(id);
      const response = await getProductDetails(id).unwrap();
      const productData = response?.data;

      if (!productData) {
        toast.error("Product data not found!");
        return;
      }

      const payload = transformProductToDuplicatePayload(productData);
      const res = await createProduct(payload).unwrap();

      if (res.success) {
        toast.success(res.message || "Product duplicated successfully!");
      } else {
        toast.error(res.message || "Failed to duplicate product.");
      }
    } catch (err: any) {
      console.error("Duplicate Error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        (typeof err?.data === "string" ? err.data : null) ||
        "Failed to duplicate product.";
      toast.error(errorMessage);
    } finally {
      setDuplicateLoadingId(null);
    }
  };

  const actionMenu = (record: IProductData) => {
    const showDivider = hasTopMenuSection && hasBottomMenuSection;

    return (
      <Menu className="border border-gray-200 shadow-sm">
        {allActions.includes("review image add") && (
          <Menu.Item
            key="review-image"
            onClick={({ domEvent }) => {
              domEvent.stopPropagation();
              setSelectedOneProductId(record.id);
              setOpenReviewImage(true);
            }}
          >
            Review Image Add
          </Menu.Item>
        )}

        {allActions.includes("update bom") && (
          <Menu.Item
            key="bom"
            onClick={({ domEvent }) => {
              domEvent.stopPropagation();
              setSelectedProduct(record);
              setOpenBOMSetup(true);
            }}
          >
            {record.bomCount !== 0 ? "Update Raw BOM" : "Configure Raw BOM"}
          </Menu.Item>
        )}

        {allActions.includes("update packaging bom") && (
          <Menu.Item
            key="packaging-bom"
            onClick={({ domEvent }) => {
              domEvent.stopPropagation();
              setSelectedProduct(record);
              setOpenPackagingBOMSetup(true);
            }}
          >
            Packaging Material Add
          </Menu.Item>
        )}

        {allActions.includes("planning") && (
          <Menu.Item key="planning" disabled={record.bomCount === 0}>
            {record.bomCount !== 0 ? (
              <Link
                to={`/product/${record.id}/planning`}
                onClick={(e) => e.stopPropagation()}
              >
                Planning
              </Link>
            ) : (
              <span
                className="text-gray-400 cursor-not-allowed"
                title="Please configure BOM first"
              >
                Planning
              </span>
            )}
          </Menu.Item>
        )}

        {allActions.includes("addons") && (
          <Menu.Item key="addons">
            <Link
              to={`/product/${record.id}/addons`}
              onClick={(e) => e.stopPropagation()}
            >
              Addons
            </Link>
          </Menu.Item>
        )}

        {allActions.includes("reviews") && (
          <Menu.Item
            key="reviews"
            onClick={({ domEvent }) => {
              domEvent.stopPropagation();
              setSelectedOneProductId(record.id);
              setOpenReviewImage(true);
            }}
          >
            Reviews
          </Menu.Item>
        )}

        {showDivider && <Menu.Divider />}

        {canDuplicateProduct && (
          <Menu.Item
            key="duplicate"
            disabled={duplicateLoadingId === record.id}
            onClick={({ domEvent }) => {
              domEvent.stopPropagation();
              handleDuplicate(record.id);
            }}
          >
            Duplicate Product
          </Menu.Item>
        )}
        {hasUpdate && (
          <Menu.Item key="edit">
            <Link
              to={`/product/update-product/${record.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              Edit Product
            </Link>
          </Menu.Item>
        )}
        {hasDelete && (
          <Menu.Item
            key="delete"
            danger
            onClick={({ domEvent }) => {
              domEvent.stopPropagation();
              handleDelete(record.id);
            }}
          >
            Delete
          </Menu.Item>
        )}
      </Menu>
    );
  };

  const printableData = products.map((product: IProductData, index: number) => {
    const createdAt = product.createdAt ? new Date(product.createdAt) : null;

    return {
      SL: index + 1,
      Name: product.name || "-",
      Category: product.category?.name || "-",
      Brand: product.brand?.name || "-",
      "Base Unit": product.baseUnit?.name || "-",
      Status: product.isActive ? "Active" : "Inactive",
      "Created At": createdAt ? createdAt.toLocaleDateString("en-GB") : "-", // fallback if undefined
    };
  });

  const columns = [
    {
      title: "Id",
      key: "index",
      render: (_: any, __: IProductData, index: number) => <> #{index + 1}</>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 100,
      sorter: (a: any, b: any) => {
        if (!a.name) return -1;
        if (!b.name) return 1;
        return a.name.localeCompare(b.name);
      },
      render: (name: string, record: IProductData) =>
        hasUpdate ? (
          <Link
            to={`/product/${record.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={name} placement="topLeft">
              <div
                className="text-primary"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {name?.slice(0, 15) + "....."}
              </div>
            </Tooltip>
          </Link>
        ) : (
          <Tooltip title={name} placement="topLeft">
            <div
              className="text-gray-700"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name?.slice(0, 15) + "....."}
            </div>
          </Tooltip>
        ),
    },
    {
      title: "Sku",
      dataIndex: "sku",
      key: "sku",
      width: 100,
      sorter: true,
      defaultSortOrder: "ascend" as any,
      render: (sku: string) => (
        <Tooltip title={sku} placement="topLeft">
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {sku}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 100,
      render: (slug: string) => (
        <Tooltip title={slug} placement="topLeft">
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {slug}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: { name?: string }) => <>{category?.name}</>,
    },
    {
      title: "Type",
      dataIndex: "types",
      key: "types",
      render: (types: Array<{ id: string; name: string }> | undefined) => {
        if (!types || !Array.isArray(types) || types.length === 0) return "-";

        // Extract type names from the types array
        const typeNames = types.map((type) => type.name);
        const firstTypeName = typeNames[0];
        const allTypeNames = typeNames.join(", ");
        return (
          <Tooltip title={allTypeNames}>
            <div className="flex items-center">
              <Tag style={{ borderColor: "green" }}>{firstTypeName}</Tag>
              {typeNames.length > 1 && (
                <Tag style={{ borderColor: "green" }}>
                  +{typeNames.length - 1}
                </Tag>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      render: (brand: { name?: string }) => <>{brand?.name}</>,
    },
    {
      title: "BaseUnit",
      dataIndex: "baseUnit",
      key: "baseUnit",
      render: (baseUnit: { name?: string }) => <>{baseUnit?.name}</>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: IProductData) => {
        let color = "blue";
        const text = status || (record.isActive ? "PUBLISHED" : "DRAFT");

        if (text === "DRAFT") color = "orange";
        else if (text === "PUBLISHED") color = "green";
        else if (text === "ARCHIVED") color = "red";

        return (
          <Tag color={color} className="font-medium">
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: { id: string }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <SwitchStatus2
            disabled={!hasUpdate}
            onChange={() => handleStatusChange(record?.id as string)}
            checked={isActive}
            loading={loadingId === record?.id}
          />
        </div>
      ),
      // This controls the icon color
      filtered: statusFilter !== "all",
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Active", value: "true" },
            { text: "In Active", value: "false" },
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="statusFilter"
                value={item.value}
                checked={statusFilter === item.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setStatusFilter(value);
                  setPage(1);
                }}
                style={{
                  marginRight: 8,
                  accentColor: "green",
                  cursor: "pointer",
                }}
              />
              {item.text}
            </label>
          ))}
        </div>
      ),
    },
    {
      title: "Variants",
      dataIndex: "variants",
      key: "variants",
      render: (variants: IProduct[]) => <>{variants?.length || 0} Item</>,
    },

    {
      title: "Current Stock",
      key: "currentStock",
      render: (_: any, record: IProductData) => {
        const totalStock =
          record.variants?.reduce(
            (sum, variant) => sum + (variant.currentStock || 0),
            0,
          ) || 0;
        const totalMinStock =
          record.variants?.reduce(
            (sum, variant) => sum + (variant.minStock || 0),
            0,
          ) || 0;

        return (
          <span
            className={`font-medium ${
              totalStock < totalMinStock ? "text-red-500" : "text-green-600"
            }`}
          >
            {totalStock}
          </span>
        );
      },
    },

    {
      title: "Created At",
      dataIndex: "createdAt", // API থেকে আসা date field
      key: "createdAt",
      render: (date: string) => {
        const d = new Date(date);
        // DD-MM-YYYY format
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Month index 0-11
        const year = d.getFullYear();
        return <span>{`${day}-${month}-${year}`}</span>;
      },
      sorter: true,
    },
    ...(hasUpdate || hasDelete || canShowProductRowDropdown
      ? [
          {
            title: "Action",
            key: "action",
            width: 160,
            fixed: "right" as const,
            className: "fix-right-column",
            render: (_: any, record: IProductData) => (
              <div className="flex gap-2 justify-center items-center">
                {hasUpdate && (
                  <Tooltip title="View Details">
                    <Link
                      to={`/product/${record.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button icon={<FiEye />} size="middle" />
                    </Link>
                  </Tooltip>
                )}
                {hasUpdate && (
                  <Tooltip title="Edit Product">
                    <Link
                      to={`/product/update-product/${record.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button icon={<FiEdit />} size="middle" />
                    </Link>
                  </Tooltip>
                )}
                {canShowProductRowDropdown && (
                  <Tooltip title="More Actions">
                    <Dropdown overlay={actionMenu(record)} trigger={["click"]}>
                      <Button
                        size="middle"
                        icon={
                          duplicateLoadingId === record.id ? (
                            <RefreshCcw className="animate-spin" size={16} />
                          ) : (
                            <FiMoreVertical />
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </Tooltip>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const filterMenu = (
    <div className="p-6 min-w-[360px] bg-white border border-gray-300 rounded-sm shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-gray-900 text-sm font-semibold">
            Filter Products
          </h1>
        </div>
        <Button
          size="small"
          onClick={handelClear}
          className="!text-sm !bg-red-600 !text-white"
        >
          Clear All
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-6">
          {/* Category */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-gray-900 text-xs mb-1 font-medium">
              Category
            </label>
            <Input
              placeholder="Search category..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              onChange={(e) => debounceCategorySearch(e.target.value)}
              className="mb-3 mt-2"
              size="small"
              allowClear
            />
            <div className="max-h-[150px] overflow-y-auto">
              {categories?.length === 0 ? (
                <p className="text-xs text-red-500">No categories found</p>
              ) : (
                <div className="max-h-[250px] overflow-y-auto">
                  <Checkbox.Group
                    options={categories
                      .filter((cat: any) =>
                        cat?.name
                          .toLowerCase()
                          .includes(categorySearch.toLowerCase()),
                      )
                      .map((cat: any) => ({
                        label: cat?.name,
                        value: cat?.id,
                      }))}
                    value={filteredCategory}
                    onChange={(values) =>
                      setFilteredCategory(values as string[])
                    }
                    className="flex flex-col gap-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Brand */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-gray-900 text-xs mb-1 font-medium">
              Brand
            </label>
            <Input
              placeholder="Search brand..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              onChange={(e) => debounceBrandSearch(e.target.value)}
              className="mb-3 mt-2"
              size="small"
              allowClear
            />
            <div className="max-h-[150px] overflow-y-auto">
              {brands?.length === 0 ? (
                <p className="text-xs text-red-500">No brands found</p>
              ) : (
                <div className="max-h-[250px] overflow-y-auto">
                  <Checkbox.Group
                    options={brands
                      .filter((brand: any) =>
                        brand?.name
                          .toLowerCase()
                          .includes(brandSearch.toLowerCase()),
                      )
                      .map((brand: any) => ({
                        label: brand?.name,
                        value: brand?.id,
                      }))}
                    value={filteredBrand}
                    onChange={(values) => setFilteredBrand(values as string[])}
                    className="flex flex-col gap-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Units */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-gray-900 text-xs mb-1 font-medium">
              Units
            </label>
            <Input
              placeholder="Search unit..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              onChange={(e) => debounceUnitsSearch(e.target.value)}
              className="mb-3 mt-2"
              size="small"
              allowClear
            />
            <div className="max-h-[150px] overflow-y-auto">
              {units?.length === 0 ? (
                <p className="text-xs text-red-500">No units found</p>
              ) : (
                <div className="max-h-[250px] overflow-y-auto">
                  <Checkbox.Group
                    options={units
                      .filter((unit: any) =>
                        unit?.name
                          .toLowerCase()
                          .includes(unitSearch.toLowerCase()),
                      )
                      .map((unit: any) => ({
                        label: unit?.name,
                        value: unit?.id,
                      }))}
                    value={filteredUnit}
                    onChange={(values) => setFilteredUnit(values as string[])}
                    className="flex flex-col gap-2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // select column
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "index",
    "name",
    "category",
    "brand",
    "baseUnit",
    "status",
    "isActive",
    "currentStock",
    "action",
  ]);

  return (
    <div>
      <PageMeta title="Products | ERP" description="Manage Products" />
      <div className="">
        <PageHeader
          title="Products"
          subtitle="View and manage all products"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Products" },
          ]}
          extra={
            <div className="flex items-center  gap-3">
              <PageListPrint
                tableData={printableData}
                fileName="products-list"
              />
              <CustomActionButton
                disabled={products.length === 0 ? true : false}
                onClick={() => {
                  refetch();
                }}
                text="Refresh"
                icon={<RefreshCcw />}
                type="default"
              />

              {hasCreate && (
                <Link to="/create-product">
                  <CustomActionButton
                    text="Add New"
                    icon={<Plus />}
                    type="primary"
                  />
                </Link>
              )}
            </div>
          }
        />

        <div className="flex justify-between gap-4 !mb-4  flex-wrap">
          <Input
            disabled={meta.total < 0}
            placeholder="Search products by name..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            onChange={(e) => debounceSearch(e.target.value)}
            className="w-full md:max-w-md flex-1"
            size="middle"
            allowClear
          />

          <div className="flex gap-5 ">
            <FilterColumn
              tableName="product_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />

            {hasUpdate && (
              <MultipleDeleteAndStatusChanges
                text="Products"
                iDs={selectedProductIds}
                deleteMutation={deleteProduct}
                statusChangeMutation={updateStatus}
                setIDs={setSelectedProductIds}
                isDeleteButton={false}
              />
            )}

            <Dropdown overlay={filterMenu} trigger={["click"]}>
              <CustomActionButton
                disabled={!products.length && true}
                icon2={<DownOutlined />}
                type="default"
                icon={<Filter />}
                text=" Filter"
              ></CustomActionButton>
            </Dropdown>
          </div>
        </div>

        {/* Type Filter Tabs */}
        <Tabs
          activeKey={filteredType}
          onChange={(key) => {
            setFilteredType(key);
            setPage(1); // Reset to first page when filter changes
            const params = new URLSearchParams(searchParams);
            const selectedType = productTypes.find(
              (type: { name: string; slug: string }) => type.slug === key,
            );
            params.set("typeTab", (selectedType?.name || key).toLowerCase());
            setSearchParams(params);
          }}
          items={[
            {
              key: "all",
              label: "All",
            },
            ...productTypes.map(
              (type: { id: string; name: string; slug: string }) => ({
                key: type.slug,
                label: type.name,
              }),
            ),
          ]}
          className="mb-4"
        />

        <div
          className={`w-full mb-4 overflow-x-auto ant-table-wrapper !bg-transparent ${
            isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
          } custom-scrollbar`}
        >
          <Tabs
            activeKey={activeCategory}
            onChange={(key) => {
              setActiveCategory(key);
              setPage(1);
              const params = new URLSearchParams(searchParams);
              const selectedCategory = categories.find(
                (category: any) => category.id === key,
              );
              params.set(
                "categoryTab",
                (selectedCategory?.name || key).toLowerCase(),
              );
              setSearchParams(params);
            }}
            tabBarGutter={20}
            items={[
              {
                key: "all",
                label: (
                  <span className="whitespace-nowrap">All Categories</span>
                ),
              },
              ...(categoriesData?.data?.map((category: any) => ({
                key: category.id,
                label: (
                  <span className="whitespace-nowrap">{category.name}</span>
                ),
              })) || []),
            ]}
            className="mb-0 w-full"
          />
        </div>

        <DataTable
          selectRow={true}
          loading={productsLoading || isFetching || isProfileLoading}
          data={products}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          rowKey="id"
          isPaginate={meta?.total > 10}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10}
          total={meta?.total || 0}
          clearSelectionTrigger={selectedProductIds.length === 0 && true}
          onSelectRowsChange={(selectedRows: any[]) => {
            const ids = selectedRows.map((row) => row.id);
            setSelectedProductIds(ids);
          }}
          onRow={
            hasUpdate
              ? (record: IProductData) => ({
                  onClick: () => navigate(`/product/${record.id}`),
                  style: { cursor: "pointer" },
                })
              : undefined
          }
          onChange={handleTableChange}
        />
      </div>
      {/* Modals */}
      {openCreateProduct && (
        <CreateProductModal
          open={openCreateProduct}
          setOpen={setOpenCreateProduct}
        />
      )}
      {openUpdateProduct && selectedProduct && (
        <UpdateProductModal
          open={openUpdateProduct}
          setOpen={setOpenUpdateProduct}
          data={selectedProduct}
        />
      )}

      {openBOMSetup && selectedProduct && (
        <RawMaterialBOMSetupModal
          open={openBOMSetup}
          setOpen={setOpenBOMSetup}
          product={selectedProduct}
        />
      )}

      {openPackagingBOMSetup && selectedProduct && (
        <PackagingBOMSetupModal
          open={openPackagingBOMSetup}
          setOpen={setOpenPackagingBOMSetup}
          product={selectedProduct}
        />
      )}

      {/* Review Image Modal */}
      {openReviewImage && selectedOneProductId && (
        <ReviewImageModal
          open={openReviewImage}
          setOpen={setOpenReviewImage}
          productId={selectedOneProductId}
          isComboProduct={false}
        />
      )}

      {/* Requisition setup removed from Products list - use Planning page instead */}
    </div>
  );
};

export default ProductsList;
