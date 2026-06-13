import { useRef, useState, useMemo } from "react";
import { Input, Select, Card, Tooltip } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables/index.ts";
import { debounce } from "../../../../../utils/debounce.ts";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker.tsx";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint.tsx";
import { useGetEmployeeOrderCancellationsReportQuery } from "../../../../../redux/features/report/reportApi.ts";
import OrderCancellationsDetailsModal from "../../../../../components/common/Modals/Report/EmployeeSalesReport/OrderCancellationsDetailsModal.tsx";

const WebOrderCancellationSubTab = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const [viewBy, setViewBy] = useState<"reason" | "previous_status">("reason");
  const [dateFilterType, setDateFilterType] = useState<
    "cancellation" | "order_date"
  >("cancellation");

  const [orderModalOpen, setOrderModalOpen] = useState(false);
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

  const handleOpenModal = (record: any) => {
    setSelectedEmployee({
      id: record.employeeId,
      name: record.employeeName,
    });
    setOrderModalOpen(true);
  };

  const {
    data: reportResponse,
    isLoading,
    isFetching,
  } = useGetEmployeeOrderCancellationsReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    { name: "viewBy", value: viewBy },
    { name: "dateFilterType", value: dateFilterType },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const reportData = reportResponse?.data;
  const rows = reportData?.rows || [];
  const dynamicColsData = useMemo(
    () => reportData?.columns || [],
    [reportData],
  );
  const summary = reportResponse?.summary;
  const meta = reportResponse?.meta || { total: 0 };

  const allColumns = useMemo(() => {
    const baseCols = [
      {
        title: "Employee",
        key: "employee",
        width: 280,
        fixed: "left" as const,
        render: (_: any, record: any) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {record.employeeName}
            </span>
          </div>
        ),
      },
      {
        title: "Total Cancelled",
        key: "totalCancellations",
        align: "center" as const,
        width: 150,
        render: (_count: number, record: any) => (
          <span
            className="font-bold text-red-500 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(record);
            }}
          >
            {record.totalCancellations || 0}
          </span>
        ),
      },
    ];

    const dynamicCols = dynamicColsData.map((col: any) => ({
      title: (
        <Tooltip title={col.name}>
          <span className="truncate max-w-[150px] inline-block">
            {col.name}
          </span>
        </Tooltip>
      ),
      key: col.id,
      align: "center" as const,
      width: 150,
      render: (_: any, record: any) => {
        const item = record.breakdown?.find((b: any) => b.columnId === col.id);
        return (
          <span
            className={
              item?.count > 0 ? "font-medium text-gray-800" : "text-gray-300"
            }
          >
            {item?.count || 0}
          </span>
        );
      },
    }));

    return [...baseCols, ...dynamicCols];
  }, [dynamicColsData]);

  const columns = allColumns;

  const printableData = rows.map((item: any) => ({
    Employee: item.employeeName,
    "Total Cancellations": item.totalCancellations,
    ...(item.breakdown || []).reduce((acc: any, b: any) => {
      const colName =
        dynamicColsData.find((c: any) => c.id === b.columnId)?.name ||
        b.columnId;
      acc[colName] = b.count;
      return acc;
    }, {}),
  }));

  const summaryCardShell =
    "h-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-shadow duration-200 hover:shadow dark:border-slate-700/80 dark:bg-slate-900/40";

  const listScrollClass =
    "mt-3 min-h-[92px] max-h-[124px] space-y-0 overflow-y-auto overscroll-contain pr-1";

  return (
    <div className="">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card bordered={false} className={summaryCardShell}>
          <div className="flex min-h-[136px] min-w-0 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Total cancelled
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {summary?.totalCancelled ?? 0}
            </p>
            <p className="mt-2 border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Based on filters and selected dates
            </p>
          </div>
        </Card>

        <Card bordered={false} className={summaryCardShell}>
          <div className="flex min-h-[136px] min-w-0 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Top reason
            </p>
            <p
              className="mt-2 text-base font-semibold leading-snug text-slate-900 dark:text-white line-clamp-2"
              title={summary?.topReason?.name || undefined}
            >
              {summary?.topReason?.name}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                Count
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-800 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100">
                {summary?.topReason?.count ?? 0}
              </span>
            </div>
          </div>
        </Card>

        <Card bordered={false} className={summaryCardShell}>
          <div className="flex min-h-[136px] min-w-0 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Top employees
            </p>
            <div className={listScrollClass}>
              {(summary?.topEmployees || []).length > 0 ? (
                summary.topEmployees.map((emp: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 first:pt-0 last:border-0 last:pb-0 dark:border-slate-700/60"
                  >
                    <span className="min-w-0 truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">
                      {emp.name}
                    </span>
                    <span className="inline-flex min-w-[2.25rem] shrink-0 justify-end text-right text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">
                      {emp.count}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[13px] text-slate-400 dark:text-slate-500">
                  No data
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card bordered={false} className={summaryCardShell}>
          <div className="flex min-h-[136px] min-w-0 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Top previous status
            </p>
            <div className={listScrollClass}>
              {(summary?.topPreviousStatuses || []).length > 0 ? (
                summary.topPreviousStatuses.map((status: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 first:pt-0 last:border-0 last:pb-0 dark:border-slate-700/60"
                  >
                    <span className="min-w-0 truncate text-[13px] font-medium uppercase tracking-wide text-slate-800 dark:text-slate-100">
                      {status.name}
                    </span>
                    <span className="inline-flex min-w-[2.25rem] shrink-0 justify-end text-right text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">
                      {status.count}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[13px] text-slate-400 dark:text-slate-500">
                  No data
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Input
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              placeholder="Search employee name..."
              onChange={handleSearch}
              className="max-w-xs rounded-lg"
              allowClear
            />
            <Select
              value={viewBy}
              onChange={setViewBy}
              className="w-40"
              placeholder="View By"
              options={[
                { label: "By Reason", value: "reason" },
                { label: "By Prev Status", value: "previous_status" },
              ]}
            />
            <Select
              value={dateFilterType}
              onChange={setDateFilterType}
              className="w-44"
              placeholder="Date Filter Type"
              options={[
                { label: "Cancellation Date", value: "cancellation" },
                { label: "Order Date", value: "order_date" },
              ]}
            />
          </div>

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
              fileName="Order_Cancellations_Report"
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <DataTable
          loading={isLoading || isFetching}
          columns={columns}
          data={rows}
          rowKey="employeeId"
          isPaginate={meta?.total > limit}
          total={meta?.total || 0}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
          scroll={{ x: 1200 }}
        />
      </div>

      <OrderCancellationsDetailsModal
        open={orderModalOpen}
        setOpen={setOrderModalOpen}
        employeeId={selectedEmployee?.id || null}
        employeeName={selectedEmployee?.name || null}
        dateRange={dateRange}
      />
    </div>
  );
};

export default WebOrderCancellationSubTab;
