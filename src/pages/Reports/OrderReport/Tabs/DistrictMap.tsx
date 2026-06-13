import { useState } from "react";

import DistrictView from "./DistrictMapSubTabs/DistrictView";
import DivisionView from "./DistrictMapSubTabs/DivisionView";
import CourierView from "./DistrictMapSubTabs/CourierView";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";

const DistrictMap = () => {
  const [activeSubTab, setActiveSubTab] = useState("Districts");
  const [activeMetric, setActiveMetric] = useState("Orders");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const subTabs = ["Districts", "Divisions", "Courier"];
  const metrics = [
    { label: "Orders" },
    { label: "Revenue" },
    { label: "Delivery %" },
    { label: "Return %" },
  ];

  const renderSubTab = () => {
    switch (activeSubTab) {
      case "Districts":
        return <DistrictView activeMetric={activeMetric} dateRange={dateRange} />;
      case "Divisions":
        return (
          <DivisionView activeMetric={activeMetric} dateRange={dateRange} />
        );
      case "Courier":
        return (
          <CourierView activeMetric={activeMetric} dateRange={dateRange} />
        );
      default:
        return <DistrictView activeMetric={activeMetric} dateRange={dateRange} />;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Sub Tabs & Metric Selector Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Sub Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeSubTab === tab
                  ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <div>
            <CustomDatePicker
              onChange={(dates) => {
                setDateRange(dates);
              }}
              selectedData={dateRange}
            />
          </div>
          {/* Metric Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 ">
            {metrics.map((m) => (
              <button
                key={m.label}
                onClick={() => setActiveMetric(m.label)}
                className={`flex items-center  gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${
                  activeMetric === m.label
                    ? "bg-white  text-primary border border-gray-200 dark:bg-white dark:text-gray-900"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid - 3 Cards as per image */}

      {/* Content area */}
      <div className="mt-4">{renderSubTab()}</div>
    </div>
  );
};

export default DistrictMap;
