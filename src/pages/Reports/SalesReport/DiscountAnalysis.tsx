import React from "react";
import { DisplayCurrency } from "../../../utils/currency";

interface DiscountData {
  totalSales: number;
  totalAmount: number;
  totalDiscount: number;
  totalFinalAmount: number;
  averageDiscount: number;
  discountPercentage: string;
  salesWithDiscount: number;
  salesWithoutDiscount: number;
}

interface DiscountAnalysisProps {
  data: DiscountData;
}

const DiscountAnalysis: React.FC<DiscountAnalysisProps> = ({ data }) => {
  const {
    totalSales,
    totalAmount,
    totalDiscount,
    totalFinalAmount,
    averageDiscount,
    discountPercentage,
    salesWithDiscount,
    salesWithoutDiscount,
  } = data;

  // No longer needed, using DisplayCurrency instead

  const formatPercentage = (value: string | number): string => {
    return `${parseFloat(value?.toString())?.toFixed(2)}%`;
  };

  const withDiscountPercentage = (salesWithDiscount / totalSales) * 100;
  const withoutDiscountPercentage = (salesWithoutDiscount / totalSales) * 100;

  return (
    <div className="bg-white rounded-lg  border border-gray-200 p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-black">
          Discount Analysis
        </h2>
        <div className="bg-green-100 px-3 py-1 rounded-full">
          <span className="text-green-800 text-sm font-medium">
            {formatPercentage(discountPercentage)} Off
          </span>
        </div>
      </div>

      {/* Total Sales Overview */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="text-gray-600 text-sm mb-1">Total Sales</div>
        <div className="text-lg font-semibold text-black">
          {totalSales} Orders
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="text-sm font-semibold text-gray-500 mb-2">
          Amount Breakdown
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Original Amount</span>
          <span className="text-green-600 font-semibold">
            <DisplayCurrency amount={totalAmount} />
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Discount</span>
          <span className="text-black font-semibold">
            -<DisplayCurrency amount={totalDiscount} />
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Final Amount</span>
          <span className="text-green-600 font-semibold">
            <DisplayCurrency amount={totalFinalAmount} />
          </span>
        </div>
      </div>

      {/* Discount Statistics */}
      <div className="space-y-2 mb-4">
        <div className="text-sm font-semibold text-gray-500 mb-2">
          Discount Statistics
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Average Discount</span>
          <span className="text-black font-semibold">
            <DisplayCurrency amount={averageDiscount} />
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Discount Rate</span>
          <span className="text-green-600 font-semibold">
            {formatPercentage(discountPercentage)}
          </span>
        </div>
      </div>

      {/* Sales Distribution */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-500 mb-2">
          Sales Distribution
        </div>

        <div className="space-y-2">
          {/* With Discount */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">With Discount</span>
              <span className="font-semibold text-orange-600">
                {salesWithDiscount} ({formatPercentage(withDiscountPercentage)})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${withDiscountPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Without Discount */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Without Discount</span>
              <span className="font-semibold text-green-600">
                {salesWithoutDiscount} (
                {formatPercentage(withoutDiscountPercentage)})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${withoutDiscountPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountAnalysis;
