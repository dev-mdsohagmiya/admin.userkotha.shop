import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Tag, Tooltip } from "antd";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../../components/common/Button/CustomActionButton";
import PageMeta from "../../../components/common/Meta/PageMeta";
import ShippingNoteModal from "../../../components/common/Modals/OrderManagement/ShippingNoteModal";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import { useModulePermissions } from "../../../hooks/usePermissions";
import {
  useDeleteShippingNoteMutation,
  useGetAllShippingNotesQuery,
} from "../../../redux/features/shippingNote/shippingNoteApi";
import { IShippingNote } from "../../../types/shippingNote";

const ShippingNoteList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<IShippingNote | null>(null);

  // API Hooks
  const {
    data: notesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllShippingNotesQuery();
  const [deleteNote] = useDeleteShippingNoteMutation();

  // Handle data structure from API and client-side filtering
  const notes = notesData?.data || [];

  const { hasUpdate, hasCreate, hasDelete } =
    useModulePermissions("Shipping Note");

  const handleCreate = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEdit = (note: IShippingNote) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this shipping note?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteNote(id).unwrap();
          toast.success("Shipping note deleted successfully");
        } catch (error: any) {
          toast.error(error?.data?.message || "Failed to delete shipping note");
        }
      },
    });
  };

  const columns = [
    {
      title: "Note Name",
      dataIndex: "name",
      key: "name",

      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Note Text",
      dataIndex: "text",
      key: "text",
      render: (text: string) => (
        <Tooltip title={text}>
          <p className="text-gray-600 line-clamp-2 max-w-md cursor-pointer">
            {text}
          </p>
        </Tooltip>
      ),
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
            render: (record: IShippingNote) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit size={14} />}
                      onClick={() => handleEdit(record)}
                    />
                  </Tooltip>
                )}
                {hasDelete && (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
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
    setEditingNote(null);
  };

  return (
    <div>
      <PageMeta
        title="Shipping Note | Amzad Food ERP"
        description="Manage shipping notes for Amzad Food"
      />

      <PageHeader
        title="Shipping Note"
        subtitle="View and manage all shipping notes"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Order Management", path: "/orders/complete" },
          { title: "Shipping Note" },
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
        data={notes}
        columns={columns}
        rowKey={(record: IShippingNote) => record.id || "id"}
        currentPage={page}
        isPaginate={false}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={notes.length}
      />

      {/* Create/Edit Modal */}
      <ShippingNoteModal
        open={isModalOpen}
        onClose={handleModalClose}
        initialValues={editingNote}
      />
    </div>
  );
};

export default ShippingNoteList;
