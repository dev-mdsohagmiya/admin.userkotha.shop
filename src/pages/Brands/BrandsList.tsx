"use client";

import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Image, Input, InputRef, Modal, Tooltip } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { ImageOff, Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import SwitchStatus2 from "../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateBrandModal from "../../components/common/Modals/CreateBrandModel";
import UpdateBrandModal from "../../components/common/Modals/UpdateBrandModel";
import MultipleDeleteAndStatusChanges from "../../components/common/MultipleDeleteAndStatusChanges/MultipleDeleteAndStatusChanges";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { config } from "../../config";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteBrandMutation,
  useGetAllBrandsQuery,
  useUpdateBrandStatusMutation,
} from "../../redux/features/brand/brandApi";
import { IBrand } from "../../types/brands";
import { MediaImage } from "../../types/media";
import { debounce } from "../../utils/debounce";

// --------- Main Brands List Page ---------
const BrandsList = () => {
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const searchInput = useRef<InputRef | null>(null);
  const {
    data: brandData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllBrandsQuery([
    { name: "page", value: page },
    searchText && { name: "search", value: searchText },
  ]);

  const brands = brandData?.data || [];
  const meta = brandData?.meta || {};
  const [limit, setLimit] = useState(10);
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);

  const [openCreateBrandModal, setOpenCreateBrandModal] = useState(false);
  const [openUpdateBrandModal, setOpenUpdateBrandModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [updateStatus] = useUpdateBrandStatusMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  // permissions
  const { hasCreate, hasUpdate, hasDelete } = useModulePermissions("Brands");
  // Delete
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this brand?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteBrand(id).unwrap();
          if (res.success) {
            toast.success("Brand deleted successfully.");
          }
        } catch (err: any) {
          console.error("Error deleting Brand:", err);
          toast.error("Failed to delete Brand.");
        }
      },
    });
  };

  // Toggle Status
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

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

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
  const printableBrands = brands.map((brand: IBrand, index: number) => {
    const createdAt = brand.createdAt ? new Date(brand.createdAt) : null;

    return {
      SL: index + 1,
      Name: brand.name || "-",
      Description: brand.description || "-",
      Status: brand.isActive ? "Active" : "Inactive",
      "Created At": createdAt
        ? `${String(createdAt.getDate()).padStart(2, "0")}-${String(
            createdAt.getMonth() + 1,
          ).padStart(2, "0")}-${createdAt.getFullYear()}`
        : "-",
    };
  });

  const columns = [
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      render: (logo: MediaImage) =>
        logo?.url ? (
          <Image
            src={`${config.image_access_url}${logo.url}`}
            alt="Brand Logo"
            width={48}
            height={48}
            style={{
              objectFit: "contain",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            preview={{
              mask: "Preview",
              maskClassName: "bg-black bg-opacity-50 text-white text-xs",
            }}
            fallback="/default-logo.png"
          />
        ) : (
          <div
            style={{
              width: 35,
              height: 35,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #fafafa, #e9e9e9)",
              border: "1px dashed green",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "green",
              fontSize: "5px",
              fontWeight: 500,
            }}
          >
            <ImageOff className="!h-[20px] !w-[20px]" />
          </div>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "238px",
      ...getNameColumnSearchProps(),
    },

    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => (
        <Tooltip
          title={desc}
          overlayInnerStyle={{
            maxHeight: 200, // control height (px)
            maxWidth: 1050, // control width (px)
            overflowY: "auto",
            whiteSpace: "normal", // let text wrap
            wordBreak: "break-word", // avoid overflow words
          }}
        >
          <span className="line-clamp-2 cursor-pointer">
            {desc?.slice(0, 20) || "-"}
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
          checked={isActive}
          onChange={() => handleStatusChange(record.id)}
          loading={record?.id === loadingId}
        />
      ),
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            render: (_: any, record: IBrand) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setSelectedBrand(record);
                        setOpenUpdateBrandModal(true);
                      }}
                    />
                  </Tooltip>
                )}
                {hasDelete && (
                  <Tooltip title="Delete">
                    <Button
                      danger
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(record.id)}
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
        title="Product Brands | Amzad Food ERP"
        description="This is Product Brands page"
      />
      <div className="">
        <PageHeader
          title="Brands"
          subtitle="View and manage all Brands"
          breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Brands" }]}
          extra={
            <>
              <PageListPrint
                tableData={printableBrands}
                fileName="Brand-list"
              />
              <MultipleDeleteAndStatusChanges
                text="Brands"
                iDs={selectedBrandIds}
                deleteMutation={deleteBrand}
                statusChangeMutation={updateStatus}
                setIDs={setSelectedBrandIds}
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
                  onClick={() => setOpenCreateBrandModal(true)}
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
          data={brands}
          columns={columns}
          selectRow={true}
          rowKey="id"
          isPaginate={meta?.total > 10 && true}
          currentPage={page}
          showSizeChanger={meta?.total > 10 && true}
          clearSelectionTrigger={selectedBrandIds.length === 0 && true}
          limit={limit}
          setLimit={setLimit}
          setCurrentPage={setPage}
          total={meta?.total || 0}
          onSelectRowsChange={(selectedRows: any[]) => {
            const ids = selectedRows.map((row) => row.id);
            setSelectedBrandIds(ids);
          }}
        />
      </div>
      {openCreateBrandModal && (
        <CreateBrandModal
          open={openCreateBrandModal}
          setOpen={setOpenCreateBrandModal}
        />
      )}

      {openUpdateBrandModal && selectedBrand && (
        <UpdateBrandModal
          open={openUpdateBrandModal}
          setOpen={setOpenUpdateBrandModal}
          data={selectedBrand}
        />
      )}
    </div>
  );
};

export default BrandsList;
