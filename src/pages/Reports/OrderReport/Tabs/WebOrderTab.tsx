import { useState } from "react";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import OrderOverviewSubTab from "./WebOrderSubTabs/OrderOverviewSubTab";
import ProductPerformanceSubTab from "./WebOrderSubTabs/ProductPerformanceSubTab";
import OrderChannelSubTab from "./WebOrderSubTabs/OrderChannelSubTab";

const WebOrderTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("Order Overview");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const subTabs = ["Order Overview", "Product Performance", "Order Channel"];

  const orderStatusData = [
    {
      status: "Complete",
      count: 281,
      amount: "৳3,41,600",
      percentage: 46.3,
      color: "bg-amber-500",
    },
    {
      status: "Incomplete",
      count: 102,
      amount: "৳1,18,170",
      percentage: 16.8,
      color: "bg-gray-800",
    },
    {
      status: "Cancel",
      count: 100,
      amount: "৳1,16,930",
      percentage: 16.5,
      color: "bg-amber-600",
    },
    {
      status: "Good But No Response",
      count: 67,
      amount: "৳83,100",
      percentage: 11.0,
      color: "bg-rose-500",
    },
    {
      status: "Processing",
      count: 30,
      amount: "৳38,300",
      percentage: 4.9,
      color: "bg-teal-500",
    },
  ];

  const productsData = [
    {
      id: 1,
      name: "চিটা শুঁটকি - ৫০০ গ্রাম",
      sku: "AF-68",
      orders: 118,
      quantity: 136,
      amount: "৳1,34,640",
      top: "Top 1",
    },
    {
      id: 2,
      name: "ব্রাউন ফিশ শুঁটকি",
      sku: "AF-15-1",
      orders: 113,
      quantity: 125,
      amount: "৳1,23,750",
      top: "Top 2",
    },
    {
      id: 3,
      name: "লইট্টা শুঁটকি",
      sku: "AF-35-2",
      orders: 83,
      quantity: 87,
      amount: "৳91,350",
      top: "Top 3",
    },
    {
      id: 4,
      name: "খেজুরের ঝোলা গুড় / Khejur Jola Gur",
      sku: "AF-18-3",
      orders: 67,
      quantity: 77,
      amount: "৳88,550",
    },
  ];

  const renderActiveSubTabContent = () => {
    switch (activeSubTab) {
      case "Order Overview":
        return (
          <OrderOverviewSubTab
            orderStatusData={orderStatusData}
            dateRange={dateRange}
          />
        );
      case "Product Performance":
        return <ProductPerformanceSubTab dateRange={dateRange} />;
      case "Order Channel":
        return <OrderChannelSubTab dateRange={dateRange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-10">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight leading-none mb-1">
            Web Order Report
          </h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Detailed Web Analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CustomDatePicker
            onChange={(dates) => setDateRange(dates)}
            selectedData={dateRange}
          />
          <PageListPrint
            tableData={
              activeSubTab === "Order Overview" ? orderStatusData : productsData
            }
            fileName={`Web-Order-${activeSubTab.replace(" ", "-")}`}
          />
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveSubTab(tab);
              setDateRange([null, null]);
            }}
            className={`px-6 py-3 text-xs font-bold transition-all relative ${
              activeSubTab === tab
                ? "text-primary bg-primary/5 border-b-2 border-primary"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-2">{renderActiveSubTabContent()}</div>
    </div>
  );
};

export default WebOrderTab;
