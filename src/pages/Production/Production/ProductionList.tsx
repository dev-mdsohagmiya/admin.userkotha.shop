import { Button, Input, Space, Tabs, Tag, Tooltip } from "antd";
import { RefreshCcw, Search, Settings } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { FiPackage } from "react-icons/fi";

import { useSearchParams } from "react-router-dom";
import PageListPrint from "../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PackagingMaterialBOMSetupModal from "../../../components/common/Modals/BOM/PackagingMaterialBOMSetupModal";
import RawMaterialBOMSetupModal from "../../../components/common/Modals/BOM/RawMaterialBOMSetupModal";
import ProductionCompleteModal from "../../../components/common/Modals/Production/ProductionCompleteModal";
import ComboProductRequisitionSetupModal from "../../../components/common/Modals/RequisitionApproval/ComboProductRequisitionSetupModal";
import PackagingMaterialRequisitionSetupModal from "../../../components/common/Modals/RequisitionApproval/PackagingMaterialRequisitionSetupModal";
import RawMaterialRequisitionSetupModal from "../../../components/common/Modals/RequisitionApproval/RawMaterialRequisitionSetupModal";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import { useModulePermissions } from "../../../hooks/usePermissions";
import {
  useGetProductionsQuery,
  useUpdateProductionStatusMutation,
} from "../../../redux/features/production/productionApi";
import { ProductionRecord } from "../../../types/production";
import { DisplayCurrency } from "../../../utils/currency";
import { debounce } from "../../../utils/debounce";

