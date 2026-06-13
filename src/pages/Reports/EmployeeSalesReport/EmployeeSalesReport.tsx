import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { useModulePermissions } from "../../../hooks/usePermissions";
import EmployeeReportTab from "./Tabs/EmployeeReportTab";
import OrderCancellationsTab from "./Tabs/OrderCancellationsTab";
import OrderCompletionsTab from "./Tabs/OrderCompletionsTab";
import CombinedEmployeeReportTab from "./Tabs/PerformanceReport";
import WebOrderUpdatesTab from "./Tabs/WebOrderUpdatesTab";
import WorkLogTab from "./Tabs/WorkLogTab";

const EmployeeSalesReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { allActions, isSuperAdmin } =
    useModulePermissions("Employee Sales Report");

  const tabPermissionMap: Record<string, string> = useMemo(
    () => ({
      "employee-report": "view_employee_report",
      "performance-report": "view_performance_report",
      "web-order-updates": "view_web_order_updates",
      "order-cancellations": "view_order_cancellations",
      "work-log": "view_work_log",
      "order-completions": "view_order_completions",
    }),
    [],
  );

  const topTabs = useMemo(() => {
    const fullTabs = [
      { label: "Employee Report", key: "employee-report" },
      { label: "Performance Report", key: "performance-report" },
      { label: "Web Order Updates", key: "web-order-updates" },
      { label: "Order Cancellations", key: "order-cancellations" },
      { label: "Work Log", key: "work-log" },
      { label: "Order Completions", key: "order-completions" },
    ];

    return fullTabs.filter((tab) => {
      if (isSuperAdmin) return true;
      const perm = tabPermissionMap[tab.key];
      return allActions.includes(perm);
    });
  }, [allActions, isSuperAdmin, tabPermissionMap]);

  const validTabKeys = useMemo(
    () => new Set(topTabs.map((tab) => tab.key)),
    [topTabs],
  );
  const tabParam = searchParams.get("tab");

  const activeTabKey = useMemo(() => {
    if (tabParam && validTabKeys.has(tabParam)) {
      return tabParam;
    }
    return topTabs.length > 0 ? topTabs[0].key : "employee-report";
  }, [tabParam, validTabKeys, topTabs]);

  const activeTab = useMemo(
    () =>
      topTabs.find((tab) => tab.key === activeTabKey)?.label ||
      "Employee Report",
    [topTabs, activeTabKey],
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Employee Report":
        return <EmployeeReportTab />;
      case "Performance Report":
        return <CombinedEmployeeReportTab />;
      case "Web Order Updates":
        return <WebOrderUpdatesTab />;
      case "Order Cancellations":
        return <OrderCancellationsTab />;
      case "Work Log":
        return <WorkLogTab />;
      case "Order Completions":
        return <OrderCompletionsTab />;
      default:
        return <EmployeeReportTab />;
    }
  };

  return (
    <>
      <PageMeta
        title="Employee Sales Report | Amzad Food ERP"
        description="View employee sales performance and statistics"
      />
      <PageHeader
        title="Employee Sales Report"
        subtitle="View and manage all Employee Sales Report"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Employee Sales Report" },
        ]}
      />

      {/* Top Navigation Tabs - Now at the very top */}
      <div className="border-b border-gray-200 dark:border-gray-700 pt-2 mb-4">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {topTabs.map((tab) => {
            const isActive = activeTabKey === tab.key;
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

      {/* Render Active Tab Content */}
      <div className="">{renderContent()}</div>
    </>
  );
};

export default EmployeeSalesReport;
