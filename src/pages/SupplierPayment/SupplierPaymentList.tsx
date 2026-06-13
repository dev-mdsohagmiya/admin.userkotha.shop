import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tooltip } from "antd";
import { Search } from "lucide-react";
import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";

// Sample data type
interface ISupplierPayment {
  id: string;
  date: string;
  transactionType: "Purchase" | "Payment" | "Refund" | "Adjustment";
  referenceId: string;
  description: string;
  debit?: number;
  credit?: number;
  adjustedAgainst?: string;
  balance?: number;
}

const SupplierPaymentList = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Sample data (replace with API)
  const [payments, setPayments] = useState<ISupplierPayment[]>([
    {
      id: "1",
      date: "2025-10-01",
      transactionType: "Purchase",
      referenceId: "INV-1001",
      description: "Purchase of raw materials",
      debit: 5000,
      credit: 0,
      adjustedAgainst: "Payment ID 2001",
      balance: 5000,
    },
    {
      id: "2",
      date: "2025-10-05",
      transactionType: "Payment",
      referenceId: "PAY-2001",
      description: "Payment to supplier",
      debit: 0,
      credit: 5000,
      adjustedAgainst: "Invoice INV-1001",
      balance: 0,
    },
  ]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this payment?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: () => {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        toast.success("Payment deleted successfully.");
      },
    });
  };

  const columns = [
    {
      title: "Sl",
      key: "sl",
      render: (_: any, __: any, index: number) => "#" + (index + 1),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Transaction Type",
      dataIndex: "transactionType",
      key: "transactionType",
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
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="line-clamp-2 cursor-pointer">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (value: number) => value?.toLocaleString() || "-",
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (value: number) => value?.toLocaleString() || "-",
    },
    {
      title: "Adjusted Against",
      dataIndex: "adjustedAgainst",
      key: "adjustedAgainst",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (value: number) => value?.toLocaleString() || "-",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (record: ISupplierPayment) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button icon={<FiEdit />} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
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
        title="Supplier Payments | ERP"
        description="View and manage supplier payments"
      />

      <PageHeader
        title="Supplier Payments"
        subtitle="View and manage all supplier payments"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Supplier Payments" },
        ]}
        // extra={<Button type="primary">+ Add Payment</Button>}
      />

      <Input
        placeholder="Search payments by reference or description..."
        prefix={<Search className="w-4 h-4 text-gray-400" />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="max-w-md mb-4"
        size="large"
        allowClear
      />

      <DataTable
        loading={false}
        data={payments}
        columns={columns}
        rowKey="id"
        isPaginate={true}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={payments.length}
      />
    </div>
  );
};

export default SupplierPaymentList;
