import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tooltip } from "antd";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useEmployees } from "../../hooks/useEmployees";
import { IEmployee } from "../../types/interfaces";
import CreateEmployeeModal from "../../components/common/Modals/employees/CreateEmployeeModal";
import UpdateEmployeeModal from "../../components/common/Modals/employees/UpdateEmployeeModal";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import EmployeeChangePasswordModal from "../../components/common/Modals/employees/EmployeeChangePasswordModal";
import { debounce } from "../../utils/debounce";
import { RiLockPasswordLine } from "react-icons/ri";
import { FilterDropdownProps } from "antd/es/table/interface";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { useModulePermissions } from "../../hooks/usePermissions";
import { moduleHasAction } from "../../utils/permissions";

const EmployeesList = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
    null,
  );
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);

  const {
    employees,
    isFetching,
    loading,
    total,
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    deleteEmployee,
    updateEmployee,
    refetch,
  } = useEmployees();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this employee?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteEmployee(id);
          if (res.success) {
            toast.success("Employee deleted successfully.");
          } else {
            toast.error(res.error || "Failed to delete employee.");
          }
        } catch (err: any) {
          console.error("Error deleting employee:", err);
          toast.error("Failed to delete employee.");
        }
      },
    });
  };
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onStatusChange = async (checked: boolean, id: string) => {
    try {
      setLoadingId(id);
      await updateEmployee(id, { isActive: checked });
    } catch (err: any) {
      console.error("Error updating employee status:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const debounceSearch = useRef(
    debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 500),
  ).current;

  // Filter employees based on search text
  const filteredEmployees = employees.filter(
    (employee: IEmployee) =>
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.phone.includes(search),
  );

  // Paginate data
  const paginatedData = filteredEmployees.slice(
    (page - 1) * limit,
    page * limit,
  );

  // Same source as sidebar / GET user/me (Redux login payload can omit designation)
  const { hasCreate, hasUpdate, hasDelete, allActions, isProfileLoading } =
    useModulePermissions("Employees");
  const hasChangePassword = moduleHasAction(allActions, "change password");

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      render: (designation: any) => designation?.name || "-",
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
            render: (record: IEmployee) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setOpenUpdateModal(true);
                        setSelectedEmployee(record);
                      }}
                    />
                  </Tooltip>
                )}
                {hasChangePassword && (
                  <Tooltip title="Change Password">
                    <Button
                      icon={<RiLockPasswordLine />}
                      onClick={() => {
                        setSelectedEmployee(record);
                        setOpenChangePasswordModal(true);
                      }}
                      style={{
                        color: "#ff3d0a",
                        border: "1px solid #ff3d0a",
                        padding: "4px",
                      }}
                    />
                  </Tooltip>
                )}
                {hasDelete && (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      disabled={record?.email === "admin@userkotha.shop"}
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

  const printableEmployees = filteredEmployees.map(
    (employee: IEmployee, index: number) => {
      const createdAt = employee.createdAt
        ? new Date(employee.createdAt)
        : null;

      return {
        SL: index + 1,
        Name: employee.name || "-",
        Email: employee.email || "-",
        Phone: employee.phone || "-",
        Designation: employee.designation?.name || "-",
        Status: employee.isActive ? "Active" : "Inactive",
        "Created At": createdAt
          ? `${String(createdAt.getDate()).padStart(2, "0")}-${String(
              createdAt.getMonth() + 1,
            ).padStart(2, "0")}-${createdAt.getFullYear()}`
          : "-",
      };
    },
  );

  return (
    <div>
      <PageMeta
        title="Admin Users | UserKotha.Shop ERP"
        description="Manage admin users"
      />

      <PageHeader
        title="Admin Users"
        subtitle="View and manage all admin users with designation-based permissions"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Admin Users" },
        ]}
        extra={
          <>
            <PageListPrint
              tableData={printableEmployees}
              fileName="Employees-list"
            />
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

      <Input
        placeholder="Search employees by name, email, or phone..."
        prefix={<Search className="w-4 h-4 text-gray-400" />}
        onChange={(e) => debounceSearch(e.target.value)}
        className="max-w-md mb-4"
        size="middle"
        allowClear
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
        <CreateEmployeeModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
        />
      )}

      {openUpdateModal && selectedEmployee && (
        <UpdateEmployeeModal
          open={openUpdateModal}
          setOpen={setOpenUpdateModal}
          data={selectedEmployee}
        />
      )}

      {openChangePasswordModal && selectedEmployee && (
        <EmployeeChangePasswordModal
          open={openChangePasswordModal}
          setOpen={setOpenChangePasswordModal}
          data={selectedEmployee}
        />
      )}
    </div>
  );
};

export default EmployeesList;
