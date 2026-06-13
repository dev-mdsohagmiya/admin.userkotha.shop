import { Input, Select, Space, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowDown,
  FiArrowRight,
  FiArrowUp,
  FiDownload,
} from "react-icons/fi";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { stockStorage } from "../../moc/localStorageUtils";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import { FiActivity, FiTrendingUp } from "react-icons/fi";
import { debounce } from "../../utils/debounce";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { getDefaultDateRange } from "../../utils/dateRange";
import CustomDatePicker from "../../components/common/Date/CustomDatePicker";
const { Text } = Typography;
const { Option } = Select;
// const { RangePicker } = DatePicker;

const StockTransactions = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<any>(getDefaultDateRange());
  const [transactions, setTransactions] = useState<any[]>([]);

  // Use the hook at the top level of the component
  //   const { data: materialsData, isLoading: materialsLoading } =
  //     useGetRawMaterialsQuery(undefined);
  useEffect(() => {
    loadTransactions();
  }, []);
  // debounce search
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;
  const loadTransactions = () => {
    const allTransactions = stockStorage.getAllTransactions();
    setTransactions(allTransactions);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.materialName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      transaction.referenceNumber
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesDate =
      !dateRange ||
      (dayjs(transaction.date).isAfter(dateRange[0]) &&
        dayjs(transaction.date).isBefore(dateRange[1]));

    return matchesSearch && matchesType && matchesDate;
  });

  const getTransactionTypeColor = (type: string) => {
    return type === "in" ? "green" : "red";
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === "in" ? <FiArrowUp /> : <FiArrowDown />;
  };

  const getReferenceTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "blue";
      case "production":
        return "purple";
      case "adjustment":
        return "orange";
      case "requisition":
        return "cyan";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleString(),
      width: 150,
    },
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      width: 200,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={getTransactionTypeColor(type)}>
          <Space>
            {getTransactionTypeIcon(type)}
            {type.toUpperCase()}
          </Space>
        </Tag>
      ),
      width: 100,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: any) => (
        <Text strong>
          {quantity} {record.unit}
        </Text>
      ),
      width: 120,
    },
    {
      title: "Reference",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      render: (number: string, record: any) => (
        <Tag color={getReferenceTypeColor(record.referenceType)}>{number}</Tag>
      ),
      width: 140,
    },
    {
      title: "Reference Type",
      dataIndex: "referenceType",
      key: "referenceType",
      render: (type: string) => (
        <Text type="secondary" className="capitalize">
          {type.replace("_", " ")}
        </Text>
      ),
      width: 140,
    },
    {
      title: "Stock Change",
      key: "stockChange",
      render: (_: any, record: any) => (
        <Space>
          <Text type="secondary">{record.previousStock}</Text>
          <FiArrowRight className="text-gray-400" />
          <Text strong>{record.newStock}</Text>
          <Text type="secondary">{record.unit}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => (
        <Tooltip title={notes}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {notes}
          </Text>
        </Tooltip>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalTransactions: transactions.length,
    totalIn: transactions
      .filter((t) => t.type === "in")
      .reduce((sum, t) => sum + t.quantity, 0),
    totalOut: transactions
      .filter((t) => t.type === "out")
      .reduce((sum, t) => sum + t.quantity, 0),
    netChange:
      transactions
        .filter((t) => t.type === "in")
        .reduce((sum, t) => sum + t.quantity, 0) -
      transactions
        .filter((t) => t.type === "out")
        .reduce((sum, t) => sum + t.quantity, 0),
  };

  return (
    <div>
      <PageMeta
        title="Stock Transactions | ERP"
        description="View Stock Transaction History"
      />
      <PageHeader
        title="Stock Transactions"
        subtitle="Track all material movements and stock changes"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Inventory" },
          { title: "Stock Transactions" },
        ]}
        extra={
          // <Button icon={<FiDownload />}>Export Report</Button>

          <CustomActionButton
            text="Export Report"
            icon={<FiDownload />}
            type="default"
          />
        }
      />
      {/* Statistics Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Total Transactions */}
        <PageHeaderCard
          icon={<FiActivity className="text-white text-2xl" />}
          title="Total Transactions"
          value={stats.totalTransactions}
          color="cyan"
        />

        {/* Total In */}
        <PageHeaderCard
          icon={<FiArrowUp className="text-white text-2xl" />}
          title="Total In"
          value={`+${stats.totalIn}`}
          color="green"
        />

        {/* Total Out */}
        <PageHeaderCard
          icon={<FiArrowDown className="text-white text-2xl" />}
          title="Total Out"
          value={`-${stats.totalOut}`}
          color="purple"
        />

        {/* Net Change */}
        <PageHeaderCard
          icon={<FiTrendingUp className="text-white text-2xl" />}
          title="Net Change"
          value={`${stats.netChange >= 0 ? "+" : ""}${stats.netChange}`}
          color="indigo"
        />
      </div>
      {/* Filters */}

      <div className="flex flex-wrap justify-between gap-4 items-center">
        <Input
          // disabled={meta.total < 0}
          placeholder="Search products by name..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          className="max-w-md"
          size="middle"
          allowClear
        />

        <div className="flex gap-3.5">
          <Select
            // disabled={meta.total < 0}
            value={typeFilter}
            onChange={setTypeFilter}
            className="w-full md:w-40"
            placeholder="Transaction Type"
          >
            <Option value="all">All Types</Option>
            <Option value="in">Stock In</Option>
            <Option value="out">Stock Out</Option>
          </Select>
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </div>
      </div>

      {/* Transactions Table */}

      <div className="mt-5">
        <DataTable
          data={filteredTransactions}
          columns={columns}
          rowKey="id"
          isPaginate={true}
          currentPage={page}
          setCurrentPage={setPage}
          total={filteredTransactions.length}
        />
      </div>
    </div>
  );
};

export default StockTransactions;
