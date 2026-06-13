import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Tag, Tooltip } from "antd";
import { Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageMeta from "../../components/common/Meta/PageMeta";
import AddonModal from "../../components/common/Modals/Addon/AddonModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import {
  useDeleteAddonMutation,
  useGetAllAddonsQuery,
} from "../../redux/features/addon/addonApi";
import { useGetProductByIdQuery } from "../../redux/features/product/productApi";
import { IAddon } from "../../types/addon";

const ProductReferenceAddonsList = () => {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch product details for header
  const { data: productData } = useGetProductByIdQuery(id as string, {
    skip: !id,
  });

  // Fetch relations (addons) for this product
  const {
    data: addonData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllAddonsQuery(
    [
      { name: "page", value: page },
      { name: "limit", value: limit },
      { name: "productId", value: id }, // Filter by productId (uses the updated API)
    ],
    {
      skip: !id,
    },
  );

  const addons = addonData?.data || [];
  const meta = addonData?.meta || { total: 0, page: 1, limit: 10 };

  const [openAddonModal, setOpenAddonModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<IAddon | null>(null);
  const [deleteAddon] = useDeleteAddonMutation();

  const handleDelete = (addonId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this addon?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteAddon(addonId).unwrap();
          toast.success("Addon deleted successfully.");
        } catch (err: any) {
          console.error("Error deleting addon:", err);
          toast.error("Failed to delete addon.");
        }
      },
    });
  };

  const columns = [
    {
      title: "Source Product",
      key: "source",
      render: (_: any, record: IAddon) => {
        // Check if source is combo or regular product
        const isSourceCombo = !!record.comboProduct;

        let productPath = null;
        let productName = "N/A";
        let variantName = "";
        let productType = "";

        if (isSourceCombo && record.comboProduct) {
          // Source is combo product
          productPath = `/combo-products/${record.comboProductId}`;
          productName = record.comboProduct.name || "N/A";
          variantName = record.comboVariant?.name || "";
          productType = "Combo";
        } else if (record.product) {
          // Source is regular product
          productPath = `/product/${record.productId}`;
          productName = record.product.name || "N/A";
          variantName = record.productVariant?.name || "";
          productType = "Product";
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {productPath ? (
                <Link
                  to={productPath}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {productName}
                </Link>
              ) : (
                productName
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{variantName}</span>
              {productType && (
                <Tag
                  color={isSourceCombo ? "purple" : "blue"}
                  className="text-xs"
                >
                  {productType}
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Addon Product",
      key: "addon",
      render: (_: any, record: IAddon) => {
        // Check if it's a combo product addon or regular product addon
        const isComboAddon = !!record.addonComboVariant;

        let productPath = null;
        let productName = "N/A";
        let variantName = "";
        let productType = "";

        if (isComboAddon && record.addonComboVariant) {
          // Combo product addon
          productPath = record.addonComboVariant.comboProductId
            ? `/combo-products/${record.addonComboVariant.comboProductId}`
            : null;
          productName = record.addonComboVariant.comboProduct?.name || "N/A";
          variantName = record.addonComboVariant.name || "";
          productType = "Combo";
        } else if (record.addonProductVariant) {
          // Regular product addon
          productPath = record.addonProductVariant.productId
            ? `/product/${record.addonProductVariant.productId}`
            : null;
          productName = record.addonProductVariant.product?.name || "N/A";
          variantName = record.addonProductVariant.name || "";
          productType = "Product";
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {productPath ? (
                <Link
                  to={productPath}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {productName}
                </Link>
              ) : (
                productName
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{variantName}</span>
              {productType && (
                <Tag
                  color={isComboAddon ? "purple" : "blue"}
                  className="text-xs"
                >
                  {productType}
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },

    {
      title: "Label",
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
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: IAddon) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              icon={<FiEdit />}
              onClick={() => {
                setSelectedAddon(record);
                setOpenAddonModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<FiTrash2 />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title={`Addons - ${productData?.data?.name || "Product"} | UserKotha.Shop ERP`}
        description="Manage Product Addons"
      />
      <div className="">
        <PageHeader
          title={`Addons for ${productData?.data?.name || "Product"}`}
          subtitle="Manage product addons"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Products", path: "/products" },
            { title: "Addons" },
          ]}
          extra={
            <>
              <CustomActionButton
                disabled={meta?.total === 0}
                onClick={() => refetch()}
                text="Refresh"
                icon={<RefreshCcw />}
                type="default"
              />
              <CustomActionButton
                onClick={() => {
                  setSelectedAddon(null);
                  setOpenAddonModal(true);
                }}
                text="Add Addon"
                icon={<Plus />}
                type="primary"
              />
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
          defaultSourceProductId={id}
        />
      )}
    </div>
  );
};

export default ProductReferenceAddonsList;
