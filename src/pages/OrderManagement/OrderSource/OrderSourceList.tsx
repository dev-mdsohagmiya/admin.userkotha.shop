import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, message, Modal, Tag, Tooltip } from "antd";
import { Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";
import CustomActionButton from "../../../components/common/Button/CustomActionButton";
import PageMeta from "../../../components/common/Meta/PageMeta";
import OrderSourceModal from "../../../components/common/Modals/OrderManagement/OrderSourceModal";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import { useModulePermissions } from "../../../hooks/usePermissions";
import {
  useDeleteOrderSourceMutation,
  useGetAllOrderSourcesQuery,
} from "../../../redux/features/orderSource/orderSourceApi";
import { IOrderSource } from "../../../types/orderSource";
import { debounce } from "../../../utils/debounce";

const OrderSourceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IOrderSource | null>(null);

  const searchInput = useRef<InputRef | null>(null);
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchTerm(value);
      setPage(1);
    }, 500),
  ).current;

  // API Hooks
  const {
    data: sourcesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllOrderSourcesQuery();
  const [deleteSource] = useDeleteOrderSourceMutation();

  // Handle data structure from API and client-side filtering
  const allSources = sourcesData?.data || [];
  const sources = allSources.filter((source) =>
    source.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  // const meta = sourcesData?.meta; // Assuming get all doesn't paginate or we handle client side pagination if needed, but the original code had pagination.
  // The new API endpoint getAllOrderSources currently just returns data[]. If we want pagination, we need to update the API definitions.
  // For 'Get All', usually it returns all. Let's assume client-side pagination for now or if the API supports it.

  const { hasUpdate, hasCreate, hasDelete } =
    useModulePermissions("Order Source");

  const handleCreate = () => {
    setEditingSource(null);
    setIsModalOpen(true);
  };

  const handleEdit = (source: IOrderSource) => {
    setEditingSource(source);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this order source?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSource(id).unwrap();
          message.success("Order source deleted successfully");
        } catch (error: any) {
          message.error(
            error?.data?.message || "Failed to delete order source",
          );
        }
      },
    });
  };

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder="Search order source..."
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
      ...getNameColumnSearchProps(), // Keep search for name
      render: (text: string, record: IOrderSource) => (
        <div className="flex items-center gap-2">
          {record.icon && (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <i className={record.icon} style={{ fontSize: "16px" }}></i>
            </div>
          )}
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      ),
    },
    {
      title: "Icon Class",
      dataIndex: "icon",
      key: "icon",
      render: (text: string) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        if (!date) return "-";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return <span>{`${day}-${month}-${year}`}</span>;
      },
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (record: IOrderSource) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit size={15} />}
                      onClick={() => handleEdit(record)}
                    />
                  </Tooltip>
                )}
                {hasDelete && (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(record.id || "")}
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

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSource(null);
  };

  return (
    <div>
      <PageMeta
        title="Order Source | Amzad Food ERP"
        description="Manage order sources for Amzad Food"
      />

      <PageHeader
        title="Order Source"
        subtitle="View and manage all order sources"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Order Management", path: "/orders/complete" },
          { title: "Order Source" },
        ]}
        extra={
          <>
            <CustomActionButton
              onClick={() => refetch()}
              text="Refresh"
              icon={<RefreshCcw size={18} />}
              type="default"
            />
            {hasCreate && (
              <CustomActionButton
                onClick={handleCreate}
                text="Add New"
                icon={<Plus size={18} />}
                type="primary"
              />
            )}
          </>
        }
      />

      <DataTable
        loading={isLoading || isFetching}
        data={sources}
        columns={columns}
        rowKey={(record: IOrderSource) => record.id || record.id || "id"}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        isPaginate={false}
        total={sources.length} // since we are fetching all
      />

      {/* Create/Edit Modal */}
      <OrderSourceModal
        open={isModalOpen}
        onClose={handleModalClose}
        initialValues={editingSource}
      />
    </div>
  );
};

export default OrderSourceList;
