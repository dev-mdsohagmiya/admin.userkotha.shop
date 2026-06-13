import { useSearchParams } from "react-router-dom";
import OrderStatusSubTab from "./employ-subtab/OrderStatusSubTab";
import OrderSourcesSubTab from "./employ-subtab/OrderSourcesSubTab";
import ProductReportSubTab from "./employ-subtab/ProductReportSubTab";
import OtherSubTab from "./employ-subtab/OtherSubTab";
import AllSubTab from "./employ-subtab/AllSubTab";
import { useModulePermissions } from "../../../../hooks/usePermissions";
import { useMemo } from "react";

const EmployeeReportTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { allActions, isSuperAdmin } =
    useModulePermissions("Employee Sales Report");

  const subTabPermissionMap: Record<string, string> = useMemo(
    () => ({
      "order-status": "view_order_status_sub",
      "order-sources": "view_order_sources_sub",
      "product-report": "view_product_report_sub",
      other: "view_other_sub",
      all: "view_all_sub",
    }),
    [],
  );

  const subTabs = useMemo(() => {
    const fullSubTabs = [
      {
        label: "Order Status",
        key: "order-status",
        component: <OrderStatusSubTab />,
      },
      {
        label: "Order Sources",
        key: "order-sources",
        component: <OrderSourcesSubTab />,
      },
      {
        label: "Product Report",
        key: "product-report",
        component: <ProductReportSubTab />,
      },
      { label: "Other", key: "other", component: <OtherSubTab /> },
      { label: "All", key: "all", component: <AllSubTab /> },
    ];

    const filtered = fullSubTabs.filter((tab) => {
      if (isSuperAdmin) return true;
      const perm = subTabPermissionMap[tab.key];
      return allActions.includes(perm);
    });

    const allEntry = filtered.find((tab) => tab.key === "all");
    const rest = filtered.filter((tab) => tab.key !== "all");
    return allEntry ? [allEntry, ...rest] : filtered;
  }, [allActions, isSuperAdmin, subTabPermissionMap]);

  const validKeys = useMemo(
    () => new Set(subTabs.map((tab) => tab.key)),
    [subTabs],
  );
  const subTabParam = searchParams.get("subTab");

  const activeSubTabKey = useMemo(() => {
    if (subTabParam && validKeys.has(subTabParam)) {
      return subTabParam;
    }
    return subTabs.length > 0 ? subTabs[0].key : "order-status";
  }, [subTabParam, validKeys, subTabs]);

  return (
    <div className="">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Advanced Employee Report
        </h1>
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 mt-4 mb-6">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {subTabs.map((tab) => {
            const isActive = activeSubTabKey === tab.key;
            return (
              <button
                key={tab.label}
                onClick={() => setSearchParams({ subTab: tab.key })}
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

      <div className="tab-content">
        {subTabs.find((tab) => tab.key === activeSubTabKey)?.component}
      </div>
    </div>
  );
};

export default EmployeeReportTab;
