import { Button, Input, Tag, Tooltip } from "antd";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiEye, FiShoppingCart } from "react-icons/fi";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { DisplayCurrency } from "../../utils/currency";

// --- TYPES ---
interface IRawMaterial {
  id: string;
  name: string;
  category: { id: string; name: string };
  supplier: { id: string; name: string };
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: { id: string; name: string; symbol: string };
  lastPurchaseDate: string;
  lastPurchaseRate: number;
}

// --- COMPONENT ---
const StockAlertList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ✅ FAKE DATA
  const materials: IRawMaterial[] = [
    {
      id: "1",
      name: "Sugar",
      category: { id: "c1", name: "Food Ingredients" },
      supplier: { id: "s1", name: "BD Agro Traders" },
      currentStock: 5,
      minStock: 10,
      maxStock: 100,
      unit: { id: "u1", name: "Kilogram", symbol: "kg" },
      lastPurchaseDate: "2025-09-20",
      lastPurchaseRate: 55,
    },
    {
      id: "2",
      name: "Wheat Flour",
      category: { id: "c1", name: "Food Ingredients" },
      supplier: { id: "s2", name: "ABC Flour Mill" },
      currentStock: 0,
      minStock: 20,
      maxStock: 150,
      unit: { id: "u1", name: "Kilogram", symbol: "kg" },
      lastPurchaseDate: "2025-09-28",
      lastPurchaseRate: 48,
    },
    {
      id: "3",
      name: "Packaging Box",
      category: { id: "c2", name: "Packaging" },
      supplier: { id: "s3", name: "PaperHouse Ltd." },
      currentStock: 85,
      minStock: 30,
      maxStock: 120,
      unit: { id: "u2", name: "Pieces", symbol: "pcs" },
      lastPurchaseDate: "2025-10-02",
      lastPurchaseRate: 12,
    },
    {
      id: "4",
      name: "Salt",
      category: { id: "c1", name: "Food Ingredients" },
      supplier: { id: "s4", name: "Desh Salt Co." },
      currentStock: 15,
      minStock: 15,
      maxStock: 80,
      unit: { id: "u1", name: "Kilogram", symbol: "kg" },
      lastPurchaseDate: "2025-09-25",
      lastPurchaseRate: 22,
    },
  ];

  // ✅ Filter by search
  const filteredData = materials.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ✅ Stock Status Logic
  const getStockStatus = (material: IRawMaterial) => {
    const current = Number(material.currentStock);
    const min = Number(material.minStock);

    if (current <= 0) {
      return { label: "Critical", color: "red" };
    } else if (current <= min) {
      return { label: "Low", color: "orange" };
    } else {
      return { label: "Normal", color: "green" };
    }
  };

  // ✅ Columns
  const columns = [
    {
      title: "Sl",
      key: "sl",
      render: (_: any, __: any, index: number) => "#" + (index + 1),
    },
    {
      title: "Material Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: any) => category?.name || "—",
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (value: number, record: IRawMaterial) => (
        <span>
          {value} {record.unit.symbol}
        </span>
      ),
    },
    {
      title: "Min Stock",
      dataIndex: "minStock",
      key: "minStock",
      render: (value: number, record: IRawMaterial) => (
        <span>
          {value} {record.unit.symbol}
        </span>
      ),
    },
    {
      title: "Stock Status",
      key: "stockStatus",
      render: (_: any, record: IRawMaterial) => {
        const status = getStockStatus(record);
        return (
          <Tag
            color={status.color}
            className="font-medium flex items-center gap-1"
          >
            {status.label}
          </Tag>
        );
      },
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplier: any) => supplier?.name || "—",
    },
    {
      title: "Last Purchase Date",
      dataIndex: "lastPurchaseDate",
      key: "lastPurchaseDate",
    },
    {
      title: "Last Purchase Rate",
      dataIndex: "lastPurchaseRate",
      key: "lastPurchaseRate",
      render: (value: number) =>
        value ? <DisplayCurrency amount={value} /> : "—",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (record: IRawMaterial) => (
        <div className="flex gap-2">
          <Tooltip title="Order Now">
            <Button
              type="primary"
              icon={<FiShoppingCart />}
              onClick={() =>
                navigate(`/purchase/order/new?supplier=${record.supplier.id}`)
              }
            />
          </Tooltip>

          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              onClick={() => navigate(`/raw-material/details/${record.id}`)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Stock Alert | ERP"
        description="View materials that are low or critical in stock"
      />

      <PageHeader
        title="Stock Alert List"
        subtitle="Monitor materials with low or critical stock"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Stock Alert" },
        ]}
      />

      <Input
        placeholder="Search material by name..."
        prefix={<Search className="w-4 h-4 text-gray-400" />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="max-w-md mb-4"
        size="large"
        allowClear
      />

      <DataTable
        loading={false}
        data={filteredData}
        columns={columns}
        rowKey="id"
        isPaginate={true}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={filteredData.length}
      />
    </div>
  );
};

export default StockAlertList;
