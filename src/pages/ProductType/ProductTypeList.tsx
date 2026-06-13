import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Modal, Tooltip } from "antd";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";

import CustomActionButton from "../../components/common/Button/CustomActionButton";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import CreateProductTypeModal from "../../components/common/Modals/ProductType/CreateProductTypeModal";
import UpdateProductTypeModal from "../../components/common/Modals/ProductType/UpdateProductTypeModal";
import { IProductType } from "../../types/productType";
import { debounce } from "../../utils/debounce";

import { FilterDropdownProps } from "antd/es/table/interface";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteProductTypeMutation,
  useGetAllProductTypeQuery,
  useUpdateProductTypeMutation,
} from "../../redux/features/ptoductType/proudctTypeApi";

const PROTECTED_SLUGS = [
  "offer",
  "seasonal",
  "daily-needs",
  "snack",
  "popular",
];

const ProductTypeList = () => {
  const [openCreateProductTypeModal, setOpenCreateProductTypeModal] =
    useState(false);
  const [openUpdateProductTypeModal, setOpenUpdateProductTypeModal] =
    useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const searchInput = useRef<InputRef | null>(null);
  const [deleteProductType] = useDeleteProductTypeMutation();
  const [updateProductType] = useUpdateProductTypeMutation();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { data, isLoading, isFetching, refetch } = useGetAllProductTypeQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    searchText && { name: "search", value: searchText },
  ]);

  const productTypes = data?.data || [];
  const meta = data?.meta;
  const [selectedProductType, setSelectedProductType] =
    useState<IProductType | null>(null);

  // debounceSearch
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }),
  ).current;

  // delete handler
  const handleDelete = (id: string | undefined) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product type?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteProductType(id as string).unwrap();
          if (res.success) {
            toast.success("Product Type deleted successfully.");
          }
        } catch (err: any) {
          console.error("Error deleting product type:", err);
          toast.error("Failed to delete product type.");
        }
      },
    });
  };

  const { hasUpdate, hasCreate, hasDelete } = useModulePermissions("Types");

  // Toggle status by updating through PUT endpoint
  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      setLoadingId(id);
      const productType = productTypes.find((pt: IProductType) => pt.id === id);
      if (productType) {
        await updateProductType({
          id,
          data: {
            ...productType,
            isActive: !currentStatus,
          },
        }).unwrap();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setLoadingId(null);
    }
  };

  // Wrapper for status change mutation (for MultipleDeleteAndStatusChanges)
  const handleStatusChangeMutation = async (id: string) => {
    const productType = productTypes.find((pt: IProductType) => pt.id === id);
    if (productType) {
      await updateProductType({
        id,
        data: {
          ...productType,
          isActive: !productType.isActive,
        },
      }).unwrap();
    }
  };

  const getNameColumnSearchProps = () => ({
    filterDropdown: () => (
      <div>
        <Input
          ref={searchInput}
          placeholder="Search product type by name..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          value={searchText}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
          className="relative"
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
      width: "230px",
      ...getNameColumnSearchProps(),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: "200px",
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
            {description || "-"}
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
                    clearFilters?.();
                    confirm({ closeDropdown: true });
                  } else {
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
        return true;
      },
      filterMultiple: false,
      render: (isActive: boolean, record: { id: string }) => (
        <SwitchStatus2
          disabled={!hasUpdate}
          checked={isActive}
          onChange={() => handleStatusChange(record.id, isActive)}
          loading={record?.id === loadingId}
        />
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
      defaultSortOrder: "descend",
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (record: IProductType) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setOpenUpdateProductTypeModal(true);
                        setSelectedProductType(record);
                      }}
                    />
                  </Tooltip>
                )}
                {hasDelete && !PROTECTED_SLUGS.includes(record.slug) && (
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

  const printableProductTypes = productTypes.map(
    (type: IProductType, index: number) => {
      const createdAt = type.createdAt ? new Date(type.createdAt) : null;

      return {
        SL: index + 1,
        Name: type.name || "-",
        Slug: type.slug || "-",
        Description: type.description?.slice(0, 29) || "-",
        Status: type.isActive ? "Active" : "Inactive",
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
        title="Product Types | Amzad Food ERP"
        description="This is product types page"
      />
      <div>
        <PageHeader
          title="Product Types"
          subtitle="View and manage all Product Types"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Product Types" },
          ]}
          extra={
            <>
              <PageListPrint
                tableData={printableProductTypes}
                fileName="Product-Type-list"
              />
              <MultipleDeleteAndStatusChanges
                text="Product Type"
                iDs={selectedProductIds}
                deleteMutation={deleteProductType}
                statusChangeMutation={handleStatusChangeMutation}
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
                  onClick={() => setOpenCreateProductTypeModal(true)}
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
          data={productTypes}
          columns={columns}
          rowKey="id"
          isPaginate={meta?.total > 10 && true}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10 && true}
          total={meta?.total || 0}
          selectRow={true}
          clearSelectionTrigger={selectedProductIds.length === 0 && true}
          onSelectRowsChange={(selectedRows: any[]) => {
            const ids = selectedRows
              .filter((row) => !PROTECTED_SLUGS.includes(row.slug))
              .map((row) => row.id);
            setSelectedProductIds(ids);
          }}
        />
      </div>
      {openCreateProductTypeModal && (
        <CreateProductTypeModal
          open={openCreateProductTypeModal}
          setOpen={setOpenCreateProductTypeModal}
        />
      )}

      {openUpdateProductTypeModal && selectedProductType && (
        <UpdateProductTypeModal
          open={openUpdateProductTypeModal}
          setOpen={setOpenUpdateProductTypeModal}
          data={selectedProductType}
        />
      )}
    </div>
  );
};

export default ProductTypeList;
