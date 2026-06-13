import React from "react";
import { Loader } from "../../../components/common/Loading";

import { DisplayCurrency } from "../../../utils/currency";

interface UserPerformanceData {
  userId: string;
  totalSales: number;
  totalAmount: number;
  totalDiscount: number;
  totalItems: number;
  averageOrderValue: number;
  userName?: string;
  userEmail?: string;
}

interface UserPerformanceProps {
  data: UserPerformanceData[];
  loading: boolean;
  fetching: boolean;
}

const UserPerformance: React.FC<UserPerformanceProps> = ({
  data,
  loading,
  fetching,
}) => {
  const sortedData = [...data]?.sort((a, b) => b.totalAmount - a.totalAmount);

  const totals = {
    totalSales: sortedData.reduce((sum, user) => sum + user.totalSales, 0),
    totalAmount: sortedData.reduce((sum, user) => sum + user.totalAmount, 0),
    totalDiscount: sortedData.reduce(
      (sum, user) => sum + user.totalDiscount,
      0,
    ),
    totalItems: sortedData.reduce((sum, user) => sum + user.totalItems, 0),
  };

  if (!loading && !fetching && sortedData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Performance Data
          </h3>
          <p className="text-gray-500">
            No user performance data available yet.
          </p>
        </div>
      </div>
    );
  }

  if (loading || fetching) return <Loader />;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}`;
    }
  };

  return (
    <div className="p-6 bg-white rounded-md  mb-4 border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-semibold">Sales Leaderboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Top performing users by sales
          </p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <div className="text-[16px] font-bold ">
            <DisplayCurrency amount={totals.totalAmount} />
          </div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedData.map((user, index) => (
          <div
            key={user.userId}
            className="p-4 rounded-md border border-gray-200 bg-white   transition-all h-[130px]"
          >
            <div className="flex items-center justify-between">
              {/* Rank + Info */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-primary font-bold border border-gray-200">
                  {getRankIcon(index)}
                </div>
                <div>
                  <div className="font-semibold text-black">
                    User {user.userId.slice(-6)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.totalSales} sales • {user.totalItems} items
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="text-right">
                <div className="text-sm font-semibold ">
                  <DisplayCurrency amount={user.totalAmount} />
                </div>
                <div className="text-sm text-gray-600">
                  Avg:{" "}
                  <DisplayCurrency
                    amount={Math.round(user.averageOrderValue)}
                  />
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1 text-gray-600">
                <span>Performance</span>
                <span>
                  {Math.round(
                    (user.totalAmount / sortedData[0].totalAmount) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: `${
                      (user.totalAmount / sortedData[0].totalAmount) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-white rounded-md border ">
        <h3 className="font-semibold  mb-3">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Top Performer:</span>
              <span className="font-semibold text-black">
                User {sortedData[0]?.userId.slice(-6)} -{" "}
                <DisplayCurrency amount={sortedData[0]?.totalAmount || 0} />
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Average Order Value:</span>
              <span className="font-semibold text-black">
                <DisplayCurrency
                  amount={Math.round(totals.totalAmount / totals.totalSales)}
                />
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Users:</span>
              <span className="font-semibold text-black">
                {sortedData.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount Usage:</span>
              <span className="font-semibold text-black">
                <DisplayCurrency amount={totals.totalDiscount} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPerformance;
