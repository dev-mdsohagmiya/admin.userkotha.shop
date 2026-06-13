import { useState } from "react";
import WebOrderCancellationSubTab from "./order-cancellations-subtab/WebOrderCancellationSubTab";
import OrderListCancellationSubTab from "./order-cancellations-subtab/OrderListCancellationSubTab";

const OrderCancellationsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("Web Order Cancellation");

  const subTabs = [
    {
      label: "Web Order Cancellation",
      component: <WebOrderCancellationSubTab />,
    },
    {
      label: "Order List Cancellation ",
      component: <OrderListCancellationSubTab />,
    },
  ];

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Order cancellation report
        </h2>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.label;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveSubTab(tab.label)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-gray-900 dark:text-white border-primary font-semibold"
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
        {subTabs.find((tab) => tab.label === activeSubTab)?.component}
      </div>
    </div>
  );
};

export default OrderCancellationsTab;
