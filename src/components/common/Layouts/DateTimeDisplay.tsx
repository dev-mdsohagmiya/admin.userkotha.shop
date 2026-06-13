import React, { useState, useEffect } from "react";

const DateTimeDisplay: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Split time into parts
  const hours = currentDateTime.getHours();
  const minutes = currentDateTime.getMinutes().toString().padStart(2, "0");
  const seconds = currentDateTime.getSeconds().toString().padStart(2, "0");

  // AM/PM format
  const isAM = hours < 12;
  const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
  const amPm = isAM ? "AM" : "PM";

  const formattedDate = currentDateTime.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .digit-slide {
            display: inline-block;
            animation: slideUp 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          }
        `}
      </style>
      <div
        className="hidden xl:flex items-center gap-2.5 px-2 py-1 mr-6 
                      bg-white/40 dark:bg-gray-800/40 backdrop-blur-md 
                      border border-gray-200 dark:border-gray-700 
                      rounded-lg whitespace-nowrap overflow-hidden"
      >
        {/* Date */}
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 flex-shrink-0">
          <div
            className="flex items-center justify-center w-5 h-5 rounded 
                          bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            {formattedDate}
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>

        {/* Consolidated Smart Time Display */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center px-2 py-1 bg-gray-50/50 dark:bg-gray-900/40 rounded-sm border border-gray-100 dark:border-gray-700/50 shadow-inner overflow-hidden">
            <div className="flex items-center font-mono text-[17px] font-semibold tabular-nums tracking-tight">
              {/* Hours digits */}
              <div className="flex items-center">
                {formattedHours.split("").map((digit, idx) => (
                  <span
                    key={`h-${idx}-${digit}`}
                    className="min-w-[12px] text-center digit-slide text-gray-800 dark:text-gray-100"
                  >
                    {digit}
                  </span>
                ))}
              </div>

              {/* Stylized Colon */}
              <div
                className="flex flex-col gap-0.5 mx-1.5 animate-pulse"
                style={{ animationDuration: "2s" }}
              >
                <div className="w-0.5 h-0.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                <div className="w-0.5 h-0.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
              </div>

              {/* Minutes digits */}
              <div className="flex items-center">
                {minutes.split("").map((digit, idx) => (
                  <span
                    key={`m-${idx}-${digit}`}
                    className="min-w-[12px] text-center digit-slide text-gray-800 dark:text-gray-100"
                  >
                    {digit}
                  </span>
                ))}
              </div>

              {/* Stylized Colon (Dimmer) */}
              <div className="flex flex-col gap-0.5 mx-1.5 opacity-40">
                <div className="w-0.5 h-0.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                <div className="w-0.5 h-0.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
              </div>

              {/* Seconds digits */}
              <div className="flex items-center">
                {seconds.split("").map((digit, idx) => (
                  <span
                    key={`s-${idx}-${digit}`}
                    className="min-w-[12px] text-center digit-slide text-orange-600 dark:text-orange-400"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center ml-0.5">
            <span className="text-[9px] font-semibold uppercase text-gray-400 dark:text-gray-500 leading-none">
              {amPm}
            </span>
            <div className="flex items-center justify-center mt-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DateTimeDisplay;
