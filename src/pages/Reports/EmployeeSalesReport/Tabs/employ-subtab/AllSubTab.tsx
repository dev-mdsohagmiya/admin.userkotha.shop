import { useMemo, useRef, useState } from "react";
import { Input, Table, Tooltip } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import { debounce } from "../../../../../utils/debounce";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker.tsx";
import CurrencyIcon from "../../../../../components/common/CurrencyIcon";
import { useGetEmployeeAllReportQuery } from "../../../../../redux/features/report/reportApi.ts";
import EmployeeOrdersModal from "../../../../../components/common/Modals/Report/EmployeeSalesReport/EmployeeOrdersModal.tsx";

/** Rounds order % for display (avoids 16.666666666666664% style output). */
function formatOrderPercentForDisplay(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "0";
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

const AllSubTab = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleOpenModal = (record: any) => {
    setSelectedEmployee({ id: record.employeeId, name: record.employeeName });
    setOrderModalOpen(true);
  };

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value);
  };

  const { data: response, isLoading, isFetching } = useGetEmployeeAllReportQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const parsed = useMemo(() => {
    const level1 = response?.data || {};
    const level2 = level1?.data || {};
    const reportData = Array.isArray(level1?.rows) ? level1 : level2;

    return {
      rows: reportData?.rows || [],
      statuses: reportData?.statuses || [],
      sources: reportData?.sources || [],
      summary: response?.summary || level1?.summary || level2?.summary || {},
      meta: response?.meta || level1?.meta || level2?.meta || {},
    };
  }, [response]);

  const rows = parsed.rows;
  const statuses = parsed.statuses;
  const sources = parsed.sources;
  const summary = parsed.summary;
  const meta = parsed.meta;

  const sourceSummary = useMemo(() => {
    return sources.map((source: any) => {
      const sourceId = source?.id ?? null;
      const sourceName = String(source?.name || "Unknown");
      const orders = rows.reduce((sum: number, row: any) => {
        const stat = (row?.sourceStats || []).find(
          (s: any) =>
            (s?.sourceId ?? null) === sourceId &&
            String(s?.sourceName || "Unknown").toLowerCase() ===
              sourceName.toLowerCase(),
        );
        return sum + Number(stat?.orders || 0);
      }, 0);
      return { sourceId, sourceName, orders };
    });
  }, [rows, sources]);

  const renderCell = (orders = 0, percentage = 0, sales = 0) => {
    const allZero = Number(orders) === 0 && Number(percentage) === 0 && Number(sales) === 0;
    if (allZero) return <span className="text-gray-300">0</span>;

    return (
      <div className="flex flex-col items-center">
        <span className="font-bold text-gray-800">{orders}</span>
        <span className="text-[10px] text-gray-400">
          ({formatOrderPercentForDisplay(percentage)}%)
        </span>
        <div className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
          <CurrencyIcon size={10} />
          <span>{Number(sales || 0).toLocaleString()}</span>
        </div>
      </div>
    );
  };

  const columns = useMemo(() => {
    const base = [
      {
        title: "Employee",
        key: "employeeName",
        dataIndex: "employeeName",
        fixed: "left" as const,
        width: 220,
        render: (name: string) => (
          <span className="font-semibold text-gray-800 whitespace-nowrap block">{name || "-"}</span>
        ),
      },
      {
        title: "Total Orders",
        key: "totalOrders",
        dataIndex: "totalOrders",
        align: "center" as const,
        width: 110,
        render: (count: number, record: any) => (
          <span
            className="font-bold text-primary cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(record);
            }}
          >
            {count || 0}
          </span>
        ),
      },
      {
        title: "Total Sales",
        key: "totalSales",
        dataIndex: "totalSales",
        align: "center" as const,
        width: 140,
        render: (amount: number) => (
          <div className="flex items-center justify-center gap-1 font-semibold text-green-600">
            <CurrencyIcon size={14} />
            {(amount || 0).toLocaleString()}
          </div>
        ),
      },
    ];

    const statusCols = statuses.map((status: any) => ({
      title: (
        <Tooltip title={status?.name}>
          <span className="truncate max-w-[120px] inline-block uppercase text-xs">
            {status?.name}
          </span>
        </Tooltip>
      ),
      key: `status_${status?.id}`,
      align: "center" as const,
      width: 120,
      render: (_: any, record: any) => {
        const stat = (record?.statusStats || []).find(
          (s: any) => s?.statusId === status?.id,
        );
        return renderCell(stat?.orders || 0, stat?.orderPercentage || 0, stat?.sales || 0);
      },
    }));

    const sourceCols = sources.map((source: any) => ({
      title: (
        <Tooltip title={source?.name}>
          <span className="truncate max-w-[120px] inline-block uppercase text-xs">
            {source?.name}
          </span>
        </Tooltip>
      ),
      key: `source_${source?.id ?? "__NULL__"}_${String(source?.name || "unknown").toLowerCase()}`,
      align: "center" as const,
      width: 120,
      render: (_: any, record: any) => {
        const sourceId = source?.id ?? null;
        const sourceName = String(source?.name || "Unknown").toLowerCase();
        const stat = (record?.sourceStats || []).find((s: any) => {
          const statId = s?.sourceId ?? null;
          const statName = String(s?.sourceName || "Unknown").toLowerCase();
          return statId === sourceId && statName === sourceName;
        });
        return renderCell(stat?.orders || 0, stat?.orderPercentage || 0, stat?.sales || 0);
      },
    }));

    return [...base, ...statusCols, ...sourceCols];
  }, [statuses, sources]);

  const printableData = rows.map((row: any) => ({
    Employee: row?.employeeName || "-",
    "Total Orders": row?.totalOrders || 0,
    "Total Sales": row?.totalSales || 0,
  }));

  return (
    <div>
      <div className="rounded-lg">
        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search all reports..."
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
            <PageListPrint tableData={printableData} fileName="All_Employee_Report" />
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
          scroll={{ x: 2600 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50 font-bold">
                {columns.map((col: any, index: number) => {
                  let content: React.ReactNode = null;

                  if (col.key === "employeeName") content = "Total";
                  else if (col.key === "totalOrders") content = summary?.totalOrders || 0;
                  else if (col.key === "totalSales") {
                    content = (
                      <div className="flex items-center justify-center gap-1 font-semibold text-green-600">
                        <CurrencyIcon size={14} />
                        {(summary?.totalSales || 0).toLocaleString()}
                      </div>
                    );
                  } else if (String(col.key).startsWith("status_")) {
                    const statusId = String(col.key).replace("status_", "");
                    const s = (summary?.statusWiseOrders || []).find((x: any) => x.statusId === statusId);
                    content = s?.orders || 0;
                  } else if (String(col.key).startsWith("source_")) {
                    const sourceKey = String(col.key).replace("source_", "");
                    const s = sourceSummary.find((x: any) => {
                      const k = `${x?.sourceId ?? "__NULL__"}_${String(x?.sourceName || "unknown").toLowerCase()}`;
                      return k === sourceKey;
                    });
                    content = s?.orders || 0;
                  }

                  return (
                    <Table.Summary.Cell key={String(col.key)} index={index} align="center">
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

export default AllSubTab;
