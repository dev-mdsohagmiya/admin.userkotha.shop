import { useRef, useState, useMemo, type ReactNode } from "react";
import { Input, Switch, Table, Tooltip } from "antd";
import { Search } from "lucide-react";
import PageHeaderCard from "../../../../components/common/Card/PageHeaderCard";
import { DataTable } from "../../../../components/common/Tables";
import { debounce } from "../../../../utils/debounce";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker.tsx";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { useGetEmployeeWorkLogReportQuery } from "../../../../redux/features/report/reportApi.ts";
import WorkLogDetailsModal from "../../../../components/common/Modals/Report/EmployeeSalesReport/WorkLogDetailsModal.tsx";

const WorkLogTab = () => {
  const [workLogDetailOpen, setWorkLogDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hideZeroActivity, setHideZeroActivity] = useState(false);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    [null, null]
  );

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value);
  };

  const { data: workLogResponse, isFetching, isLoading } = useGetEmployeeWorkLogReportQuery(
    [
      { name: "page", value: page },
      { name: "limit", value: limit },
      ...(searchText ? [{ name: "search", value: searchText }] : []),
      ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
      ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
    ],
  );

  const workLogList = useMemo((): any[] => {
    const p = workLogResponse as any;
    if (Array.isArray(p?.data)) return p.data;
    if (Array.isArray(p?.data?.data)) return p.data.data;
    return [];
  }, [workLogResponse]);

  const p = workLogResponse as any;
  const meta = p?.meta || p?.data?.meta || {};
  const summary = p?.summary || p?.data?.summary || null;

  const displayRows = useMemo(() => {
    if (!hideZeroActivity) return workLogList;
    return workLogList.filter((r) => Number(r?.totalActions ?? 0) > 0);
  }, [workLogList, hideZeroActivity]);

  const breakdownSpec = useMemo(() => {
    const order: string[] = [];
    const labelByKey = new Map<string, string>();
    for (const row of workLogList) {
      for (const item of row?.activityBreakdown || []) {
        const k = item?.key;
        if (k && !labelByKey.has(k)) {
          labelByKey.set(k, String(item?.label || k));
          order.push(k);
        }
      }
    }
    return order.map((key) => ({ key, label: labelByKey.get(key) || key }));
  }, [workLogList]);

  const allColumns = useMemo(() => {
    const baseCols = [
      {
        title: "Employee",
        key: "employee",
        width: 260,
        fixed: "left" as const,
        render: (_: unknown, record: any) => (
          <div className="min-w-0 py-0.5">
            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {record.employeeName || "—"}
            </div>
          </div>
        ),
      },
      {
        title: "Orders touched",
        dataIndex: "ordersTouched",
        key: "ordersTouched",
        align: "center" as const,
        width: 120,
        render: (val: number) => (
          <span className="tabular-nums font-medium text-gray-800 dark:text-gray-200">
            {val ?? 0}
          </span>
        ),
      },
      {
        title: "Orders updated",
        dataIndex: "ordersUpdated",
        key: "ordersUpdated",
        align: "center" as const,
        width: 120,
        render: (val: number) => (
          <span className="tabular-nums font-medium text-gray-800 dark:text-gray-200">
            {val ?? 0}
          </span>
        ),
      },
      {
        title: "Completed",
        dataIndex: "completed",
        key: "completed",
        align: "center" as const,
        width: 100,
        render: (val: number) => (
          <span className="tabular-nums font-medium text-primary dark:text-emerald-400">
            {val ?? 0}
          </span>
        ),
      },
      {
        title: "Views",
        dataIndex: "views",
        key: "views",
        align: "center" as const,
        width: 90,
        render: (val: number) => (
          <span className="tabular-nums text-gray-800 dark:text-gray-200">{val ?? 0}</span>
        ),
      },
      {
        title: "Total actions",
        dataIndex: "totalActions",
        key: "totalActions",
        align: "center" as const,
        width: 110,
        render: (val: number) => (
          <span className="tabular-nums font-semibold text-gray-900 dark:text-white">
            {val ?? 0}
          </span>
        ),
      },
      {
        title: "Complete rate",
        dataIndex: "completeRate",
        key: "completeRate",
        align: "center" as const,
        width: 110,
        render: (val: number) => {
          const n = Number(val);
          const text = Number.isFinite(n) ? `${n.toFixed(2)}%` : "—";
          const tone =
            n >= 50
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : n >= 15
                ? "text-amber-600 dark:text-amber-400 font-semibold"
                : "text-gray-600 dark:text-gray-400 font-medium";
          return <span className={`tabular-nums ${tone}`}>{text}</span>;
        },
      },
    ];

    const breakdownCols = breakdownSpec.map(({ key, label }) => ({
      title: (
        <Tooltip title={label}>
          <span className="truncate max-w-[100px] inline-block text-xs uppercase tracking-wide">
            {label}
          </span>
        </Tooltip>
      ),
      key: `breakdown_${key}`,
      align: "center" as const,
      width: 120,
      render: (_: unknown, record: any) => {
        const item = record?.activityBreakdown?.find((b: any) => b.key === key);
        const c = Number(item?.count ?? 0);
        return (
          <span
            className={
              c > 0
                ? "tabular-nums font-medium text-gray-800 dark:text-gray-200"
                : "tabular-nums text-gray-300 dark:text-gray-600"
            }
          >
            {c}
          </span>
        );
      },
    }));

    return [...baseCols, ...breakdownCols];
  }, [breakdownSpec]);

  const printableData = displayRows.map((item: any) => {
    const row: Record<string, string | number> = {
      Employee: item.employeeName ?? "",
      "Orders touched": item.ordersTouched ?? 0,
      "Orders updated": item.ordersUpdated ?? 0,
      Completed: item.completed ?? 0,
      Views: item.views ?? 0,
      "Total actions": item.totalActions ?? 0,
      "Complete rate": Number.isFinite(Number(item.completeRate))
        ? `${Number(item.completeRate).toFixed(2)}%`
        : "—",
    };
    for (const { key, label } of breakdownSpec) {
      const itemB = item.activityBreakdown?.find((b: any) => b.key === key);
      row[label] = itemB?.count ?? 0;
    }
    return row;
  });

  const pageSum = useMemo(() => {
    return displayRows.reduce(
      (acc, r: any) => ({
        ordersTouched: acc.ordersTouched + Number(r.ordersTouched || 0),
        ordersUpdated: acc.ordersUpdated + Number(r.ordersUpdated || 0),
        completed: acc.completed + Number(r.completed || 0),
        views: acc.views + Number(r.views || 0),
        totalActions: acc.totalActions + Number(r.totalActions || 0),
      }),
      { ordersTouched: 0, ordersUpdated: 0, completed: 0, views: 0, totalActions: 0 },
    );
  }, [displayRows]);

  const breakdownSums = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const { key } of breakdownSpec) {
      sums[key] = displayRows.reduce((s, r: any) => {
        const item = r?.activityBreakdown?.find((b: any) => b.key === key);
        return s + Number(item?.count || 0);
      }, 0);
    }
    return sums;
  }, [displayRows, breakdownSpec]);

  return (
    <div className="">
      <div className="rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Employee work log
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
            >
              <span className="font-medium">Guide</span>
            </button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <PageHeaderCard
              color="primary"
              title="Total actions"
              value={(summary.totalActions ?? 0).toLocaleString()}
              subtitle="Full report range"
            />
            <PageHeaderCard
              color="cyan"
              title="Total views"
              value={(summary.totalViews ?? 0).toLocaleString()}
              subtitle="Full report range"
            />
            <PageHeaderCard
              color="orange"
              title="Total completed"
              value={(summary.totalCompleted ?? 0).toLocaleString()}
              subtitle="Full report range"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          <Switch size="small" checked={hideZeroActivity} onChange={setHideZeroActivity} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Hide zero activity
          </span>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search by employee name..."
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
            <PageListPrint tableData={printableData} fileName="Work_Log_Report" />
          </div>
        </div>
      </div>

      <style>{`
        .work-log-table .ant-table-thead > tr > th::before { display: none !important; }
        .work-log-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b !important;
        }
        .dark .work-log-table .ant-table-thead > tr > th {
          background: rgb(15 23 42 / 0.6) !important;
          color: #94a3b8 !important;
        }
      `}</style>

      <div className="mt-5">
        <DataTable
          loading={isLoading || isFetching}
          columns={allColumns}
          data={displayRows}
          rowKey="employeeId"
          className="work-log-table"
          onRow={(record: any) => ({
            onClick: () => {
              setSelectedEmployee({
                id: record.employeeId,
                name: record.employeeName || "Employee",
              });
              setWorkLogDetailOpen(true);
            },
            className: "cursor-pointer",
          })}
          isPaginate={(meta?.total ?? 0) > limit}
          total={meta?.total ?? 0}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
          scroll={{ x: 1200 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-slate-50/90 dark:bg-slate-900/80 font-semibold">
                {allColumns.map((col, index) => {
                  let content: ReactNode = null;
                  if (col.key === "employee") {
                    content = (
                      <span className="text-slate-700 dark:text-slate-200">Page subtotal</span>
                    );
                  } else if (col.key === "ordersTouched") {
                    content = pageSum.ordersTouched;
                  } else if (col.key === "ordersUpdated") {
                    content = pageSum.ordersUpdated;
                  } else if (col.key === "completed") {
                    content = pageSum.completed;
                  } else if (col.key === "views") {
                    content = pageSum.views;
                  } else if (col.key === "totalActions") {
                    content = pageSum.totalActions;
                  } else if (col.key === "completeRate") {
                    content = (
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                        —
                      </span>
                    );
                  } else if (String(col.key).startsWith("breakdown_")) {
                    const bk = String(col.key).replace("breakdown_", "");
                    content = breakdownSums[bk] ?? 0;
                  }
                  return (
                    <Table.Summary.Cell
                      key={String(col.key || index)}
                      index={index}
                      align={col.key === "employee" ? "left" : "center"}
                      className="text-slate-900 dark:text-white"
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

      <WorkLogDetailsModal
        open={workLogDetailOpen}
        setOpen={setWorkLogDetailOpen}
        employeeId={selectedEmployee?.id || null}
        employeeName={selectedEmployee?.name || null}
        dateRange={dateRange}
      />
    </div>
  );
};

export default WorkLogTab;
