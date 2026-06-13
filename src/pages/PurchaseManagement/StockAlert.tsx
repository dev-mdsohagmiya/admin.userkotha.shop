import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Input,
  Modal,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { RefreshCcw, Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { FiEdit, FiShoppingCart } from "react-icons/fi";
import { GrTransaction } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import UpdataStockModal from "../../components/common/Modals/Stock/UpdataStockModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useStockListQuery,
  useStockStatusQuery,
} from "../../redux/features/stock/stockApi";
import { ICategory } from "../../types/category";
import { IMaterial } from "../../types/material";
import { IUnit } from "../../types/product";
import { debounce } from "../../utils/debounce";

interface StockAlertItem {
  type: string;
  name: string;
  createdAt: any;
  id: string;
  materialName: string;
  category: ICategory;
  currentStock: number;
  minStock: number;
  maxStock: number;
  stockStatus: string;
  supplier: { name: string };
  lastPurchaseDate: string;
  lastPurchaseRate: number;
  unit: IUnit;
}

export interface PrintableStockData {
  SL: number;
  "Material Name": string;
  "Material Type": string;
  Category: ICategory;
  minStock: string;
  "Current Stock": string;
  "Max Stock": string;
  "Stock Status": string;
  Supplier: string;
  "Created At": string;
}

