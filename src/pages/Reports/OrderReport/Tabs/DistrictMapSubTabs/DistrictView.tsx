import { FiMapPin, FiBox, FiTrendingUp } from "react-icons/fi";
import PageHeaderCard from "../../../../../components/common/Card/PageHeaderCard";
import { MdOutlineChromeReaderMode } from "react-icons/md";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { useState, useMemo } from "react";
import { Input } from "antd";
import { Search } from "lucide-react";
import districtPolygons from "./bangladesh_districts_polygons.json";
import { useGetDistrictMapReportQuery } from "../../../../../redux/features/report/reportApi";

const DistrictView = ({
  activeMetric = "Orders",
  dateRange,
}: {
  activeMetric?: string;
  dateRange: [string | null, string | null];
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isOrdersMetric = activeMetric === "Orders";


  const { data: districtReport } = useGetDistrictMapReportQuery([
    { name: "startDate", value: dateRange?.[0] || "" },
    { name: "endDate", value: dateRange?.[1] || "" },
  ]);

  const summary = districtReport?.data?.summary;
  const districtData = useMemo(
    () => districtReport?.data?.data || [],
    [districtReport?.data?.data],
  );

  type Point = [number, number];
  type DistrictApiData = {
    name: string;
    lat: string;
    long: string;
    orders: number;
    revenue: number;
  };
  type DistrictMarker = {
    name: string;
    coordinates: Point;
    orders: number;
    revenue: number;
    metricValue: number;
  };

  // Build markers from API district data
  const markers = useMemo(() => {
    return (districtData as DistrictApiData[])
      .map((district) => {
        const lat = Number.parseFloat(district.lat);
        const lng = Number.parseFloat(district.long);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          return null;
        }

        const orders = district.orders || 0;
        const revenue = district.revenue || 0;
        return {
          name: district.name,
          coordinates: [lng, lat] as Point,
          orders,
          revenue,
          metricValue: isOrdersMetric ? orders : revenue,
        };
      })
      .filter((district): district is DistrictMarker => district !== null);
  }, [districtData, isOrdersMetric]);

  // Sort and filter markers for the sidebar
  const sortedDistricts = useMemo(() => {
    return [...markers].sort((a, b) => b.metricValue - a.metricValue);
  }, [markers]);

  /** Top 10 / search: only districts with activity on the current metric (> 0). */
  const topDistricts = useMemo(() => {
    const withActivity = sortedDistricts.filter((d) => d.metricValue > 0);
    if (searchQuery) {
      return withActivity.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return withActivity.slice(0, 10);
  }, [sortedDistricts, searchQuery]);

  // Total stats for header cards
  const totalOrders = useMemo(
    () => summary?.orders || markers.reduce((acc, curr) => acc + curr.orders, 0),
    [markers, summary?.orders],
  );
  const activeDistrictsCount = useMemo(
    () =>
      summary?.activeDistricts ||
      markers.filter((district) => district.metricValue > 0).length,
    [markers, summary?.activeDistricts],
  );
  const topDistrict = useMemo(() => {
    const topFromSummary = summary?.topDistricts?.[0];
    if (topFromSummary) {
      return {
        name: topFromSummary.district,
        orders: topFromSummary.orders || 0,
        revenue: topFromSummary.revenue || 0,
      };
    }
    const firstWithData = sortedDistricts.find((d) => d.metricValue > 0);
    return {
      name: firstWithData?.name || "N/A",
      orders: firstWithData?.orders || 0,
      revenue: firstWithData?.revenue || 0,
    };
  }, [sortedDistricts, summary?.topDistricts]);
  const withoutDistrictOrders = summary?.withoutDistrict?.orders || 0;

  // Helper function to get color based on metric
  const getColor = (value: number) => {
    const maxVal = sortedDistricts[0]?.metricValue || 0;
    if (maxVal === 0) return "transparent";
    if (value === 0) return "transparent";

    // Scale colors based on intensity using the project's primary color shades
    if (isOrdersMetric) {
      if (value < maxVal * 0.2) return "#ffdccf"; // primary-100
      if (value < maxVal * 0.5) return "#ff9a7d"; // primary-300
      return "#ff3d0a"; // primary-500
    } else {
      // For revenue/others, using orange shades from theme for visual distinction
      if (value < maxVal * 0.2) return "#FFFAEB"; // warning-50
      if (value < maxVal * 0.5) return "#FEE4E2"; // error-100 or use orange
      return "#FB6514"; // orange-500
    }
  };

  // Normalize names for better matching between different data sources
  const normalizeName = (name: string) => {
    if (!name) return "";
    const map: { [key: string]: string } = {
      chittagong: "chattogram",
      comilla: "cumilla",
      sirajgonj: "sirajganj",
      sirajganj: "sirajganj",
      barisal: "barishal",
      jessore: "jashore",
      bogra: "bogura",
      brahmanbaria: "brahmanbaria",
    };
    const lower = name.toLowerCase().trim();
    return map[lower] || lower;
  };

  const getMetricValue = (name: string) => {
    const normalizedTarget = normalizeName(name);
    const district = markers.find(
      (m) => normalizeName(m.name) === normalizedTarget,
    );
    if (!district) return 0;
    return district.metricValue;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Main Content: Map & Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
        <PageHeaderCard
          icon={<FiBox className="text-[18px]" />}
          color="cyan"
          title="Total Orders"
          value={totalOrders}
          subtitle="Across selected range"
        />
        <PageHeaderCard
          icon={<FiMapPin className="text-[18px]" />}
          color="indigo"
          title="Active Districts"
          value={activeDistrictsCount}
          subtitle="Out of 64 districts"
        />
        <PageHeaderCard
          icon={<FiTrendingUp className="text-[18px]" />}
          color="green"
          title="Top District"
          value={topDistrict.name}
          subtitle={isOrdersMetric ? `${topDistrict.orders} orders` : `৳${topDistrict.revenue}`}
        />
        <PageHeaderCard
          icon={<MdOutlineChromeReaderMode className="text-[18px]" />}
          color="orange"
          title="Without District"
          value={withoutDistrictOrders}
          subtitle="Not assigned to district"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Map Section */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-lg flex flex-col min-h-[750px] overflow-hidden">
          <div className="p-4 border-b border-gray-200/80 dark:border-gray-800 text-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
              Bangladesh District Map
            </h3>
            <p className="text-[10px] text-gray-400">
              Visualizing {activeMetric.toLowerCase()} by all 64 districts
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-50/70 via-white to-gray-50/50 dark:from-gray-800/30 dark:via-gray-900 dark:to-gray-800/20">
            <div className="w-full h-[600px] rounded-lg border border-gray-200/90 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/40 transition-all duration-500">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 6500,
                  center: [90.35, 23.9],
                }}
                style={{ width: "100%", height: "100%" }}
              >
                <Geographies geography={districtPolygons}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const districtName = geo.properties.ADM2_EN;
                      const value = getMetricValue(districtName);
                      const isSelected =
                        selectedDistrict &&
                        normalizeName(selectedDistrict) ===
                          normalizeName(districtName);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            if (value > 0) setSelectedDistrict(districtName);
                          }}
                          onMouseLeave={() => {
                            setSelectedDistrict(null);
                          }}
                          style={{
                            default: {
                              fill: getColor(value),
                              stroke: isSelected ? "#0B9C3F" : "#D7DEE8",
                              strokeWidth: isSelected ? 1.4 : 0.7,
                              outline: "none",
                              transition: "all 220ms ease",
                            },
                            hover: {
                              fill:
                                value === 0
                                  ? "transparent"
                                  : activeMetric === "Orders"
                                    ? "#ff3d0a"
                                    : "#EC4A0A",
                              stroke:
                                value === 0
                                  ? "#D7DEE8"
                                  : activeMetric === "Orders"
                                    ? "#0A8738"
                                    : "#C4320A",
                              strokeWidth: value === 0 ? 0.8 : 1.7,
                              outline: "none",
                              cursor: value === 0 ? "default" : "pointer",
                            },
                          }}
                          className="dark:stroke-gray-700 transition-all duration-300"
                        />
                      );
                    })
                  }
                </Geographies>

                {markers
                  .filter((m) => m.metricValue > 0)
                  .map((m) => {
                    const val = m.metricValue;
                    const isSelected =
                      selectedDistrict &&
                      normalizeName(selectedDistrict) === normalizeName(m.name);
                    return (
                      <Marker key={m.name} coordinates={m.coordinates}>
                        <g
                          className="cursor-pointer group"
                          onMouseEnter={() => setSelectedDistrict(m.name)}
                          onMouseLeave={() => setSelectedDistrict(null)}
                        >
                          <circle
                            r={isSelected ? 6.5 : 3.5}
                            fill={
                              isOrdersMetric ? "#ff3d0a" : "#FB6514"
                            }
                            stroke="#fff"
                            strokeWidth={1.2}
                            className="transition-all duration-300"
                          />

                          {isSelected && (
                            <g transform="translate(0, -22)">
                              <rect
                                x="-50"
                                y="-20"
                                width="100"
                                height="24"
                                rx="6"
                                fill="#111827"
                              />
                              <text
                                textAnchor="middle"
                                fill="#fff"
                                fontSize="9"
                                fontWeight="800"
                                y="-5"
                                className="font-sans"
                              >
                                {m.name}:{" "}
                                {!isOrdersMetric ? `৳${val}` : val}
                              </text>
                              <path
                                d="M -4 -0 L 0 4 L 4 -0 Z"
                                fill="#111827"
                                transform="translate(0, 4)"
                              />
                            </g>
                          )}
                        </g>
                      </Marker>
                    );
                  })}
              </ComposableMap>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-400 uppercase mb-2">
              {activeMetric} Intensity
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Low
              </span>
              <div className="flex gap-1 h-2 w-48 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 p-0.5">
                <div
                  className={`flex-1 border border-gray-200 bg-white dark:bg-gray-900 opacity-30`}
                  title="Zero"
                ></div>
                <div
                  className={`flex-1 ${
                    activeMetric === "Orders" ? "bg-[#ffdccf]" : "bg-[#FFFAEB]"
                  }`}
                  title="Low"
                ></div>
                <div
                  className={`flex-1 ${
                    activeMetric === "Orders" ? "bg-[#ff9a7d]" : "bg-[#FEE4E2]"
                  }`}
                  title="Medium"
                ></div>
                <div
                  className={`flex-1 ${
                    activeMetric === "Orders" ? "bg-[#ff3d0a]" : "bg-[#FB6514]"
                  }`}
                  title="High"
                ></div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                High
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-5">
          {/* Details Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center h-[200px] flex-none overflow-hidden">
            {selectedDistrict ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-12 h-12 bg-[#fff0ea] dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto text-[#ff3d0a] dark:text-primary-400 border border-[#ffdccf] dark:border-primary-800">
                  <FiMapPin className="text-xl" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider">
                    {selectedDistrict}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {markers.find(
                      (m) =>
                        normalizeName(m.name) ===
                        normalizeName(selectedDistrict || ""),
                    )?.metricValue || 0}{" "}
                    {activeMetric}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-3 border border-gray-100 dark:border-gray-700">
                  <FiMapPin className="text-lg" />
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                  Hover over a district
                </p>
              </>
            )}
          </div>

          {/* Top Districts Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-200/80 dark:border-gray-800 space-y-2">
              <h3 className="text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-widest text-center">
                {searchQuery ? "Search Results" : "Top 10 Districts"}
              </h3>
              <div className="relative">
                <Input
                  placeholder="Search district..."
                  prefix={<Search className="w-3.5 h-3.5 text-gray-400" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                  className="w-full text-[11px] rounded-md border-gray-200 dark:border-gray-800"
                  size="middle"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {topDistricts.map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={() => {
                    if (item.metricValue > 0) setSelectedDistrict(item.name);
                  }}
                  onMouseLeave={() => setSelectedDistrict(null)}
                  className={`flex justify-between items-center px-4 py-3 group transition-colors border-b last:border-0 border-gray-100 dark:border-gray-800/80 border-l-[3px] ${
                    selectedDistrict &&
                    normalizeName(selectedDistrict) === normalizeName(item.name)
                      ? "bg-primary-50 dark:bg-primary-900/10 border-l-[#ff3d0a]"
                      : item.metricValue > 0
                        ? "border-l-transparent hover:bg-primary-50/50 cursor-pointer"
                        : "border-l-transparent bg-transparent cursor-default"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                        item.metricValue > 0
                          ? "bg-[#ff3d0a] text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-[#ff3d0a] group-hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`text-[12px] font-bold transition-colors ${
                        selectedDistrict &&
                        normalizeName(selectedDistrict) ===
                          normalizeName(item.name)
                          ? "text-[#ff3d0a] dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300 group-hover:text-[#ff3d0a]"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded transition-all ${
                        item.metricValue > 0
                          ? "bg-[#fff0ea] text-[#ff3d0a] dark:bg-primary-900/30 dark:text-primary-400"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-500 group-hover:text-[#ff3d0a]"
                      }`}
                    >
                      {isOrdersMetric ? item.orders : `৳${item.revenue}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictView;