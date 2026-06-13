import { useState, useRef } from "react";

import { Select, Input } from "antd";
import { debounce } from "../../../../utils/debounce";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";

// Sub-tabs
import CurrentStockReport from "../ParcelSubTabs/CurrentStockReport";
import LowStockAlertReport from "../ParcelSubTabs/LowStockAlertReport";
import StockInVsOutReport from "../ParcelSubTabs/StockInVsOutReport";
import FastSlowMovingReport from "../ParcelSubTabs/FastSlowMovingReport";
import { Search } from "lucide-react";

type ParcelReportType =
  | "Current Stock Report"
  | "Low Stock Alert"
  | "Stock In vs Out"
  | "Fast & Slow Moving Products";

const ParcelTab = () => {
  const { Option } = Select;
  const [reportType, setReportType] =
    useState<ParcelReportType>("Current Stock Report");
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

  const handleReportChange = (value: ParcelReportType) => {
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
      case "Current Stock Report":
        return <CurrentStockReport {...props} />;
      case "Low Stock Alert":
        return <LowStockAlertReport {...props} />;
      case "Stock In vs Out":
        return <StockInVsOutReport {...props} />;
      case "Fast & Slow Moving Products":
        return <FastSlowMovingReport {...props} />;
      default:
        return <CurrentStockReport {...props} />;
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
            className="min-w-[220px] h-10 premium-select"
            size="middle"
          >
            <Option value="Current Stock Report">
              <div className="flex items-center gap-2">
                <span>Current Stock Report</span>
              </div>
            </Option>
            <Option value="Low Stock Alert">
              <div className="flex items-center gap-2">
                <span>Low Stock Alert</span>
              </div>
            </Option>
            <Option value="Stock In vs Out">
              <div className="flex items-center gap-2">
                <span>Stock In vs Out</span>
              </div>
            </Option>
            <Option value="Fast & Slow Moving Products">
              <div className="flex items-center gap-2">
                <span>Fast & Slow Moving Products</span>
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

export default ParcelTab;
