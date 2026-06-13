import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { useSidebar } from "../../../context/SidebarContext";
import { useModulePermissions } from "../../../hooks/usePermissions";
import DeliveredOrdersTab from "./Tabs/DeliveredOrdersTab";
import ProfitSalesChartTab from "./Tabs/ProfitSalesChartTab";
import SalesTab from "./Tabs/SalesTab";
import SummaryTab from "./Tabs/SummaryTab";

const ProfitAndSalesReport = () => {
  const { isExpanded } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const { allActions, isSuperAdmin } = useModulePermissions(
    "Profit & Sales Report",
  );

  const tabPermissionMap: Record<string, string> = useMemo(
    () => ({
      summary: "view_summary",
      sales: "view_sales",
      "delivered-orders": "view_delivered_orders",
      "profit-sales-chart": "view_profit_sales_chart",
    }),
    [],
  );

  const tabs = useMemo(() => {
    const fullTabs = [
      { label: "Summary", key: "summary" },
      { label: "Sales", key: "sales" },
      { label: "Delivered Orders", key: "delivered-orders" },
      { label: "Profit & Sales Chart", key: "profit-sales-chart" },
    ];

    return fullTabs.filter((tab) => {
      if (isSuperAdmin) return true;
      const perm = tabPermissionMap[tab.key];
      return allActions.includes(perm);
    });
  }, [allActions, isSuperAdmin, tabPermissionMap]);

  const tabKeys = useMemo(() => new Set(tabs.map((tab) => tab.key)), [tabs]);
  const activeTabParam = searchParams.get("tab");

  // Determine initial active tab based on permissions
  const activeTabKey = useMemo(() => {
    if (activeTabParam && tabKeys.has(activeTabParam)) {
      return activeTabParam;
    }
    return tabs.length > 0 ? tabs[0].key : "summary";
  }, [activeTabParam, tabKeys, tabs]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeTabKey)?.label || "Summary",
    [tabs, activeTabKey],
  );

  const renderContent = () => {
    switch (activeTabKey) {
      case "summary":
        return <SummaryTab dateRange={dateRange} />;
      case "sales":
        return <SalesTab dateRange={dateRange} />;
      case "delivered-orders":
        return <DeliveredOrdersTab dateRange={dateRange} />;
      case "profit-sales-chart":
        return <ProfitSalesChartTab dateRange={dateRange} />;
      default:
        return <SummaryTab dateRange={dateRange} />;
    }
  };

  return (
    <>
      <PageMeta
        title="Profit & Sales Report | UserKotha.Shop ERP"
        description="Profit and sales analytics overview"
      />

      <PageHeader
        title="Profit & Sales Report"
        subtitle="Track revenue, cost, and profit performance"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Reports" },
          { title: "Profit & Sales Report" },
        ]}
        extra={
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        }
      />

      <div
        className={`w-full overflow-x-auto ant-table-wrapper border-b border-gray-200 dark:border-gray-700 !bg-transparent pt-2 mb-6 ${
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
        <div className="flex gap-6 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setSearchParams({ tab: tab.key })}
                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {renderContent()}
    </>
  );
};

export default ProfitAndSalesReport;
