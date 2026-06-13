import { useState } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
  FiArrowUpRight,
  FiArrowDownRight,
  FiBriefcase,
  FiCreditCard as FiPayment,
} from "react-icons/fi";

const FinancialsTab = () => {
  const [activeRange, setActiveRange] = useState("30D");

  const summaryData = [
    {
      title: "Total Revenue",
      value: "৳1,427,650",
      change: "+12.5%",
      isPositive: true,
      icon: <FiDollarSign />,
      color: "emerald",
    },
    {
      title: "Net Profit",
      value: "৳458,200",
      change: "+8.2%",
      isPositive: true,
      icon: <FiTrendingUp />,
      color: "blue",
    },
    {
      title: "Avg. Order Value",
      value: "৳2,450",
      change: "-2.4%",
      isPositive: false,
      icon: <FiPieChart />,
      color: "purple",
    },
    {
      title: "Pending Payments",
      value: "৳124,000",
      change: "14 orders",
      isPositive: null,
      icon: <FiBriefcase />,
      color: "amber",
    },
  ];

  const paymentMethods = [
    { method: "Cash on Delivery", amount: "৳850,400", share: 60, icon: "💵" },
    { method: "bKash", amount: "৳420,150", share: 30, icon: "📱" },
    { method: "Credit Card", amount: "৳102,100", share: 7, icon: "💳" },
    { method: "Nagad", amount: "৳55,000", share: 3, icon: "💸" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-10">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
          {["7D", "30D", "90D", "All"].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                activeRange === range
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 balance-card p-5 rounded-xl border border-gray-200 dark:border-gray-800 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 border border-${stat.color}-100 dark:border-${stat.color}-800/50 group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
              {stat.isPositive !== null && (
                <span
                  className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                    stat.isPositive
                      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                      : "text-rose-600 bg-rose-50 dark:bg-rose-900/20"
                  }`}
                >
                  {stat.isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
              {stat.title}
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <FiPayment className="text-primary" /> Payment Methods
            </h3>
          </div>
          <div className="p-6 space-y-5">
            {paymentMethods.map((pm, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{pm.icon}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {pm.method}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 dark:text-white leading-none">
                      {pm.amount}
                    </p>
                    <span className="text-[10px] font-bold text-gray-400">
                      {pm.share}% share
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${pm.share}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Insight Section */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary opacity-5 rounded-full transition-all group-hover:scale-110"></div>
          <div>
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              Financial Integrity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Your overall profit margin has increased by{" "}
              <span className="font-black text-primary">4.2%</span> compared to
              last month. Consider focusing on bKash payments to reduce COD
              transit risks.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Margin Health
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-black text-emerald-500">
                    Strong
                  </span>
                </div>
              </div>
              <button className="text-[10px] font-bold text-primary uppercase border-b border-primary/30 hover:border-primary transition-all">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialsTab;
