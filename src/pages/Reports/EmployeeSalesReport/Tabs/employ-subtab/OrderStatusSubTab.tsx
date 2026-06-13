import { useRef, useState, useMemo } from "react";
import { Input, Table, Tooltip } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../../components/common/Tables/index.ts";
import PageListPrint from "../../../../../components/common/CommonPrintCsvAndPdf/PageListPrint.tsx";
import { debounce } from "../../../../../utils/debounce.ts";
import CustomDatePicker from "../../../../../components/common/Date/CustomDatePicker.tsx";
import FilterColumn from "../../../../../components/common/FilterColumn/FilterColumn.tsx";
import CurrencyIcon from "../../../../../components/common/CurrencyIcon";
import { useGetEmployeeOrderStatusReportQuery } from "../../../../../redux/features/report/reportApi.ts";
import EmployeeOrdersModal from "../../../../../components/common/Modals/Report/EmployeeSalesReport/EmployeeOrdersModal.tsx";

function formatOrderPercentForDisplay(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "0";
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

const OrderStatusSubTab = () => {
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

  const {
    data: orderStatusResponse,
    isLoading,
    isFetching,
  } = useGetEmployeeOrderStatusReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const reportData = orderStatusResponse?.data;
  const rows = reportData?.rows || [];
  const summary = orderStatusResponse?.summary;
  const meta = orderStatusResponse?.meta;

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
            {amount?.toLocaleString() || 0}
          </div>
        ),
      },
    ];

    const renderStatusCell = (record: any, statusId: string) => {
      const stats = record.statusStats?.find((s: any) => s.statusId === statusId);
      return (
        <div className="flex flex-col items-center">
          <span
            className={
              stats?.orders > 0 ? "font-bold text-gray-800" : "text-gray-300"
            }
          >
            {stats?.orders || 0}
          </span>
          {stats?.orders > 0 && (
            <span className="text-[10px] text-gray-400">
              ({formatOrderPercentForDisplay(stats?.orderPercentage)}%)
            </span>
          )}
          {(stats?.sales || 0) > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
              <CurrencyIcon size={10} />
              <span>{(stats?.sales || 0).toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    };

    const dynamicCols = [
      {
        title: (
          <Tooltip title="PENDING">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              PENDING
            </span>
          </Tooltip>
        ),
        key: "PENDING",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "PENDING"),
      },
      {
        title: (
          <Tooltip title="HOLD">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              HOLD
            </span>
          </Tooltip>
        ),
        key: "HOLD",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "HOLD"),
      },
      {
        title: (
          <Tooltip title="CONFIRM">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              CONFIRM
            </span>
          </Tooltip>
        ),
        key: "CONFIRM",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "CONFIRM"),
      },
      {
        title: (
          <Tooltip title="SHIPPED">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              SHIPPED
            </span>
          </Tooltip>
        ),
        key: "SHIPPED",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "SHIPPED"),
      },
      {
        title: (
          <Tooltip title="DELIVERED">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              DELIVERED
            </span>
          </Tooltip>
        ),
        key: "DELIVERED",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "DELIVERED"),
      },
      {
        title: (
          <Tooltip title="CANCELLED">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              CANCELLED
            </span>
          </Tooltip>
        ),
        key: "CANCELLED",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "CANCELLED"),
      },
      {
        title: (
          <Tooltip title="GOOD BUT NO RESPONSE">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              GOOD BUT NO RESPONSE
            </span>
          </Tooltip>
        ),
        key: "GOOD_BUT_NO_RESPONSE",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) =>
          renderStatusCell(record, "GOOD_BUT_NO_RESPONSE"),
      },
      {
        title: (
          <Tooltip title="NO RESPONSE">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              NO RESPONSE
            </span>
          </Tooltip>
        ),
        key: "NO_RESPONSE",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "NO_RESPONSE"),
      },
      {
        title: (
          <Tooltip title="ADVANCE REQUIRED">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              ADVANCE REQUIRED
            </span>
          </Tooltip>
        ),
        key: "ADVANCE_REQUIRED",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) =>
          renderStatusCell(record, "ADVANCE_REQUIRED"),
      },
      {
        title: (
          <Tooltip title="RETURNED">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              RETURNED
            </span>
          </Tooltip>
        ),
        key: "RETURNED",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "RETURNED"),
      },
      {
        title: (
          <Tooltip title="PRINT">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              PRINT
            </span>
          </Tooltip>
        ),
        key: "PRINT",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "PRINT"),
      },
      {
        title: (
          <Tooltip title="UN PRINT">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              UN PRINT
            </span>
          </Tooltip>
        ),
        key: "UN_PRINT",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "UN_PRINT"),
      },
      {
        title: (
          <Tooltip title="PREORDER">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              PREORDER
            </span>
          </Tooltip>
        ),
        key: "PREORDER",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "PREORDER"),
      },
      {
        title: (
          <Tooltip title="CROSS_SELL">
            <span className="truncate max-w-[120px] inline-block uppercase text-xs">
              CROSS_SELL
            </span>
          </Tooltip>
        ),
        key: "CROSS_SELL",
        align: "center" as const,
        width: 120,
        render: (_: any, record: any) => renderStatusCell(record, "CROSS_SELL"),
      },
    ];

    return [...baseCols, ...dynamicCols];
  }, []);

  const columns = allColumns.filter(
    (col) =>
      selectedColumnKeys.length === 0 ||
      selectedColumnKeys.includes(col.key || ""),
  );

  const printableData = rows.map((item: any) => ({
    Employee: item.employeeName,
    "Total Orders": item.totalOrders,
    "Total Sales": item.totalSales,
    ...(item.statusStats || []).reduce((acc: any, s: any) => {
      acc[s.statusName] = s.orders;
      return acc;
    }, {}),
  }));

  return (
    <div className="">
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
              fileName="Employee_Order_Status_Report"
            />
            <FilterColumn
              tableName="employee_order_status"
              columns={allColumns.map((col) => ({
                key: col.key || "",
                title:
                  typeof col.title === "string"
                    ? col.title
                    : (col.key as string) || "",
              }))}
              onChangeSelectedKeys={setSelectedColumnKeys}
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
          scroll={{ x: 1500 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50 dark:bg-gray-900/50 font-bold">
                {columns.map((col, index) => {
                  let content: React.ReactNode = null;

                  if (col.key === "employee") {
                    content = "Total";
                  } else if (col.key === "totalOrders") {
                    content = summary?.totalOrders || 0;
                  } else if (col.key === "totalSales") {
                    content = (
                      <div className="flex items-center justify-center gap-1 font-semibold text-green-600">
                        <CurrencyIcon size={14} />
                        {(summary?.totalSales || 0).toLocaleString()}
                      </div>
                    );
                  } else {
                    const statusTotal = summary?.statusWiseOrders?.find(
                      (s: any) => s.statusId === col.key,
                    );
                    content = statusTotal?.orders || 0;
                  }

                  return (
                    <Table.Summary.Cell
                      key={col.key}
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

      {/* Employee Order Details Modal */}
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

export default OrderStatusSubTab;
