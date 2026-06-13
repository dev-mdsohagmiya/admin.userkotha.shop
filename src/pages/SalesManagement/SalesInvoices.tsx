import React, { useState } from "react";
import { Button, Input, Tag, Dropdown, Modal, Tooltip, Menu } from "antd";
import { Search, Printer, ShoppingCart } from "lucide-react";
import { DataTable } from "../../components/common/Tables";
import {
  useSaleListQuery,
  useUpdateSaleStatusForCompletedMutation,
} from "../../redux/features/sales/salesApi";
import { Loader } from "../../components/common/Loading";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiEye, FiMoreVertical } from "react-icons/fi";
import SalesInvoicesPrint from "../../components/common/CommonPrintCsvAndPdf/SalesInvoicesPrint";
import { MdOutlinePayment } from "react-icons/md";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import UpdatePaymentAmountModal from "../../components/common/Modals/UpdatePaymentAmountModal";
import { DisplayCurrency } from "../../utils/currency";

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  totalPurchases: number;
  lastPurchaseDate: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  };
}

interface Variant {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
}

interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
  variant: Variant;
}

interface Sale {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  paymentMethod: string;
  totalAmount: number;
  discount: number;
  deliveryCharge: number;
  otherCharge: number;
  otherChargeDescription: string;
  finalAmount: number;
  paid: number;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
}

// Constants
const PAYMENT_METHOD_COLORS: Record<string, string> = {
  cash: "green",
  card: "purple",
  digital: "yellow",
  bkash: "green",
  nagad: "green",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "green",
  paid: "green",
  unpaid: "red",
  pending: "yellow",
  quotation: "orange",
  cancelled: "red",
};

const STATUS_FILTERS = [
  { text: "Completed", value: "completed" },
  { text: "Paid", value: "paid" },
  { text: "Unpaid", value: "unpaid" },
  { text: "Pending", value: "pending" },
  { text: "Quotation", value: "quotation" },
  { text: "Cancelled", value: "cancelled" },
];

