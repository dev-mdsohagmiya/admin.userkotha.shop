import { useMemo, useRef, useState } from "react";
import { Input, Table, Tooltip } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables/index.ts";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { debounce } from "../../../../../utils/debounce";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker.tsx";
import CurrencyIcon from "../../../../../components/common/CurrencyIcon";
import { useGetEmployeeOrderSourcesReportQuery } from "../../../../../redux/features/report/reportApi.ts";
import EmployeeOrdersModal from "../../../../../components/common/Modals/Report/EmployeeSalesReport/EmployeeOrdersModal.tsx";

const OrderSourcesSubTab = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

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
    data: orderSourcesResponse,
    isLoading,
    isFetching,
  } = useGetEmployeeOrderSourcesReportQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const parsedPayload = useMemo(() => {
    const level1 = orderSourcesResponse?.data || {};
    const level2 = level1?.data || {};
    const reportData = Array.isArray(level1?.rows) ? level1 : level2;

    return {
      rows: reportData?.rows || [],
      sources: reportData?.sources || [],
      summary:
        orderSourcesResponse?.summary ||
        level1?.summary ||
        level2?.summary ||
        null,
      meta: orderSourcesResponse?.meta || level1?.meta || level2?.meta || {},
    };
  }, [orderSourcesResponse]);

  const rows = useMemo(() => parsedPayload.rows || [], [parsedPayload]);
  const sources = useMemo(() => {
    const apiSources = Array.isArray(parsedPayload.sources) ? parsedPayload.sources : [];
    const sourceStatsFromRows = rows.flatMap(
      (row: any) => row?.sourceStats || row?.orderSourceStats || [],
    );

    const sourceMap = new Map<string, { id: string | null; name: string }>();
    apiSources.forEach((s: any) => {
      const id = s?.id ?? null;
      const name = String(s?.name || "Unknown").trim() || "Unknown";
      const key = `${id ?? "__NULL__"}::${name.toLowerCase()}`;
      sourceMap.set(key, { id, name });
    });

    sourceStatsFromRows.forEach((s: any) => {
      const id = s?.sourceId ?? s?.orderSourceId ?? null;
      const name = String(s?.sourceName || s?.name || "Unknown").trim() || "Unknown";
      const key = `${id ?? "__NULL__"}::${name.toLowerCase()}`;
      if (!sourceMap.has(key)) {
        sourceMap.set(key, { id, name });
      }
    });

    return Array.from(sourceMap.values());
  }, [parsedPayload.sources, rows]);
  const summary = parsedPayload.summary;
  const meta = parsedPayload.meta;

  const computedSummary = useMemo(() => {
    const totalOrders = rows.reduce(
      (sum: number, row: any) => sum + Number(row?.totalOrders || 0),
      0,
    );
    const totalSales = rows.reduce(
      (sum: number, row: any) => sum + Number(row?.totalSales || 0),
      0,
    );

    const sourceWiseOrders = sources.map((source: any) => {
      const sourceId = source?.id ?? null;
      const sourceName = source?.name ?? "Unknown";
      const orders = rows.reduce((sum: number, row: any) => {
        const stats = (row?.sourceStats || row?.orderSourceStats || []).find(
          (s: any) =>
            (s?.sourceId ?? s?.orderSourceId ?? null) === sourceId &&
            String(s?.sourceName || s?.name || "Unknown")
              .trim()
              .toLowerCase() === sourceName.trim().toLowerCase(),
        );
        return sum + Number(stats?.orders || 0);
      }, 0);

      return { sourceId, sourceName, orders };
    });

    return { totalOrders, totalSales, sourceWiseOrders };
  }, [rows, sources]);

  const effectiveSummary = summary || computedSummary;

  const allColumns = useMemo(() => {
    const baseCols = [
      {
        title: "Employee",
        key: "employee",
        width: 260,
        fixed: "left" as const,
        render: (_: any, record: any) => (
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {record.employeeName || "-"}
          </span>
        ),
      },
      {
        title: "Total Orders",
        dataIndex: "totalOrders",
        key: "totalOrders",
        align: "center" as const,
        width: 120,
        render: (count: number) => <span className="font-bold text-primary">{count || 0}</span>,
      },
      {
        title: "Total Sales",
        dataIndex: "totalSales",
        key: "totalSales",
        align: "center" as const,
        width: 150,
        render: (amount: number) => (
          <div className="flex items-center justify-center gap-1 font-semibold text-green-600">
            <CurrencyIcon size={14} />
            {(amount || 0).toLocaleString()}
          </div>
        ),
      },
    ];

    const sourceCols = sources.map((source: any) => ({
      title: (
        <Tooltip title={source.name}>
          <span className="truncate max-w-[120px] inline-block uppercase text-xs">
            {source.name}
          </span>
        </Tooltip>
      ),
      key: `source_${source?.id ?? "__NULL__"}_${String(source?.name || "unknown").toLowerCase()}`,
      align: "center" as const,
      width: 120,
      render: (_: any, record: any) => {
        const sourceStats = record.sourceStats || record.orderSourceStats || [];
        const sourceId = source?.id ?? null;
        const sourceName = String(source?.name || "").trim().toLowerCase();
        const stats = sourceStats.find(
          (s: any) => {
            const statId = s?.sourceId ?? s?.orderSourceId ?? null;
            const statName = String(s?.sourceName || s?.name || "")
              .trim()
              .toLowerCase();

            if (sourceId === null) {
              return statId === null && (statName === sourceName || statName === "unknown");
            }

            return statId === sourceId || statName === sourceName;
          },
        );
        const orders = Number(stats?.orders || 0);
        const percentage = Number(stats?.orderPercentage || 0);
        const sales = Number(stats?.sales || 0);
        const isAllZero = orders === 0 && percentage === 0 && sales === 0;

        return (
          <div className="flex flex-col items-center">
            <span className={orders > 0 ? "font-bold text-gray-800" : "text-gray-300"}>
              {orders}
            </span>
            {!isAllZero && orders > 0 && (
              <span className="text-[10px] text-gray-400">
                ({percentage}%)
              </span>
            )}
            {!isAllZero && (
              <div className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                <CurrencyIcon size={10} />
                <span>{sales.toLocaleString()}</span>
              </div>
            )}
          </div>
        );
      },
    }));

    return [...baseCols, ...sourceCols];
  }, [sources]);

  const columns = allColumns;

  const printableData = rows.map((item: any) => ({
    Employee: item.employeeName,
    "Total Orders": item.totalOrders || 0,
    "Total Sales": item.totalSales || 0,
    ...((item.sourceStats || item.orderSourceStats || []).reduce(
      (acc: any, s: any) => {
        const title = s.sourceName || s.name || s.sourceId || "Unknown";
        acc[title] = s.orders || 0;
        return acc;
      },
      {},
    ) as Record<string, number>),
  }));

  return (
    <div>
      <style>{`
        .clean-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .clean-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #f3f4f6 !important;
        }
      `}</style>

      <div className="rounded-lg">
        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search employee name..."
            onChange={handleSearch}
            className="max-w-md rounded-lg"
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
              fileName="Employee_Order_Sources_Report"
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
          onRow={(record: any) => ({
            onClick: () => handleOpenModal(record),
            className: "cursor-pointer",
          })}
          className="clean-table"
          isPaginate={meta?.total > limit}
          total={meta?.total || 0}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
          scroll={{ x: 1400 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50 dark:bg-gray-900/50 font-bold">
                {columns.map((col, index) => {
                  let content: React.ReactNode = null;

                  if (col.key === "employee") {
                    content = "Total";
                  } else if (col.key === "totalOrders") {
                    content = effectiveSummary?.totalOrders || 0;
                  } else if (col.key === "totalSales") {
                    content = (
                      <div className="flex items-center justify-center gap-1 font-semibold text-green-600">
                        <CurrencyIcon size={14} />
                        {(effectiveSummary?.totalSales || 0).toLocaleString()}
                      </div>
                    );
                  } else {
                    const sourceKey = String(col.key || "");
                    const sourceSummary = effectiveSummary?.sourceWiseOrders?.find(
                      (s: any) => {
                        const summaryId = s?.sourceId ?? "__NULL__";
                        const summaryName = String(s?.sourceName || "unknown").toLowerCase();
                        const keyByIdAndName = `source_${summaryId}_${summaryName}`;
                        return keyByIdAndName === sourceKey;
                      },
                    );
                    content = sourceSummary?.orders || 0;
                  }

                  return (
                    <Table.Summary.Cell
                      key={String(col.key || index)}
                      index={index}
                      align="center"
                      className="text-gray-900 dark:text-white"
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

export default OrderSourcesSubTab;
