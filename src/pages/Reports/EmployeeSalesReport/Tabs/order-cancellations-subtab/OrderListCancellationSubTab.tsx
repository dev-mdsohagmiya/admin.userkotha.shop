import { useRef, useState } from "react";
import { Input } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables/index.ts";
import { debounce } from "../../../../../utils/debounce.ts";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker.tsx";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint.tsx";
import OrderListCancellationDetailsModal from "../../../../../components/common/Modals/Report/EmployeeSalesReport/OrderListCancellationDetailsModal.tsx";
import { useGetEmployeeOrderCancellationsListReportQuery } from "../../../../../redux/features/report/reportApi.ts";

const OrderListCancellationSubTab = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value);
  };

  const { data, isLoading, isFetching } =
    useGetEmployeeOrderCancellationsListReportQuery([
      { name: "page", value: page },
      { name: "limit", value: limit },
      ...(searchText ? [{ name: "search", value: searchText }] : []),
      ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
      ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
    ]);

  const p = data as any;
  const rows: any[] = Array.isArray(p?.data)
    ? p.data
    : Array.isArray(p?.data?.data)
      ? p.data.data
      : [];
  const meta = p?.meta || { total: 0 };
  const openDetails = (record: any) => {
    if (!record?.employeeId) return;
    setSelectedEmployee({
      id: record.employeeId,
      name: record.employeeName || "Employee",
    });
    setDetailsOpen(true);
  };

  const columns = [
    {
      title: "Employee",
      key: "employee",
      width: 320,
      fixed: "left" as const,
      render: (_: unknown, record: any) => (
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {record.employeeName || "—"}
        </span>
      ),
    },
    {
      title: "Cancelled",
      key: "cancelled",
      align: "center" as const,
      width: 140,
      render: (_: unknown, record: any) => {
        const n = Number(record.cancelled ?? 0);
        return (
          <span
            className={
              n > 0
                ? "cursor-pointer font-bold tabular-nums text-red-500 hover:underline"
                : "font-bold tabular-nums text-red-500"
            }
            onClick={(e) => {
              e.stopPropagation();
              if (n > 0) openDetails(record);
            }}
          >
            {n.toLocaleString()}
          </span>
        );
      },
    },
  ];

  const printableData = rows.map((item: any) => ({
    Employee: item.employeeName,
    Cancelled: item.cancelled ?? 0,
  }));


  return (
    <div className="">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          prefix={<Search className="h-4 w-4 text-gray-400" />}
          placeholder="Search employee..."
          onChange={handleSearch}
          className="max-w-xs rounded-lg"
          allowClear
        />
        <div className="flex items-center gap-3">
          <CustomDatePicker
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
            selectedData={dateRange}
          />
          <PageListPrint
            tableData={printableData}
            fileName="Employee_Order_Cancellations_List"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading || isFetching}
        rowKey={(r: any) => r?.employeeId || r?.employeeName}
        isPaginate={(meta?.total || 0) > limit}
        total={meta?.total || rows.length}
        currentPage={page}
        limit={limit}
        setCurrentPage={setPage}
        setLimit={setLimit}
        showSizeChanger
        scroll={{ x: 480 }}
      />

      <OrderListCancellationDetailsModal
        open={detailsOpen}
        setOpen={setDetailsOpen}
        employeeId={selectedEmployee?.id || null}
        employeeName={selectedEmployee?.name || null}
        dateRange={dateRange}
      />
    </div>
  );
};

export default OrderListCancellationSubTab;
