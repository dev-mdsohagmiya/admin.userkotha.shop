// components/designations/DesignationsList.tsx
import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Modal, Tooltip } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiShield, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateDesignationModal from "../../components/common/Modals/designation/CreateDesignationModal";
import PermissionsModal from "../../components/common/Modals/designation/PermissionsModal";
import UpdateDesignationModal from "../../components/common/Modals/designation/UpdateDesignationModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useDesignations } from "../../hooks/useDesignations";
import { useModulePermissions } from "../../hooks/usePermissions";
import { moduleHasAction } from "../../utils/permissions";
import { IDesignation } from "../../types/interfaces";
import { debounce } from "../../utils/debounce";

const DesignationsList = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openPermissionsModal, setOpenPermissionsModal] = useState(false);
  const [selectedDesignation, setSelectedDesignation] =
    useState<IDesignation | null>(null);

  const {
    designations,
    isFetching,
    loading,
    total,
    page,
    limit,
    search,
    setPage,
    setLimit,
    refetch,
    setSearch,
    deleteDesignation,
    updateDesignation,
  } = useDesignations();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this designation?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteDesignation(id);
          if (res.success) {
            toast.success("Designation deleted successfully.");
          } else {
            toast.error(res.error || "Failed to delete designation.");
          }
        } catch (err: any) {
          console.error("Error deleting designation:", err);
          toast.error("Failed to delete designation.");
        }
      },
    });
  };
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const searchInput = useRef<InputRef | null>(null);
  const onStatusChange = async (checked: boolean, id: string) => {
    try {
      setLoadingId(id);
      await updateDesignation(id, { isActive: checked });
    } catch (err: any) {
      console.error("Error updating employee status:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // Filter designations based on search text
  const filteredDesignations = designations.filter(
    (designation: IDesignation) =>
      designation.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Paginate data
  const paginatedData = filteredDesignations.slice(
    (page - 1) * limit,
    page * limit,
  );
  const debounceSearch = useRef(
    debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 500),
  ).current;

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div>
        <Input
          ref={searchInput}
          placeholder="Search  unit by name..."
          prefix={<Search className="w-4 h-4  text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
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

  // Same source as GET user/me (Redux login can omit full designation.permissions)
  const { hasCreate, hasUpdate, hasDelete, allActions, isProfileLoading } =
    useModulePermissions("Designations");
  const hasChangePermissions = moduleHasAction(
    allActions,
    "change_permissions",
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getNameColumnSearchProps(),
      width: "228px",
    },
    {
      title: "Total Employees",
      dataIndex: "employeeCount",
      key: "employeeCount",
      render: (employeeCount: number) => (
        <span className="font-medium text-green-600">{employeeCount || 0}</span>
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
          onChange={(checked) => onStatusChange(checked, record.id)}
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
            fixed: "right",
            render: (record: IDesignation) => (
              <div className="flex gap-2">
                <>
                  {hasChangePermissions && (
                    <Tooltip title="Permissions">
                      <Button
                        icon={<FiShield />}
                        onClick={() => {
                          setOpenPermissionsModal(true);
                          setSelectedDesignation(record);
                        }}
                      />
                    </Tooltip>
                  )}
                  {hasUpdate && (
                    <Tooltip title="Edit">
                      <Button
                        icon={<FiEdit />}
                        onClick={() => {
                          setOpenUpdateModal(true);
                          setSelectedDesignation(record);
                        }}
                      />
                    </Tooltip>
                  )}
                </>
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

  return (
    <div>
      <PageMeta
        title="Designations | Amzad Food ERP"
        description="Manage designations"
      />

      <PageHeader
        title="Designations"
        subtitle="View and manage all designations"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Designations" },
        ]}
        extra={
          <>
            <CustomActionButton
              disabled={total === 0 ? true : false}
              onClick={() => {
                refetch();
              }}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />
            {hasCreate && (
              <CustomActionButton
                text="Add New"
                icon={<Plus />}
                type="primary"
                onClick={() => setOpenCreateModal(true)}
              ></CustomActionButton>
            )}
          </>
        }
      />

      <DataTable
        loading={loading || isFetching || isProfileLoading}
        data={paginatedData}
        columns={columns}
        rowKey="id"
        isPaginate={total > 10}
        showSizeChanger={total > 10 && true}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={total}
      />

      {openCreateModal && (
        <CreateDesignationModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
        />
      )}

      {openUpdateModal && selectedDesignation && (
        <UpdateDesignationModal
          open={openUpdateModal}
          setOpen={setOpenUpdateModal}
          data={selectedDesignation}
        />
      )}

      {openPermissionsModal && selectedDesignation && (
        <PermissionsModal
          open={openPermissionsModal}
          setOpen={setOpenPermissionsModal}
          data={selectedDesignation}
        />
      )}
    </div>
  );
};

export default DesignationsList;
