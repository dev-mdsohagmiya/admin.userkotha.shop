import {
  Button,
  // DatePicker,
  Input,
  Space,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { CheckCheck, RefreshCcw, Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { FiEye, FiPlus } from "react-icons/fi";
import { MdPending } from "react-icons/md";
import { TbCoinTaka } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreatePurchaseModal from "../../components/common/Modals/CreatePurchaseModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { Total } from "../../icons";
import { Supplier } from "../../moc/localStorageUtils";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useGetPurchaseStatsQuery,
  usePurchaseListQuery,
} from "../../redux/features/purchases-management/purchasesManagementApi";
import { useSupplierListQuery } from "../../redux/features/suppliers/suppliersApi";
import { debounce } from "../../utils/debounce";

// const { RangePicker } = DatePicker;

const PurchasesList: React.FC = () => {
  const navigate = useNavigate();
  const [openPurchase, setOpenPurchase] = useState(false);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const { data: supplierData } = useSupplierListQuery([
    { name: "limit", value: "5000" },
  ]);

  const suppliers = supplierData?.data;
  // API hooks
  const queryParams: { name: string; value: string }[] = [
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ];

  if (searchText) {
    queryParams.push({ name: "search", value: searchText });
  }

  if (supplierFilter !== "all") {
    queryParams.push({ name: "supplierId", value: supplierFilter });
  }
  if (typeFilter !== "all") {
    queryParams.push({ name: "purchaseType", value: typeFilter });
  }

  if (statusFilter !== "all") {
    queryParams.push({ name: "paymentStatus", value: statusFilter });
  }

  const {
    data: purchasesData,
    isLoading,
    isFetching,
    refetch,
  } = usePurchaseListQuery(queryParams);
  const { data: statsData } = useGetPurchaseStatsQuery(undefined);

  const purchases = purchasesData?.data || [];
  const meta = purchasesData?.meta;
  const stats = statsData?.data || {
    totalPurchases: 0,
    totalAmount: 0,
    pendingPurchases: 0,
    completedPurchases: 0,
  };

  const { hasCreate } = useModulePermissions("Purchases");

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debounceSearch(value);
  };

  const handleViewDetails = (record: any) => {
    navigate(`/purchases/${record.id}`);
  };

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, record: any, index: number) => <>#{index + 1}</>,
    },
    {
      title: "Purchase ID",
      dataIndex: "purchaseId",
      key: "purchaseId",
      render: (text: string) => (
        <Tooltip title={text}>
          {" "}
          <div style={{ whiteSpace: "nowrap" }}>{text?.slice(0, 10)}</div>
        </Tooltip>
      ),
    },
    // {
    //   title: "Material Name",
    //   dataIndex: "",
    //   key: "purchaseId",
    //   render: (text: string) => (
    //     <Tooltip title={text}>
    //       {" "}
    //       <div style={{ whiteSpace: "nowrap" }}>{text?.slice(0, 10)}</div>
    //     </Tooltip>
    //   ),
    // },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplier",
      render: (_: any, record: any) => {
        const text = record.supplier?.name || record.supplierName || "N/A";
        return (
          <Tooltip title={text}>
            <div style={{ whiteSpace: "nowrap" }}>{text?.slice(0, 10)}</div>
          </Tooltip>
        );
      },
      filterDropdown: ({ setSelectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          {suppliers?.map((item: Supplier) => (
            <label
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="supplierFilter"
                value={item.id}
                checked={supplierFilter === item.id}
                onChange={(e) => {
                  const val = e.target.value;
                  setSupplierFilter(val);
                  setSelectedKeys([val]);
                  confirm();
                }}
                style={{
                  marginRight: 8,
                  accentColor: "green",
                  cursor: "pointer",
                }}
              />
              {item.name}
            </label>
          ))}
        </div>
      ),
      filtered: supplierFilter !== "all",
    },
    {
      title: "Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
      render: (text: string) => (
        <Tooltip title={text}>
          {" "}
          <div style={{ whiteSpace: "nowrap" }}>
            {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
          </div>
        </Tooltip>
      ),
      // This controls the icon color
      filtered: statusFilter !== "all",

      filterDropdown: ({ setSelectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Packaging", value: "packaging" },
            { text: "Raw", value: "raw" },
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
                checked={typeFilter === item.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setTypeFilter(value);
                  setSelectedKeys([value]);
                  setPage(1);
                  confirm();
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
      title: "Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (
        a: {
          purchaseDate: string | number | Date | dayjs.Dayjs | null | undefined;
        },
        b: {
          purchaseDate: string | number | Date | dayjs.Dayjs | null | undefined;
        },
      ) => dayjs(a.purchaseDate).unix() - dayjs(b.purchaseDate).unix(), // ✅ date comparison
      defaultSortOrder: "descend", // চাইলে ডিফল্টভাবে descending দেখাবে
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toFixed(2)}`,
    },
    {
      title: "Paid Amount",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (amount: number) => (amount ? `${amount.toFixed(2)}` : "-"),
    },
    {
      title: "Due Amount",
      dataIndex: "dueAmount",
      key: "dueAmount",
      render: (amount: number) => (amount ? `${amount.toFixed(2)}/-` : "-"),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (paymentStatus: string) => {
        let backgroundColor = "";

        if (paymentStatus === "Partial") backgroundColor = "#FD8000";
        else if (paymentStatus === "Due") backgroundColor = "red";
        else if (paymentStatus === "Paid") backgroundColor = "green";
        else backgroundColor = "gray"; // default color for other statuses

        return (
          <Tag
            style={{
              backgroundColor,
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "4px 10px",
            }}
          >
            {paymentStatus?.toUpperCase() || "-"}
          </Tag>
        );
      },

      filterDropdown: ({ setSelectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Partial", value: "Partial" },
            { text: "Due", value: "Due" },
            { text: "Paid", value: "Paid" },
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
                name="stockStatus"
                value={item.value}
                checked={statusFilter === item.value} // use a separate state for stockStatus
                onChange={(e) => {
                  const val = e.target.value;
                  setStatusFilter(val); // ✅ only set state
                  setSelectedKeys([val]);
                  confirm(); // close dropdown
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
      filtered: statusFilter !== "all",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: any) => (
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

  // const printableData = purchases.map((purchase: any, index: number) => {
  //   const purchaseDate = purchase.purchaseDate
  //     ? new Date(purchase.purchaseDate)
  //     : null;
  //   const createdAt = purchase.createdAt ? new Date(purchase.createdAt) : null;

  //   return {
  //     SL: index + 1,
  //     "Purchase ID": purchase.purchaseId || "-",
  //     Supplier: purchase.supplier?.name || "-",
  //     "Purchase Date": purchaseDate
  //       ? purchaseDate.toLocaleDateString("en-GB")
  //       : "-",
  //     "Purchase Type": purchase.purchaseType || "-",
  //     "Invoice No": purchase.invoiceNo || "-",
  //     "Purchased By": purchase.purchasedByName || "-",
  //     "Reference No": purchase.referenceNo || "-",
  //     "Sub Total": purchase.subTotal || 0,
  //     Discount: purchase.discount || 0,
  //     "VAT Amount": purchase.vatAmount || 0,
  //     "Other Charges": purchase.otherCharges || 0,
  //     "Total Amount": purchase.totalAmount || 0,
  //     "Grand Total": purchase.grandTotal || 0,
  //     "Paid Amount": purchase.paidAmount || 0,
  //     "Due Amount": purchase.dueAmount || 0,
  //     "Payment Status": purchase.paymentStatus || "-",
  //     Status: purchase.status || "-",
  //     "Items Count": purchase.items?.length || 0,
  //     "Created At": createdAt ? createdAt.toLocaleDateString("en-GB") : "-",
  //   };
  // });

  const printableData = purchases.map((purchase: any, index: number) => {
    const purchaseDate = purchase.purchaseDate
      ? new Date(purchase.purchaseDate).toLocaleDateString("en-GB")
      : "-";
    const createdAt = purchase.createdAt
      ? new Date(purchase.createdAt).toLocaleDateString("en-GB")
      : "-";

    // Make fullData dynamic friendly
    const fullData: Record<string, any> = {
      index: index + 1,
      purchaseId: purchase.purchaseId || "-",
      supplier: purchase.supplier?.name || "-",
      purchaseDate,
      purchaseType: purchase.purchaseType || "-",
      invoiceNo: purchase.invoiceNo || "-",
      purchasedBy: purchase.purchasedByName || "-",
      referenceNo: purchase.referenceNo || "-",
      subTotal: purchase.subTotal || 0,
      discount: purchase.discount || 0,
      vatAmount: purchase.vatAmount || 0,
      otherCharges: purchase.otherCharges || 0,
      totalAmount: purchase.totalAmount || 0,
      grandTotal: purchase.grandTotal || 0,
      paidAmount: purchase.paidAmount || 0,
      dueAmount: purchase.dueAmount || 0,
      paymentStatus: purchase.paymentStatus || "-",
      status: purchase.status || "-",
      itemsCount: purchase.items?.length || 0,
      createdAt,
    };

    const filteredData: Record<string, any> = {};

    selectedColumnKeys.forEach((key: string) => {
      filteredData[key] = fullData[key] ?? "-";
    });

    return filteredData;
  });

  return (
    <div>
      <PageMeta title="Purchases | ERP" description="Purchase Management" />

      <PageHeader
        title="Purchases"
        subtitle="Track all purchase transactions and payments"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Purchases" },
        ]}
        extra={
          // <Button type="primary" icon={<FiPlus />} onClick={handleAddPayment}>
          //   Add Payment
          // </Button>
          //
          <>
            <CustomActionButton
              disabled={purchases.length === 0 ? true : false}
              onClick={() => {
                refetch();
              }}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />

            {hasCreate && (
              <CustomActionButton
                text="Add New"
                type="primary"
                icon={<FiPlus />}
                onClick={() => setOpenPurchase(true)}
              ></CustomActionButton>
            )}
          </>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PageHeaderCard
          icon={<Total className="text-white text-2xl" />}
          title="Total Purchases"
          value={stats.totalPurchases}
          color="blue"
        />
        <PageHeaderCard
          icon={<TbCoinTaka className="text-white text-2xl" />}
          title="Total Amount"
          value={`${stats.totalAmount.toFixed(2)}`}
          color="orange"
        />
        <PageHeaderCard
          icon={<MdPending className="!text-white text-2xl" />}
          title="Due"
          value={stats.pendingPurchases}
          color="purple"
        />
        <PageHeaderCard
          icon={<CheckCheck className="text-white text-2xl" />}
          title="Paid"
          value={stats.completedPurchases}
          color="green"
        />
      </div>

      {/* Filters */}

      <div className="flex justify-between my-4">
        <Input
          placeholder="Search by reference ID, description..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-md"
          size="middle"
          allowClear
        />

        <div className="flex gap-3">
          <PageListPrint tableData={printableData} fileName="purchase-list" />
          <FilterColumn
            tableName="supplier_payments_table"
            columns={columns}
            onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
          />

          {/* <div>
              <RangePicker
                placeholder={["Start Date", "End Date"]}
                onChange={(dates) => setDateRange(dates)}
                className="w-full"
              />
            </div> */}
        </div>
      </div>

      <DataTable
        // selectRow={true}
        loading={isLoading || isFetching}
        data={purchases}
        columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
        rowKey="id"
        isPaginate={meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={meta?.total > 10}
        total={meta?.total || 0}
        // onSelectRowsChange={(selectedRows: any[]) => {
        //   const ids = selectedRows.map((row) => row.id);
        //   setSelectedProductIds(ids);
        // }}
      />

      {openPurchase && (
        <CreatePurchaseModal open={openPurchase} setOpen={setOpenPurchase} />
      )}
    </div>
  );
};

export default PurchasesList;