const StockAlert: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);

  const queryParams: { name: string; value: string }[] = [
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ];

  // Add optional search parameter if present
  if (searchText) {
    queryParams.push({ name: "search", value: searchText });
  }
  if (statusFilter && statusFilter !== "all")
    queryParams.push({ name: "stockStatus", value: statusFilter });

  if (typeFilter && typeFilter !== "all") {
    queryParams.push({ name: "type", value: typeFilter });
  }

  const { hasUpdate } = useModulePermissions("Stock Alert");

  const {
    data,
    isLoading,
    isFetching,
    refetch: stockListRefetch,
  } = useStockListQuery(queryParams);
  const { isLoading: stockLoading, refetch } = useStockStatusQuery(undefined);

  const stocks = data?.data || [];
  const meta = data?.meta || [];

  // const handelClear = () => {
  //   setFilteredCategory([]);
  // };

  const [openUpdateStockModal, setOpenUpdateStockModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // const { data: categoriesData, isLoading: categoriesLoading } =
  //   useCategoryListQuery(undefined);

  // const [categorySearch, setCategorySearch] = useState("");

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }),
  ).current;

  // Apply filters

  const handleOrderNow = (record: StockAlertItem) => {
    if (record.supplier?.name && record.supplier.name !== "Unknown Supplier") {
      // Navigate to purchase creation with material pre-selected
      navigate(
        `/purchases?material=${record.id}&supplier=${record.supplier.name}`,
      );
    }
  };

  const printableData = stocks.map((material: IMaterial, index: number) => {
    const createdAt = material.createdAt ? new Date(material.createdAt) : null;

    const formatText = (text?: string): string =>
      text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "-";

    const formatStock = (value?: number, symbol?: string): string =>
      `${value?.toLocaleString() || 0}${symbol ? ` (${symbol})` : ""}`;

    return {
      SL: index + 1,
      "Material Name": material.name || "-",
      "Material Type": material?.type,
      Category: material.category?.name || "-",
      "Min Stock": formatStock(material.minStock, material.unit?.symbol),
      "Current Stock": formatStock(
        material.currentStock,
        material.unit?.symbol,
      ),
      "Max Stock": formatStock(material.maxStock, material.unit?.symbol),
      "Stock Status": formatText(material.stockStatus),
      Supplier: material.supplier?.name || "-",
      "Created At": createdAt
        ? createdAt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "-",
    };
  });

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: StockAlertItem, index: number) => <>#{index + 1}</>,
    },
    {
      title: "Material Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span style={{ whiteSpace: "nowrap" }}>{name || "-"}</span>
      ),
    },
    {
      title: "Material Type",
      dataIndex: "type",
      key: "type",
      width: "40%",
      render: (type: string) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {type
            ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
            : "-"}
        </span>
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
      }: {
        setSelectedKeys: (keys: React.Key[]) => void;
        selectedKeys: React.Key[];
        confirm: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Raw Material", value: "raw" },
            { text: "Packaging Material", value: "packaging" },
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
                name="materialType"
                value={item.value}
                checked={selectedKeys[0] === item.value}
                onChange={(e) => {
                  setSelectedKeys([e.target.value]);
                  setTypeFilter(e.target.value); // ✅ only set state
                  confirm(); // closes the dropdown
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: { name: string }) => (
        <p color="blue">{category.name}</p>
      ),
    },
    {
      title: "Min Stock",
      dataIndex: "minStock",
      key: "minStock",
      align: "center",
      render: (minStock: number, record: any) =>
        `${minStock.toLocaleString()} (${record.unit?.symbol || ""})`,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      sorter: (a: any, b: any) =>
        Number(a.currentStock) - Number(b.currentStock),
      sortDirections: ["ascend", "descend"],
      render: (stock: number, record: any) => {
        const color = record.stockStatus === "low" ? "red" : "inherit";
        return (
          <span style={{ color }}>
            {stock?.toLocaleString() || 0}{" "}
            {record.unit?.symbol ? `(${record.unit.symbol})` : ""}
          </span>
        );
      },
      align: "center" as const,
    },
    // {
    //   title: "Max Stock",
    //   dataIndex: "maxStock",
    //   key: "maxStock",
    //   align: "center",
    //   render: (maxStock: number, record: any) =>
    //     `${maxStock.toLocaleString()} (${record.unit?.symbol || ""})`,
    // },
    // Stock Status column
    {
      title: "Stock Status",
      dataIndex: "stockStatus",
      key: "stockStatus",
      render: (status: string) => {
        let backgroundColor = "";

        if (status === "over") backgroundColor = "orange";
        else if (status === "low") backgroundColor = "red";
        else backgroundColor = "green";

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
            {status?.toUpperCase() || "-"}
          </Tag>
        );
      },

      filterDropdown: ({ setSelectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Normal", value: "normal" },
            { text: "Low", value: "low" },
            { text: "Over", value: "over" },
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
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      align: "center", // Column content center
      render: (supplier: { name: string }) => (
        <Tooltip title={supplier?.name || "-"}>
          <div
            style={{
              maxWidth: 50, // width adjust করতে পারো
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              margin: "0 auto", // Center div horizontally
              textAlign: "center", // Center text inside div
            }}
          >
            {supplier?.name || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // ascending
      },
      sortDirections: ["ascend", "descend"],
      render: (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        return (
          <span className="">
            {date.toLocaleDateString()} {/* or use toLocaleString() for time */}
          </span>
        );
      },
    },

    // {
    //   title: "Last Purchase Rate",
    //   dataIndex: "lastPurchaseRate",
    //   key: "lastPurchaseRate",
    //   render: (rate: number) => `$${rate.toFixed(2)}`,
    // },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: StockAlertItem) => (
        <Space>
          <Tooltip
            title={
              record.stockStatus === "low"
                ? "Stock is low — you can order now"
                : "Out of stock — ordering disabled"
            }
          >
            <Button
              icon={<FiShoppingCart />}
              type="primary"
              onClick={() => handleOrderNow(record)}
              disabled={record.stockStatus !== "low"} // ✅ শুধুমাত্র low হলে enable থাকবে
              className={`transition-all duration-300 ${
                record.stockStatus === "low"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
              }`}
            />
          </Tooltip>

          {hasUpdate && (
            <Tooltip title="Edit">
              <Button
                icon={<FiEdit />}
                onClick={() => {
                  setOpenUpdateStockModal(true);
                  setSelectedStock(record?.id);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  // select column
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  // const filterMenu = (
  //   <div className="p-6 min-w-[360px] bg-white border border-gray-300 rounded-sm shadow-lg">
  //     {/* Header */}
  //     <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
  //       <div className="flex items-center gap-3">
  //         <h1 className="text-gray-900 text-sm font-semibold">
  //           Filter Products
  //         </h1>
  //       </div>
  //       <Button
  //         size="small"
  //         onClick={handelClear}
  //         className="text-sm text-red-600 hover:bg-red-50"
  //       >
  //         Clear All
  //       </Button>
  //     </div>

  //     {/* Filters */}
  //     <div className="mb-5">
  //       <div className="flex flex-wrap gap-6">
  //         {/* Category */}
  //         <div className="flex-1 min-w-[150px]">
  //           <label className="block text-gray-900 text-xs mb-1 font-medium">
  //             Category
  //           </label>
  //           <Input
  //             placeholder="Search category..."
  //             prefix={<Search className="w-4 h-4 text-gray-400" />}
  //             value={categorySearch}
  //             onChange={(e) => setCategorySearch(e.target.value)}
  //             className="mb-3 mt-2"
  //             size="small"
  //             allowClear
  //           />
  //           <div className="max-h-[150px] overflow-y-auto">
  //             {categoriesData?.data?.length === 0 ? (
  //               <p className="text-xs text-red-500">No categories found</p>
  //             ) : (
  //               <div className="max-h-[250px] overflow-y-auto">
  //                 <Checkbox.Group
  //                   options={categoriesData?.data
  //                     .filter((cat: any) =>
  //                       cat?.name
  //                         .toLowerCase()
  //                         .includes(categorySearch.toLowerCase())
  //                     )
  //                     .map((cat: any) => ({
  //                       label: cat?.name,
  //                       value: cat?.id,
  //                     }))}
  //                   value={filteredCategory}
  //                   onChange={(values) =>
  //                     setFilteredCategory(values as string[])
  //                   }
  //                   className="flex flex-col gap-2"
  //                 />
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Sort */}
  //     <div className="pt-3 border-t border-gray-200">
  //       <label className="block text-gray-900 text-xs mb-2 font-medium">
  //         Sort By
  //       </label>
  //       <div className="flex gap-3 mt-3">
  //         <Button
  //           type={sortOrder === "asc" ? "primary" : "default"}
  //           onClick={() => setSortOrder("asc")}
  //           className="flex-1"
  //         >
  //           Asc
  //         </Button>
  //         <Button
  //           type={sortOrder === "desc" ? "primary" : "default"}
  //           onClick={() => setSortOrder("desc")}
  //           className="flex-1"
  //         >
  //           Desc
  //         </Button>
  //       </div>
  //     </div>
  //   </div>
  // );

  const handleChangeStatusAndDelete = (value: string) => {
    if (value === "delete") {
      // 🗑️ Delete Confirmation Modal
      Modal.confirm({
        title: "Delete Selected Products",
        content:
          "Are you sure you want to delete the selected products? This action cannot be undone.",
        icon: <ExclamationCircleOutlined style={{ color: "red" }} />,
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        centered: true,
        onOk: async () => {
          try {
            // await deleteProduct(selectedProductIds);
            toast.success("🗑️ Products deleted successfully.");
          } catch (err) {
            console.error(err);
            toast.error("❌ Failed to delete products.");
          }
        },
      });
    }

    // ✅ Status Change Modal
    else if (value === "status") {
      Modal.confirm({
        title: "Change Product Status",
        content:
          "Do you want to update the status of the selected products to Active?",
        icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />, // Tailwind green-600
        okText: "Yes, Change",
        okType: "primary",
        okButtonProps: {
          style: {
            backgroundColor: "#16a34a", // Tailwind green-600
            borderColor: "#16a34a",
          },
        },
        cancelText: "Cancel",
        centered: true,
        onOk: async () => {
          try {
            // await updateProductStatus(selectedProductIds);
            toast.success("✅ Product status updated successfully.");
          } catch (err) {
            console.error(err);
            toast.error("⚠️ Failed to update status.");
          }
        },
      });
    }
  };

  const actions = (
    <Card className="!border !border-gray-200">
      {" "}
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          style={{
            width: "100%",
            fontWeight: 500,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => handleChangeStatusAndDelete("delete")}
        >
          Delete
        </Button>

        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          style={{
            width: "100%",
            backgroundColor: "#16a34a", // Tailwind green-600
            borderColor: "#16a34a",
            fontWeight: 500,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "10px",
          }}
          onClick={() => handleChangeStatusAndDelete("status")}
        >
          Change Status
        </Button>
      </Space>
    </Card>
  );

  return (
    <div>
      <PageMeta
        title="Stock Alert | ERP"
        description="Stock Alert Management"
      />

      <PageHeader
        title="Stock Alert"
        subtitle="Monitor materials with low stock levels"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Stock Alert" },
        ]}
        extra={
          <>
            <PageListPrint tableData={printableData} fileName="products-list" />

            <CustomActionButton
              disabled={meta?.total === 0 ? true : false}
              onClick={() => {
                refetch();
                stockListRefetch();
              }}
              text="Refresh"
              icon={<RefreshCcw />}
              type="primary"
            />
          </>
        }
      />

      {/* Statistics Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <PageHeaderCard
          icon={<Total className="text-white text-2xl" />}
          title="Total Materials"
          value={stockStatus.totalMaterials || 0}
          color="blue"
        />
        <PageHeaderCard
          icon={<FiPackage className="text-white text-2xl" />}
          title="Total Products"
          value={stockStatus.totalProducts || 0}
          color="green"
        />
        <PageHeaderCard
          icon={<Stock className="text-white text-2xl" />}
          title="Low Stock"
          value={stockStatus.lowStockCount || 0}
          color="orange"
        />
        <PageHeaderCard
          icon={<AlertTriangle className="text-white text-2xl" />}
          title="Total Value"
          value={stockStatus.totalValue?.toFixed(2) || 0}
          color="red"
        />
      </div> */}

      <div className="flex my-4 justify-between flex-wrap">
        <Input
          // disabled={meta.total < 0}
          placeholder="Search products by name..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          className="max-w-md "
          size="middle"
          allowClear
        />
        <div className="flex gap-5 ">
          <FilterColumn
            tableName="stock_alert_table"
            columns={columns}
            onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
          />

          {selectedProductIds.length > 0 && (
            <Dropdown overlay={actions} trigger={["click"]}>
              <CustomActionButton
                icon={<GrTransaction />}
                type="default"
                text=" Actions"
                icon2={<DownOutlined />}
              ></CustomActionButton>
            </Dropdown>
          )}

          {/* <Dropdown overlay={filterMenu} trigger={["click"]}>
            <CustomActionButton
              // disabled={!products.length && true}
              icon2={<DownOutlined />}
              type="default"
              icon={<Filter />}
              text=" Filter"
            ></CustomActionButton>
          </Dropdown> */}
        </div>
      </div>

      <DataTable
        // selectRow={true}
        loading={isLoading || isFetching || stockLoading}
        data={stocks}
        columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
        rowKey="id"
        isPaginate={meta?.total > 10 && true}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={true}
        total={meta?.total || 0}
        onSelectRowsChange={(selectedRows: any[]) => {
          const ids = selectedRows.map((row) => row.id);
          setSelectedProductIds(ids);
        }}
      />
      {openUpdateStockModal && selectedStock && (
        <UpdataStockModal
          open={openUpdateStockModal}
          setOpen={setOpenUpdateStockModal}
          id={selectedStock}
        />
      )}
    </div>
  );
};

export default StockAlert;
