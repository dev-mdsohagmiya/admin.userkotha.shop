import React, { useState } from "react";
import { Button, Card, Empty, Tooltip, Popconfirm } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Edit, Plus, Trash2, ArrowLeft } from "lucide-react";
import PageHeader from "../../components/common/Navigation/PageHeader";
import PageMeta from "../../components/common/Meta/PageMeta";
import { DataTable } from "../../components/common/Tables";
import {
  useGetComboProductByIdQuery,
  useGetPackagingBOMQuery,
  useDeletePackagingBOMMutation,
} from "../../redux/features/comboProduct/comboProductApi";
import PackagingBOMModal from "../../components/common/Modals/ComboProduct/PackagingBOMModal";
import { IPackagingBOM } from "../../types/comboProduct";
import TableSkeleton from "../../components/skeleton/TableSkeleton";

const PackagingBOM: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<IPackagingBOM | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  // Fetch combo product data
  const {
    data: comboProductResponse,
    isLoading: isLoadingProduct,
    refetch: refetchProduct,
  } = useGetComboProductByIdQuery(id || "", { skip: !id });

  // Fetch packaging BOM
  const {
    data: bomResponse,
    isLoading: isLoadingBOM,
    refetch: refetchBOM,
  } = useGetPackagingBOMQuery(id || "", { skip: !id });

  const [deleteBOM] = useDeletePackagingBOMMutation();

  const comboProduct = comboProductResponse?.data;
  const bomItems = bomResponse?.data || [];

  const handleAddBOM = (variantId: string) => {
    setSelectedVariantId(variantId);
    setSelectedBOM(null);
    setOpenModal(true);
  };

  const handleEditBOM = (bom: IPackagingBOM) => {
    setSelectedBOM(bom);
    setSelectedVariantId(bom.comboVariantId);
    setOpenModal(true);
  };

  const handleDeleteBOM = async (bomId: string) => {
    try {
      const response = await deleteBOM(bomId).unwrap();
      if (response.success) {
        toast.success("Packaging BOM item deleted successfully");
        refetchBOM();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete packaging BOM");
    }
  };

  const handleSuccess = () => {
    refetchBOM();
    refetchProduct();
  };

  // Group BOM items by variant
  const groupedBOM = comboProduct?.variants?.map((variant: { id: string }) => {
    const variantBOMItems = bomItems.filter(
      (bom: { comboVariantId: string }) => bom.comboVariantId === variant.id,
    );
    return {
      variant,
      bomItems: variantBOMItems,
    };
  });

  const bomColumns = [
    {
      title: "Material Name",
      key: "materialName",
      render: (_: any, record: any) => (
        <div className="">
          <span className="font-medium">{record.materialName || "-"}</span>
        </div>
      ),
    },
    {
      title: "Current Stock",
      key: "currentStock",
      render: (_: any, record: any) => (
        <span>
          {record.currentStock || 0} {record.unit || ""}
        </span>
      ),
    },
    {
      title: "Quantity per Unit",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: number, record: any) => (
        <span>
          {Math.floor(percentage)} {record.unit || ""}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: IPackagingBOM) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => handleEditBOM(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Packaging BOM"
            description="Are you sure you want to delete this item?"
            onConfirm={() => handleDeleteBOM(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                size="small"
                icon={<Trash2 className="w-4 h-4" />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title={`Packaging BOM - ${comboProduct?.name || "Combo Product"} | ERP`}
        description="Manage packaging materials for combo product variants"
      />

      <PageHeader
        title={`Packaging BOM - ${comboProduct?.name || ""}`}
        subtitle="Define packaging materials required for each combo product variant"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Combo Products", path: "/combo-product" },
          {
            title: comboProduct?.name || "Details",
            path: `/combo-product/${id}`,
          },
          { title: "Packaging BOM" },
        ]}
        extra={
          <Button
            type="default"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(`/combo-product/${id}`)}
          >
            Back to Details
          </Button>
        }
      />

      <div className="space-y-6">
        {isLoadingProduct || isLoadingBOM ? (
          <TableSkeleton />
        ) : !groupedBOM || groupedBOM.length === 0 ? (
          <Empty description="No variants found" />
        ) : (
          groupedBOM.map(
            (group: {
              variant: {
                id: React.Key | null | undefined;
                name:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      unknown,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactPortal
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined;
                sku: any;
              };
              bomItems: string | any[];
            }) => (
              <Card
                key={group.variant.id}
                style={{ marginBottom: "15px" }}
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">
                        {group.variant.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        SKU: {group.variant.sku || "-"}
                      </span>
                    </div>
                    <Button
                      type="primary"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => handleAddBOM(String(group.variant.id!))}
                    >
                      Add Packaging Material
                    </Button>
                  </div>
                }
              >
                {group.bomItems.length === 0 ? (
                  <Empty
                    description="No packaging materials defined"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => handleAddBOM(String(group.variant.id!))}
                    >
                      Add First Material
                    </Button>
                  </Empty>
                ) : (
                  <DataTable
                    data={group.bomItems}
                    columns={bomColumns}
                    rowKey="id"
                    isPaginate={false}
                  />
                )}
              </Card>
            ),
          )
        )}
      </div>

      {openModal && (
        <PackagingBOMModal
          open={openModal}
          setOpen={setOpenModal}
          comboProductId={id!}
          comboVariantId={selectedVariantId!}
          existingBOMs={selectedBOM ? [selectedBOM] : undefined}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default PackagingBOM;
