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
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useSidebar } from "../../context/SidebarContext";
import { useGetAllBrandsQuery } from "../../redux/features/brand/brandApi";
import {
  useComboProductListQuery,
  useCreateComboProductMutation,
  useDeleteComboProductMutation,
  useLazyGetComboProductByIdQuery,
  useUpdateComboProductStatusMutation,
} from "../../redux/features/comboProduct/comboProductApi";
import { useProductCategoryListQuery } from "../../redux/features/productCategories/productCategoriesApi";
import { useGetAllProductTypeQuery } from "../../redux/features/ptoductType/proudctTypeApi";
import { useUnitListQuery } from "../../redux/features/units/unitsApi";
import {
  IComboProductData,
  IComboProductVariant,
} from "../../types/comboProduct";
import { IProductData } from "../../types/product";
import { debounce } from "../../utils/debounce";

import ReviewImageModal from "../../components/common/Modals/review/ReviewImageModal";
import { useModulePermissions } from "../../hooks/usePermissions";
import { transformComboProductToDuplicatePayload } from "../../utils/duplicateHelpers";

const ComboProductList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteComboProduct] = useDeleteComboProductMutation();
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("sku");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [updateStatus] = useUpdateComboProductStatusMutation();

  // review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // custom loading
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<string | null>(
    null,
  );
  // filter
  const [filteredType, setFilteredType] = useState<string>("all");

  const [filteredCategory, setFilteredCategory] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { isExpanded } = useSidebar();
  const [filteredBrand, setFilteredBrand] = useState<string[]>([]);
  const [filteredUnit, setFilteredUnit] = useState<string[]>([]);
  // select column
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "index",
    "sku",
    "name",
    "types",
    "isPlan",
    "category",
    "brand",
    "baseUnit",
    "status",
    "currentStock",
    "minStock",
    "isActive",
    "action",
  ]);
  // select product
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

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

  // Fetch product types for tabs
  const { data: productTypesData } = useGetAllProductTypeQuery([
    { name: "isActive", value: true },
  ]);
  const productTypes = useMemo(
    () => productTypesData?.data || [],
    [productTypesData],
  );

  // debounce search
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
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
  const {
    data: comboProductsData,
    isLoading: comboProductsLoading,
    isFetching,
    refetch,
  } = useComboProductListQuery(
    [
      { name: "page", value: page },
      { name: "limit", value: limit },
      searchText && { name: "search", value: searchText },
      filteredCategory.length > 0 && {
        name: "category",
        value: filteredCategory,
      },
      filteredBrand.length > 0 && { name: "brand", value: filteredBrand },
      filteredUnit.length > 0 && { name: "baseUnit", value: filteredUnit },
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

  const handleTableChange = (
    pagination: any,
    filters: any,
    sorter: any,
    extra: any,
  ) => {
    if (extra?.action === "sort") {
      if (sorter && sorter.order) {
        setSortBy(sorter.field as string);
        setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
      } else {
        setSortBy("createdAt");
        setSortOrder("desc");
      }
      setPage(1);
    }
  };

  // 🔹 Extract data
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData],
  );
  const brands = brandsData?.data || [];
  const units = unitsData?.data || [];
  const comboProducts = comboProductsData?.data || [];
  const meta = comboProductsData?.meta || {};

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

  // Create maps for quick lookup
  const categoryMap = categories.reduce((acc: any, cat: any) => {
    acc[cat.id] = cat;
    return acc;
  }, {});
  const brandMap = brands.reduce((acc: any, brand: any) => {
    acc[brand.id] = brand;
    return acc;
  }, {});
  const unitMap = units.reduce((acc: any, unit: any) => {
    acc[unit.id] = unit;
    return acc;
  }, {});
  const {
    hasUpdate,
    hasCreate,
    hasDelete,
    allActions,
    isSuperAdmin,
    isProfileLoading,
  } = useModulePermissions("Combo Products");

  const handelClear = () => {
    setFilteredCategory([]);
    setFilteredBrand([]);
    setFilteredUnit([]);
    setActiveCategory("all");
    const params = new URLSearchParams(searchParams);
    params.set("categoryTab", "all");
    setSearchParams(params);
  };
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this combo product?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteComboProduct(id).unwrap();
          if (res.success) {
            toast.success("Combo product deleted successfully.");
          }
        } catch (err: any) {
          const errorMessage =
            err?.data?.message ||
            err?.message ||
            "Failed to delete combo product.";
          toast.error(errorMessage);
        }
      },
    });
  };

  const [getComboDetails] = useLazyGetComboProductByIdQuery();
  const [createComboProduct] = useCreateComboProductMutation();

  const handleDuplicate = async (id: string) => {
    try {
      setDuplicateLoadingId(id);
      const response = await getComboDetails(id).unwrap();
      const comboData = response?.data;

      if (!comboData) {
        toast.error("Combo product data not found!");
        return;
      }

      const payload = transformComboProductToDuplicatePayload(comboData);
      const res = await createComboProduct(payload).unwrap();

      if (res.success) {
        toast.success(res.message || "Combo product duplicated successfully!");
      } else {
        toast.error(res.message || "Failed to duplicate combo product.");
      }
    } catch (err: any) {
      console.error("Duplicate Error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        (typeof err?.data === "string" ? err.data : null) ||
        "Failed to duplicate combo product.";
      toast.error(errorMessage);
    } finally {
      setDuplicateLoadingId(null);
    }
  };

  const actionMenu = (record: IComboProductData) => (
    <Menu className="border border-gray-200 shadow-sm">
      {(isSuperAdmin || allActions.includes("duplicate product")) && (
        <Menu.Item
          key="duplicate"
          disabled={duplicateLoadingId === record.id}
          onClick={({ domEvent }) => {
            domEvent.stopPropagation();
            handleDuplicate(record.id);
          }}
        >
          Duplicate Combo
        </Menu.Item>
      )}

      {(isSuperAdmin || allActions.includes("review image add")) && (
        <Menu.Item
          key="review-image"
          onClick={({ domEvent }) => {
            domEvent.stopPropagation();
            setSelectedProductId(record.id);
            setReviewModalOpen(true);
          }}
        >
          Review Image Add
        </Menu.Item>
      )}

      {(isSuperAdmin || allActions.includes("addons")) && (
        <Menu.Item key="addons">
          <Link
            to={`/combo-product/${record.id}/addons`}
            onClick={(e) => e.stopPropagation()}
          >
            Addons
          </Link>
        </Menu.Item>
      )}

      {(isSuperAdmin || allActions.includes("reviews")) && (
        <Menu.Item
          key="reviews"
          onClick={({ domEvent }) => {
            domEvent.stopPropagation();
            setSelectedProductId(record.id);
            setReviewModalOpen(true);
          }}
        >
          Reviews
        </Menu.Item>
      )}

      {(isSuperAdmin || allActions.includes("update packaging bom")) && (
        <Menu.Item key="packaging-bom">
          <Link
            to={`/combo-product/${record.id}/packaging-bom`}
            onClick={(e) => e.stopPropagation()}
          >
            Packaging Bom
          </Link>
        </Menu.Item>
      )}
      {(isSuperAdmin || allActions.includes("planning")) && record.isPlan && (
        <Menu.Item key="planning">
          <Link
            to={`/combo-product/${record.id}/planning`}
            onClick={(e) => e.stopPropagation()}
          >
            Planning
          </Link>
        </Menu.Item>
      )}

      <Menu.Item key="view">
        <Link
          to={`/combo-product/${record.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </Menu.Item>

      {(hasUpdate || isSuperAdmin) && (
        <Menu.Item key="edit">
          <Link
            to={`/combo-product/update-combo-product/${record.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            Edit Combo Product
          </Link>
        </Menu.Item>
      )}
      {/* <Menu.Item key="production">
        Production
      </Menu.Item> */}
      <Menu.Divider />
      {(hasDelete || isSuperAdmin) && (
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

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: IComboProductData, index: number) => (
        <> #{index + 1}</>
      ),
    },
    // {
    //   title: "Combo ID",
    //   dataIndex: "comboId",
    //   key: "comboId",
    // },
    // {
    //   title: "Combo Name",
    //   dataIndex: "name",
    //   key: "name",
    // },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 100,
      render: (name: string, record: IComboProductData) => (
        <Link
          to={`/combo-product/${record.id}`}
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
              {name?.slice(0, 15) + "..."}
            </div>
          </Tooltip>
        </Link>
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
            {slug?.slice(0, 15) + (slug?.length > 15 ? "..." : "")}
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
      defaultSortOrder: "ascend",
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
      title: "Is Plan",
      dataIndex: "isPlan",
      key: "isPlan",
      render: (isPlan: boolean) =>
        isPlan ? (
          <Tag color="gold" className="font-medium">
            PLAN
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      render: (brand: { name?: string }, record: IComboProductData) => (
        <>{brand?.name || brandMap[record.brand]?.name}</>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: { name?: string }, record: IComboProductData) => (
        <>{category?.name || categoryMap[record.category]?.name}</>
      ),
    },
    {
      title: "base Unit",
      dataIndex: "baseUnit",
      key: "baseUnit",
      render: (baseUnit: { name?: string }, record: IComboProductData) => (
        <>{baseUnit?.name || unitMap[record.baseUnit]?.name}</>
      ),
    },
    {
      title: "Variants",
      dataIndex: "variants",
      key: "variants",
      render: (variants: IComboProductVariant[]) => (
        <>{variants?.length || 0} Item</>
      ),
    },
    {
      title: "Current Stock",
      key: "currentStock",
      render: (_: any, record: IComboProductData) => {
        const total =
          record.variants?.reduce((sum, v) => sum + (v.currentStock || 0), 0) ||
          0;
        const totalMin =
          record.variants?.reduce((sum, v) => sum + (v.minStock || 0), 0) || 0;
        return (
          <span
            className={`font-medium ${
              total < totalMin ? "text-red-500" : "text-green-600"
            }`}
          >
            {total}
          </span>
        );
      },
    },
    {
      title: "Min Stock",
      key: "minStock",
      render: (_: any, record: IComboProductData) => {
        const total = record.variants?.reduce(
          (sum, v) => sum + (v.minStock || 0),
          0,
        );
        return <span>{total || 0}</span>;
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: IComboProductData) => {
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
      defaultSortOrder: undefined,
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      fixed: "right",
      className: "fix-right-column",
      render: (_: any, record: IComboProductData) => (
        <div className="flex gap-2 justify-center items-center">
          <Tooltip title="View Details">
            <Link
              to={`/combo-product/${record.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="middle" type="default" icon={<FiEye />} />
            </Link>
          </Tooltip>
          {(hasUpdate || isSuperAdmin) && (
            <Tooltip title="Edit">
              <Link
                to={`/combo-product/update-combo-product/${record.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="middle" type="default" icon={<FiEdit />} />
              </Link>
            </Tooltip>
          )}

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
        </div>
      ),
    },
  ];

  const filterMenu = (
    <div className="p-6 min-w-[360px] bg-white border border-gray-300 rounded-sm">
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

  const printableData = comboProducts.map(
    (product: IProductData, index: number) => {
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
    },
  );

  return (
    <div>
      <PageMeta
        title="Combo Products | ERP"
        description="Manage Combo Products"
      />

      <PageHeader
        title="Combo Products"
        subtitle="View and manage all combo products"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Combo Products" },
        ]}
        extra={
          <div className="flex items-center gap-3">
            <PageListPrint
              tableData={printableData}
              fileName="Combo products-list"
            />
            <CustomActionButton
              disabled={comboProducts.length === 0 ? true : false}
              onClick={() => {
                refetch();
              }}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />

            {hasCreate && (
              <Link to={"/create-combo-product"}>
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
          className="max-w-md"
          size="middle"
          allowClear
        />
        <div className="flex gap-5 ">
          <FilterColumn
            tableName="combo_product_table"
            columns={columns}
            onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
          />

          {hasUpdate && (
            <MultipleDeleteAndStatusChanges
              text="Products"
              iDs={selectedProductIds}
              deleteMutation={deleteComboProduct}
              statusChangeMutation={updateStatus}
              setIDs={setSelectedProductIds}
              isDeleteButton={false}
            />
          )}
          <Dropdown overlay={filterMenu} trigger={["click"]}>
            <CustomActionButton
              disabled={!comboProducts.length && true}
              icon2={<DownOutlined />}
              type="default"
              icon={<Filter />}
              text=" Filter"
            ></CustomActionButton>
          </Dropdown>
        </div>
      </div>

      {/* Type Filter Tabs */}

      <div
        className={`w-full mb-4 overflow-x-auto ant-table-wrapper !bg-transparent ${
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        } custom-scrollbar`}
      >
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
              label: "All Types",
            },
            ...productTypes.map(
              (type: { id: string; name: string; slug: string }) => ({
                key: type.slug,
                label: type.name,
              }),
            ),
          ]}
        />
      </div>
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
              label: <span className="whitespace-nowrap">All Categories</span>,
            },
            ...(categoriesData?.data?.map((category: any) => ({
              key: category.id,
              label: <span className="whitespace-nowrap">{category.name}</span>,
            })) || []),
          ]}
          className="!-mt-3 w-full"
        />
      </div>

      <DataTable
        selectRow={true}
        loading={comboProductsLoading || isFetching || isProfileLoading}
        data={comboProducts}
        columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
        rowKey="id"
        isPaginate={meta?.total > 10 && true}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        clearSelectionTrigger={selectedProductIds.length === 0 && true}
        showSizeChanger={meta?.total > 20 && true}
        total={meta?.total || 0}
        onSelectRowsChange={(selectedRows: any[]) => {
          const ids = selectedRows.map((row) => row.id);
          setSelectedProductIds(ids);
        }}
        onRow={(record: IComboProductData) => ({
          onClick: () => navigate(`/combo-product/${record.id}`),
          style: { cursor: "pointer" },
        })}
        onChange={handleTableChange}
      />

      {/* Review Image Modal */}
      {reviewModalOpen && selectedProductId && (
        <ReviewImageModal
          open={reviewModalOpen}
          setOpen={setReviewModalOpen}
          productId={selectedProductId}
          isComboProduct={true}
        />
      )}
    </div>
  );
};

export default ComboProductList;
