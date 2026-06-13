import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Space, Tag, Tooltip, Typography } from "antd";

import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateSupplierModal from "../../components/common/Modals/Supplier/CreateSupplierModal";
import UpdateSupplierModal from "../../components/common/Modals/Supplier/UpdateSupplierModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteSupplierMutation,
  useSupplierListQuery,
  useUpdateSupplierStatusMutation,
} from "../../redux/features/suppliers/suppliersApi";
import { ISupplier } from "../../types/supplier";
import { DisplayCurrency } from "../../utils/currency";
import { debounce } from "../../utils/debounce";
const { Text } = Typography;

const SuppliersList = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const {
    data: supplierData,
    isLoading: supplierLoading,
    isFetching,
    refetch,
  } = useSupplierListQuery([
    { name: "page", value: page },
    searchText && { name: "search", value: searchText },
  ]);

  const suppliers = supplierData?.data;
  const meta = supplierData?.meta;

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // role check and permission

  const { hasUpdate, hasCreate, hasDelete } =
    useModulePermissions("Suppliers");

  // const searchInput = useRef<InputRef | null>(null);

  const [deleteSupplier] = useDeleteSupplierMutation();
  const [updateSupplierStatus] = useUpdateSupplierStatusMutation();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const Navigate = useNavigate();
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(
    null,
  );

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this unit?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteSupplier(id).unwrap();
          if (res.success) toast.success("Unit deleted successfully");
        } catch (err: any) {
          toast.error(err?.message || "Failed to delete unit");
        }
      },
    });
  };

  // Toggle status
  const handleStatusChange = async (id: string) => {
    try {
      setLoadingId(id);
      await updateSupplierStatus(id).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const columns = [
    // {
    //   title: "SL",
    //   key: "index",
    //   width: 60,
    //   render: (_: any, __: any, index: number) => (
    //     <Text style={{ whiteSpace: "nowrap" }}>#{index + 1}</Text>
    //   ),
    // },
    {
      title: "Code",
      dataIndex: "supplierCode",
      key: "supplierCode",
      width: 50,
      render: (code: string) => (
        <Tag style={{ whiteSpace: "nowrap" }}>{code || "N/A"}</Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: ISupplier) => (
        <Space>
          <div>
            <Text strong style={{ whiteSpace: "nowrap" }}>
              {record?.name}
            </Text>
            <br />
            <Text
              style={{ whiteSpace: "nowrap" }}
              type="secondary"
              className="text-xs"
            >
              {record.contactPerson || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 300,
      render: (text: string, record: ISupplier) => (
        <Space direction="vertical" size={0} style={{ whiteSpace: "nowrap" }}>
          <Space style={{ whiteSpace: "nowrap" }}>
            <Text>{record?.phone1}</Text>
          </Space>
          {record.phone2 && (
            <Text
              type="secondary"
              className="text-xs"
              style={{ whiteSpace: "nowrap" }}
            >
              Alt: {record.phone2 || "-"}
            </Text>
          )}
        </Space>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 300,
      render: (email: string) => (
        <Space>
          <Text style={{ whiteSpace: "nowrap" }}>{email || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 300,
      render: (type: string) => {
        if (!type) return "N/A";
        const formatted =
          type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        return (
          <Space>
            <Text style={{ whiteSpace: "nowrap" }}>{formatted} Material</Text>
          </Space>
        );
      },
    },
    {
      title: "Total Due",
      dataIndex: "totalDue",
      key: "totalDue",
      width: 300,
      render: (due: number) => (
        <Text strong className={due > 0 ? "text-red-600" : "text-green-600"}>
          <DisplayCurrency amount={due} />
        </Text>
      ),
    },
    {
      title: "Total Purchases",
      dataIndex: "totalPurchases",
      key: "totalPurchases",
      width: 150,
      render: (purchases: number) => (
        <Text strong className="text-gray-800">
          <DisplayCurrency amount={purchases} />
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: ISupplier) => (
        <SwitchStatus2
          onChange={() => handleStatusChange(record.id as string)}
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
      width: 120,
      fixed: "right",
      render: (_: any, record: ISupplier) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              size="middle"
              onClick={() => Navigate(`/suppliers/${record.id}`)}
            />
          </Tooltip>
          {hasUpdate && (
            <Tooltip title="Edit">
              <Button
                icon={<FiEdit />}
                size="middle"
                onClick={() => {
                  setSelectedSupplier(record);
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
  ];

  const printableData = suppliers?.map((supplier: ISupplier, index: number) => {
    const createdAt = supplier.createdAt ? new Date(supplier.createdAt) : null;

    return {
      SL: index + 1,
      Code: supplier.supplierCode || "-",
      Name: supplier.name || "-",
      "Contact Person": supplier.contactPerson || "-",
      Phone: supplier.phone1 || "-",
      // "Phone 2": supplier.phone2 || "-",
      // Email: supplier.email || "-",
      "Total Due": supplier.totalDue
        ? `TK ${supplier.totalDue.toFixed(2)}`
        : "TK 0.00",
      "Total Purchases": supplier.totalPurchases
        ? `TK ${supplier.totalPurchases.toFixed(2)}`
        : "TK 0.00",
      Type: supplier.type
        ? `${
            supplier.type.charAt(0).toUpperCase() +
            supplier.type.slice(1).toLowerCase()
          } Material`
        : "N/A",
      // Status: supplier.isActive ? "Active" : "Inactive",
      "Created At": createdAt ? createdAt.toLocaleDateString("en-GB") : "-",
    };
  });

  return (
    <div>
      <PageMeta title="Suppliers | ERP" description="Manage Suppliers" />
      <div>
        <PageHeader
          title="Suppliers"
          subtitle="Manage all your suppliers and vendor information"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Suppliers" },
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
                  onClick={() => setOpenCreateModal(true)}
                />
              )}
            </>
          }
        />

        {/* Statistics Cards */}

        {/* Search and Filters */}
        <div className="flex justify-between flex-wrap my-4 items-start">
          <Input
            placeholder="Search suppliers by name, code, phone, email..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            onChange={(e) => debounceSearch(e.target.value)}
            className="max-w-md"
            size="middle"
            allowClear
          />
          <div className="flex gap-2">
            <PageListPrint tableData={printableData} fileName="Supplier-list" />
            <FilterColumn
              tableName="suppliers_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
          </div>
        </div>

        {/* Suppliers Table */}

        <DataTable
          loading={supplierLoading || isFetching}
          data={suppliers}
          // columns={columns}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          rowKey="id"
          isPaginate={meta?.total > 10 === true}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={meta?.total}
        />
      </div>
      {/* Create/Edit Modal */}
      {openCreateModal && (
        <CreateSupplierModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
        />
      )}
      {openUpdateModal && selectedSupplier && (
        <UpdateSupplierModal
          open={openUpdateModal}
          setOpen={setOpenUpdateModal}
          data={selectedSupplier}
        />
      )}
    </div>
  );
};

export default SuppliersList;
