const Loader = ({
  text = "Loading",
  fullHeight = false,
  size = "medium",
}: {
  text?: string;
  fullHeight?: boolean;
  size?: "small" | "medium" | "large";
}) => {
  const sizeMap = {
    small: { spinner: "w-5 h-5 border-2", text: "text-xs" },
    medium: { spinner: "w-8 h-8 border-3", text: "text-sm" },
    large: { spinner: "w-12 h-12 border-4", text: "text-base" },
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${fullHeight ? " min-h-[90vh]" : "p-6"} w-full transition-all duration-300`}
    >
      <div className="relative">
        {/* Outer Ring */}
        <div
          className={`${sizeMap[size].spinner} rounded-full border-gray-100 border-t-primary-500 animate-spin`}
        />

        {/* Inner static ring for better balancing */}
        <div
          className={`absolute inset-0 ${sizeMap[size].spinner} rounded-full border-gray-50 opacity-20`}
        />
      </div>

      {text && (
        <span
          className={`${sizeMap[size].text} font-semibold text-slate-500 animate-pulse tracking-wide`}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;
