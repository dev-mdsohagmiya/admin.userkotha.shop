import dayjs from "dayjs";

export const getDefaultDateRange = (): [string, string] => [
  dayjs().format("YYYY-MM-DD"),
  dayjs().add(1, "day").format("YYYY-MM-DD"),
];

export const getThirtyDaysRange = (): [string, string] => [
  dayjs().subtract(30, "days").format("YYYY-MM-DD"),
  dayjs().add(1, "day").format("YYYY-MM-DD"),
];

export const getThisMonthRange = (): [string, string] => [
  dayjs().startOf("month").format("YYYY-MM-DD"),
  dayjs().endOf("month").add(1, "day").format("YYYY-MM-DD"),
];

/** Matches CustomDatePicker preset "This Week" */
export const getThisWeekRange = (): [string, string] => {
  const today = dayjs();
  return [
    today.startOf("week").format("YYYY-MM-DD"),
    today.endOf("week").add(1, "day").format("YYYY-MM-DD"),
  ];
};

/** RTK Query args for report endpoints that accept startDate / endDate */
export const buildReportDateQueryArgs = (
  dateRange: [string | null, string | null],
): { name: string; value: string }[] => {
  const args: { name: string; value: string }[] = [];
  if (dateRange[0]) {
    args.push({ name: "startDate", value: dateRange[0] });
  }
  if (dateRange[1]) {
    args.push({ name: "endDate", value: dateRange[1] });
  }
  return args;
};

export const reportDateQueryCacheKey = (
  queryArgs: { name: string; value: string }[],
): string => {
  if (!queryArgs.length) return "all";
  return queryArgs
    .map((a) => `${a.name}=${a.value}`)
    .sort()
    .join("&");
};
