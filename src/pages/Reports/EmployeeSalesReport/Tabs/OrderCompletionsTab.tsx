import { useMemo, useRef, useState } from "react";
import { Input } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../components/common/Tables";
import { debounce } from "../../../../utils/debounce";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker.tsx";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import OrderCompletionsDetailsModal, {
  type OrderCompletionsDetailCategory,
} from "../../../../components/common/Modals/Report/EmployeeSalesReport/OrderCompletionsDetailsModal";
import { useGetEmployeeOrderCompletionsReportQuery } from "../../../../redux/features/report/reportApi";

type CompletionRow = {
  employeeId: string;
  employeeName: string;
  total: number;
  processing: number;
  noResponse: number;
  onHold: number;
  advancePayment: number;
  incomplete: number;
  goodNoResponse: number;
};

interface OrderCompletionsApiPayload {
  data?: CompletionRow[];
  meta?: { total?: number; page?: number; limit?: number };
  summary?: {
    total?: number;
    processing?: number;
    noResponse?: number;
    onHold?: number;
    advancePayment?: number;
    incomplete?: number;
    goodNoResponse?: number;
  };
}

type DateRangeState = [string | null, string | null];

function metricCell(value: number, highlightPositive: boolean) {
  const n = Number(value ?? 0);
  const active = highlightPositive && n > 0;
  return (
    <span
      className={
        active
          ? "font-medium text-primary tabular-nums"
          : "tabular-nums text-gray-700 dark:text-gray-300"
      }
    >
      {n.toLocaleString()}
    </span>
  );
}

/** First metric column on the row with count &gt; 0 → API fromCategory; else processing. */
function categoryFromRow(r: CompletionRow): OrderCompletionsDetailCategory {
  if (Number(r.processing) > 0) return "processing";
  if (Number(r.noResponse) > 0) return "no_response";
  if (Number(r.onHold) > 0) return "on_hold";
  if (Number(r.advancePayment) > 0) return "adv_payment";
  if (Number(r.incomplete) > 0) return "incomplete";
  if (Number(r.goodNoResponse) > 0) return "good_no_response";
  return "processing";
}

export default function OrderCompletionsTab() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState([null, null] as DateRangeState);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailEmployeeId, setDetailEmployeeId] = useState<string | null>(null);
  const [detailEmployeeName, setDetailEmployeeName] = useState<string | null>(
    null,
  );
  const [detailInitialCategory, setDetailInitialCategory] =
    useState<OrderCompletionsDetailCategory>("processing");

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: { target: HTMLInputElement }) => {
    debounceSearch(e.target.value);
  };

  const { data, isLoading, isFetching } = useGetEmployeeOrderCompletionsReportQuery(
    [
      { name: "page", value: page },
      { name: "limit", value: limit },
      ...(searchText ? [{ name: "search", value: searchText }] : []),
      ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
      ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
    ],
  );

  const { rows, meta, summary } = useMemo(() => {
    const payload = data as OrderCompletionsApiPayload | undefined;
    return {
      rows: Array.isArray(payload?.data) ? payload.data : [],
      meta: payload?.meta ?? {},
      summary: payload?.summary,
    };
  }, [data]);

  const totalRows = Number(meta.total ?? rows.length);

  const columns = useMemo(
    () => [
      {
        title: "Employee",
        key: "employee",
        width: 220,
        fixed: "left" as const,
        render: (_: unknown, record: CompletionRow) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {record.employeeName || "—"}
          </span>
        ),
      },
      {
        title: "Total",
        key: "total",
        align: "center" as const,
        width: 100,
        render: (_: unknown, record: CompletionRow) =>
          metricCell(record.total, true),
      },
      {
        title: "Processing",
        key: "processing",
        align: "center" as const,
        width: 110,
        render: (_: unknown, record: CompletionRow) =>
          metricCell(record.processing, true),
      },
      {
        title: "No Response",
        key: "noResponse",
        align: "center" as const,
        width: 120,
        render: (_: unknown, record: CompletionRow) =>
          metricCell(record.noResponse, false),
      },
      {
        title: "On Hold",
        key: "onHold",
        align: "center" as const,
        width: 100,
        render: (_: unknown, record: CompletionRow) =>
          metricCell(record.onHold, false),
      },
      {
        title: "Adv. Payment",
        key: "advancePayment",
        align: "center" as const,
        width: 120,
        render: (_: unknown, record: CompletionRow) =>
          metricCell(record.advancePayment, false),
      },
      {
        title: "Incomplete",
        key: "incomplete",
        align: "center" as const,
        width: 110,
        render: (_: unknown, record: CompletionRow) =>
          metricCell(record.incomplete, true),
      },
      {
        title: "Good No Resp.",
        key: "goodNoResponse",
        align: "center" as const,
        width: 130,
        render: (_: unknown, record: CompletionRow) =>
          metricCell(record.goodNoResponse, true),
      },
    ],
    [],
  );

  const printableData = useMemo(
    () =>
      rows.map((item) => ({
        Employee: item.employeeName,
        Total: item.total,
        Processing: item.processing,
        "No Response": item.noResponse,
        "On Hold": item.onHold,
        "Adv. Payment": item.advancePayment,
        Incomplete: item.incomplete,
        "Good No Resp.": item.goodNoResponse,
      })),
    [rows],
  );

  const summaryItems = [
    { label: "Total", value: summary?.total },
    { label: "Processing", value: summary?.processing },
    { label: "No response", value: summary?.noResponse },
    { label: "On hold", value: summary?.onHold },
    { label: "Adv. payment", value: summary?.advancePayment },
    { label: "Incomplete", value: summary?.incomplete },
    { label: "Good no resp.", value: summary?.goodNoResponse },
  ].filter((x) => x.value != null);

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Order Completions Report
        </h2>
      </div>

      {summaryItems.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900/40">
          {summaryItems.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
                {Number(value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <Input
          prefix={<Search className="h-4 w-4 text-gray-400" />}
          placeholder="Search by employee name..."
          onChange={handleSearch}
          className="max-w-md rounded-md"
          allowClear
        />
        <div className="flex flex-wrap items-center gap-4">
        <div>
        <CustomDatePicker
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
            selectedData={dateRange}
          />
        </div>
          <PageListPrint
            tableData={printableData}
            fileName="Order_Completions_Report"
          />
        </div>
      </div>

      <div className="mt-5">
        <DataTable
          loading={isLoading || isFetching}
          columns={columns}
          data={rows}
          rowKey="employeeId"
          isPaginate={totalRows > limit}
          total={totalRows}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger
          scroll={{ x: 1100 }}
          onRow={(record: CompletionRow) => ({
            onClick: () => {
              const r = record as CompletionRow & {
                employee_id?: string;
                employee_name?: string;
              };
              setDetailEmployeeId(r.employeeId ?? r.employee_id ?? null);
              setDetailEmployeeName(r.employeeName ?? r.employee_name ?? null);
              setDetailInitialCategory(categoryFromRow(record));
              setDetailsOpen(true);
            },
            className: "cursor-pointer",
          })}
        />
      </div>

      <OrderCompletionsDetailsModal
        open={detailsOpen}
        setOpen={setDetailsOpen}
        employeeId={detailEmployeeId}
        employeeName={detailEmployeeName}
        initialFromCategory={detailInitialCategory}
        dateRange={dateRange}
      />
    </div>
  );
}