export const SalesInvoices: React.FC = () => {
  // State management
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkPrintModalOpen, setIsBulkPrintModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [changeStatus] = useUpdateSaleStatusForCompletedMutation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  // API hooks
  const {
    data: salesData,
    isLoading,
    isFetching,
  } = useSaleListQuery(
    [
      searchText && { name: "search", value: searchText },
      { name: "page", value: page },
      { name: "limit", value: limit },
      statusFilter !== "all" && { name: "status", value: statusFilter },
    ].filter(Boolean),
  );

  const sales = salesData?.data?.data || [];
  const meta = salesData?.data?.meta;
  const navigate = useNavigate();
  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Helper functions

  const handleViewInvoice = (record: Sale) => {
    navigate(`/sales/${record?.id}`);
  };

  // render: (_: any, record: Sale) => {
  //   const menuItems = [
  //     ...(record.status === "quotation"
  //       ? [
  //           {
  //             key: "convert-sales",
  //             label: "Convert to Sales",
  //             icon: <ShoppingCart size={14} />,
  //             onClick: () => handleConvertToSales(record),
  //           },
  //         ]
  //       : []),
  //     {
  //       key: "view",
  //       label: "View Details",
  //       icon: <Eye size={14} />,
  //       onClick: () => handleViewInvoice(record),
  //     },
  //     {
  //       key: "print",
  //       label: "Print Invoice",
  //       icon: <Printer size={14} />,
  //       // onClick: () => handlePrintSingleInvoice(record),
  //     },
  //     {
  //       key: "download",
  //       label: "Download PDF",
  //       icon: <Download size={14} />,
  //       onClick: () => handleDownloadPDF(record),
  //     },
  //   ];

  //   return (
  //     <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
  //       <Button type="text" icon={<MoreVertical size={16} />} />
  //     </Dropdown>
  //   );
  // },

  const actionMenu = (record: Sale) => (
    <Menu>
      {record.status === "quotation" && (
        <Menu.Item
          key="Convert"
          icon={<ShoppingCart size={14} />}
          onClick={() => handleChangeStatus(record)}
        >
          Convert to Sales
        </Menu.Item>
      )}
      <Menu.Item
        key="View"
        icon={<FiEye />}
        onClick={() => {
          handleViewInvoice(record);
        }}
      >
        View Details
      </Menu.Item>

      <Menu.Item
        key="print"
        // onClick={() => handlePrintSingleInvoice(record)}
      >
        <div className="-mt-1.5">
          <SalesInvoicesPrint invoice={record} />
        </div>
      </Menu.Item>
    </Menu>
  );

  const handleChangeStatus = (sales: any) => {
    Modal.confirm({
      title: "Confirm Update",
      content: "Are you sure you want to mark this sale as completed?",
      okText: "completed",
      cancelText: "Cancel",
      okButtonProps: {
        style: {
          backgroundColor: "green",
          borderColor: "green",
          color: "#fff",
        },
      },
      async onOk() {
        try {
          const res = await changeStatus({
            id: sales?.id,
            data: "completed",
          });

          // Handle success response
          if (res) {
            toast.success("Status updated successfully!");
          } else {
            toast.error("Update failed!");
          }
        } catch (error: any) {
          const message =
            error?.data?.message || error?.message || "Something went wrong!";
          toast.error(message);
          console.error("Status update failed:", error);
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      sorter: (a: Sale, b: Sale) =>
        a.invoiceNumber.localeCompare(b.invoiceNumber),
    },
    {
      title: "Customer Name",
      dataIndex: "customer",
      key: "customer",
      render: (customer: Customer) => customer?.name || "-",
      sorter: (a: Sale, b: Sale) =>
        a.customer.name.localeCompare(b.customer.name),
    },
    {
      title: "Amount",
      key: "amount",
      render: (record: Sale) => (
        <div className="text-right">
          <div className="font-semibold">
            <DisplayCurrency amount={record.finalAmount} />
          </div>
          {record.discount > 0 && (
            <div className="text-xs text-gray-500 line-through">
              <DisplayCurrency amount={record.totalAmount} />
            </div>
          )}
        </div>
      ),
      sorter: (a: Sale, b: Sale) => a.finalAmount - b.finalAmount,
    },
    {
      title: "Paid Amount",
      key: "paid",
      render: (record: Sale) => (
        <div className="text-right">
          <div className="text-xs text-black font-medium">
            <DisplayCurrency amount={record.paid} />
          </div>
        </div>
      ),
      sorter: (a: Sale, b: Sale) => a.finalAmount - b.finalAmount,
    },
    {
      title: "Due Amount",
      key: "paid",
      render: (record: Sale) => (
        <div className="text-right">
          <div className="text-xs text-black font-medium">
            <DisplayCurrency amount={record?.finalAmount - record.paid} />
          </div>
        </div>
      ),
      sorter: (a: Sale, b: Sale) => a.finalAmount - b.finalAmount,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => (
        <Tag
          style={{
            color: PAYMENT_METHOD_COLORS[method] || "#d9d9d9", // default gray
          }}
        >
          {method
            ? method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()
            : "Cash"}
        </Tag>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items: SaleItem[]) => (
        <span className="font-medium">{items?.length || 0} items</span>
      ),
      sorter: (a: Sale, b: Sale) => a.items.length - b.items.length,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: STATUS_FILTERS,
      filterMode: "tree" as const,
      filterSearch: true,
      onFilter: (value: any, record: Sale) => record.status === value,
      render: (status: string, record: Sale) => (
        <button
          style={{
            border: "none",
            background: "transparent",
            cursor: status === "completed" ? "not-allowed" : "pointer",
          }}
          disabled={status === "completed"} // disable button if already completed
          onClick={() => handleChangeStatus(record)}
        >
          <Tooltip title={status === "quotation" ? "Convert to Sales" : ""}>
            <Tag
              style={{
                color: STATUS_COLORS[status] || "#d9d9d9",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
                : "Unknown"}
            </Tag>
          </Tooltip>
        </button>
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
      }: {
        setSelectedKeys: (keys: React.Key[]) => void;
        selectedKeys: React.Key[];
      }) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Completed", value: "completed" },
            { text: "Quotation", value: "quotation" },
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="statusFilter"
                value={item.value}
                checked={selectedKeys[0] === item.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedKeys([value]);

                  setStatusFilter(value); // ✅ set state for backend filter
                  setPage(1); // reset page
                }}
                style={{
                  marginRight: 8,
                  accentColor: "green",
                  cursor: "pointer",
                }}
              />
              {item.text}
            </label>
          ))}
        </div>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        // 12-hour time format
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hours12 = String(hours).padStart(2, "0");

        return (
          <div>
            <div className="font-medium">{`${day}/${month}/${year}`}</div>
            <div className="text-xs text-gray-500">{`${hours12}:${minutes} ${ampm}`}</div>
          </div>
        );
      },
      sorter: (a: Sale, b: Sale) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 100,
      render: (record: Sale) => (
        <div className="flex gap-2">
          <Tooltip title="Actions">
            <Dropdown overlay={actionMenu(record)} trigger={["click"]}>
              <Button icon={<FiMoreVertical />} />
            </Dropdown>
          </Tooltip>
          <Tooltip title="Make Payment">
            <Button
              disabled={record?.paid === record?.finalAmount}
              size="middle"
              type="primary"
              icon={<MdOutlinePayment />}
              onClick={() => {
                setOpenPaymentModal(true);
                setSelectedId(record?.id);
              }}
            ></Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  // Bulk Print Component

  const selectedInvoices = sales.filter((invoice: Sale) =>
    selectedRowKeys.includes(invoice.id),
  );

  return (
    <div className="space-y-4">
      {/* Print Styles */}
      <style>{`
        @media print {
          .page-break {
            page-break-after: always;
            page-break-inside: avoid;
          }
          .page-break:last-child {
            page-break-after: auto;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 no-print">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <Input
            placeholder="Search invoices by ID, customer, phone..."
            prefix={<Search size={16} />}
            className="max-w-md sm:w-[300px]"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>
        <FilterColumn
          tableName="sales_invoices_table"
          columns={columns}
          onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
        />
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <DataTable
          selectRow={true}
          data={sales}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          rowKey="id"
          loading={isFetching || isLoading}
          isPaginate={meta?.total > 10}
          currentPage={meta?.page || 1}
          setCurrentPage={setPage}
          total={meta?.total || 0}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10}
          onSelectRowsChange={(selectedRows: Sale[]) => {
            const ids = selectedRows.map((row) => row.id);
            setSelectedRowKeys(ids);
          }}
        />
        {/* <DataTable
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          rowKey="id"
          isPaginate={meta?.total > 10}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10}
          total={meta?.total || 0}
          clearSelectionTrigger={selectedProductIds.length === 0 && true}
          onSelectRowsChange={(selectedRows: any[]) => {
            const ids = selectedRows.map((row) => row.id);
            setSelectedProductIds(ids);
          }}
        /> */}
      </div>
      {/* Bulk Print Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Printer size={20} />
            <span>Bulk Print - {selectedInvoices.length} Invoice(s)</span>
          </div>
        }
        open={isBulkPrintModalOpen}
        onCancel={() => setIsBulkPrintModalOpen(false)}
        width="95%"
        style={{ maxWidth: 900 }}
        footer={[
          <Button key="close" onClick={() => setIsBulkPrintModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<Printer size={16} />}
            onClick={() => window.print()}
          >
            Print All
          </Button>,
        ]}
      ></Modal>

      {openPaymentModal && selectedId && (
        <UpdatePaymentAmountModal
          open={openPaymentModal}
          setOpen={setOpenPaymentModal}
          paymentId={selectedId}
        />
      )}
    </div>
  );
};
