import { Button, Input, InputRef, Modal, Tabs, Tooltip } from "antd";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

import {
  useDeleteMaterialMutation,
  useGetMaterialsQuery,
  useToggleMaterialStatusMutation,
} from "../../redux/features/material/materialApi";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateMaterialModel from "../../components/common/Modals/material/CreateMaterialModel";
import UpdateMaterialModel from "../../components/common/Modals/material/UpdateMaterialModel";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useSidebar } from "../../context/SidebarContext";
import { useModulePermissions } from "../../hooks/usePermissions";
import { IMaterial } from "../../types/material";
import { debounce } from "../../utils/debounce";

const MaterialsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedMaterial, setSelectedMaterial] = useState<IMaterial | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [inputValue, setInputValue] = useState(""); // For controlled input

  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  const searchInput = useRef<InputRef | null>(null);
  const [updateStatus] = useToggleMaterialStatusMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();
  // --- Debounced search ---
  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // update input immediately
    debounceSearch(value); // update search query debounced
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setInputValue(""); // clear input
    setSearchText(""); // clear search query
    setCategoryFilter("all"); // clear category filter
    setPage(1);
    const params = new URLSearchParams(searchParams);
    const typeLabelMap: Record<string, string> = {
      all: "all",
      raw: "raw materials",
      packaging: "packaging materials",
    };
    params.set("typeTab", (typeLabelMap[key] || key).toLowerCase());
    params.set("categoryTab", "all");
    setSearchParams(params);
  };

  // --- Fetch materials with type + pagination + search ---
  const { data, isLoading, isFetching, refetch } = useGetMaterialsQuery(
    [
      activeTab !== "all" ? { name: "type", value: activeTab } : null,
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      searchText ? { name: "search", value: searchText } : null,
      statusFilter !== "all" ? { name: "status", value: statusFilter } : null,
      categoryFilter !== "all"
        ? { name: "categoryId", value: categoryFilter }
        : null,
    ].filter(Boolean),
  );

  const materials = data?.data || [];
  const meta = data?.meta;
  const summeryTab = useMemo(() => data?.summary || [], [data]);
  const { isExpanded } = useSidebar();

  useEffect(() => {
    const typeTabParam = searchParams.get("typeTab");
    if (!typeTabParam) return;

    const normalizedType = typeTabParam.toLowerCase();
    const typeKeyMap: Record<string, string> = {
      all: "all",
      raw: "raw",
      "raw materials": "raw",
      packaging: "packaging",
      "packaging materials": "packaging",
    };
    const nextType = typeKeyMap[normalizedType] || "all";
    if (nextType !== activeTab) {
      setActiveTab(nextType);
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    const categoryTabParam = searchParams.get("categoryTab");
    if (!categoryTabParam) return;

    const normalizedCategory = categoryTabParam.toLowerCase();
    if (normalizedCategory === "all") {
      if (categoryFilter !== "all") setCategoryFilter("all");
      return;
    }

    const matchedCategory = summeryTab.find(
      (category: any) => category?.name?.toLowerCase() === normalizedCategory,
    );

    if (matchedCategory?.id && matchedCategory.id !== categoryFilter) {
      setCategoryFilter(matchedCategory.id);
    }
  }, [categoryFilter, searchParams, summeryTab]);

  const { hasUpdate, hasCreate, hasDelete } =
    useModulePermissions("Materials");

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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this unit?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteMaterial(id).unwrap();
          if (res.success) toast.success("Material deleted successfully");
        } catch (err: any) {
          toast.error(err?.message || "Failed to delete unit");
        }
      },
    });
  };

  // print data
  const printableData = materials.map((material: IMaterial, index: number) => {
    const createdAt = material.createdAt ? new Date(material.createdAt) : null;

    return {
      SL: index + 1,
      Name: material.name || "-",
      Category: material.category?.name || "-",
      "Min Stock": `${material.minStock?.toLocaleString() || 0} ${
        material.unit?.symbol ? `(${material.unit.symbol})` : ""
      }`,

      "Current Stock": `${material.currentStock?.toLocaleString() || 0} ${
        material.unit?.symbol ? `(${material.unit.symbol})` : ""
      }`,
      "Avail Stock": `${material.costPerUnit?.toLocaleString() || 0} ${
        material.unit?.symbol ? `(${material.unit.symbol})` : ""
      }`,
      Status: material.isActive ? "Active" : "Inactive",
      Notes: material.notes || "-",
      "Created At": createdAt
        ? createdAt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "-",
    };
  });

  // --- Columns ---
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    // { title: "Code", dataIndex: "code", key: "code", ellipsis: true },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filtered: categoryFilter !== "all",
      render: (category: IMaterial["category"]) => (
        <span className="whitespace-nowrap">{category?.name}</span>
      ),
    },
    {
      title: "Min Stock",
      dataIndex: "minStock",
      key: "minStock",
      align: "center" as const,
      render: (value: number, record: IMaterial) => (
        <span>
          {value?.toLocaleString() || 0}{" "}
          {record.unit?.symbol ? `(${record.unit.symbol})` : ""}
        </span>
      ),
    },

    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      sorter: (a: { currentStock: number }, b: { currentStock: number }) =>
        a.currentStock - b.currentStock,
      defaultSortOrder: "descend",
      align: "center" as const,
      render: (stock: number, record: any) => {
        const color = record.stockStatus === "low" ? "red" : "inherit";
        return (
          <span style={{ color }}>
            {stock?.toLocaleString() || 0}{" "}
            {record.unit?.symbol ? `(${record.unit.symbol})` : ""}
          </span>
        );
      },
    },
    {
      title: "Cost Per Unit",
      key: "availStock",
      align: "center" as const,
      render: (record: IMaterial) => {
        return <span>{record.costPerUnit?.toLocaleString() || 0}</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: { id: string }) => (
        <SwitchStatus2
          onChange={() => handleStatusChange(record?.id as string)}
          checked={isActive}
          loading={loadingId === record?.id}
        />
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
      title: "Notes",
      dataIndex: "notes",
      key: "notes",

      render: (notes: string) => (
        <Tooltip title={notes || "-"}>
          <div
            style={{
              maxWidth: 100,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {notes?.slice(0, 20) || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt", // API থেকে আসা date field
      key: "createdAt",
      render: (date: string) => (
        <span>
          {new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), // sorting
      defaultSortOrder: "descend", // চাইলে default descending
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            align: "center" as const,
            fixed: "right",
            render: (record: IMaterial) => (
              <div className="flex items-center justify-center gap-2">
                {/* <Tooltip title="View Details">
            <Button>
              <Link to={`/raw-material/${record.id}`}>
                <FiEye />
              </Link>
            </Button>
          </Tooltip> */}
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setSelectedMaterial(record);
                        setOpenUpdateModal(true);
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
                      onClick={() => handleDelete(record.id as string)}
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

  return (
    <>
      <PageMeta
        title="Materials List | Amzad Food ERP"
        description="This is Materials List page"
      />
      <PageHeader
        title="Materials"
        subtitle="View and manage all materials"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Materials" },
        ]}
        extra={
          <>
            <PageListPrint tableData={printableData} fileName="material-list" />

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
                onClick={() => setOpenCreateModal(true)}
                text="Add New"
                icon={<Plus />}
                type="primary"
              />
            )}
          </>
        }
      />
      <div>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            { key: "all", label: "All" },
            { key: "raw", label: "Raw Materials" },
            { key: "packaging", label: "Packaging Materials" },
          ]}
        />

        <div
          className={`w-full mb-4 overflow-x-auto ant-table-wrapper !bg-transparent ${
            isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
          }`}
        >
          <Tabs
            activeKey={categoryFilter}
            onChange={(key) => {
              setCategoryFilter(key);
              setPage(1);
              const params = new URLSearchParams(searchParams);
              if (key === "all") {
                params.set("categoryTab", "all");
              } else {
                const selectedCategory = summeryTab.find(
                  (category: any) => category.id === key,
                );
                params.set(
                  "categoryTab",
                  (selectedCategory?.name || key).toLowerCase(),
                );
              }
              setSearchParams(params);
            }}
            tabBarGutter={10}
            items={[
              {
                key: "all",
                label: (
                  <span className="whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-300">
                    All
                  </span>
                ),
              },
              ...(summeryTab?.map((category: any) => ({
                key: category.id,
                label: (
                  <span className="whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-300">
                    {category.name}
                  </span>
                ),
              })) || []),
            ]}
            className="category-tabs mb-0 w-full"
          />
        </div>

        <div className="my-4 flex justify-between items-center gap-4">
          <div className="flex gap-4 flex-1">
            <Input
              ref={searchInput}
              placeholder={`Search ${activeTab} materials...`}
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={inputValue} // <-- controlled value
              onChange={handleSearch}
              allowClear
              className="max-w-md"
              size="middle"
            />
          </div>
          <div className="flex gap-4">
            {hasUpdate && (
              <MultipleDeleteAndStatusChanges
                text="Materials"
                iDs={selectedMaterialIds}
                deleteMutation={deleteMaterial}
                statusChangeMutation={updateStatus}
                setIDs={setSelectedMaterialIds}
              />
            )}
            <FilterColumn
              tableName="materials_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
          </div>
        </div>

        <DataTable
          selectRow={true}
          loading={isLoading || isFetching}
          data={materials}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          rowKey="id"
          isPaginate={meta?.total > 10 && true}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          clearSelectionTrigger={selectedMaterialIds.length === 0 && true}
          showSizeChanger={meta?.total > 10 && true}
          total={meta?.total || 0}
          onSelectRowsChange={(selectedRows: any[]) => {
            const ids = selectedRows.map((row) => row.id);
            setSelectedMaterialIds(ids);
          }}
        />
      </div>

      {/* Create Modal */}
      {openCreateModal && (
        <CreateMaterialModel
          open={openCreateModal}
          setOpen={() => setOpenCreateModal(false)}
        />
      )}

      {/* Update Modal */}
      {openUpdateModal && selectedMaterial && (
        <UpdateMaterialModel
          open={openUpdateModal}
          setOpen={() => setOpenUpdateModal(false)}
          data={selectedMaterial}
        />
      )}
    </>
  );
};

export default MaterialsList;
