import { Button, Col, Input, Row, Select, Space, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { FiEye, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import { TbCoinTakaFilled } from "react-icons/tb";
import { DataTable } from "../../components/common/Tables";
import { DisplayCurrency } from "../../utils/currency";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { debounce } from "../../utils/debounce";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import { TaskIcon } from "../../icons";

const { Option } = Select;

interface SupplierPayment {
  id: string;
  date: string;
  transactionType: "Purchase" | "Payment" | "Refund" | "Adjustment";
  referenceId: string;
  description: string;
  debit: number;
  credit: number;
  adjustedAgainst: string;
  balance: number;
  supplierId: string;
  supplierName: string;
}

const SupplierPaymentList: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<SupplierPayment[]>(
    [],
  );
  const [searchText, setSearchText] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  // Mock data - replace with actual data from API/localStorage
  useEffect(() => {
    const mockData: SupplierPayment[] = [
      {
        id: "pay_001",
        date: "2025-01-15",
        transactionType: "Purchase",
        referenceId: "PUR-0001",
        description: "Purchase of raw materials",
        debit: 2500.0,
        credit: 0,
        adjustedAgainst: "",
        balance: 2500.0,
        supplierId: "sup_001",
        supplierName: "ABC Suppliers Ltd",
      },
      {
        id: "pay_002",
        date: "2025-01-16",
        transactionType: "Payment",
        referenceId: "PAY-0001",
        description: "Partial payment via bank transfer",
        debit: 0,
        credit: 1500.0,
        adjustedAgainst: "PUR-0001",
        balance: 1000.0,
        supplierId: "sup_001",
        supplierName: "ABC Suppliers Ltd",
      },
      {
        id: "pay_003",
        date: "2025-01-18",
        transactionType: "Purchase",
        referenceId: "PUR-0002",
        description: "Additional material purchase",
        debit: 1800.0,
        credit: 0,
        adjustedAgainst: "",
        balance: 2800.0,
        supplierId: "sup_001",
        supplierName: "ABC Suppliers Ltd",
      },
      {
        id: "pay_004",
        date: "2025-01-20",
        transactionType: "Refund",
        referenceId: "RET-0001",
        description: "Return of damaged goods",
        debit: 0,
        credit: 300.0,
        adjustedAgainst: "PUR-0002",
        balance: 2500.0,
        supplierId: "sup_001",
        supplierName: "ABC Suppliers Ltd",
      },
      {
        id: "pay_005",
        date: "2025-01-22",
        transactionType: "Adjustment",
        referenceId: "ADJ-0001",
        description: "Discount adjustment",
        debit: 0,
        credit: 100.0,
        adjustedAgainst: "PUR-0001",
        balance: 2400.0,
        supplierId: "sup_001",
        supplierName: "ABC Suppliers Ltd",
      },
    ];

    setPayments(mockData);
    setFilteredPayments(mockData);
  }, []);

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // Apply filters
  useEffect(() => {
    let filtered = payments;

    if (searchText) {
      filtered = filtered.filter(
        (payment) =>
          payment.referenceId
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          payment.description
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          payment.supplierName.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (supplierFilter) {
      filtered = filtered.filter(
        (payment) => payment.supplierId === supplierFilter,
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(
        (payment) => payment.transactionType === typeFilter,
      );
    }

    setFilteredPayments(filtered);
  }, [payments, searchText, supplierFilter, typeFilter]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "Purchase":
        return "blue";
      case "Payment":
        return "green";
      case "Refund":
        return "orange";
      case "Adjustment":
        return "purple";
      default:
        return "default";
    }
  };

  const handleViewDetails = (record: SupplierPayment) => {
    // Navigate to payment details or related transaction
    if (record.transactionType === "Purchase") {
      navigate(`/purchases/${record.referenceId}`);
    }
  };

  const handleAddPayment = () => {
    // Navigate to add new payment
    navigate("/supplier-payment/new");
  };

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: SupplierPayment, index: number) => <>#{index + 1}</>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Transaction Type",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type: string) => (
        <Tag color={getTransactionTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: "Reference ID",
      dataIndex: "referenceId",
      key: "referenceId",
    },
    {
      title: "Description / Notes",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (debit: number) =>
        debit > 0 ? <DisplayCurrency amount={debit} /> : "-",
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (credit: number) =>
        credit > 0 ? <DisplayCurrency amount={credit} /> : "-",
    },
    {
      title: "Adjusted Against",
      dataIndex: "adjustedAgainst",
      key: "adjustedAgainst",
      render: (adjusted: string) => adjusted || "-",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number) => (
        <span
          className={
            balance > 0 ? "text-red-600 font-semibold" : "text-green-600"
          }
        >
          <DisplayCurrency amount={balance} />
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: SupplierPayment) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const suppliers = [
    { id: "sup_001", name: "ABC Suppliers Ltd" },
    { id: "sup_002", name: "XYZ Trading Co" },
  ];

  const stats = {
    totalTransactions: payments.length,
    totalDebit: payments.reduce((sum, payment) => sum + payment.debit, 0),
    totalCredit: payments.reduce((sum, payment) => sum + payment.credit, 0),
    currentBalance:
      payments.length > 0 ? payments[payments.length - 1].balance : 0,
  };

  return (
    <div>
      <PageMeta
        title="Supplier Payment | ERP"
        description="Supplier Payment Management"
      />
      <div className="">
        <PageHeader
          title="Supplier Payment"
          subtitle="Track all supplier transactions and payments"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Supplier Payment" },
          ]}
          extra={
            <CustomActionButton
              text="  Add Payment"
              type="primary"
              icon={<FiPlus />}
              onClick={handleAddPayment}
            ></CustomActionButton>
          }
        />

        <Row gutter={[16, 16]} className="">
          {/* Total Transactions */}
          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<TbCoinTakaFilled size={24} color="#fff" />}
              title="Total Transactions"
              value={stats.totalTransactions}
              color="cyan"
            />
          </Col>

          {/* Total Debit */}
          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<ArrowDownCircle size={24} color="#fff" />}
              title="Total Debit"
              value={<DisplayCurrency amount={stats.totalDebit} />}
              color="purple"
            />
          </Col>

          {/* Total Credit */}
          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<ArrowUpCircle size={24} color="#fff" />}
              title="Total Credit"
              value={<DisplayCurrency amount={stats.totalCredit} />}
              color="green"
            />
          </Col>

          {/* Current Balance */}
          <Col xs={24} sm={12} lg={6}>
            <PageHeaderCard
              icon={<TaskIcon color="#fff" />}
              title="Current Balance"
              value={<DisplayCurrency amount={stats.currentBalance} />}
              color={stats.currentBalance > 0 ? "red" : "green"}
            />
          </Col>
        </Row>

        {/* Filters */}

        <div className="flex justify-between my-4 flex-wrap gap-4">
          <Input
            placeholder="Search by reference ID, description..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            onChange={(e) => debounceSearch(e.target.value)}
            allowClear
            size="middle"
            className="max-w-md"
          />

          <div className="flex gap-4">
            <Select
              placeholder="All Suppliers"
              value={supplierFilter || undefined}
              onChange={setSupplierFilter}
              allowClear
              className="w-full"
            >
              {suppliers.map((supplier) => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>

            <FilterColumn
              tableName="supplier_payments_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />

            <Select
              placeholder="All Types"
              value={typeFilter || undefined}
              onChange={setTypeFilter}
              allowClear
              className="w-full"
            >
              <Option value="Purchase">Purchase</Option>
              <Option value="Payment">Payment</Option>
              <Option value="Refund">Refund</Option>
              <Option value="Adjustment">Adjustment</Option>
            </Select>
          </div>
        </div>

        <DataTable
          // columns={columns}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          dataSource={filteredPayments}
          rowKey="id"
          isPaginate={true}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          // total={meta?.total || 0}
        />
      </div>
    </div>
  );
};

export default SupplierPaymentList;
