import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Space, Tooltip, Typography } from "antd";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";

import CustomActionButton from "../../components/common/Button/CustomActionButton";
import CreateOrUpdateWarehouseModal from "../../components/common/Modals/CreateOrUpdateWarehouseModal";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteWarehouseMutation,
  useToggleWarehouseStatusMutation,
  useWarehouseListQuery,
} from "../../redux/features/warehouses/warehousesApi";
import { debounce } from "../../utils/debounce";

const { Text } = Typography;

interface Warehouse {
  id: string;
  name: string;
  location?: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  capacity?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const WarehousesList = () => {
  const navigate = useNavigate();

  // States
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Debounced Search
  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // API Hooks
  const [deleteWarehouse] = useDeleteWarehouseMutation();
  const [updateStatus] = useToggleWarehouseStatusMutation();
  const { data, isLoading, isFetching, refetch } = useWarehouseListQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    searchText && { name: "search", value: searchText },
  ]);

  const { hasUpdate, hasCreate, hasDelete } =
    useModulePermissions("Warehouses");

  // Data
  const warehouses: Warehouse[] = data?.data?.data || [];
  const meta = data?.data?.meta;

  // ✅ Delete
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this warehouse?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      async onOk() {
        try {
          const res = await deleteWarehouse(id).unwrap();
          toast.success(res?.message || "Warehouse deleted successfully");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to delete warehouse");
        }
      },
    });
  };

  // ✅ Status Toggle
  const handleStatusChange = async (id: string) => {
    try {
      setLoadingId(id);
      await updateStatus(id).unwrap();
    } catch (err: any) {
      console.log(err?.data?.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Table Columns
  const columns = [
    {
      title: "SL",
      key: "index",
      width: 60,
      render: (_: any, __: Warehouse, index: number) => (
        <Text>#{index + 1}</Text>
      ),
    },
    {
      title: "Warehouse Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string, record: Warehouse) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.location && (
            <Text type="secondary" className="text-xs">
              {record.location}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      width: 150,
      render: (manager: any) => manager?.name || "Not assigned",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      width: 120,
      render: (capacity: number) =>
        capacity ? `${capacity} sq ft` : "Not set",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean, record: Warehouse) => (
        <SwitchStatus2
          onChange={() => handleStatusChange(record.id)}
          checked={isActive}
          loading={loadingId === record.id}
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
    {
      title: "Action",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_: any, record: Warehouse) => (
        <div className="flex gap-2">
          {/* View */}
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              size="middle"
              onClick={() => navigate(`/warehouses/${record.id}`)}
            />
          </Tooltip>

          {/* Edit */}
          {hasUpdate && (
            <Tooltip title="Edit">
              <Button
                icon={<FiEdit />}
                size="middle"
                onClick={() => {
                  setEditWarehouse(record);
                  setOpenCreateModal(true);
                }}
              />
            </Tooltip>
          )}

          {/* Delete */}
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
  ];

  return (
    <div>
      <PageMeta title="Warehouses | ERP" description="Manage Warehouses" />

      <PageHeader
        title="Warehouses"
        subtitle="Manage your warehouse infrastructure and storage locations"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Warehouses" },
        ]}
        extra={
          <>
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
                text="Add New"
                type="primary"
                icon={<Plus />}
                onClick={() => {
                  setEditWarehouse(null);
                  setOpenCreateModal(true);
                }}
              />
            )}
          </>
        }
      />

      {/* Stats Section */}
      {/* <div className="mx-auto">
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} sm={12} md={6}>
            <PageHeaderCard
              icon={<FaBuilding className="text-white text-2xl" />}
              title="Total Warehouses"
              value={stats.total}
              color="cyan"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <PageHeaderCard
              icon={<Activity className="text-white text-2xl" />}
              title="Active"
              value={stats.active}
              color="green"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <PageHeaderCard
              icon={<FiHome className="text-white text-2xl" />}
              title="Inactive"
              value={stats.inactive}
              color="red"
            />
          </Col>
        </Row>
      </div> */}

      {/* Search */}
      <div className="flex flex-wrap gap-4 my-4 items-center">
        <Input
          placeholder="Search warehouses by name, location, or manager..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          value={searchText}
          onChange={(e) => debounceSearch(e.target.value)}
          className="max-w-md"
          allowClear
        />
      </div>

      {/* Data Table */}
      <DataTable
        loading={isLoading || isFetching}
        data={warehouses}
        columns={columns}
        rowKey="id"
        isPaginate={!!meta?.total && meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta?.total}
      />

      {/* Create/Edit Modal */}
      {openCreateModal && (
        <CreateOrUpdateWarehouseModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
          editData={editWarehouse}
        />
      )}
    </div>
  );
};

export default WarehousesList;
