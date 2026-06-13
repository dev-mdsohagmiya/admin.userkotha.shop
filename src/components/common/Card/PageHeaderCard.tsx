import React from "react";
import CountUp from "react-countup";

interface StatCardProps {
  icon?: React.ReactNode;
  color:
    | "primary"
    | "green"
    | "purple"
    | "indigo"
    | "cyan"
    | "red"
    | "yellow"
    | "blue"
    | "orange"
    | "pink";
  title: string;
  value: string | number | any;
  subtitle?: React.ReactNode;
  count?: boolean;
}

const colorMap: Record<
  string,
  { bg: string; border: string; iconBg: string; hoverBg: string }
> = {
  primary: {
    bg: "bg-primary-50",
    border: "border-primary-400/20",
    iconBg: "bg-primary",
    hoverBg: "hover:bg-primary-100/50",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-400",
    hoverBg: "hover:bg-green-100",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconBg: "bg-purple-400",
    hoverBg: "hover:bg-purple-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    iconBg: "bg-indigo-400",
    hoverBg: "hover:bg-indigo-100",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    iconBg: "bg-cyan-400",
    hoverBg: "hover:bg-cyan-100",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-400",
    hoverBg: "hover:bg-red-100",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    iconBg: "bg-yellow-400",
    hoverBg: "hover:bg-yellow-100",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-400",
    hoverBg: "hover:bg-blue-100",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-400",
    hoverBg: "hover:bg-orange-100",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    iconBg: "bg-pink-400",
    hoverBg: "hover:bg-pink-100",
  },
};

const PageHeaderCard: React.FC<StatCardProps> = ({
  icon,
  color,
  title,
  value,
  subtitle,
  count,
}) => {
  const colorClasses = colorMap[color] || colorMap.primary;

  const renderValue = () => {
    if (count && (typeof value === "number" || (typeof value === "string" && !isNaN(Number(value))))) {
      const numValue = Number(value);
      const decimals = numValue % 1 === 0 ? 0 : 2;
      return <CountUp end={numValue} duration={2} separator="," decimals={decimals} />;
    }
    return value;
  };

  return (
    <div
      className={`${colorClasses.bg} ${colorClasses.border} ${colorClasses.hoverBg} border transition-all duration-300 h-full rounded-lg p-4 flex flex-col gap-4 cursor-pointer relative overflow-hidden shadow-none group`}
    >
      {/* Background decoration */}
      <div
        className={`absolute top-0 right-0 w-12 h-12 ${colorClasses.iconBg} rounded-full -translate-y-6 translate-x-6 opacity-20 group-hover:scale-110 transition-transform`}
      ></div>
      {/* <div
        className={`absolute bottom-0 left-0 w-12 h-12 ${colorClasses.iconBg} rounded-full translate-y-6 -translate-x-6 opacity-20`}
      ></div> */}

      <div className="flex items-center justify-between w-full relative">
        <div className="flex-1">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.1em] mb-1">
            {title}
          </p>
          <div className="flex flex-col">
            <h2 className="text-gray-800 dark:text-gray-100 text-lg font-bold leading-tight">
              {renderValue()}
            </h2>
            {subtitle && (
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={`${colorClasses.iconBg} w-9 h-9 flex items-center justify-center rounded-lg text-white shadow-sm`}
          >
            <span className="text-white text-base">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeaderCard;
