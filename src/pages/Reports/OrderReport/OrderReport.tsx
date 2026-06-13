import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { useSidebar } from "../../../context/SidebarContext";
import { useModulePermissions } from "../../../hooks/usePermissions";
import CombinedOrderTab from "./Tabs/CombinedOrderTab";
import DistrictMap from "./Tabs/DistrictMap";
import OrderReportTab from "./Tabs/OrderReportTab";
import StatusUpdatesTab from "./Tabs/StatusUpdatesTab";
import WebOrderTab from "./Tabs/WebOrderTab";

const OrderReport = () => {
  const { isExpanded } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();

  const { allActions, isSuperAdmin } = useModulePermissions("Order Report");

  const tabPermissionMap: Record<string, string> = useMemo(
    () => ({
      combined: "view_combined",
      "order-report": "view_order_report",
      "district-map": "view_district_map",
      "status-updates": "view_status_updates",
      "web-order": "view_web_order",
    }),
    [],
  );

  const topTabs = useMemo(() => {
    const fullTabs = [
      { label: "Combined", key: "combined" },
      { label: "Order Report", key: "order-report" },
      { label: "District Map", key: "district-map" },
      { label: "Status Updates", key: "status-updates" },
      { label: "Web Order", key: "web-order" },
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
    return topTabs.length > 0 ? topTabs[0].key : "combined";
  }, [tabParam, validTabKeys, topTabs]);

  const activeTab = useMemo(
    () => topTabs.find((tab) => tab.key === activeTabKey)?.label || "Combined",
    [topTabs, activeTabKey],
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Combined":
        return <CombinedOrderTab />;
      case "Order Report":
        return <OrderReportTab />;
      case "District Map":
        return <DistrictMap />;
      case "Status Updates":
        return <StatusUpdatesTab />;
      case "Web Order":
        return <WebOrderTab />;
      // case "Financials":
      //   return <FinancialsTab />;
      default:
        return <CombinedOrderTab />;
    }
  };

  return (
    <>
      <PageMeta
        title="Order Report | UserKotha.Shop ERP"
        description="Comprehensive order analytics and reports"
      />

      <PageHeader
        title="Order Reports"
        subtitle="Comprehensive order analytics"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Reports" },
          { title: "Order Report" },
        ]}
      />

      {/* Top Navigation Tabs - Original Border Bottom Style */}
      <div
        className={`w-full overflow-x-auto ant-table-wrapper border-b border-gray-200 dark:border-gray-700 !bg-transparent pt-2 mb-6 ${
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
        <div className="flex gap-6 no-scrollbar">
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

export default OrderReport;
