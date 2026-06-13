import { useState } from "react";
import { Input } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables/index.ts";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint.tsx";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker.tsx";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn.tsx";
import CurrencyIcon from "../../../../../components/common/CurrencyIcon";
import { useGetEmployeeProductReportQuery } from "../../../../../redux/features/report/reportApi.ts";

const ProductReportSubTab = () => {
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [employeeId, setEmployeeId] = useState("");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const {
    data: productReportResponse,
    isLoading: isProductLoading,
    isFetching: isProductFetching,
  } = useGetEmployeeProductReportQuery(
    [
      { name: "employeeId", value: employeeId.trim() },
      { name: "page", value: page },
      { name: "limit", value: limit },
      ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
      ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
    ],
    { skip: !employeeId.trim() },
  );

  // Supports both shapes:
  // 1) { employee, meta, data } and 2) { data: { employee, meta, data } }
  const productPayload =
    Array.isArray(productReportResponse?.data?.data) ||
    productReportResponse?.data?.employee ||
    productReportResponse?.data?.meta
      ? productReportResponse?.data
      : productReportResponse;
  const productRows = Array.isArray(productPayload?.data) ? productPayload.data : [];
  const productMeta = productPayload?.meta || {};
  const reportEmployee = productPayload?.employee;

  const allColumns = [
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Code", dataIndex: "code", key: "code", align: "center" as const },
    {
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center" as const,
    },
    {
      title: "Avg Price",
      dataIndex: "avgPrice",
      key: "avgPrice",
      align: "right" as const,
      render: (value: number) => (
        <span className="flex items-center justify-end gap-1">
          <CurrencyIcon size={12} />
          {Math.round(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Total Sales",
      dataIndex: "totalSales",
      key: "totalSales",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-semibold text-green-600 flex items-center justify-end gap-1">
          <CurrencyIcon size={12} />
          {(value || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  const columns = allColumns.filter(
    (col) => selectedColumnKeys.length === 0 || selectedColumnKeys.includes(col.key),
  );

  const printableData = productRows.map((item: any) => ({
    "Product Name": item.productName,
    Code: item.code,
    "Total Quantity": item.totalQuantity,
    "Avg Price": item.avgPrice,
    "Total Sales": item.totalSales,
  }));

  return (
    <div className="">
      <div className="rounded-lg">
        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[400px] shrink-0">
            <Input
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setPage(1);
              }}
              placeholder="Employee ID  , name "
              className="w-full"
              allowClear
            />
            </div>
          </div>
          <div className="flex gap-3">
            <CustomDatePicker
              onChange={(dates) => {
                setDateRange(dates);
                setPage(1);
              }}
              selectedData={dateRange}
            />
            <PageListPrint
              tableData={printableData}
              fileName={`${reportEmployee?.name || "Employee"}_Product_Report`}
            />
            <FilterColumn
              tableName="employee_product_report"
              columns={allColumns.map((col) => ({
                key: col.key,
                title: col.title,
              }))}
              onChangeSelectedKeys={setSelectedColumnKeys}
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        {reportEmployee?.name && (
          <div className="mb-2 text-sm text-gray-600">
            Employee: <span className="font-semibold text-gray-800">{reportEmployee.name}</span>
          </div>
        )}
        <DataTable
          loading={isProductLoading || isProductFetching}
          columns={columns}
          data={productRows}
          rowKey={(record: any) => `${record?.code || "NA"}_${record?.productName || "item"}`}
          isPaginate={(productMeta?.total || 0) > limit}
          total={productMeta?.total || 0}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
        />
      </div>
    </div>
  );
};

export default ProductReportSubTab;
