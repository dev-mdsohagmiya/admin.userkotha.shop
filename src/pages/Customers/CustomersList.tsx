import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Button, Input, Modal, Tooltip } from "antd";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";

import { Plus, RefreshCcw, Search } from "lucide-react";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import CreateCustomerModal from "../../components/common/Modals/Customer/CreateCustomerModal";
import UpdateCustomerModal from "../../components/common/Modals/Customer/UpdateCustomerModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useCustomerListQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerStatusMutation,
} from "../../redux/features/customers/customersApi";
import { ICustomer } from "../../types/customer";
import { debounce } from "../../utils/debounce";

const CustomersList = () => {
  const [openCreateCustomerModal, setOpenCreateCustomerModal] = useState(false);
  const [openUpdateCustomerModal, setOpenUpdateCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const { hasUpdate, hasCreate, hasDelete } =
    useModulePermissions("Customer List");

  const searchInput = useRef<InputRef | null>(null);

  const [deleteCustomer] = useDeleteCustomerMutation();
  const [updateStatus] = useUpdateCustomerStatusMutation();

  const { data, isLoading, isFetching, refetch } = useCustomerListQuery(
    [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      searchText && { name: "search", value: searchText },
    ].filter(Boolean) as { name: string; value: string }[],
  );

  const customers = data?.data ?? [];
  const meta = data?.meta;

  // Delete customer
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this customer?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteCustomer(id).unwrap();
          if (res.success) {
            toast.success("Customer deleted successfully");
          }
        } catch (err: any) {
          toast.error(err?.message || "Failed to delete customer");
        }
      },
    });
  };

  // Toggle status
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

  // Search props for Name column
  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div>
        <Input
          ref={searchInput}
          placeholder="Search customer by name"
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Name">
        <SearchOutlined
          className={`!rounded-full !bg-transparent ${
            filtered ? "!bg-green-100 !text-green-600" : "!bg-gray-100"
          } cursor-pointer`}
        />
      </Tooltip>
    ),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
  });
  const getNameColumnSearchPropsEmail = () => ({
    filterDropdown: () => (
      <div>
        <Input
          ref={searchInput}
          placeholder="Search customer by email"
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search Name">
        <SearchOutlined
          className={`!rounded-full !bg-transparent ${
            filtered ? "!bg-green-100 !text-green-600" : "!bg-gray-100"
          } cursor-pointer`}
        />
      </Tooltip>
    ),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
  });

  const printableData = customers.map((customer: ICustomer, index: number) => {
    const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;

    return {
      SL: index + 1,
      Name: customer.name || "-",
      Phone: customer.phone || "-",
      Email: customer.email || "-",

      Status: customer.isActive ? "Active" : "Inactive",
      "Created At": createdAt ? createdAt.toLocaleDateString("en-GB") : "-", // fallback if undefined
    };
  });

  const columns = [
    {
      title: "Id",
      key: "index",
      render: (_: any, __: ICustomer, index: number) => <> #{index + 1}</>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "230px",
      ...getNameColumnSearchProps(),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getNameColumnSearchPropsEmail(),
      render: (email: string) => (
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
          }}
        >
          {email || "-"}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => (
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
          }}
        >
          {phone}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: ICustomer) => (
        <SwitchStatus2
          disabled={!hasUpdate}
          onChange={() => handleStatusChange(record.id as string)}
          checked={isActive}
          loading={loadingId === record.id}
        />
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "200px",
      render: (address: string) => (
        <Tooltip title={address ?? "-"}>
          <span className="line-clamp-1 cursor-pointer">{address || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return <span>{`${day}-${month}-${year}`}</span>;
      },
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (record: ICustomer) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setSelectedCustomer(record);
                        setOpenUpdateCustomerModal(true);
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
    <div>
      <PageMeta
        title="Customers | YourAppName"
        description="This is the Customers page"
      />

      <PageHeader
        title="Customers"
        subtitle="View and manage all customers"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Sales", path: "/sales" },
          { title: "Customers" },
        ]}
        extra={
          <>
            <PageListPrint tableData={printableData} fileName="Customer-list" />
            <CustomActionButton
              disabled={meta?.total === 0}
              onClick={() => refetch()}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />
            {hasCreate && (
              <CustomActionButton
                onClick={() => setOpenCreateCustomerModal(true)}
                text="Add New"
                icon={<Plus />}
                type="primary"
              />
            )}
          </>
        }
      />

      <DataTable
        loading={isLoading || isFetching}
        data={customers}
        columns={columns}
        rowKey="id"
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        isPaginate={!!(meta?.total && meta.total > limit)}
        showSizeChanger={!!(meta?.total && meta.total > limit)}
        total={meta?.total ?? 0}
      />

      {openCreateCustomerModal && (
        <CreateCustomerModal
          open={openCreateCustomerModal}
          setOpen={setOpenCreateCustomerModal}
        />
      )}
      {openUpdateCustomerModal && selectedCustomer && (
        <UpdateCustomerModal
          open={openUpdateCustomerModal}
          setOpen={setOpenUpdateCustomerModal}
          data={selectedCustomer}
        />
      )}
    </div>
  );
};

export default CustomersList;
