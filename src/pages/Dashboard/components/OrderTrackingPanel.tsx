import React, { useState } from "react";
import IncompleteOrderTracking from "./IncompleteOrderTracking";
import WebOrderTracking from "./WebOrderTracking";

type TrackingTab = "web" | "incomplete";

const TABS: { id: TrackingTab; label: string }[] = [
  { id: "web", label: "Web Order Tracking" },
  { id: "incomplete", label: "Incomplete Order Tracking" },
];

const OrderTrackingPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TrackingTab>("web");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 pt-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all relative rounded-t-md ${
                activeTab === tab.id
                  ? "text-primary bg-primary/5 border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "web" ? (
          <WebOrderTracking embedded />
        ) : (
          <IncompleteOrderTracking embedded />
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPanel;
