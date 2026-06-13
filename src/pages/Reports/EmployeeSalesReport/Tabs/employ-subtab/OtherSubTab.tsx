import { useRef, useState } from "react";
import { Input, Table } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { debounce } from "../../../../../utils/debounce";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker.tsx";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn.tsx";
import { useGetEmployeeOtherReportQuery } from "../../../../../redux/features/report/reportApi.ts";
import CurrencyIcon from "../../../../../components/common/CurrencyIcon";
import EmployeeOrdersModal from "../../../../../components/common/Modals/Report/EmployeeSalesReport/EmployeeOrdersModal.tsx";

const OtherSubTab = () => {
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  // Modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Debounced search
  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value);
  };

  const {
    data: otherEmployeeReportData,
    isLoading,
    isFetching,
  } = useGetEmployeeOtherReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const otherEmployeeReport = otherEmployeeReportData?.data || [];
  const summary = otherEmployeeReportData?.summary;
  const meta = otherEmployeeReportData?.meta;

  const allColumns = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 200,
      render: (text: string) => (
        <span className="font-semibold text-primary/80 group-hover:text-primary transition-colors">
          {text}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "center" as const,
      sorter: (a: any, b: any) => a.totalOrders - b.totalOrders,
      render: (count: number) => (
        <span
          className={
            count > 0
              ? "text-primary font-medium bg-primary/5 px-3 py-1 rounded-full text-xs"
              : "text-gray-400"
          }
        >
          {count}
        </span>
      ),
    },
    {
      title: "Total Money",
      dataIndex: "totalSales",
      key: "totalSales",
      align: "center" as const,
      render: (amount: number) => (
        <span
          className={
            amount > 0
              ? "text-primary font-semibold flex items-center justify-center gap-1"
              : "text-primary/50 flex items-center justify-center gap-1"
          }
        >
          <CurrencyIcon size={12} />
          {amount?.toLocaleString() || 0}
        </span>
      ),
      sorter: (a: any, b: any) => a.totalSales - b.totalSales,
    },
    {
      title: "Avg Money",
      dataIndex: "avgSales",
      key: "avgSales",
      align: "center" as const,
      render: (amount: number) => (
        <span
          className={
            amount > 0
              ? "text-gray-800 font-semibold flex items-center justify-center gap-1"
              : "text-gray-400 flex items-center justify-center gap-1"
          }
        >
          <CurrencyIcon size={12} />
          {Math.round(amount || 0)?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Cross Sale",
      dataIndex: "crossSaleCount",
      key: "crossSaleCount",
      align: "center" as const,
      render: (count: number, record: any) => (
        <div className="flex flex-col items-center">
          <span
            className={count > 0 ? "font-bold text-gray-800" : "text-gray-400"}
          >
            {count}
          </span>
          <span className="text-[10px] text-gray-400 italic">
            ({record.crossSalePercentage || 0}%)
          </span>
        </div>
      ),
    },
  ];

  const columns = allColumns.filter(
    (col) =>
      selectedColumnKeys.length === 0 || selectedColumnKeys.includes(col.key),
  );

  const printableData = otherEmployeeReport.map((item: any) => ({
    Employee: item.employeeName,
    Total: item.totalOrders,
    "Total Money": item.totalSales,
    "Avg Money": item.avgSales,
    "Cross Sale": `${item.crossSaleCount} (${item.crossSalePercentage}%)`,
  }));

  return (
    <div className="">
      <div className="rounded-lg">
        {/* Search & Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search employees..."
            onChange={handleSearch}
            className="max-w-md rounded-md"
            allowClear
          />
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
              fileName="Employee_Other_Report"
            />
            <FilterColumn
              tableName="employee_other_report"
              columns={allColumns.map((col) => ({
                key: col.key,
                title: col.title,
              }))}
              onChangeSelectedKeys={setSelectedColumnKeys}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg mt-5">
        <DataTable
          loading={isLoading || isFetching}
          columns={columns}
          data={otherEmployeeReport}
          rowKey="employeeId"
          isPaginate={otherEmployeeReportData?.meta?.total > 10}
          total={meta?.total || 0}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
          onRow={(record: any) => ({
            onClick: () => {
              setSelectedEmployee({
                id: record.employeeId,
                name: record.employeeName,
              });
              setOrderModalOpen(true);
            },
            className: "cursor-pointer transition-all hover:bg-primary/5",
          })}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50/50 font-semibold border-t">
                {columns.map((col, index) => {
                  let content: React.ReactNode = null;
                  let align: "left" | "center" | "right" = "left";
                  let className = "py-3 px-4";

                  switch (col.key) {
                    case "employeeName":
                      content = "Total";
                      className += " text-gray-800";
                      break;
                    case "totalOrders":
                      content = summary?.totalOrders || 0;
                      align = "center";
                      className += " text-primary font-bold";
                      break;
                    case "totalSales":
                      content = (
                        <span className="flex items-center justify-center gap-0.5">
                          <CurrencyIcon size={12} />
                          {summary?.totalSales?.toLocaleString() || 0}
                        </span>
                      );
                      align = "center";
                      className += " text-green-600 font-bold";
                      break;
                    case "avgSales":
                      content = (
                        <span className="flex items-center justify-center gap-0.5">
                          <CurrencyIcon size={12} />
                          {Math.round(summary?.avgSales || 0)?.toLocaleString()}
                        </span>
                      );
                      align = "center";
                      className += " text-gray-800 font-bold";
                      break;
                    case "crossSaleCount":
                      content = summary?.crossSaleCount || 0;
                      align = "center";
                      className += " text-gray-800 font-bold text-center";
                      break;
                    default:
                      content = null;
                      break;
                  }

                  return (
                    <Table.Summary.Cell
                      key={col.key}
                      index={index}
                      align={align}
                      className={className}
                    >
                      {content}
                    </Table.Summary.Cell>
                  );
                })}
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>

      <EmployeeOrdersModal
        open={orderModalOpen}
        setOpen={setOrderModalOpen}
        employeeId={selectedEmployee?.id || null}
        employeeName={selectedEmployee?.name || null}
        dateRange={dateRange}
      />
    </div>
  );
};

export default OtherSubTab;
