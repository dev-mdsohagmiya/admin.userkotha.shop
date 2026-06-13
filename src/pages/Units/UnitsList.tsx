import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Button, Input, Modal, Tooltip } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import {
  CreateUnitsModal,
  UpdateUnitsModal,
} from "../../components/common/Modals";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteUnitMutation,
  useUnitListQuery,
  useUpdateUnitStatusMutation,
} from "../../redux/features/units/unitsApi";
import { IUnit } from "../../types/units";
import { debounce } from "../../utils/debounce";

const UnitsList = () => {
  const [openCreateUnitsModal, setOpenCreateUnitsModal] = useState(false);
  const [openUpdateUnitsModal, setOpenUpdateUnitsModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<IUnit | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const searchInput = useRef<InputRef | null>(null);

  const [deleteUnit] = useDeleteUnitMutation();
  const [updateStatus] = useUpdateUnitStatusMutation();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { data, isLoading, isFetching, refetch } = useUnitListQuery([
    { name: "page", value: page },
    searchText && { name: "search", value: searchText },
  ]);

  const units = data?.data || [];
  const meta = data?.meta;
  const [limit, setLimit] = useState(10);
  // Delete unit
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this unit?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteUnit(id).unwrap();
          if (res.success) toast.success("Unit deleted successfully");
        } catch (err: any) {
          toast.error(err?.message || "Failed to delete unit");
        }
      },
    });
  };

  const { hasUpdate, hasCreate, hasDelete } = useModulePermissions("Units");

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

  // Name column search props
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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "228px",
      ...getNameColumnSearchProps(),
    },
    { title: "Symbol", dataIndex: "symbol", key: "symbol" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center" as const,
      render: (desc: string) => (
        <Tooltip
          title={desc}
          overlayInnerStyle={{
            maxHeight: 200,
            maxWidth: 1050,
            overflowY: "auto",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          <span className="line-clamp-2 cursor-pointer">{desc || "-"}</span>
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
            fixed: "right",
            render: (record: IUnit) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setOpenUpdateUnitsModal(true);
                        setSelectedUnit(record);
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
  const printableUnits = units.map((unit: IUnit, index: number) => {
    const createdAt = unit.createdAt ? new Date(unit.createdAt) : null;

    return {
      SL: index + 1,
      Name: unit.name || "-",
      Symbol: unit.symbol || "-",
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
        title="Product Units | Amzad Food ERP"
        description="This is Product units page"
      />

      <PageHeader
        title="Units"
        subtitle="View and manage all Units"
        breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Units" }]}
        extra={
          <>
            <PageListPrint tableData={printableUnits} fileName="Units-list" />
            <MultipleDeleteAndStatusChanges
              text="Unit"
              iDs={selectedProductIds}
              deleteMutation={deleteUnit}
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
                onClick={() => setOpenCreateUnitsModal(true)}
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
        data={units}
        columns={columns}
        rowKey="id"
        currentPage={page}
        isPaginate={meta?.total > 10 && true}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        clearSelectionTrigger={selectedProductIds.length === 0 && true}
        showSizeChanger={meta?.total > 10 && true}
        total={meta?.total || 0}
        selectRow={true}
        onSelectRowsChange={(selectedRows: any[]) => {
          const ids = selectedRows.map((row) => row.id);
          setSelectedProductIds(ids);
        }}
      />

      {openCreateUnitsModal && (
        <CreateUnitsModal
          open={openCreateUnitsModal}
          setOpen={setOpenCreateUnitsModal}
        />
      )}
      {openUpdateUnitsModal && selectedUnit && (
        <UpdateUnitsModal
          open={openUpdateUnitsModal}
          setOpen={setOpenUpdateUnitsModal}
          data={selectedUnit}
        />
      )}
    </div>
  );
};

export default UnitsList;
