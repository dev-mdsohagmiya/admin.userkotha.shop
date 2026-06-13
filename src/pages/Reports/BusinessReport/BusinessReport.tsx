import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { useSidebar } from "../../../context/SidebarContext";
import { useModulePermissions } from "../../../hooks/usePermissions";
import LogisticsTab from "./Tabs/LogisticsTab";
import OrderManagementTab from "./Tabs/OrderManagementTab";
import ParcelTab from "./Tabs/ParcelTab";

const BusinessReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isExpanded } = useSidebar();

  const { allActions, isSuperAdmin } =
    useModulePermissions("Business Report");

  const tabPermissionMap: Record<string, string> = useMemo(
    () => ({
      "order-management": "view_order_management",
      logistics: "view_logistics",
      parcel: "view_parcel",
    }),
    [],
  );

  const topTabs = useMemo(() => {
    const fullTabs = [
      {
        label: "Order Management",
        key: "order-management",
      },
      {
        label: "Logistics",
        key: "logistics",
      },
      {
        label: "Parcel",
        key: "parcel",
      },
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
    return topTabs.length > 0 ? topTabs[0].key : "order-management";
  }, [tabParam, validTabKeys, topTabs]);

  const activeTab = useMemo(
    () =>
      topTabs.find((tab) => tab.key === activeTabKey)?.label ||
      "Order Management",
    [topTabs, activeTabKey],
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Order Management":
        return <OrderManagementTab />;
      case "Logistics":
        return <LogisticsTab />;
      case "Parcel":
        return <ParcelTab />;
      // case "Employee Performance":
      //   return <EmployeePerformanceTab />;
      default:
        return <OrderManagementTab />;
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      <PageMeta
        title="Business Reports | UserKotha.Shop ERP"
        description="Comprehensive analytics across orders, logistics, and inventory"
      />
      <PageHeader
        title="Business Reports"
        subtitle="Comprehensive analytics across orders, logistics, and inventory"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Business Reports" },
        ]}
      />
      <div
        className={`!w-full mb-4 overflow-x-auto ant-table-wrapper !bg-transparent ${
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
        {/* Navigation Tabs */}
        <div className="">
          <div className="flex justify-start gap-8 pb-6">
            {topTabs.map((tab) => {
              const isActive = activeTabKey === tab.key;
              return (
                <button
                  key={tab.label}
                  onClick={() => setSearchParams({ tab: tab.key })}
                  className={`flex items-center gap-2 py-4 text-sm -ml-2 font-medium transition-all border-b-2 ${
                    isActive
                      ? "text-primary border-primary"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  <span
                    className={isActive ? "text-primary" : "text-gray-400"}
                  ></span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Wrapper */}
          <div>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default BusinessReport;
