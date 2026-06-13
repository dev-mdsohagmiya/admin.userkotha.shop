import { Button, Input, Tooltip } from "antd";
import { RefreshCcw, Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import CustomActionButton from "../../../components/common/Button/CustomActionButton";
import PageListPrint from "../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import PageMeta from "../../../components/common/Meta/PageMeta";
import CrateTransferModal from "../../../components/common/Modals/ProductionStock/CrateTransferModal";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { useGetAvailableProductionTransfersQuery } from "../../../redux/features/production/productionApi";
import { StockRecord } from "../../../types/production";
import { debounce } from "../../../utils/debounce";

const ProductionStockList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [openCreateTransferModal, setOpenCreateTransferModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<StockRecord[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StockRecord | null>(
    null,
  );

  // Fetch available production transfers
  const {
    data: apiResponse,
    isLoading,
    refetch,
    isFetching,
  } = useGetAvailableProductionTransfersQuery(undefined);

  const stockData = apiResponse?.data || [];
  const meta = apiResponse?.meta || {};

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
    }, 500),
  ).current;

  const { hasUpdate } = useModulePermissions("Production Stock List");

  const filteredStock = stockData.filter(
    (item: StockRecord) =>
      item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.variant.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Handle row selection from DataTable
  const handleSelectRowsChange = (selectedRowsData: StockRecord[]) => {
    setSelectedRows(selectedRowsData);
  };

  const handleBulkTransfer = () => {
    setSelectedProduct(null); // Clear single selection
    setOpenCreateTransferModal(true);
  };

  const handleSingleTransfer = (record: StockRecord) => {
    setSelectedProduct(record);
    setSelectedRows([]);
    setOpenCreateTransferModal(true);
  };

  // printable data
  const printableData = filteredStock.map(
    (record: StockRecord, index: number) => {
      const createdAt = record.variant.createdAt
        ? new Date(record.variant.createdAt)
        : null;

      return {
        SL: index + 1,
        "Product Name": record.productName || "-",
        "Variant Name": record.variant.name || "-",
        SKU: record.variant.sku || "-",
        "Available Qty": record.availableQty ?? "-",
        "Created At": createdAt
          ? `${String(createdAt.getDate()).padStart(2, "0")}-${String(
              createdAt.getMonth() + 1,
            ).padStart(2, "0")}-${createdAt.getFullYear()}`
          : "-",
      };
    },
  );

  const stockColumns = [
    {
      title: "SL",
      key: "sl",
      render: (_: any, __: StockRecord, index: number) => <> #{index + 1}</>,
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: StockRecord) => (
        <div className="flex items-center gap-2">
          <Link
            to={
              record.isCombo
                ? `/combo-product/${record.productId}`
                : `/product/${record.productId}`
            }
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {text}
          </Link>
          {record.isCombo && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              COMBO
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Variant Name",
      key: "variantName",
      render: (_: any, record: StockRecord) => record.variant.name,
    },
    {
      title: "SKU",
      key: "sku",
      render: (_: any, record: StockRecord) => (
        <Link
          to={
            record.isCombo
              ? `/combo-product/${record.productId}`
              : `/product/${record.productId}`
          }
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {record.variant.sku}
        </Link>
      ),
    },
    {
      title: "Available Quantity",
      dataIndex: "availableQty",
      key: "availableQty",
    },
    {
      title: "Updated At",
      key: "updatedAt",
      render: (_: any, record: StockRecord) => {
        const d = new Date(record.variant.updatedAt);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      },
      sorter: (a: StockRecord, b: StockRecord) =>
        new Date(a.variant.updatedAt).getTime() -
        new Date(b.variant.updatedAt).getTime(),
      defaultSortOrder: "descend" as const,
    },
    ...(hasUpdate
      ? [
          {
            title: "Actions",
            key: "action",
            render: (_: any, record: StockRecord) => (
              <div className="flex gap-2">
                <Tooltip title="Transfer to Warehouse">
                  <Button
                    type="primary"
                    size="small"
                    icon={<FiArrowUpRight />}
                    onClick={() => handleSingleTransfer(record)}
                  >
                    Transfer
                  </Button>
                </Tooltip>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageMeta
        title="Production Stock | ERP"
        description="Manage and monitor production stock levels"
      />
      <div className="">
        <PageHeader
          title="Production Stock Overview"
          subtitle="Track available stock, manage transfers, and monitor product readiness for dispatch"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Productions" },
            { title: "Stock List" },
          ]}
          extra={
            <>
              {selectedRows.length > 0 && (
                <Button
                  onClick={handleBulkTransfer}
                  icon={<FiArrowUpRight />}
                  type="primary"
                  style={{ marginRight: "8px" }}
                >
                  Transfer ({selectedRows.length})
                </Button>
              )}
              <CustomActionButton
                disabled={isLoading || isFetching}
                onClick={() => {
                  refetch();
                }}
                text="Refresh"
                icon={<RefreshCcw />}
                type="primary"
              />
            </>
          }
        />

        <div className="mb-4 flex justify-between">
          <Input
            placeholder="Search product or variant name..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => debounceSearch(e.target.value)}
            className="max-w-md"
            allowClear
          />
          <PageListPrint
            tableData={printableData}
            fileName="Production-stock-list"
          />
        </div>

        <DataTable
          data={filteredStock}
          columns={stockColumns}
          rowKey="variantId"
          isPaginate={meta?.total > 10}
          currentPage={1}
          setCurrentPage={() => {}}
          limit={10}
          setLimit={() => {}}
          total={filteredStock.length}
          loading={isLoading || isFetching}
          // selectRow={true}
          show
          onSelectRowsChange={handleSelectRowsChange}
        />

        {openCreateTransferModal && (
          <CrateTransferModal
            open={openCreateTransferModal}
            setOpen={setOpenCreateTransferModal}
            data={selectedProduct}
            bulkData={selectedRows.length > 0 ? selectedRows : undefined}
            onSuccess={() => {
              setSelectedRows([]);
              setSelectedProduct(null);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductionStockList;
