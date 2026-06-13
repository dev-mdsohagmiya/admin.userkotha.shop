"use client";

import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Modal, Tag, Tooltip } from "antd";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { IAddon } from "../../types/addon";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";

import AddonModal from "../../components/common/Modals/Addon/AddonModal";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteAddonMutation,
  useGetAllAddonsQuery,
} from "../../redux/features/addon/addonApi";
import { debounce } from "../../utils/debounce";

const AddonList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef<InputRef | null>(null);

  const {
    data: addonData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllAddonsQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    searchText && { name: "searchTerm", value: searchText },
  ]);

  const addons = addonData?.data || [];
  const meta = addonData?.meta || { total: 0, page: 1, limit: 10 };

  const [openAddonModal, setOpenAddonModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<IAddon | null>(null);
  const [deleteAddon] = useDeleteAddonMutation();

  const { hasUpdate, hasCreate, hasDelete } = useModulePermissions("Addons");
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this addon?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteAddon(id).unwrap();

          // The API returns void on success usually, or a standard response
          toast.success("Addon deleted successfully.");
        } catch (err: any) {
          console.error("Error deleting Addon:", err);
          toast.error("Failed to delete Addon.");
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

  // Search by Source Product Name (if supported by backend)
  // For now assuming searchTerm works for product name
  const getSearchProps = () => ({
    filterDropdown: () => (
      <div className="p-2">
        <Input
          placeholder="Search..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          size="middle"
          allowClear
          className="w-full"
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title="Search">
        <SearchOutlined
          className={`!rounded-full !bg-transparent ${
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
      title: "Source Product",
      key: "source",
      ...getSearchProps(),
      render: (_: any, record: IAddon) => {
        // Fix: correctly check for productId / comboProductId inside the related variant product
        const productId = record.productId || record.comboProductId;
        const isCombo = !!record.comboProductId;

        const path = productId
          ? isCombo
            ? `/combo-product/${productId}`
            : `/product/${productId}`
          : null;

        const productName =
          record.product?.name || record.comboProduct?.name || "N/A";

        const variantName =
          record.productVariant?.name || record.comboVariant?.name || "";

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {path ? (
                <Link
                  to={path}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {productName}
                </Link>
              ) : (
                productName
              )}
            </span>
            <span className="text-xs text-gray-500">{variantName}</span>
          </div>
        );
      },
    },
    {
      title: "Addon Product",
      key: "addon",
      render: (_: any, record: IAddon) => {
        const addonProductPath = record.addonProductVariant?.productId
          ? `/product/${record.addonProductVariant.productId}`
          : record.addonComboVariant?.comboProductId
            ? `/combo-product/${record.addonComboVariant.comboProductId}`
            : null;

        const productName =
          record.addonProductVariant?.product?.name ||
          record.addonComboVariant?.comboProduct?.name ||
          "N/A";
        const variantName =
          record.addonProductVariant?.name ||
          record.addonComboVariant?.name ||
          "";

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {addonProductPath ? (
                <Link
                  to={addonProductPath}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {productName}
                </Link>
              ) : (
                productName
              )}
            </span>
            <span className="text-xs text-gray-500">{variantName}</span>
          </div>
        );
      },
    },

    {
      title: "Offer Label",
      dataIndex: "offerLabel",
      key: "offerLabel",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
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
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_: any, record: IAddon) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setSelectedAddon(record);
                        setOpenAddonModal(true);
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
        title="Addons | UserKotha.Shop ERP"
        description="Manage Product Addons"
      />
      <div className="">
        <PageHeader
          title="Addons"
          subtitle="Manage product addons and suggestions"
          breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Addons" }]}
          extra={
            <>
              <CustomActionButton
                disabled={meta?.total === 0}
                onClick={() => refetch()}
                text="Refresh"
                icon={<RefreshCcw />}
                type="default"
              />
              {hasCreate && (
                <CustomActionButton
                  onClick={() => {
                    setSelectedAddon(null);
                    setOpenAddonModal(true);
                  }}
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
          data={addons}
          columns={columns}
          rowKey="id"
          isPaginate={meta?.total > 10}
          currentPage={page}
          showSizeChanger={meta?.total > 10}
          limit={limit}
          setLimit={setLimit}
          setCurrentPage={setPage}
          total={meta?.total || 0}
        />
      </div>

      {openAddonModal && (
        <AddonModal
          open={openAddonModal}
          setOpen={setOpenAddonModal}
          addonData={selectedAddon}
        />
      )}
    </div>
  );
};

export default AddonList;
