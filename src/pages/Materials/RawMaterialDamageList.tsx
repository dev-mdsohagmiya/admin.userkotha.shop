import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Select, Tag, Tooltip } from "antd";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { stockStorage } from "../../moc/localStorageUtils";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import { DisplayCurrency } from "../../utils/currency";

interface DamageRecord {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  reason: string;
  damageType: "damage" | "adjustment";
  referenceNumber: string;
  date: string;
  notes?: string;
  previousStock: number;
  newStock: number;
  cost: number;
  totalCost: number;
}

const MaterialDamageList = () => {
  const [searchText, setSearchText] = useState("");
  const [damageTypeFilter, setDamageTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  //   const [selectedDamage, setSelectedDamage] = useState<DamageRecord | null>(
  //     null
  //   );
  //   const [isProcessing, setIsProcessing] = useState(false);

  const [damageRecords, setDamageRecords] = useState<DamageRecord[]>([]);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  useEffect(() => {
    loadDamageRecords();
  }, []);

  const loadDamageRecords = () => {
    // Get all stock transactions and filter for damage/adjustment records
    const allTransactions = stockStorage.getAllTransactions();

    // Filter transactions that are adjustments (which include damages)
    const adjustmentTransactions = allTransactions.filter(
      (transaction) =>
        transaction.referenceType === "adjustment" &&
        transaction.type === "out",
    );

    // Transform to damage records format
    const damageRecordsData: DamageRecord[] = adjustmentTransactions.map(
      (transaction) => ({
        id: transaction.id,
        materialId: transaction.materialId,
        materialName: transaction.materialName,
        quantity: transaction.quantity,
        unit: transaction.unit,
        reason: transaction.notes || "Stock adjustment",
        damageType: transaction.notes?.toLowerCase().includes("damage")
          ? "damage"
          : "adjustment",
        referenceNumber: transaction.referenceNumber,
        date: transaction.date,
        notes: transaction.notes,
        previousStock: transaction.previousStock,
        newStock: transaction.newStock,
        cost: 0, // This would need to be calculated based on material cost
        totalCost: 0, // This would need to be calculated
      }),
    );

    setDamageRecords(damageRecordsData);
  };

  const filteredRecords = damageRecords.filter((record) => {
    const matchesSearch =
      record.materialName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.referenceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchText.toLowerCase());

    const matchesType =
      damageTypeFilter === "all" || record.damageType === damageTypeFilter;

    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this damage record?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          // Remove from localStorage (this is a simplified approach)
          // In a real app, you'd have a proper API call
          const updatedRecords = damageRecords.filter(
            (record) => record.id !== id,
          );
          setDamageRecords(updatedRecords);
          toast.success("Damage record deleted successfully.");
        } catch (err: any) {
          console.error("Error deleting damage record:", err);
          toast.error("Failed to delete damage record.");
        }
      },
    });
  };

  const getDamageTypeColor = (type: string) => {
    return type === "damage" ? "red" : "orange";
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
      width: 120,
    },
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      ellipsis: true,
    },
    {
      title: "Reference",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "damageType",
      key: "damageType",
      render: (type: string) => (
        <Tag color={getDamageTypeColor(type)}>{type.toUpperCase()}</Tag>
      ),
      width: 100,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (quantity: number, record: DamageRecord) => (
        <span>
          {quantity} {record.unit}
        </span>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason: string) => (
        <Tooltip title={reason}>
          <span>{reason}</span>
        </Tooltip>
      ),
    },
    {
      title: "Stock Change",
      key: "stockChange",
      align: "center" as const,
      render: (_: any, record: DamageRecord) => (
        <span className="text-red-600">
          {record.previousStock} → {record.newStock}
        </span>
      ),
    },
    {
      title: "Total Cost",
      dataIndex: "totalCost",
      key: "totalCost",
      align: "right" as const,
      render: (cost: number) => (
        <span className="font-medium">
          <DisplayCurrency amount={cost} />
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center" as const,
      fixed: "right",
      render: (record: DamageRecord) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="View Details">
            <Button>
              <FiEye />
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<FiEdit />}
              onClick={() => {
                // setSelectedDamage(record);
                // setOpenUpdateDamageModal(true);
              }}
            />
          </Tooltip>
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
        </div>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalRecords: damageRecords.length,
    totalDamageQuantity: damageRecords
      .filter((r) => r.damageType === "damage")
      .reduce((sum, r) => sum + r.quantity, 0),
    totalAdjustmentQuantity: damageRecords
      .filter((r) => r.damageType === "adjustment")
      .reduce((sum, r) => sum + r.quantity, 0),
    totalCost: damageRecords.reduce((sum, r) => sum + r.totalCost, 0),
  };

  return (
    <div className="relative">
      <PageMeta
        title="Raw Material Damage/Adjustment | Amzad Food ERP"
        description="Calculated damage and adjustment list for raw materials"
      />

      <div className="">
        <PageHeader
          title="Raw Material Damage and Adjustment"
          subtitle="View and manage calculated damage and adjustment records"
          breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Damage" }]}
          extra={
            <CustomActionButton
              // onClick={() => setOpenCreateUnitsModal(true)}
              text="Add Damage/Adjustment"
              icon={<Plus />}
              type="primary"
            />
            // <Button
            //   //   onClick={() => setOpenCreateDamageModal(true)}
            //   type="primary"
            //   htmlType="submit"
            //   size="middle"
            //   //   loading={isProcessing}
            //   style={{
            //     borderRadius: "6px",
            //     padding: "0 24px",
            //     background: "#ff3d0a",
            //     border: "none",
            //     boxShadow: "0 2px 4px rgba(255, 107, 53, 0.2)",
            //   }}
            // >
            //   + Add Damage/Adjustment
            // </Button>
          }
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PageHeaderCard
            icon={<i className="fa-solid fa-file-alt text-white text-2xl"></i>}
            title="Total Records"
            value={stats.totalRecords}
            color="blue"
          />
          <PageHeaderCard
            icon={
              <i className="fa-solid fa-exclamation-triangle text-white text-2xl"></i>
            }
            title="Total Damage Qty"
            value={stats.totalDamageQuantity}
            color="red"
          />
          <PageHeaderCard
            icon={<i className="fa-solid fa-adjust text-white text-2xl"></i>}
            title="Total Adjustment Qty"
            value={stats.totalAdjustmentQuantity}
            color="orange"
          />
          <PageHeaderCard
            icon={
              <i className="fa-solid fa-dollar-sign text-white text-2xl"></i>
            }
            title="Total Cost"
            value={<DisplayCurrency amount={stats.totalCost} />}
            color="green"
          />
        </div>

        <div className="flex justify-between flex-wrap my-4 gap-4">
          <Input
            placeholder="Search damage records..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
            size="middle"
            allowClear
          />

          <div className="flex gap-3">
            <FilterColumn
              tableName="material_damage_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
            <Select
              value={damageTypeFilter}
              onChange={setDamageTypeFilter}
              size="middle"
              placeholder="Filter by type"
            >
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="damage">Damage</Select.Option>
              <Select.Option value="adjustment">Adjustment</Select.Option>
            </Select>
          </div>
        </div>

        <div className="">
          <DataTable
            loading={false}
            data={filteredRecords}
            // columns={columns}
            columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
            rowKey="id"
            isPaginate={true}
            currentPage={page}
            setCurrentPage={setPage}
            limit={limit}
            setLimit={setLimit}
            total={filteredRecords.length}
          />
        </div>
      </div>
    </div>
  );
};

export default MaterialDamageList;
