import { Button, Input, Tooltip } from "antd";
import { Search } from "lucide-react";
import { useState } from "react";
import { FiEdit, FiEye } from "react-icons/fi";
import PageMeta from "../../components/common/Meta/PageMeta";
import DetailsProductVariantModal from "../../components/common/Modals/DetailsStockModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useStockListQuery } from "../../redux/features/stock/stockApi";
import { IStock } from "../../types/stock";

const StockList = () => {
  // --- Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // --- Search state
  const [searchText, setSearchText] = useState("");

  // --- Modal & selected variant state
  const [selectedProductVariant, setSelectedProductVariant] =
    useState<IStock | null>(null);
  // const [openUpdateProductVariant, setOpenUpdateProductVariant] = useState(
  //   false
  // );
  const [openDetailsProductVariant, setOpenDetailsProductVariant] =
    useState(false);

  // --- Fetch stock data from API
  const { data: stockData, isLoading } = useStockListQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    searchText && { name: "search", value: searchText },
  ]);

  const stocks = stockData?.data || [];
  const meta = stockData?.meta;

  // --- Table columns
  const columns = [
    {
      title: "Id",
      key: "index",
      render: (_: any, __: IStock, index: number) => <>#{index + 1}</>,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: (unit: { name?: string }) => <>{unit?.name}</>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: { name?: string }) => <>{category?.name}</>,
    },
    { title: "Min Stock", dataIndex: "minStock", key: "minStock" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Max Stock", dataIndex: "maxStock", key: "maxStock" },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: IStock) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              onClick={() => {
                setSelectedProductVariant(record);
                setOpenDetailsProductVariant(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<FiEdit />}
              onClick={() => {
                setSelectedProductVariant(record);
                // setOpenUpdateProductVariant(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Meta */}
      <PageMeta
        title="Stock List | ERP"
        description="Manage product variants"
      />

      {/* Page Header */}
      <PageHeader
        title="Stock List"
        subtitle="View and manage all Stock List"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Stock list" },
        ]}
      />

      {/* Search */}
      <Input
        placeholder="Search raw materials by name..."
        prefix={<Search className="w-4 h-4 text-gray-400" />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="max-w-md mb-4"
        size="large"
        allowClear
      />

      {/* Variants Table */}
      <DataTable
        loading={isLoading}
        data={stocks}
        columns={columns}
        rowKey="id"
        isPaginate={true}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta?.total || 0}
      />

      {/* Modals */}

      {openDetailsProductVariant && selectedProductVariant && (
        <DetailsProductVariantModal
          open={openDetailsProductVariant}
          setOpen={setOpenDetailsProductVariant}
          data={selectedProductVariant}
        />
      )}
    </div>
  );
};

export default StockList;
