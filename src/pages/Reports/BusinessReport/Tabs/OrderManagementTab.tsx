import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Select, Input } from "antd";
import { debounce } from "../../../../utils/debounce";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";

// Sub-tabs
import MonthlySalesReport from "../OrderManagementSubTabs/MonthlySalesReport";
import ProductWiseSalesReport from "../OrderManagementSubTabs/ProductWiseSalesReport";
import CustomerWiseSalesReport from "../OrderManagementSubTabs/CustomerWiseSalesReport";
import ProfitAndSalesNetReport from "../OrderManagementSubTabs/ProfitAndSalesNetReport";
import OrderFinancialsNetReport from "../OrderManagementSubTabs/OrderFinancialsNetReport";
import OrderSourcePerformanceReport from "../OrderManagementSubTabs/OrderSourcePerformanceReport";
import OrderSourceAreaPerformanceReport from "../OrderManagementSubTabs/OrderSourceAreaPerformanceReport";
import DailySlipParcelOperationalReport from "../OrderManagementSubTabs/DailySlipParcelOperationalReport";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";

type ReportType =
  | "Monthly Sales Summary"
  | "Product Wise Sales"
  | "Customer Wise Order"
  | "Profit & Sales (Net Product)"
  | "Order Financials (Net Product)"
  | "Order Source Performance (Net Product)"
  | "Order Source Area Performance"
  | "Daily Slip & Parcel Operational";

const OrderManagementTab = () => {
  const { Option } = Select;
  const [reportType, setReportType] = useState<ReportType>(
    "Monthly Sales Summary",
  );
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 500),
  ).current;

  const [exportData, setExportData] = useState<any[]>([]);

  const handleReportChange = (value: ReportType) => {
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
      setExportData, // To lift the data for printing
    };

    switch (reportType) {
      case "Monthly Sales Summary":
        return <MonthlySalesReport {...props} />;
      case "Product Wise Sales":
        return <ProductWiseSalesReport {...props} />;
      case "Customer Wise Order":
        return <CustomerWiseSalesReport {...props} />;
      case "Profit & Sales (Net Product)":
        return <ProfitAndSalesNetReport {...props} />;
      case "Order Financials (Net Product)":
        return <OrderFinancialsNetReport {...props} />;
      case "Order Source Performance (Net Product)":
        return <OrderSourcePerformanceReport {...props} />;
      case "Order Source Area Performance":
        return <OrderSourceAreaPerformanceReport {...props} />;
      case "Daily Slip & Parcel Operational":
        return <DailySlipParcelOperationalReport {...props} />;

      default:
        return <MonthlySalesReport {...props} />;
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Side: Search */}
          <div className="w-full lg:max-w-xs">
            <Input
              placeholder="Search report database..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              onChange={(e) => debounceSearch(e.target.value)}
              size="middle"
              className=""
              allowClear
            />
          </div>

          {/* Right Side: Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Report Type Selector */}
            <div>
              <Select
                value={reportType}
                onChange={handleReportChange}
                className="max-w-[190px] h-10 premium-select"
                size="middle"
              >
                <Option value="Monthly Sales Summary">
                  <div className="flex items-center gap-2">
                    <span>Monthly Sales Summary</span>
                  </div>
                </Option>
                <Option value="Product Wise Sales">
                  <div className="flex items-center gap-2">
                    <span>Product Wise Sales</span>
                  </div>
                </Option>
                <Option value="Customer Wise Order">
                  <div className="flex items-center gap-2">
                    <span>Customer Wise Order</span>
                  </div>
                </Option>
                <Option value="Profit & Sales (Net Product)">
                  <div className="flex items-center gap-2">
                    <span>Profit & Sales (Net Product)</span>
                  </div>
                </Option>
                <Option value="Order Financials (Net Product)">
                  <div className="flex items-center gap-2">
                    <span>Order Financials (Net Product)</span>
                  </div>
                </Option>
                <Option value="Order Source Performance (Net Product)">
                  <div className="flex items-center gap-2">
                    <span>Order Source Performance (Net Product)</span>
                  </div>
                </Option>
                <Option value="Order Source Area Performance">
                  <div className="flex items-center gap-2">
                    <span>Order Source Area Performance</span>
                  </div>
                </Option>
                <Option value="Daily Slip & Parcel Operational">
                  <div className="flex items-center gap-2">
                    <span>Daily Slip & Parcel Operational</span>
                  </div>
                </Option>
              </Select>
            </div>

            {/* Custom Date Filter */}
            <div>
              <CustomDatePicker
                onChange={(dates) => {
                  setDateRange(dates);
                  setPage(1);
                }}
                selectedData={dateRange}
              />
            </div>

            {/* Unified Print Button */}
            <PageListPrint
              tableData={exportData}
              fileName={`${reportType.replace(/\s+/g, "-")}`}
            />
          </div>
        </div>

        {/* Render the Active Report Table */}
        <div className="  overflow-hidden min-h-[400px]">
          {renderActiveReport()}
        </div>
      </div>
    </div>
  );
};

export default OrderManagementTab;