const ProductionList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  const [openRawMaterialRequisition, setOpenRawMaterialRequisition] =
    useState(false);
  const [openPackagingRequisition, setOpenPackagingRequisition] =
    useState(false);
  const [openComboRequisition, setOpenComboRequisition] = useState(false);
  const [openCompleteModal, setOpenCompleteModal] = useState(false);
  const [selectedProduction, setSelectedProduction] =
    useState<ProductionRecord | null>(null);
  const [updatingProductionId, setUpdatingProductionId] = useState<
    string | null
  >(null);
  const [openRawBOMSetup, setOpenRawBOMSetup] = useState(false);
  const [openPackagingBOMSetup, setOpenPackagingBOMSetup] = useState(false);

  const { hasUpdate } = useModulePermissions("Production List");

  // Tab definitions
  const statusTabs = [
    { key: "all", label: "All" },
    { key: "inprogress", label: "In Progress" },
    { key: "finished", label: "Completed & Cancelled" },
  ];

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    const normalized = tabParam.toLowerCase();
    const allowedTabs = ["all", "inprogress", "finished"];
    if (allowedTabs.includes(normalized) && normalized !== statusFilter) {
      setStatusFilter(normalized);
    }
  }, [searchParams, statusFilter]);

  const {
    data: productionData,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductionsQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(statusFilter !== "all"
      ? [{ name: "status", value: statusFilter }]
      : []),
  ]);

  const statusCounts = productionData?.data?.summary || {
    all: 0,
    inprogress: 0,
    finished: 0,
  };

  const productions = productionData?.data?.data || [];

  const meta = productionData?.data?.meta || {};

  const debounceSearchRef = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1); // Reset to first page when searching
    }, 500),
  ).current;

  const handleSetupRawMaterialRequisition = (record: ProductionRecord) => {
    setSelectedProduction(record);
    setOpenRawMaterialRequisition(true);
  };

  const handleSetupPackagingRequisition = (record: ProductionRecord) => {
    setSelectedProduction(record);
    setOpenPackagingRequisition(true);
  };

  const handleSetupComboRequisition = (record: ProductionRecord) => {
    setSelectedProduction(record);
    setOpenComboRequisition(true);
  };

  const handleUpdateRawBOM = (record: ProductionRecord) => {
    setSelectedProduction(record);
    setOpenRawBOMSetup(true);
  };

  const handleUpdatePackagingBOM = (record: ProductionRecord) => {
    setSelectedProduction(record);
    setOpenPackagingBOMSetup(true);
  };

  const handleRawMaterialSuccess = () => {
    // Refetch productions after successful raw material requisition creation
    refetch();
  };

  const handlePackagingSuccess = () => {
    // Refetch productions after successful packaging requisition creation
    refetch();
  };

  const handleComboRequisitionSuccess = () => {
    // Refetch productions after successful combo requisition creation
    refetch();
  };

  const handleCompleteSuccess = () => {
    refetch();
  };

  const [updateProductionStatus] = useUpdateProductionStatusMutation();

  const handleCancelProduction = async (record: ProductionRecord) => {
    setUpdatingProductionId(record.id);
    try {
      await updateProductionStatus({
        id: record.id,
        status: "cancelled",
      }).unwrap();
      refetch();
    } catch (err) {
      // swallow or show toast if you have toast integration here
      console.error("Failed to cancel production", err);
    } finally {
      setUpdatingProductionId(null);
    }
  };

  const printableData = productions.map(
    (product: ProductionRecord, index: number) => {
      const startDate = product.startDate ? new Date(product.startDate) : null;
      const endDate = product.endDate ? new Date(product.endDate) : null;
      const createdAt = product.createdAt ? new Date(product.createdAt) : null;

      // Status formatting
      const statusText = product.status
        ? product.status
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : "-";

      return {
        SL: index + 1,
        "Production ID": product.productionNumber || "-",
        Product: product.product?.name || "-",
        Planned: product.plannedQty ?? "-",
        Produced: product.producedQty ?? "-",
        Wastage: product.wastageQty ?? "-",
        Transferred: product.transferredQty ?? "-",
        Stock: product.stockQty ?? "-",
        "Start Date": startDate
          ? startDate.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        "End Date": endDate
          ? endDate.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        Status: statusText,
        "Production Cost":
          product.productionCost != null
            ? `TK ${product.productionCost.toFixed(2)}`
            : "N/A",
        "Packaging Cost":
          product.packagingCost != null
            ? `TK ${product.packagingCost.toFixed(2)}`
            : "N/A",
        "Created At": createdAt
          ? `${String(createdAt.getDate()).padStart(2, "0")}-${String(
              createdAt.getMonth() + 1,
            ).padStart(2, "0")}-${createdAt.getFullYear()}`
          : "-",
      };
    },
  );

  const productionColumns = [
    {
      title: "Production ID",
      dataIndex: "productionNumber",
      key: "productionNumber",
      render: (productionNumber: string) => (
        <span style={{ color: "green" }}>{productionNumber}</span>
      ),
    },
    {
      title: "Product",
      key: "product",
      render: (_: any, record: ProductionRecord) => {
        const productName =
          record.product?.name || record.comboProduct?.name || "-";
        const isCombo = !!record.comboProductId;

        return (
          <Tooltip title={productName}>
            <div className="flex items-center gap-2">
              <span className="truncate line-clamp-1 block max-w-[200px]">
                {productName?.slice(0, 20)}
              </span>
              {isCombo && (
                <Tag color="purple" className="text-xs">
                  COMBO
                </Tag>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Planned",
      dataIndex: "plannedQty",
      key: "plannedQty",
      render: (qty: number) => qty?.toFixed(2) ?? "-",
    },
    {
      title: "Produced",
      dataIndex: "producedQty",
      key: "producedQty",
      render: (qty: any) => (qty != null ? `${qty.toFixed(2)} Qty` : "-"),
    },
    {
      title: "Wastage",
      dataIndex: "wastageQty",
      key: "wastageQty",
      render: (qty: number) => qty?.toFixed(2) ?? "-",
    },
    {
      title: "Transferred",
      dataIndex: "transferredQty",
      key: "transferredQty",
      render: (qty: number) => qty?.toFixed(2) ?? "-",
    },
    {
      title: "Stock",
      dataIndex: "stockQty",
      key: "stockQty",
      render: (qty: number) => qty?.toFixed(2) ?? "-",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string | null) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {date
            ? new Date(date).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string | null) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {date
            ? new Date(date).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusColorMap: Record<string, string> = {
          planned: "gray",
          in_progress: "black",
          // hold: "orange",
          completed: "green",
          cancelled: "red",
          packaging: "purple",
          packaged: "orange",
          transferred: "geekblue",
        };
        return (
          <Tag
            style={{
              color: statusColorMap[status] || "gray", // fallback color
              padding: "2px 8px",
              borderRadius: "4px",
              display: "inline-block",
              fontWeight: 500,
            }}
          >
            {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Tag>
        );
      },
    },
    {
      title: "Production Cost",
      dataIndex: "productionCost",
      key: "productionCost",
      render: (cost: number | null) =>
        cost ? <DisplayCurrency amount={cost} /> : "N/A",
    },
    {
      title: "Packaging Cost",
      dataIndex: "packagingCost",
      key: "packagingCost",
      render: (cost: number | null) =>
        cost ? <DisplayCurrency amount={cost} /> : "N/A",
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
        return `${day}-${month}-${year}`;
      },
      sorter: (a: ProductionRecord, b: ProductionRecord) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
    },
    ...(hasUpdate
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: ProductionRecord) => {
              const isComboProduct = !!record.comboProductId;
              const hasRawMaterialRequisition =
                record.requisitions?.some((req) => req.type === "raw") || false;
              const hasPackagingRequisition =
                record.requisitions?.some(
                  (req) => req.type === "packaging_material",
                ) || false;
              const hasComboRequisition =
                record.requisitions?.some(
                  (req) => req.type === "combo_product",
                ) || false;

              return (
                <Space size="small">
                  {/* For Combo Products: Show combo requisition button */}
                  {isComboProduct &&
                    record.status === "planned" &&
                    (hasComboRequisition ? (
                      <Tooltip title="Product Variant or Packaging Material Already Configured">
                        <Button
                          size="small"
                          type="default"
                          disabled
                          style={{
                            backgroundColor: "#f6ffed",
                            borderColor: "#b7eb8f",
                            color: "#52c41a",
                          }}
                        >
                          ✓
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Product Variant or Packaging Material">
                        <Button
                          icon={<FiPackage />}
                          size="small"
                          type="primary"
                          onClick={() => handleSetupComboRequisition(record)}
                        />
                      </Tooltip>
                    ))}

                  {/* For Regular Products: Show raw material setup when status is 'planned' */}
                  {!isComboProduct &&
                    record.status === "planned" &&
                    (hasRawMaterialRequisition ? (
                      <Tooltip title="Raw Material Requisition Already Configured">
                        <Button
                          size="small"
                          type="default"
                          disabled
                          style={{
                            backgroundColor: "#f6ffed",
                            borderColor: "#b7eb8f",
                            color: "#52c41a",
                          }}
                        >
                          Raw Materials ✓
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Setup Raw Material Requisition">
                        <Button
                          icon={<FiPackage />}
                          size="small"
                          type="primary"
                          onClick={() =>
                            handleSetupRawMaterialRequisition(record)
                          }
                        >
                          Raw Materials
                        </Button>
                      </Tooltip>
                    ))}

                  {/* Update Raw Material BOM */}
                  {!isComboProduct && record.status === "planned" && (
                    <Tooltip title="Update Raw Material BOM">
                      <Button
                        icon={<Settings className="w-4 h-4" />}
                        size="small"
                        onClick={() => handleUpdateRawBOM(record)}
                      />
                    </Tooltip>
                  )}

                  {/* Packaging setup: only show when status is 'in_progress' AND not combo */}
                  {!isComboProduct &&
                    record.status === "in_progress" &&
                    (hasPackagingRequisition ? (
                      <Tooltip title="Packaging Requisition Already Configured">
                        <Button
                          size="small"
                          type="default"
                          disabled
                          style={{
                            backgroundColor: "#f6ffed",
                            borderColor: "#b7eb8f",
                            color: "#52c41a",
                          }}
                        >
                          Packaging ✓
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Setup Packaging Requisition">
                        <Button
                          icon={<FiPackage />}
                          size="small"
                          type="default"
                          onClick={() =>
                            handleSetupPackagingRequisition(record)
                          }
                        >
                          Packaging
                        </Button>
                      </Tooltip>
                    ))}

                  {/* Update Packaging BOM */}
                  {!isComboProduct && record.status === "in_progress" && (
                    <Tooltip title="Update Packaging BOM">
                      <Button
                        icon={<Settings className="w-4 h-4" />}
                        size="small"
                        onClick={() => handleUpdatePackagingBOM(record)}
                      />
                    </Tooltip>
                  )}

                  {/* Complete button logic */}
                  {((isComboProduct &&
                    (record.status === "in_progress" ||
                      record.status === "packaged")) ||
                    (!isComboProduct && record.status === "packaged")) && (
                    <Tooltip title="Mark production as complete">
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          setSelectedProduction(record);
                          setOpenCompleteModal(true);
                        }}
                      >
                        Complete
                      </Button>
                    </Tooltip>
                  )}

                  {/* Cancel button: show ONLY when status is 'planned' */}
                  {record.status === "planned" && (
                    <Tooltip title="Cancel Production">
                      <Button
                        size="small"
                        danger
                        onClick={() => handleCancelProduction(record)}
                        loading={updatingProductionId === record.id}
                      >
                        Cancel
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageMeta title="Productions | ERP" description="Manage Productions" />

      <PageHeader
        title="Productions"
        subtitle="Review, approve, and manage Productions"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Productions" },
        ]}
        extra={
          <Space size="small">
            <Button
              icon={<RefreshCcw size={14} />}
              onClick={() => {
                refetch();
              }}
            >
              Refresh
            </Button>
          </Space>
        }
      />

      {/* Status Tabs */}
      <div className="mb-2 -mt-2">
        <Tabs
          activeKey={statusFilter}
          onChange={(key) => {
            setStatusFilter(key);
            setPage(1);
            const params = new URLSearchParams(searchParams);
            params.set("tab", key.toLowerCase());
            setSearchParams(params);
          }}
          className="production-tabs"
          items={statusTabs.map((tab) => ({
            label: (
              <span
                className="flex items-center gap-2"
                style={{
                  color: statusFilter === tab.key ? "#ff3d0a" : "black",
                  fontWeight: statusFilter === tab.key ? "600" : "500",
                }}
              >
                {tab.label}
                <Tag
                  style={{
                    backgroundColor:
                      statusFilter === tab.key ? "#ff3d0a" : "#9e9e9e",
                    color: "white",
                    borderRadius: "9999px",
                    border: "none",
                    margin: 0,
                  }}
                >
                  {statusCounts[tab.key] || 0}
                </Tag>
              </span>
            ),
            key: tab.key,
          }))}
        />
      </div>

      {/* Filters */}
      <div className="flex justify-between gap-4 mb-4 items-center">
        <Input
          placeholder="Search productions..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearchRef(e.target.value)}
          className="max-w-md"
          allowClear
        />
        <Space size="small">
          <PageListPrint tableData={printableData} fileName="Production-list" />
          <FilterColumn
            tableName="production_table"
            columns={productionColumns}
            onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
          />
        </Space>
      </div>

      {/* Table */}
      <DataTable
        data={productions}
        columns={productionColumns.filter(
          (c) =>
            selectedColumnKeys.includes(c.key) ||
            selectedColumnKeys.length === 0 ||
            c.key === "actions", // Always show actions column
        )}
        rowKey="id"
        isPaginate={meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta?.total || 0}
        loading={isLoading || isFetching}
      />

      {/* Modals */}
      {openRawMaterialRequisition && selectedProduction && (
        <RawMaterialRequisitionSetupModal
          open={openRawMaterialRequisition}
          setOpen={setOpenRawMaterialRequisition}
          product={selectedProduction.product}
          productId={selectedProduction.productId}
          initialBatchSize={selectedProduction.plannedQty}
          readOnlyBatchSize={true}
          onSuccess={handleRawMaterialSuccess}
          productionId={selectedProduction.id}
          productionNumber={selectedProduction.productionNumber}
          planItems={selectedProduction.plan?.items}
        />
      )}

      {openPackagingRequisition && selectedProduction && (
        <PackagingMaterialRequisitionSetupModal
          open={openPackagingRequisition}
          setOpen={setOpenPackagingRequisition}
          product={selectedProduction.product}
          initialBatchSize={selectedProduction.plannedQty}
          readOnlyBatchSize={true}
          onSuccess={handlePackagingSuccess}
          productionId={selectedProduction.id}
          productionNumber={selectedProduction.productionNumber}
          planItems={selectedProduction.plan?.items}
        />
      )}

      {openComboRequisition && selectedProduction && (
        <ComboProductRequisitionSetupModal
          open={openComboRequisition}
          setOpen={setOpenComboRequisition}
          comboProduct={selectedProduction.comboProduct}
          comboProductId={selectedProduction.comboProductId}
          onSuccess={handleComboRequisitionSuccess}
          productionId={selectedProduction.id}
          productionNumber={selectedProduction.productionNumber}
          planItems={selectedProduction.plan?.items}
        />
      )}

      {openCompleteModal && selectedProduction && (
        <ProductionCompleteModal
          open={openCompleteModal}
          setOpen={setOpenCompleteModal}
          planId={selectedProduction.plan?.id || ""}
          items={selectedProduction.plan?.items || []}
          comboProductId={selectedProduction.comboProductId}
          onSuccess={handleCompleteSuccess}
        />
      )}

      {openRawBOMSetup && selectedProduction?.product && (
        <RawMaterialBOMSetupModal
          open={openRawBOMSetup}
          setOpen={setOpenRawBOMSetup}
          product={selectedProduction.product}
        />
      )}

      {openPackagingBOMSetup && selectedProduction?.product && (
        <PackagingMaterialBOMSetupModal
          open={openPackagingBOMSetup}
          setOpen={setOpenPackagingBOMSetup}
          product={selectedProduction.product}
        />
      )}
    </div>
  );
};

export default ProductionList;
