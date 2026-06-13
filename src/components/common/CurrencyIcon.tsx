import React from "react";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

interface CurrencyIconProps {
  className?: string;
  size?: number;
}

/**
 * Bangladeshi Taka Currency Icon Component
 * @param className - Optional CSS classes
 * @param size - Optional icon size (default: 14)
 */
const CurrencyIcon: React.FC<CurrencyIconProps> = ({
  className = "",
  size = 14,
}) => {
  return (
    <span
      className={`${className} font-bold`}
      style={{ fontSize: size ? `${size}px` : "14px" }}
    >
      <FaBangladeshiTakaSign />

    </span>
  );
};

export default CurrencyIcon;
