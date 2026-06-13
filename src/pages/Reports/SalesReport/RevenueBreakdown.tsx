import React from "react";
import { DisplayCurrency } from "../../../utils/currency";

interface RevenueData {
  totalAmount: number;
  totalDiscount: number;
  totalDeliveryCharge: number;
  totalOtherCharge: number;
  totalFinalAmount: number;
  totalPaid: number;
  totalDue: number;
  collectionRate: string;
}

interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: RevenueData;
}

interface RevenueBreakdownProps {
  data: ApiResponse | RevenueData;
}

const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ data }) => {
  const revenueData: RevenueData = "data" in data ? data.data : data;

  const {
    collectionRate,
    totalAmount,
    totalDeliveryCharge,
    totalDiscount,
    totalDue,
    totalFinalAmount,
    totalOtherCharge,
    totalPaid,
  } = revenueData;

  // No longer needed, using DisplayCurrency instead

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-black">Revenue Summary</h2>
        <div className="bg-green-100 px-3 py-1 rounded-full">
          <span className="text-green-800 text-sm font-medium">
            {collectionRate}% Collection Rate
          </span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="text-gray-600 text-sm mb-1">Total Amount</div>
        <div className="text-lg font-semibold text-primary">
          <DisplayCurrency amount={totalAmount} />
        </div>
      </div>

      {/* Adjustments */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Discount</span>
          <span className="text-black">
            -<DisplayCurrency amount={totalDiscount} />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Charge</span>
          <span className="text-primary">
            +<DisplayCurrency amount={totalDeliveryCharge} />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Other Charges</span>
          <span className="text-primary">
            +<DisplayCurrency amount={totalOtherCharge} />
          </span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Paid</span>
          <span className="text-primary font-medium">
            <DisplayCurrency amount={totalPaid} />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Due</span>
          <span className="text-red-600 font-medium">
            <DisplayCurrency amount={totalDue} />
          </span>
        </div>
      </div>

      {/* Final Amount */}
      <div className="flex justify-between items-center py-3 mt-4 border-t border-gray-100">
        <span className="font-semibold text-sm text-black">Final Amount</span>
        <span className="text-base font-bold text-primary">
          <DisplayCurrency amount={totalFinalAmount} />
        </span>
      </div>
    </div>
  );
};

export default RevenueBreakdown;
