import { useRef, useState } from "react";
import { Input, Table } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../components/common/Tables/index.ts";
import FilterColumn from "../../../../components/common/FilterColumn/FilterColumn.tsx";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint.tsx";
import { debounce } from "../../../../utils/debounce.ts";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker.tsx";
import { useGetEmployeePerformanceReportQuery } from "../../../../redux/features/report/reportApi.ts";
import CurrencyIcon from "../../../../components/common/CurrencyIcon";
import EmployeeOrdersModal from "../../../../components/common/Modals/Report/EmployeeSalesReport/EmployeeOrdersModal.tsx";
import PerformanceEmployeeCancellationsModal from "../../../../components/common/Modals/Report/EmployeeSalesReport/PerformanceEmployeeCancellationsModal.tsx";

const PerformanceReport = () => {
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  // Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelEmployee, setCancelEmployee] = useState<{
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

  const handleOpenModal = (record: any) => {
    setSelectedEmployee({
      id: record.employeeId,
      name: record.employeeName,
    });
    setOrderModalOpen(true);
  };

  const handleOpenCancelledModal = (record: any) => {
    setCancelEmployee({
      id: record.employeeId,
      name: record.employeeName,
    });
    setCancelModalOpen(true);
  };

  const {
    data: performanceData,
    isLoading,
    isFetching,
  } = useGetEmployeePerformanceReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const employeePerformance = performanceData?.data || [];
  const summary = performanceData?.summary;
  const meta = performanceData?.meta;

  const allColumns = [
    {
      title: "Employee",
      key: "employee",
      width: 250,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {record.employeeName}
          </span>
        
        </div>
      ),
    },
    {
      title: "Total Approved",
      children: [
        {
          title: "Count",
          key: "totalApprovedCount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span
              className="font-bold cursor-pointer hover:text-primary hover:underline transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenModal(record);
              }}
            >
              {record.totalApproved?.count || 0}
            </span>
          ),
        },
        {
          title: "Amount",
          key: "totalApprovedAmount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span
              className="font-bold text-green-600 flex items-center justify-center gap-0.5 cursor-pointer hover:text-green-700 hover:underline transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenModal(record);
              }}
            >
              <CurrencyIcon size={12} />
              {(record.totalApproved?.amount || 0).toLocaleString()}
            </span>
          ),
        },
      ],
    },
    {
      title: "Approved from Web",
      children: [
        {
          title: "Count",
          key: "approvedWebCount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span>{record.approvedFromWeb?.count || 0}</span>
          ),
        },
        {
          title: "Amount",
          key: "approvedWebAmount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span className="font-semibold text-gray-700 flex items-center justify-center gap-0.5">
              <CurrencyIcon size={12} />
              {(record.approvedFromWeb?.amount || 0).toLocaleString()}
            </span>
          ),
        },
      ],
    },
    {
      title: "Cancelled",
      children: [
        {
          title: "Count",
          key: "cancelledCount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span className="text-red-500">{record.cancelled?.count || 0}</span>
          ),
        },
        {
          title: "Amount",
          key: "cancelledAmount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span className="text-red-500 font-semibold flex items-center justify-center gap-0.5">
              <CurrencyIcon size={12} />
              {(record.cancelled?.amount || 0).toLocaleString()}
            </span>
          ),
        },
      ],
    },
    {
      title: "Approved Outside Web",
      children: [
        {
          title: "Count",
          key: "approvedOutsideWebCount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span>{record.approvedOutsideWeb?.count || 0}</span>
          ),
        },
        {
          title: "Amount",
          key: "approvedOutsideWebAmount",
          align: "center" as const,
          render: (_: any, record: any) => (
            <span className="font-semibold text-gray-700 flex items-center justify-center gap-0.5">
              <CurrencyIcon size={12} />
              {(record.approvedOutsideWeb?.amount || 0).toLocaleString()}
            </span>
          ),
        },
      ],
    },
    {
      title: "Status",
      key: "status",
      align: "center" as const,
      width: 150,
      render: (_: any, record: any) => {
        const breakdown = record.statusBreakdown || [];

        if (breakdown.length === 0)
          return <span className="text-gray-400 text-xs">-</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-gray-800">
              {breakdown.length} status
            </span>
            {breakdown.map((item: any, idx: number) => (
              <span key={idx} className="text-[10px] text-gray-500">
                {item.status}: {item.count}
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  const filterableColumns = [
    { key: "employee", title: "Employee" },
    { key: "totalApprovedCount", title: "Total Approved Count" },
    { key: "totalApprovedAmount", title: "Total Approved Amount" },
    { key: "approvedWebCount", title: "Approved from Web Count" },
    { key: "approvedWebAmount", title: "Approved from Web Amount" },
    { key: "cancelledCount", title: "Cancelled Count" },
    { key: "cancelledAmount", title: "Cancelled Amount" },
    { key: "approvedOutsideWebCount", title: "Approved Outside Web Count" },
    { key: "approvedOutsideWebAmount", title: "Approved Outside Web Amount" },
    { key: "status", title: "Status" },
  ];

  const columns = allColumns
    .map((col) => {
      if (col.children) {
        const filteredChildren = col.children.filter(
          (child: any) =>
            selectedColumnKeys.length === 0 ||
            selectedColumnKeys.includes(child.key),
        );
        if (filteredChildren.length > 0) {
          return { ...col, children: filteredChildren };
        }
        return null; // Remove parent if no children match
      }
      return selectedColumnKeys.length === 0 ||
        selectedColumnKeys.includes(col.key || "")
        ? col
        : null;
    })
    .filter(Boolean) as any[];

  const printableData = employeePerformance.map((item: any) => ({
    Employee: item.employeeName,
    "Approved Count": item.totalApproved?.count || 0,
    "Approved Amount": item.totalApproved?.amount || 0,
    "Cancelled Count": item.cancelled?.count || 0,
    Status: (item.statusBreakdown || [])
      .map((s: any) => `${s.status}: ${s.count}`)
      .join(", "),
  }));

  return (
    <div className="">
      <div className="rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Employee Performance Report
          </h2>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search by name, email, or custom ID..."
            onChange={handleSearch}
            className="max-w-md rounded-md"
            allowClear
          />
          <div className="flex items-center gap-4">
            <CustomDatePicker
              onChange={(dates) => {
                setDateRange(dates);
                setPage(1);
              }}
              selectedData={dateRange}
            />
            <PageListPrint
              tableData={printableData}
              fileName="Employee_Performance_Report"
            />
            <FilterColumn
              tableName="employee_performance_report"
              columns={filterableColumns}
              onChangeSelectedKeys={setSelectedColumnKeys}
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <DataTable
          loading={isLoading || isFetching}
          columns={columns}
          data={employeePerformance}
          rowKey="employeeId"
          isPaginate={meta?.total > limit}
          total={meta?.total || 0}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
          onRow={(record: any) => ({
            onClick: () => handleOpenCancelledModal(record),
            className: "cursor-pointer",
          })}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50/50 font-bold border-t">
                {/* Employee Column Summary */}
                <Table.Summary.Cell index={0} className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="text-gray-800 uppercase text-xs tracking-wider">
                      Total Employees: {summary?.totalEmployees || 0}
                    </span>
                  </div>
                </Table.Summary.Cell>

                {/* Total Approved Summary */}
                <Table.Summary.Cell index={1} align="center">
                  {summary?.totalApproved?.count || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">
                  <div className="flex items-center justify-center gap-0.5 text-green-600">
                    <CurrencyIcon size={12} />
                    {(summary?.totalApproved?.amount || 0).toLocaleString()}
                  </div>
                </Table.Summary.Cell>

                {/* Approved Web Summary */}
                <Table.Summary.Cell index={3} align="center">
                  {summary?.approvedFromWeb?.count || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  <div className="flex items-center justify-center gap-0.5 text-gray-800">
                    <CurrencyIcon size={12} />
                    {(summary?.approvedFromWeb?.amount || 0).toLocaleString()}
                  </div>
                </Table.Summary.Cell>

                {/* Cancelled Summary */}
                <Table.Summary.Cell index={5} align="center">
                  <span className="text-red-500">
                    {summary?.cancelled?.count || 0}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="center">
                  <div className="flex items-center justify-center gap-0.5 text-red-500">
                    <CurrencyIcon size={12} />
                    {(summary?.cancelled?.amount || 0).toLocaleString()}
                  </div>
                </Table.Summary.Cell>

                {/* Outside Web Summary */}
                <Table.Summary.Cell index={7} align="center">
                  {summary?.approvedOutsideWeb?.count || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="center">
                  <div className="flex items-center justify-center gap-0.5 text-gray-800">
                    <CurrencyIcon size={12} />
                    {(summary?.approvedOutsideWeb?.amount || 0).toLocaleString()}
                  </div>
                </Table.Summary.Cell>

                {/* Status Column Summary */}
                <Table.Summary.Cell index={9} align="center">
                  <span className="text-gray-400">-</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>

      {/* Employee Order Details Modal */}
      <EmployeeOrdersModal
        open={orderModalOpen}
        setOpen={setOrderModalOpen}
        employeeId={selectedEmployee?.id || null}
        employeeName={selectedEmployee?.name || null}
        dateRange={dateRange}
      />
      <PerformanceEmployeeCancellationsModal
        open={cancelModalOpen}
        setOpen={setCancelModalOpen}
        employeeId={cancelEmployee?.id || null}
        employeeName={cancelEmployee?.name || null}
        dateRange={dateRange}
      />
    </div>
  );
};

export default PerformanceReport;
