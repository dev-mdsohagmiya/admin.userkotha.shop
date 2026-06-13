import React, { useState } from "react";
import ProductInventoryTab from "./InventoryTabs/ProductInventoryTab";
import CategoryWiseInventoryTab from "./InventoryTabs/CategoryWiseInventoryTab";

const InventoryReportTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("Product Inventory");
  const subTabs = ["Product Inventory", "Category Wise"];

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <div className="flex gap-6 border-b border-gray-100 dark:border-gray-800 pb-2">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`text-sm font-bold transition-all border-b-2 pb-2 ${
              activeSubTab === tab
                ? "text-primary border-primary"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === "Product Inventory" ? (
        <ProductInventoryTab />
      ) : (
        <CategoryWiseInventoryTab />
      )}
    </div>
  );
};

export default InventoryReportTab;
