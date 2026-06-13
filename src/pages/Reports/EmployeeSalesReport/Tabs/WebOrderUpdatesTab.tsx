import { useRef, useState, useMemo } from "react";
import { Input, Table } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../components/common/Tables/index.ts";
import FilterColumn from "../../../../components/common/FilterColumn/FilterColumn.tsx";
import { debounce } from "../../../../utils/debounce.ts";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker.tsx";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint.tsx";
import { useGetEmployeeWebOrderUpdatesReportQuery } from "../../../../redux/features/report/reportApi.ts";
import EmployeeOrdersModal from "../../../../components/common/Modals/Report/EmployeeSalesReport/EmployeeOrdersModal.tsx";

const WebOrderUpdatesTab = () => {
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
    data: webOrderUpdatesData,
    isLoading,
    isFetching,
  } = useGetEmployeeWebOrderUpdatesReportQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    ...(dateRange[0] ? [{ name: "startDate", value: dateRange[0] }] : []),
    ...(dateRange[1] ? [{ name: "endDate", value: dateRange[1] }] : []),
  ]);

  const webOrderUpdates = webOrderUpdatesData?.data || [];
  const summary = webOrderUpdatesData?.summary;
  const meta = webOrderUpdatesData?.meta;

  const renderWithPercent = (
    data: { count: number; percentage: number },
    colorClass: string = "text-gray-900",
  ) => (
    <div className="flex flex-col items-center">
      <span className={`font-bold ${colorClass}`}>{data?.count || 0}</span>
      <span className="text-[10px] text-gray-500">
        ({data?.percentage || 0}%)
      </span>
    </div>
  );

  const allColumns = useMemo(
    () => [
      {
        title: "Name",
        key: "name",
        width: 200,
        render: (_: any, record: any) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {record.employeeName}
          </span>
        </div>
      ),
      },
      {
        title: "Custom ID",
        dataIndex: "customId",
        key: "customId",
        align: "center" as const,
      },
      {
        title: "Total Orders",
        dataIndex: "totalOrders",
        key: "totalOrders",
        align: "center" as const,
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
        title: "Processing",
        key: "processing",
        align: "center" as const,
        render: (_: any, record: any) => renderWithPercent(record.processing),
      },
      {
        title: "Good But No Response",
        key: "goodNoResponse",
        align: "center" as const,
        render: (_: any, record: any) =>
          renderWithPercent(record.goodButNoResponse),
      },
      {
        title: "No Response",
        key: "noResponse",
        align: "center" as const,
        render: (_: any, record: any) => renderWithPercent(record.noResponse),
      },
      {
        title: "Advance Payment",
        key: "advancePayment",
        align: "center" as const,
        render: (_: any, record: any) => renderWithPercent(record.advancePayment),
      },
      {
        title: "On Hold",
        key: "onHold",
        align: "center" as const,
        render: (_: any, record: any) => renderWithPercent(record.onHold),
      },
      {
        title: "Complete",
        key: "complete",
        align: "center" as const,
        render: (_: any, record: any) =>
          renderWithPercent(record.complete, "text-green-600"),
      },
      {
        title: "Cancel",
        key: "cancel",
        align: "center" as const,
        render: (_: any, record: any) =>
          renderWithPercent(record.cancel, "text-red-500"),
      },
      {
        title: "Incomplete",
        key: "incomplete",
        align: "center" as const,
        render: (_: any, record: any) => renderWithPercent(record.incomplete),
      },
    ],
    [],
  );

  const filterableColumns = [
    { key: "name", title: "Name" },
    { key: "customId", title: "Custom ID" },
    { key: "totalOrders", title: "Total Orders" },
    { key: "processing", title: "Processing" },
    { key: "goodNoResponse", title: "Good But No Response" },
    { key: "noResponse", title: "No Response" },
    { key: "advancePayment", title: "Advance Payment" },
    { key: "onHold", title: "On Hold" },
    { key: "complete", title: "Complete" },
    { key: "cancel", title: "Cancel" },
    { key: "incomplete", title: "Incomplete" },
  ];

  const columns = allColumns.filter(
    (col) =>
      selectedColumnKeys.length === 0 || selectedColumnKeys.includes(col.key),
  );

  const printableData = webOrderUpdates.map((item: any) => ({
    Name: item.employeeName,
    "Total Orders": item.totalOrders,
    Processing: item.processing?.count || 0,
    Complete: item.complete?.count || 0,
    Cancel: item.cancel?.count || 0,
  }));

  return (
    <div className="">
      <div className="rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Employee Web Order Updates Report
          </h2>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search all columns..."
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
              fileName="Web_Order_Updates_Report"
            />
            <FilterColumn
              tableName="web_order_updates"
              columns={filterableColumns}
              onChangeSelectedKeys={setSelectedColumnKeys}
            />
          </div>
        </div>
      </div>

      <div className=" mt-5">
        <DataTable
          loading={isLoading || isFetching}
          columns={columns}
          data={webOrderUpdates}
          rowKey="employeeId"
          isPaginate={meta?.total > limit}
          total={meta?.total || 0}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50/50 font-bold">
                <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2} align="center">
                  {summary?.totalOrders || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  {summary?.processing || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  {summary?.goodButNoResponse || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">
                  {summary?.noResponse || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="center">
                  {summary?.advancePayment || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  {summary?.onHold || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="center">
                  <span className="text-green-600">
                    {summary?.complete || 0}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9} align="center">
                  <span className="text-red-500">{summary?.cancel || 0}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={10} align="center">
                  {summary?.incomplete || 0}
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
    </div>
  );
};

export default WebOrderUpdatesTab;
