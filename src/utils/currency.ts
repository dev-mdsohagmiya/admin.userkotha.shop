import React from "react";
import CurrencyIcon from "../components/common/CurrencyIcon";

/**
 * Format number as Bangladeshi currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with taka symbol
 */
export const formatCurrency = (
  amount: number | undefined | null,
  decimals: number = 2,
): string => {
  if (amount === undefined || amount === null) return "TK 0.00";
  return `${amount.toFixed(decimals)}`;
};

/**
 * Format number as Bangladeshi currency with locale
 * @param amount - The amount to format
 * @returns Formatted string with taka symbol and comma separators
 */
export const formatCurrencyLocale = (
  amount: number | undefined | null,
): string => {
  if (amount === undefined || amount === null) return "0.00";
  return `${amount.toLocaleString()}`;
};

/**
 * Display currency with the Taka Icon (React Component)
 */
export const DisplayCurrency = ({
  amount,
  size = 14,
  className = "",
  decimals = 2,
  showLocale = true,
}: {
  amount: number | undefined | null;
  size?: number;
  className?: string;
  decimals?: number;
  showLocale?: boolean;
}) => {
  const formattedAmount =
    amount === undefined || amount === null
      ? "0.00"
      : showLocale
        ? amount.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : amount.toFixed(decimals);

  return React.createElement(
    "span",
    { className: `inline-flex items-center gap-1 ${className}` },
    React.createElement(CurrencyIcon, { size }),
    formattedAmount,
  );
};

export { CurrencyIcon };
export default CurrencyIcon;
