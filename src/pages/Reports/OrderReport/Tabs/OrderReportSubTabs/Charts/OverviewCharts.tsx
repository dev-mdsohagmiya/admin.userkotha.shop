import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export const OrdersStatusChart = ({ data = [] }: { data: any[] }) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "80%",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories:
        data.length > 0
          ? data.map((item) => item.status?.replace(/_/g, " ") || "")
          : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    fill: { opacity: 1, colors: ["#ff3d0a"] },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} Orders`,
      },
    },
    grid: {
      show: false,
    },
  };

  const series = [
    {
      name: "Orders",
      data:
        data.length > 0
          ? data.map((item) => item.count)
          : [450, 850, 250, 650, 350, 950, 550],
    },
  ];

  return <Chart options={options} series={series} type="bar" height={220} />;
};

export const SourceDistributionChart = ({ data = [] }: { data: any[] }) => {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels:
      data.length > 0
        ? data.map((item) => item.source || "Unknown")
        : ["Web", "WhatsApp", "Messenger", "Other"],
    colors: (data.length > 0
      ? data
      : ["Web", "WhatsApp", "Messenger", "Other"]
    ).map((item: any) => {
      const source =
        (typeof item === "string" ? item : item.source)?.toLowerCase() || "";
      if (source.includes("web")) return "#ff3d0a";
      if (source.includes("whatsapp")) return "#22c55e";
      if (source.includes("facebook") || source.includes("messenger"))
        return "#3b82f6";

      // Default palette for others (25+ colors)
      const palette = [
        "#a855f7",
        "#f43f5e",
        "#f59e0b",
        "#8b5cf6",
        "#eab308",
        "#0ea5e9",
        "#ec4899",
        "#84cc16",
        "#14b8a6",
        "#f97316",
        "#6366f1",
        "#64748b",
        "#d946ef",
        "#2dd4bf",
        "#fb923c",
        "#94a3b8",
        "#f472b6",
        "#38bdf8",
        "#4ade80",
        "#fbbf24",
        "#818cf8",
        "#a78bfa",
        "#f87171",
        "#22d3ee",
        "#c084fc",
      ];
      const index = (data.length > 0 ? data : []).indexOf(item);
      return palette[index % palette.length];
    }),
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "10px",
      fontWeight: 600,
    },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Orders",
              fontSize: "10px",
              fontWeight: 600,
              formatter: () => {
                if (data.length > 0) {
                  return data
                    .reduce((acc, item) => acc + (Number(item.count) || 0), 0)
                    .toLocaleString();
                }
                return "1,129";
              },
            },
          },
        },
      },
    },
  };

  const series =
    data.length > 0 ? data.map((item) => item.count) : [882, 112, 77, 58];

  return <Chart options={options} series={series} type="donut" height={260} />;
};
