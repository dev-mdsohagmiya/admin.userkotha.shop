import { Button, Input, message, Select, Space, Tag, Tooltip } from "antd";
import { Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { FiEye, FiShoppingCart } from "react-icons/fi";
import { RiStockFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import SupplierInvoicesPrint from "../../components/common/CommonPrintCsvAndPdf/SupplierInvoicesPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreatePurchaseFromNeedModal from "../../components/common/Modals/CreatePurchaseFromNeedModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useGeneratePurchaseNeedsFromLowStockMutation,
  useGetAllPurchaseNeedsQuery,
} from "../../redux/features/purchases-management/purchasesManagementApi";
import { IPurchaseNeed } from "../../types/purchase";
import { DisplayCurrency } from "../../utils/currency";
import { debounce } from "../../utils/debounce";

const { Option } = Select;

const PurchaseNeedList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [createPurchaseModalOpen, setCreatePurchaseModalOpen] = useState(false);
  const [selectedPurchaseNeed, setSelectedPurchaseNeed] =
    useState<IPurchaseNeed | null>(null);

  // API hooks
  const queryParams: { name: string; value: string }[] = [
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ];

  if (searchText) {
    queryParams.push({ name: "search", value: searchText });
  }
  if (statusFilter) {
    queryParams.push({ name: "status", value: statusFilter });
  }

  const { data: needsData, isLoading } =
    useGetAllPurchaseNeedsQuery(queryParams);
  const [generateNeeds] = useGeneratePurchaseNeedsFromLowStockMutation();

  const needs = needsData?.data || [];
  const meta = needsData?.meta;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "ordered":
        return "blue";
      case "completed":
        return "green";
      default:
        return "default";
    }
  };

  const handleViewDetails = (record: IPurchaseNeed) => {
    navigate(`/purchase-need/${record.id}`);
  };

  const { hasCreate } = useModulePermissions("Purchase Need");

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleGeneratePurchaseNeeds = async () => {
    try {
      await generateNeeds({}).unwrap();
      message.success(
        "Purchase needs generated successfully from low stock materials",
      );
    } catch (error) {
      console.error("Error generating purchase needs:", error);
      message.error("Failed to generate purchase needs");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "blue";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  // const handlePrint = () => {
  //   const printConfig: PrintConfig = {
  //     type: "custom",
  //     title: "Purchase Need List",
  //     companyName: "Amzad Food Industries",
  //     documentTitle: "Purchase Need List Report",
  //     tableData: {
  //       columns: [
  //         { title: "SL", key: "index" },
  //         { title: "Supplier", key: "supplierName" },
  //         {
  //           title: "Total Materials",
  //           key: "totalMaterials",
  //           render: (count: number) => `${count} items`,
  //         },
  //         {
  //           title: "Total QTY",
  //           key: "totalQty",
  //           render: (qty: number) => qty.toLocaleString(),
  //         },
  //         {
  //           title: "Total Price",
  //           key: "totalPrice",
  //           render: (price: number) => `${price.toFixed(2)}/-`,
  //         },
  //         {
  //           title: "Status",
  //           key: "status",
  //           render: (status: string) => status.toUpperCase(),
  //         },
  //       ],
  //       data: needs.map((item: any, index: number) => ({
  //         ...item,
  //         index: index + 1,
  //       })),
  //     },
  //     summaryData: [
  //       { label: "Total Records", value: needs.length },
  //       {
  //         label: "Total Materials",
  //         value: needs.reduce(
  //           (sum: number, item: any) => sum + item.totalMaterials,
  //           0
  //         ),
  //       },
  //       {
  //         label: "Total Quantity",
  //         value: needs
  //           .reduce((sum: number, item: any) => sum + item.totalQty, 0)
  //           .toLocaleString(),
  //       },
  //       {
  //         label: "Total Value",
  //         value: `$${needs
  //           .reduce((sum: number, item: any) => sum + item.totalPrice, 0)
  //           .toFixed(2)}`,
  //         isTotal: true,
  //       },
  //     ],
  //   };

  //   // Create a temporary PrintComponent instance
  //   const printComponent = document.createElement("div");
  //   printComponent.innerHTML = '<div id="print-trigger"></div>';
  //   document.body.appendChild(printComponent);

  //   // Use React to render the PrintComponent
  //   import("react-dom/client").then(({ createRoot }) => {
  //     const root = createRoot(document.getElementById("print-trigger")!);
  //     root.render(
  //       <PrintComponent config={printConfig}>
  //         <button style={{ display: "none" }} />
  //       </PrintComponent>
  //     );

  //     // Trigger print after a short delay
  //     setTimeout(() => {
  //       document
  //         .getElementById("print-trigger")
  //         ?.querySelector("button")
  //         ?.click();
  //       document.body.removeChild(printComponent);
  //     }, 100);
  //   });
  // };

  const handleOrderNow = (record: IPurchaseNeed) => {
    setSelectedPurchaseNeed(record);
    setCreatePurchaseModalOpen(true);
  };

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: IPurchaseNeed, index: number) => <>#{index + 1}</>,
    },

    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplier",
    },
    {
      title: "Material Name",
      key: "materialName",
      render: (record: { items: { materialName: any }[] }) =>
        record.items?.[0]?.materialName || "N/A",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Total Materials",
      dataIndex: "totalMaterials",
      key: "totalMaterials",
      render: (count: number) => `${count} items`,
    },
    {
      title: "Total QTY",
      dataIndex: "totalQty",
      key: "totalQty",
      render: (qty: number) => qty.toLocaleString(),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => <DisplayCurrency amount={price} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: IPurchaseNeed) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Print">
            <SupplierInvoicesPrint purchaseNeed={record} buttonType="true" />
          </Tooltip>
          {hasCreate && (
            <Tooltip title="Order Now">
              <Button
                icon={<FiShoppingCart />}
                type="primary"
                onClick={() => handleOrderNow(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  const printableData = needs?.map((need: IPurchaseNeed, index: number) => {
    const createdAt = need.createdAt ? new Date(need.createdAt) : null;

    return {
      SL: index + 1,
      Supplier: need.supplierName || "-",
      Priority: need.priority ? need.priority.toUpperCase() : "-",
      "Total Materials": need.totalMaterials
        ? `${need.totalMaterials} items`
        : "0 items",
      "Total QTY": need.totalQty?.toLocaleString() || "0",
      "Total Price": need.totalPrice
        ? `TK ${need.totalPrice.toFixed(2)}`
        : "TK 0.00",
      Status: need.status ? need.status.toUpperCase() : "-",
      "Created At": createdAt ? createdAt.toLocaleDateString("en-GB") : "-",
    };
  });

  return (
    <div>
      <PageMeta title="Purchase Need | ERP" description="Purchase Need List" />

      <PageHeader
        title="Purchase Need"
        subtitle="List of materials needed for purchase"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Purchase Need" },
        ]}
        extra={
          <CustomActionButton
            onClick={() => handleGeneratePurchaseNeeds()}
            type="primary"
            icon={<RiStockFill />}
            text=" Generate from Low Stock"
          />
        }
      />

      {/* Filters */}

      <div className="flex justify-between mb-4  flex-wrap">
        <Input
          //  disabled={meta?.total}
          placeholder="Search by supplier or ID..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          value={searchText}
          onChange={(e) => debounceSearch(e.target.value)}
          className="max-w-md"
          size="middle"
          allowClear
        />

        <div className="flex gap-3">
          <PageListPrint
            tableData={printableData}
            fileName="Purchase-need-list"
          />
          <FilterColumn
            tableName="purchase_need_table"
            columns={columns}
            onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
          />

          <div>
            <Select
              placeholder="All Status"
              onChange={setStatusFilter}
              allowClear
              className="w-[120px]"
            >
              <Option value="pending">Pending</Option>
              <Option value="ordered">Ordered</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        // selectRow={true}
        data={needs}
        columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
        rowKey="id"
        isPaginate={meta?.total > 10}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta?.total || 0}
        loading={isLoading}
      />

      {/* Create Purchase from Need Modal */}
      {selectedPurchaseNeed && (
        <CreatePurchaseFromNeedModal
          open={createPurchaseModalOpen}
          setOpen={setCreatePurchaseModalOpen}
          purchaseNeed={selectedPurchaseNeed}
        />
      )}
    </div>
  );
};

export default PurchaseNeedList;
