import React from "react";
import { ShoppingCart, CreditCard } from "lucide-react";
import {
  useGetPurchaseMonthlyComparisonQuery,
  useGetPurchaseVsPaymentQuery,
} from "../../../redux/features/purchases-management/purchasesManagementApi";
import { DisplayCurrency } from "../../../utils/currency";

const FinancialOverviewCards: React.FC = () => {
  const { data: purchaseVsPaymentData, isLoading: isPaymentLoading } =
    useGetPurchaseVsPaymentQuery(undefined);
  const { data: monthlyComparisonData, isLoading: isMonthlyLoading } =
    useGetPurchaseMonthlyComparisonQuery(undefined);

  if (isPaymentLoading || isMonthlyLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-black">
        Loading financial data...
      </div>
    );
  }

  const monthlyList = monthlyComparisonData?.data || [];
  const paymentList = purchaseVsPaymentData?.data || [];

  if (!monthlyList.length || !paymentList.length) {
    return (
      <div className="flex justify-center items-center h-40 text-orange-500">
        No financial data available
      </div>
    );
  }

  return (
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ---------------- CARD 1: Monthly Purchase ---------------- */}
        <div className="p-4 border rounded-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-black">
                Purchase Overview
              </h4>
              <p className="text-sm text-primary font-semibold">
                Monthly financial summary
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-60">
            {monthlyList.map((item: any, i: number) => (
              <div
                key={i}
                className="border-b border-green-200 pb-2 mb-3 last:border-0 last:mb-0"
              >
                <p className="text-sm font-medium text-black mb-1">
                  {item.month}
                </p>
                <div className="flex justify-between py-1 text-sm text-black">
                  <span>Total Purchases:</span>
                  <span className="font-bold text-primary">
                    {item.totalPurchases}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <span>Total Amount:</span>
                  <span className="font-bold text-primary">
                    <DisplayCurrency amount={item.totalAmount} />
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <span>Total Paid</span>
                  <span className="font-bold text-primary">
                    <DisplayCurrency amount={item.totalPaid} />
                  </span>
                </div>

                <div className="flex justify-between py-1 text-sm text-black">
                  <span>Total Due:</span>
                  <span className="font-bold text-red-500">
                    <DisplayCurrency amount={item.totalDue} />
                  </span>
                </div>
                <div className="flex justify-between py-1 text-sm text-black">
                  <span>VAT:</span>
                  <span className="font-bold text-primary">
                    <DisplayCurrency amount={item.totalVAT} />
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <span>Discount:</span>
                  <span className="font-bold text-orange-500">
                    <DisplayCurrency amount={item.totalDiscount} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- CARD 2: Payment Overview ---------------- */}
        <div className="p-4 border rounded-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-black">
                Payment Status
              </h4>
              <p className="text-sm font-semibold text-primary">
                Monthly payment report
              </p>
            </div>
          </div>

          {/* ✅ TOTAL SUMMARY SECTION WITH ONE PROGRESS BAR */}
          {(() => {
            const totalPurchase = paymentList.reduce(
              (sum: number, p: any) => sum + p.purchaseAmount,
              0,
            );
            const totalPaid = paymentList.reduce(
              (sum: number, p: any) => sum + p.paidAmount,
              0,
            );
            const totalDue = paymentList.reduce(
              (sum: number, p: any) => sum + p.dueAmount,
              0,
            );

            const paidPercent = (totalPaid / totalPurchase) * 100 || 0;
            const duePercent = 100 - paidPercent;

            return (
              <div className="">
                <div className="flex justify-between text-sm text-black">
                  <span>Total Purchase:</span>
                  <span className="font-bold text-primary">
                    <DisplayCurrency amount={totalPurchase} />
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1 text-black">
                  <span>Total Paid:</span>
                  <span className="font-bold text-primary">
                    <DisplayCurrency amount={totalPaid} />
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <span>Total Due:</span>
                  <span className="font-bold text-red-500">
                    <DisplayCurrency amount={totalDue} />
                  </span>
                </div>

                {/* Only ONE total progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-black mb-1">
                    <span className="font-semibold text-primary">
                      Paid: {paidPercent.toFixed(1)}%
                    </span>
                    <span className="text-red-500 font-semibold">
                      Due: {duePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${paidPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
 
  );
};

export default FinancialOverviewCards;
