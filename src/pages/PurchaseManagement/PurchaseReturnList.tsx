import { Button, Input, Space, Tooltip } from "antd";
import dayjs from "dayjs";
import { RefreshCcw, Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
// import { DownOutlined } from "@ant-design/icons";
import { IPurchaseReturn } from "../../types/purchase";
import { DataTable } from "../../components/common/Tables";
// import CustomActionButton from "../../components/common/Button/CustomActionButton";
// import { useCategoryListQuery } from "../../redux/features/categories/categoriesApi";
import { debounce } from "../../utils/debounce";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import { useGetAllPurchaseReturnsQuery } from "../../redux/features/purchases-management/purchasesManagementApi";
import PurchaseReturnPrint from "../../components/common/CommonPrintCsvAndPdf/PurchaseReturnPrint";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";

const PurchaseReturnList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  // Filters
  const [searchText, setSearchText] = useState("");
  // const [filteredCategory, setFilteredCategory] = useState<string[]>([]);
  // const [filteredSupplier, setFilteredSupplier] = useState<string[]>([]);
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // const [supplierSearchText, setSupplierSearchText] = useState<string>("");
  // const [categorySearchText, setCategorySearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // const { data: categoriesData } = useCategoryListQuery([
  //   categorySearchText && { name: "search", value: { categorySearchText } },
  // ]);

  // API hook for purchase returns
  const queryParams: { name: string; value: string }[] = [
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ];

  if (searchText) {
    queryParams.push({ name: "search", value: searchText });
  }
  // if (filteredSupplier.length > 0) {
  //   queryParams.push({ name: "supplierId", value: filteredSupplier.join(",") });
  // }
  // if (filteredCategory.length > 0) {
  //   queryParams.push({ name: "categoryId", value: filteredCategory.join(",") });
  // }

  const {
    data: returnsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllPurchaseReturnsQuery(queryParams);
  const returns = returnsData?.data || [];
  const meta = returnsData?.meta;

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // const debounceCategorySearch = useRef(
  //   debounce((value) => {
  //     setCategorySearchText(value);
  //   }, 500)
  // ).current;
  // const debounceSupplierSearch = useRef(
  //   debounce((value) => {
  //     setSupplierSearchText(value);
  //   }, 500)
  // ).current;

  const columns = [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: IPurchaseReturn, index: number) => <>#{index + 1}</>,
    },
    {
      title: "Return ID",
      dataIndex: "returnId",
      key: "returnId",
      ellipsis: true,
    },
    {
      title: "Material Name",
      key: "materialName",
      render: (record: { items: { materialName: any }[] }) =>
        record.items?.[0]?.materialName || "N/A",
    },
    {
      title: "Material Type",
      key: "purchaseType",
      render: (record: { purchase: { purchaseType: string } }) => {
        const type = record.purchase?.purchaseType || "N/A";
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      },
    },
    // {
    //   title: "Purchase ID",
    //   dataIndex: "purchaseId",
    //   key: "purchaseId",
    // },

    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplier",
      ellipsis: true,
    },
    {
      title: "Total Items",
      dataIndex: "totalItems",
      key: "totalItems",
    },
    {
      title: "Total Qty",
      dataIndex: "totalQty",
      key: "totalQty",
    },
    {
      title: "Total Amount",
      dataIndex: "returnAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toFixed(2)}/-`,
    },
    {
      title: "Date",
      dataIndex: "returnDate",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a: any, b: any) =>
        dayjs(a.returnDate).valueOf() - dayjs(b.returnDate).valueOf(),
    },
    // {
    //   title: "Created By",
    //   dataIndex: "createdBy",
    //   key: "createdBy",
    // },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: IPurchaseReturn) => (
        <Space>
          <Tooltip title="View">
            <Button
              icon={<FiEye />}
              onClick={() => navigate(`/purchase-return/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Print">
            <PurchaseReturnPrint returnData={record} buttonType="true" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // const suppliers = [
  //   { id: 1, name: "Rangpur Textiles Ltd." },
  //   { id: 2, name: "North Fabrics Co." },
  //   { id: 3, name: "Alpha Garments Supply" },
  //   { id: 4, name: "BlueThread Suppliers" },
  //   { id: 5, name: "Ocean Mills" },
  //   { id: 6, name: "Sunrise Yarn Traders" },
  //   { id: 7, name: "Metro Fabric House" },
  //   { id: 8, name: "Green Stitch Ltd." },
  //   { id: 9, name: "Prime Supply Co." },
  //   { id: 10, name: "Elite Textile Traders" },
  // ];

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
  //     <div className="flex gap-4">
  //       <div className="mb-5">
  //         <div className="flex flex-wrap gap-6">
  //           {/* Category */}
  //           <div className="flex-1 min-w-[150px]">
  //             <label className="block text-gray-900 text-xs mb-1 font-medium">
  //               Supplier
  //             </label>
  //             <Input
  //               placeholder="Search category..."
  //               prefix={<Search className="w-4 h-4 text-gray-400" />}
  //               onChange={(e) => debounceSupplierSearch(e.target.value)}
  //               className="mb-3 mt-2"
  //               size="small"
  //               allowClear
  //             />
  //             <div className="max-h-[150px] overflow-y-auto">
  //               {suppliers?.length === 0 ? (
  //                 <p className="text-xs text-red-500">No categories found</p>
  //               ) : (
  //                 <div className="max-h-[250px] overflow-y-auto">
  //                   <Checkbox.Group
  //                     options={suppliers
  //                       .filter((cat: any) => cat?.name)
  //                       .map((cat: any) => ({
  //                         label: cat?.name,
  //                         value: cat?.id,
  //                       }))}
  //                     value={filteredSupplier}
  //                     onChange={(values) =>
  //                       setFilteredSupplier(values as string[])
  //                     }
  //                     className="flex flex-col gap-2"
  //                   />
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="mb-5">
  //         <div className="flex flex-wrap gap-6">
  //           {/* Category */}
  //           <div className="flex-1 min-w-[150px]">
  //             <label className="block text-gray-900 text-xs mb-1 font-medium">
  //               Category
  //             </label>
  //             <Input
  //               placeholder="Search category..."
  //               prefix={<Search className="w-4 h-4 text-gray-400" />}
  //               onChange={(e) => debounceCategorySearch(e.target.value)}
  //               className="mb-3 mt-2"
  //               size="small"
  //               allowClear
  //             />
  //             <div className="max-h-[150px] overflow-y-auto">
  //               {categoriesData?.data?.length === 0 ? (
  //                 <p className="text-xs text-red-500">No categories found</p>
  //               ) : (
  //                 <div className="max-h-[250px] overflow-y-auto">
  //                   <Checkbox.Group
  //                     options={categoriesData?.data
  //                       .filter((cat: any) => cat?.name)
  //                       .map((cat: any) => ({
  //                         label: cat?.name,
  //                         value: String(cat?.id), // ✅ cast to string
  //                       }))}
  //                     value={filteredCategory}
  //                     onChange={
  //                       (values) => setFilteredCategory(values.map(String)) // ✅ ensure string[]
  //                     }
  //                   />
  //                 </div>
  //               )}
  //             </div>
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
  // Map UI column keys to fullData keys
  const keyMap: Record<string, string> = {
    SL: "index",
    returnId: "returnId",
    materialName: "materialName",
    purchaseType: "materialType",
    supplier: "supplier",
    totalItems: "totalItems",
    totalQty: "totalQty",
    totalAmount: "totalAmount",
    date: "returnDate",
    createdBy: "createdBy",
    createdAt: "createdAt",
    action: "action",
  };

  // Generate printableData dynamically
  const printableData = returns.map((returnItem: any, index: number) => {
    const returnDate = returnItem.returnDate
      ? new Date(returnItem.returnDate)
      : null;
    const createdAt = returnItem.createdAt
      ? new Date(returnItem.createdAt)
      : null;

    const formatDateTime = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const fullData: Record<string, any> = {
      index: index + 1,
      returnId: returnItem.returnId || "-",
      materialName: returnItem.items?.[0]?.materialName || "-",
      materialType: returnItem.purchase?.purchaseType
        ? returnItem.purchase.purchaseType.charAt(0).toUpperCase() +
          returnItem.purchase.purchaseType.slice(1).toLowerCase()
        : "-",
      supplier: returnItem.supplierName || "-",
      totalItems: returnItem.totalItems || 0,
      totalQty: returnItem.totalQty || 0,
      totalAmount: returnItem.returnAmount
        ? `${returnItem.returnAmount.toFixed(2)}/-`
        : "0.00/-",
      returnDate: returnDate ? formatDateTime(returnDate) : "-",
      createdAt: createdAt ? formatDateTime(createdAt) : "-",
      createdBy: returnItem.createdBy || "-",
    };

    // Filter only selected keys
    const filteredData: Record<string, any> = {};
    selectedColumnKeys.forEach((key: string) => {
      const realKey = keyMap[key] || key; // map SL → index
      filteredData[key] = fullData[realKey] ?? "-";
    });

    return filteredData;
  });

  return (
    <div>
      <PageMeta
        title="Purchase Returns | ERP"
        description="Manage Purchase Returns"
      />
      <div className="">
        <PageHeader
          title="Purchase Returns"
          subtitle="View and manage all purchase returns"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Purchase Returns" },
          ]}
          extra={
            <CustomActionButton
              disabled={returns.length === 0 ? true : false}
              onClick={() => {
                refetch();
              }}
              text="Refresh"
              icon={<RefreshCcw />}
              type="primary"
            />
          }
        />

        {/* Filters */}

        <div className="flex justify-between flex-wrap mb-4  gap-4">
          <Input
            placeholder="Search by Return ID, Purchase ID, Supplier..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => debounceSearch(e.target.value)}
            className="max-w-md"
            size="middle"
            allowClear
          />

          <div className="flex gap-3">
            <PageListPrint tableData={printableData} fileName="Return-list" />

            <FilterColumn
              tableName="purchase_return_table"
              columns={columns}
              onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
            />
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
          // columns={columns}
          columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
          data={returns}
          rowKey="id"
          isPaginate={meta?.total > 10}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={meta?.total || 0}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
};

export default PurchaseReturnList;
