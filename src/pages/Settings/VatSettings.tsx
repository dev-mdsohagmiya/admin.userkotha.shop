import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tooltip } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import { CreateVatModal, UpdateVatModal } from "../../components/common/Modals";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteVatMutation,
  useUpdateVatStatusMutation,
  useVatListQuery,
} from "../../redux/features/vat/vatApi";
import { IVat } from "../../types/vat";
import { debounce } from "../../utils/debounce";

const VatSettings = () => {
  const [openCreateVatModal, setOpenCreateVatModal] = useState(false);
  const [openUpdateVatModal, setOpenUpdateVatModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteVat] = useDeleteVatMutation();
  // const [statusFilter, setStatusFilter] = useState<string>("all");

  // filter

  const { data, isLoading, isFetching, refetch } = useVatListQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    searchText && { name: "search", value: searchText },
  ]);

  const { hasUpdate, hasCreate, hasDelete } = useModulePermissions("Vat");

  const vats = data?.data || [];
  const meta = data?.meta;

  const [selectedVat, setSelectedVat] = useState<IVat | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [updateStatus] = useUpdateVatStatusMutation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this VAT?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteVat(id).unwrap();
          if (res.success) {
            toast.success("VAT deleted successfully.");
          }
        } catch (err: any) {
          console.error("Error deleting VAT:", err);
          toast.error("Failed to delete VAT.");
        }
      },
    });
  };

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

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
      title: "Tax Name",
      dataIndex: "taxName",
      key: "taxName",
      render: (taxName: string) => (
        <Tooltip
          title={taxName}
          overlayInnerStyle={{
            maxHeight: 200,
            maxWidth: 1050,
            overflowY: "auto",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          <span className="line-clamp-2 cursor-pointer">
            {taxName.slice(0, 43)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Rate (%)",
      dataIndex: "rate",
      key: "rate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Tax Number",
      dataIndex: "taxNumber",
      key: "taxNumber",
      render: (taxNumber: string) => (
        <Tooltip
          title={taxNumber}
          overlayInnerStyle={{
            maxHeight: 200,
            maxWidth: 1050,
            overflowY: "auto",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          <span className="line-clamp-2 cursor-pointer">
            {taxNumber.slice(0, 43)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
            {description?.slice(0, 43)}
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
            render: (record: IVat) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setOpenUpdateVatModal(true);
                        setSelectedVat(record);
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
        title="VAT Settings | Amzad Food ERP"
        description="This is VAT settings page"
      />

      <PageHeader
        title="VAT Settings"
        subtitle="View and manage all VAT configurations"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "VAT Settings" },
        ]}
        extra={
          <>
            <CustomActionButton
              disabled={vats.length === 0 ? true : false}
              onClick={() => {
                refetch();
              }}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />

            {hasCreate && (
              <CustomActionButton
                onClick={() => setOpenCreateVatModal(true)}
                text="Add New"
                icon={<Plus />}
                type="primary"
              />
            )}
          </>
        }
      />

      <div className="flex justify-between">
        <Input
          placeholder="Search VAT by tax name..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          className="max-w-md mb-4"
          size="middle"
          allowClear
        />
        <MultipleDeleteAndStatusChanges
          text="Vat"
          iDs={selectedProductIds}
          deleteMutation={deleteVat}
          statusChangeMutation={updateStatus}
          setIDs={setSelectedProductIds}
        />
      </div>

      <DataTable
        selectRow={true}
        loading={isLoading || isFetching}
        data={vats}
        columns={columns}
        rowKey="id"
        isPaginate={meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={meta?.total > 10}
        // change
        clearSelectionTrigger={selectedProductIds.length === 0 && true}
        total={meta?.total || 0}
        onSelectRowsChange={(selectedRows: any[]) => {
          const ids = selectedRows.map((row) => row.id);
          setSelectedProductIds(ids);
        }}
      />

      {openCreateVatModal && (
        <CreateVatModal
          open={openCreateVatModal}
          setOpen={setOpenCreateVatModal}
        />
      )}

      {openUpdateVatModal && selectedVat && (
        <UpdateVatModal
          open={openUpdateVatModal}
          setOpen={setOpenUpdateVatModal}
          data={selectedVat}
        />
      )}
    </div>
  );
};

export default VatSettings;
