import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Modal, Select, Tooltip } from "antd";
import { Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreatePackagingMaterialModal from "../../components/common/Modals/packaging-material/CreatePackagingMaterialModal";
import DetailsPackagingMaterialModal from "../../components/common/Modals/packaging-material/DetailsPackagingMaterialModal";
import UpdatePackagingMaterialModal from "../../components/common/Modals/packaging-material/UpdatePackagingMaterialModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import {
  useDeletePackagingMaterialMutation,
  useGetPackagingMaterialsQuery,
} from "../../redux/features/packaging-material/packagingMaterialApi";
import { useUnitListQuery } from "../../redux/features/units/unitsApi";
import { IPackagingMaterial } from "../../types/packagingMaterial";
import { debounce } from "../../utils/debounce";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { Option } from "antd/es/mentions";
import { IUnit } from "../../types/units";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import { DisplayCurrency } from "../../utils/currency";

// Custom hook for debounced search

const PackagingMaterialsList = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [selectedMaterial, setSelectedMaterial] =
    useState<IPackagingMaterial | null>(null);
  const searchInput = useRef<InputRef | null>(null);

  // Modal states
  const [
    openCreatePackagingMaterialModal,
    setOpenCreatePackagingMaterialModal,
  ] = useState(false);
  const [
    openUpdatePackagingMaterialModal,
    setOpenUpdatePackagingMaterialModal,
  ] = useState(false);
  const [
    openDetailsPackagingMaterialModal,
    setOpenDetailsPackagingMaterialModal,
  ] = useState(false);

  const { data: unitsData } = useUnitListQuery([
    { name: "page", value: "100" },
  ]);

  // Redux API calls
  const { data, isLoading } = useGetPackagingMaterialsQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    searchText && { name: "search", value: searchText },
    typeFilter !== "all" && { name: "type", value: typeFilter },
  ]);

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;
  const debounceType = useRef(
    debounce((value) => {
      setTypeFilter(value);
      setPage(1);
    }),
  ).current;
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [deletePackagingMaterial] = useDeletePackagingMaterialMutation();
  const packagingMaterials = data?.data || [];
  const meta = data?.meta || {};

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this packaging material?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await deletePackagingMaterial(id).unwrap();
          if (res.success) {
            toast.success("Packaging material deleted successfully!");
          }
        } catch (err: any) {
          console.error("Error deleting packaging material:", err);
          const errorMessage =
            (err as any)?.data?.message ||
            "Failed to delete packaging material";
          toast.error(errorMessage);
        }
      },
    });
  };

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
      width: 150,
      ellipsis: true,
      ...getNameColumnSearchProps(),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 60,
      align: "center" as const,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "units",
      width: 150,
      render: (units: IUnit) => units.name,
      align: "center" as const,
    },
    {
      title: "Min Stock",
      dataIndex: "minStock",
      key: "minStock",
      width: 50,
      align: "center" as const,
    },
    {
      title: "Max Stock",
      dataIndex: "maxStock",
      key: "maxStock",
      width: 50,
      align: "center" as const,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      width: 50,
      align: "center" as const,
    },
    {
      title: "Cost/Unit",
      dataIndex: "costPerUnit",
      key: "costPerUnit",
      width: 50,
      align: "center" as const,
      render: (value: number) => <DisplayCurrency amount={value} />,
    },

    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center" as const,
      fixed: "right",
      render: (record: IPackagingMaterial) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              onClick={() => {
                setSelectedMaterial(record);
                setOpenDetailsPackagingMaterialModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<FiEdit />}
              onClick={() => {
                setSelectedMaterial(record);
                setOpenUpdatePackagingMaterialModal(true);
              }}
            />
          </Tooltip>
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
        </div>
      ),
    },
  ];

  return (
    <div className="relative">
      <PageMeta
        title="Packaging Materials | UserKotha.Shop ERP"
        description="Packaging Materials page"
      />
      <PageHeader
        title="Packaging Materials"
        subtitle="View and manage all packaging materials"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Packaging Materials" },
        ]}
        extra={
          <CustomActionButton
            text="Add New"
            icon={<Plus />}
            type="primary"
            onClick={() => setOpenCreatePackagingMaterialModal(true)}
          />
        }
      />

      <div className="flex justify-end flex-wrap gap-4 mb-4 ">
        <Select
          // disabled={requisitions?.meta < 0}
          value={typeFilter}
          onChange={debounceType}
          className="w-full md:w-40"
          placeholder="Filter by status"
        >
          <Option value="all">All Type</Option>
          <Option value="primary">Primary</Option>
          <Option value="secondary">Secondary</Option>
          <Option value="tertiary">Tertiary</Option>
        </Select>
        <FilterColumn
          tableName="packaging_materials_table"
          columns={columns}
          onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
        />
      </div>

      <div className="border rounded-lg">
        <DataTable
          // columns={columns}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          data={packagingMaterials}
          rowKey="id"
          loading={isLoading}
          isPaginate={meta?.total > 20}
        />
      </div>

      {openCreatePackagingMaterialModal && (
        <CreatePackagingMaterialModal
          open={openCreatePackagingMaterialModal}
          setOpen={setOpenCreatePackagingMaterialModal}
        />
      )}

      {openUpdatePackagingMaterialModal && selectedMaterial && (
        <UpdatePackagingMaterialModal
          open={openUpdatePackagingMaterialModal}
          setOpen={setOpenUpdatePackagingMaterialModal}
          data={selectedMaterial}
        />
      )}

      {openDetailsPackagingMaterialModal && selectedMaterial && (
        <DetailsPackagingMaterialModal
          open={openDetailsPackagingMaterialModal}
          setOpen={setOpenDetailsPackagingMaterialModal}
          data={
            {
              ...selectedMaterial,
              units: unitsData?.data || [],
              selected: selectedMaterial,
            } as any
          }
        />
      )}
    </div>
  );
};

export default PackagingMaterialsList;
