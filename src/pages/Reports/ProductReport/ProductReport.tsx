import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { useSidebar } from "../../../context/SidebarContext";
import { useModulePermissions } from "../../../hooks/usePermissions";
import InventoryReportTab from "./Tabs/InventoryReportTab";
import ProductAZReportTab from "./Tabs/ProductAZReportTab";
import ProductReportTab from "./Tabs/ProductReportTab";
import ProductStatusTab from "./Tabs/ProductStatusTab";
import PurchaseHistory from "./Tabs/PurchaseHistory";

const ProductReport = () => {
  const { isExpanded } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();

  const { allActions, isSuperAdmin } =
    useModulePermissions("Product Report");

  const tabPermissionMap: Record<string, string> = useMemo(
    () => ({
      "product-report": "view_product_report",
      "product-status": "view_product_status",
      "purchase-history": "view_purchase_history",
      "inventory-report": "view_inventory_report",
      "product-a-z": "view_product_a_z",
    }),
    [],
  );

  const topTabs = useMemo(() => {
    const fullTabs = [
      { label: "Product Report", key: "product-report" },
      { label: "Product Status", key: "product-status" },
      { label: "Purchase History", key: "purchase-history" },
      { label: "Inventory Report", key: "inventory-report" },
      { label: "Product A-Z", key: "product-a-z" },
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
    return topTabs.length > 0 ? topTabs[0].key : "product-report";
  }, [tabParam, validTabKeys, topTabs]);

  const activeTab = useMemo(
    () =>
      topTabs.find((tab) => tab.key === activeTabKey)?.label ||
      "Product Report",
    [topTabs, activeTabKey],
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Product Report":
        return <ProductReportTab />;
      case "Product Status":
        return <ProductStatusTab />;
      case "Purchase History":
        return <PurchaseHistory />;
      case "Inventory Report":
        return <InventoryReportTab />;
      case "Product A-Z":
        return <ProductAZReportTab />;
      default:
        return <ProductReportTab />;
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <PageMeta
        title="Product Report | UserKotha.Shop ERP"
        description="Comprehensive product analytics and reports"
      />

      <PageHeader
        title="Product Report"
        subtitle="Analyze product performance, sales trends, and delivery metrics"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Reports" },
          { title: "Product Report" },
        ]}
      />

      {/* Top Navigation Tabs */}
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
    </div>
  );
};

export default ProductReport;
