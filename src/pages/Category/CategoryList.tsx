import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Modal, Tabs, Tag, Tooltip } from "antd";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";

import { FilterDropdownProps } from "antd/es/table/interface";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import CreateCategoryModal from "../../components/common/Modals/Category/CreateCategoryModel";
import UpdateCategoryModal from "../../components/common/Modals/Category/UpdateCategoryModel";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useCategoryListQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryStatusMutation,
} from "../../redux/features/categories/categoriesApi";
import { ICategory } from "../../types/category";
import { debounce } from "../../utils/debounce";

type CategoryTypeTab = "all" | "raw" | "packaging";

const CategoriesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<CategoryTypeTab>(() => {
    const p = searchParams.get("typeTab")?.toLowerCase();
    if (p === "raw" || p === "packaging" || p === "all") return p;
    return "all";
  });
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);
  const [openUpdateCategoryModal, setOpenUpdateCategoryModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const searchInput = useRef<InputRef | null>(null);
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateStatus] = useUpdateCategoryStatusMutation();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { data, isLoading, isFetching, refetch } = useCategoryListQuery(
    [
      { name: "page", value: String(page) },
      { name: "limit", value: String(limit) },
      searchText ? { name: "search", value: searchText } : null,
      activeTab !== "all" ? { name: "type", value: activeTab } : null,
    ].filter(Boolean) as { name: string; value: string }[],
  );
  useEffect(() => {
    const typeTabParam = searchParams.get("typeTab");
    if (!typeTabParam) {
      if (activeTab !== "all") setActiveTab("all");
      return;
    }
    const normalized = typeTabParam.toLowerCase();
    const typeKeyMap: Record<string, CategoryTypeTab> = {
      all: "all",
      raw: "raw",
      packaging: "packaging",
    };
    const next = typeKeyMap[normalized] ?? "all";
    if (next !== activeTab) setActiveTab(next);
  }, [searchParams, activeTab]);

  const handleTypeTabChange = (key: string) => {
    const tab = key as CategoryTypeTab;
    setActiveTab(tab);
    setSearchText("");
    setPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("typeTab", tab.toLowerCase());
    setSearchParams(params);
  };

  const categories = data?.data || [];
  const meta = data?.meta;
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  // debounceSearch
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }),
  ).current;
  // delete handler
  const handleDelete = (id: string | undefined) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteCategory(id as string).unwrap();
          if (res.success) {
            toast.success("Category deleted successfully.");
          }
        } catch (err: any) {
          console.error("Error deleting category:", err);
          toast.error("Failed to delete category.");
        }
      },
    });
  };
  const { hasUpdate, hasCreate, hasDelete } =
    useModulePermissions("Categories");
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

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div>
        <Input
          ref={searchInput}
          placeholder="Search unit by name..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          value={searchText}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
          className="relative"
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Name">
        <SearchOutlined
          className={`!rounded-full !bg-transparent 
          ${
            filtered ? "!bg-green-100 !text-green-600" : "!bg-gray-100 "
          } cursor-pointer`}
        />
      </Tooltip>
    ),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "230px",
      ...getNameColumnSearchProps(),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "230px",
      render: (type: string) => {
        const label =
          type?.length > 0
            ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
            : "-";
        return (
          <Tag color={type?.toLowerCase() === "packaging" ? "blue" : "green"}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      // align: "center" as const,
      render: (description: string) => (
        <Tooltip
          title={description}
          overlayInnerStyle={{
            maxHeight: 200,
            maxWidth: 1050,
            overflowY: "auto",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          <span className="line-clamp-2 cursor-pointer">
            {description || "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => (
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
                checked={selectedKeys[0] === item.value}
                style={{
                  marginRight: 8,
                  accentColor: "green",
                  cursor: "pointer",
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "all") {
                    // ✅ Clear filters and instantly show all records
                    clearFilters?.();
                    confirm({ closeDropdown: true });
                  } else {
                    // ✅ Apply filter immediately
                    setSelectedKeys([value]);
                    confirm({ closeDropdown: true });
                  }
                }}
              />
              {item.text}
            </label>
          ))}
        </div>
      ),
      onFilter: (value: string, record: { isActive: boolean }) => {
        if (value === "true") return record.isActive === true;
        if (value === "false") return record.isActive === false;
        return true; // ✅ “All” or undefined returns all records
      },
      filterMultiple: false,
      render: (isActive: boolean, record: { id: string }) => (
        <SwitchStatus2
          disabled={!hasUpdate}
          checked={isActive}
          onChange={() => handleStatusChange(record.id)}
          loading={record?.id === loadingId}
        />
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
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            render: (record: ICategory) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setOpenUpdateCategoryModal(true);
                        setSelectedCategory(record);
                      }}
                    />
                  </Tooltip>
                )}
                {hasDelete && (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(record.id)}
                      style={{
                        color: "#dc2626",
                        border: "1px solid #dc2626",
                        padding: "4px",
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const printableCategory = categories.map((unit: ICategory, index: number) => {
    const createdAt = unit.createdAt ? new Date(unit.createdAt) : null;

    return {
      SL: index + 1,
      Name: unit.name || "-",
      Description: unit.description?.slice(1, 29) || "-",
      Status: unit.isActive ? "Active" : "Inactive",
      "Created At": createdAt
        ? `${String(createdAt.getDate()).padStart(2, "0")}-${String(
            createdAt.getMonth() + 1,
          ).padStart(2, "0")}-${createdAt.getFullYear()}`
        : "-",
    };
  });

  return (
    <div>
      <PageMeta
        title=" Categories | Amzad Food ERP"
        description="This is categories page"
      />
      <div>
        <PageHeader
          title="Categories"
          subtitle="View and manage all Categories"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Categories" },
          ]}
          extra={
            <>
              <PageListPrint
                tableData={printableCategory}
                fileName="Category-list"
              />
              <MultipleDeleteAndStatusChanges
                text="Vat"
                iDs={selectedProductIds}
                deleteMutation={deleteCategory}
                statusChangeMutation={updateStatus}
                setIDs={setSelectedProductIds}
              />
              <CustomActionButton
                disabled={meta?.total === 0 ? true : false}
                onClick={() => {
                  refetch();
                }}
                text="Refresh"
                icon={<RefreshCcw />}
                type="default"
              />
              {hasCreate && (
                <CustomActionButton
                  onClick={() => setOpenCreateCategoryModal(true)}
                  text="Add New"
                  icon={<Plus />}
                  type="primary"
                />
              )}
            </>
          }
        />

        <Tabs
          activeKey={activeTab}
          onChange={handleTypeTabChange}
          items={[
            { key: "all", label: "All" },
            { key: "RAW", label: "Raw" },
            { key: "PACKAGING", label: "Packaging" },
          ]}
          className="mb-4"
        />

        <DataTable
          loading={isLoading || isFetching}
          data={categories}
          columns={columns}
          rowKey="id"
          isPaginate={meta?.total > 10 && true}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10 && true}
          total={meta?.total || 0}
          selectRow={true}
          clearSelectionTrigger={selectedProductIds.length === 0 && true}
          onSelectRowsChange={(selectedRows: any[]) => {
            const ids = selectedRows.map((row) => row.id);
            setSelectedProductIds(ids);
          }}
        />
      </div>
      {openCreateCategoryModal && (
        <CreateCategoryModal
          open={openCreateCategoryModal}
          setOpen={setOpenCreateCategoryModal}
        />
      )}

      {openUpdateCategoryModal && selectedCategory && (
        <UpdateCategoryModal
          open={openUpdateCategoryModal}
          setOpen={setOpenUpdateCategoryModal}
          data={selectedCategory}
        />
      )}
    </div>
  );
};

export default CategoriesList;
