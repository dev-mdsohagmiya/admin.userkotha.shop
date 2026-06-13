import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Select, Input } from "antd";
import { debounce } from "../../../../utils/debounce";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";



// Sub-tabs
import CancelledOrdersReport from "../LogisticsSubTabs/CancelledOrdersReport";
import CourierWiseDeliveryReport from "../LogisticsSubTabs/CourierWiseDeliveryReport";
import CourierReturnDeliveryReport from "../LogisticsSubTabs/CourierReturnDeliveryReport";
import PendingDeliveryReport from "../LogisticsSubTabs/PendingDeliveryReport";
import ReturnRTOReport from "../LogisticsSubTabs/ReturnRTOReport";
import DelayedDeliveryReport from "../LogisticsSubTabs/DelayedDeliveryReport";
import AreaWiseDeliveryReport from "../LogisticsSubTabs/AreaWiseDeliveryReport";
import DailyCollectionReport from "../LogisticsSubTabs/DailyCollectionReport";
import CourierPaymentReconciliationReport from "../LogisticsSubTabs/CourierPaymentReconciliationReport";
import DailyCashVsBankCODReport from "../LogisticsSubTabs/DailyCashVsBankCODReport";
import CurrentStockReport from "../LogisticsSubTabs/CurrentStockReport";

type LogisticsReportType =
  | "Cancelled Orders"
  | "Courier Wise Delivery"
  | "Courier Return/Delivery"
  | "Pending Delivery"
  | "Return / RTO"
  | "Delayed Delivery"
  | "Area Wise Delivery"
  | "Daily Collection"
  | "Courier Payment Reconciliation"
  | "Daily Cash vs Bank COD"
  | "Current Stock Report";

const LogisticsTab = () => {
  const { Option } = Select;
  const [reportType, setReportType] =
    useState<LogisticsReportType>("Cancelled Orders");
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

  const handleReportChange = (value: LogisticsReportType) => {
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
      case "Cancelled Orders":
        return <CancelledOrdersReport {...props} />;
      case "Courier Wise Delivery":
        return <CourierWiseDeliveryReport {...props} />;
      case "Courier Return/Delivery":
        return <CourierReturnDeliveryReport {...props} />;
      case "Pending Delivery":
        return <PendingDeliveryReport {...props} />;
      case "Return / RTO":
        return <ReturnRTOReport {...props} />;
      case "Delayed Delivery":
        return <DelayedDeliveryReport {...props} />;
      case "Area Wise Delivery":
        return <AreaWiseDeliveryReport {...props} />;
      case "Daily Collection":
        return <DailyCollectionReport {...props} />;
      case "Courier Payment Reconciliation":
        return <CourierPaymentReconciliationReport {...props} />;
      case "Daily Cash vs Bank COD":
        return <DailyCashVsBankCODReport {...props} />;
      case "Current Stock Report":
        return <CurrentStockReport {...props} />;
      default:
        return <CancelledOrdersReport {...props} />;
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
            className="min-w-[200px] h-10 premium-select"
            size="middle"
          >
            <Option value="Cancelled Orders">
              <div className="flex items-center gap-2">
                <span>Cancelled Orders</span>
              </div>
            </Option>
            <Option value="Courier Wise Delivery">
              <div className="flex items-center gap-2">
                <span>Courier Wise Delivery</span>
              </div>
            </Option>
            <Option value="Courier Return/Delivery">
              <div className="flex items-center gap-2">
                <span>Courier Return/Delivery</span>
              </div>
            </Option>
            <Option value="Pending Delivery">
              <div className="flex items-center gap-2">
                <span>Pending Delivery</span>
              </div>
            </Option>
            <Option value="Return / RTO">
              <div className="flex items-center gap-2">
                <span>Return / RTO</span>
              </div>
            </Option>
            <Option value="Delayed Delivery">
              <div className="flex items-center gap-2">
                <span>Delayed Delivery</span>
              </div>
            </Option>
            <Option value="Area Wise Delivery">
              <div className="flex items-center gap-2">
                <span>Area Wise Delivery</span>
              </div>
            </Option>
            <Option value="Daily Collection">
              <div className="flex items-center gap-2">
                <span>Daily Collection</span>
              </div>
            </Option>
            <Option value="Courier Payment Reconciliation">
              <div className="flex items-center gap-2">
                <span>Courier Payment Reconciliation</span>
              </div>
            </Option>
            <Option value="Daily Cash vs Bank COD">
              <div className="flex items-center gap-2">
                <span>Daily Cash vs Bank COD</span>
              </div>
            </Option>
            <Option value="Current Stock Report">
              <div className="flex items-center gap-2">
                <span>Current Stock Report</span>
              </div>
            </Option>
          </Select>

          <div className="flex items-center gap-2">
            <CustomDatePicker
              selectedData={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setPage(1);
              }}
            />

            <PageListPrint
              tableData={exportData}
              fileName={`${reportType.replace(/\s+/g, "-")}`}
            />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="min-h-[400px]">{renderActiveReport()}</div>
    </div>
  );
};

export default LogisticsTab;
