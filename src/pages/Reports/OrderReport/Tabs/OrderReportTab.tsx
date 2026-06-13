import { useSearchParams } from "react-router-dom";
import OverviewSubTab from "./OrderReportSubTabs/OverviewSubTab";
import MainReportSubTab from "./OrderReportSubTabs/MainReportSubTab";
import AdvanceReportSubTab from "./OrderReportSubTabs/AdvanceReportSubTab";
import ProductReportSubTab from "./OrderReportSubTabs/ProductReportSubTab";
import OrderTagReportSubTab from "./OrderReportSubTabs/OrderTagReportSubTab";
import CrossSaleReportSubTab from "./OrderReportSubTabs/CrossSaleReportSubTab";
import ReturnsSubTab from "./OrderReportSubTabs/ReturnsSubTab";
import CancellationsSubTab from "./OrderReportSubTabs/CancellationsSubTab";

const OrderReportTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const subTabs = [
    { label: "Overview", key: "overview" },
    { label: "Main Report", key: "main-report" },
    { label: "Advance Report", key: "advance-report" },
    { label: "Product Report", key: "product-report" },
    { label: "Order Tag Report", key: "order-tag-report" },
    { label: "Cross Sale Report", key: "cross-sale-report" },
    { label: "Returns", key: "returns" },
    { label: "Cancellations", key: "cancellations" },
  ];
  const validSubTabKeys = new Set(subTabs.map((tab) => tab.key));
  const subTabParam = searchParams.get("subTab");
  const activeSubTabKey =
    subTabParam && validSubTabKeys.has(subTabParam) ? subTabParam : "overview";
  const activeSubTab =
    subTabs.find((tab) => tab.key === activeSubTabKey)?.label || "Overview";

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "Overview":
        return <OverviewSubTab />;
      case "Main Report":
        return <MainReportSubTab />;
      case "Advance Report":
        return <AdvanceReportSubTab />;
      case "Product Report":
        return <ProductReportSubTab />;
      case "Order Tag Report":
        return <OrderTagReportSubTab />;
      case "Cross Sale Report":
        return <CrossSaleReportSubTab />;
      case "Returns":
        return <ReturnsSubTab />;
      case "Cancellations":
        return <CancellationsSubTab />;
      default:
        return <OverviewSubTab />;
    }
  };

  return (
    <div className="w-full font-outfit pb-10">
      {/* Sub Tab Navigation - Pill Style Design */}
      <div className="w-full overflow-x-auto mb-8 pb-1 no-scrollbar">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40 p-1 rounded-[6px] border border-gray-200 dark:border-gray-700 w-fit min-w-max">
          {subTabs.map((tab) => {
            const isActive = activeSubTabKey === tab.key;
            return (
              <button
                key={tab.label}
                onClick={() =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("subTab", tab.key);
                    return next;
                  })
                }
                className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold transition-all whitespace-nowrap rounded-[6px] ${
                  isActive
                    ? "bg-white dark:bg-gray-700 text-primary  border border-gray-200 dark:border-gray-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-800/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tab Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderSubTabContent()}
      </div>
    </div>
  );
};

export default OrderReportTab;
