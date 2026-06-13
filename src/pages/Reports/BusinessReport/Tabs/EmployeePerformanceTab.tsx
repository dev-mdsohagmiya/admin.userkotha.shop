import { useState, useRef } from "react";
import { Search, UserCheck } from "lucide-react";
import { Select, Input } from "antd";
import { debounce } from "../../../../utils/debounce";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";

// Sub-tabs
import ManualWebEntryOutcome from "../EmployeePerformanceSubTabs/ManualWebEntryOutcome";

type EmployeePerformanceReportType = "Manual Web Entry Outcome";

const EmployeePerformanceTab = () => {
  const { Option } = Select;
  const [reportType, setReportType] =
    useState<EmployeePerformanceReportType>("Manual Web Entry Outcome");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [exportData, setExportData] = useState<any[]>([]);

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 500),
  ).current;

  const handleReportChange = (value: EmployeePerformanceReportType) => {
    setReportType(value);
    setPage(1);
    setExportData([]); // Clear old data
  };

  const renderActiveReport = () => {
    const props = {
      dateRange,
      search,
      page,
      limit,
      setPage,
      setLimit,
      setExportData,
    };

    switch (reportType) {
      case "Manual Web Entry Outcome":
        return <ManualWebEntryOutcome {...props} />;
      default:
        return <ManualWebEntryOutcome {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search report..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            onChange={(e) => debounceSearch(e.target.value)}
            size="middle"
            allowClear
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={reportType}
            onChange={handleReportChange}
            className="min-w-[240px] h-10 premium-select"
            size="middle"
          >
            <Option value="Manual Web Entry Outcome">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Manual Web Entry Outcome</span>
              </div>
            </Option>
          </Select>

          <div>
            <CustomDatePicker
              selectedData={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setPage(1);
              }}
            />
          </div>

          <PageListPrint
            tableData={exportData}
            fileName={`${reportType.replace(/\s+/g, "-")}`}
          />
        </div>
      </div>

      {/* Report Content */}
      <div className="min-h-[400px]">{renderActiveReport()}</div>
    </div>
  );
};

export default EmployeePerformanceTab;
