import {
  FiDatabase,
  FiGlobe,
  FiRotateCcw,
  FiTruck,
  FiInbox,
  FiShield,
  FiFilter,
  FiLayers,
} from "react-icons/fi";
import { Tabs, Modal } from "antd";
import CustomDatePicker from "../../../../components/common/Date/CustomDatePicker";
import { useState } from "react";
import CountUp from "react-countup";
import {
  useGetCombinedOrderListQuery,
  useGetCombinedOrderOverviewQuery,
} from "../../../../redux/features/report/reportApi";
import { DataTable } from "../../../../components/common/Tables";
import PageListPrint from "../../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import dayjs from "dayjs";

// ─── Types ──────────────────────────────────────────────────────────────────
type FilterType =
  | "incoming"
  | "website"
  | "approved_web"
  | "approved_outside"
  | "total_approved"
  | "delivered"
  | "cancelled"
  | "returned";

interface OrderItem {
  orderNumber?: string;
  customer?: string;
  mobile?: string;
  address?: string;
  items?: number;
  status?: string;
  date?: string;
  total?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const FILTER_TITLES: Record<FilterType, string> = {
  incoming: "Initial Ingestion Orders",
  website: "Web Portal Origins",
  approved_web: "Approved Web Portal Orders",
  approved_outside: "Outside Web Entries",
  total_approved: "Aggregated Approved Orders",
  delivered: "Delivered Orders",
  cancelled: "Cancelled Orders",
  returned: "Returned Orders",
};

const TAB_ITEMS = [
  { key: "incoming", label: "Incoming" },
  { key: "website", label: "Website" },
  { key: "approved_web", label: "Approved Web" },
  { key: "approved_outside", label: "Outside Entries" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returned" },
];

const STATUS_STYLE: Record<string, string> = {
  CONFIRM: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
};

const TABLE_COLUMNS = [
  {
    title: "Order No",
    dataIndex: "orderNumber",
    key: "orderNumber",
    render: (text: string) => (
      <span className="font-semibold text-gray-700 dark:text-gray-300">
        #{text}
      </span>
    ),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Mobile",
    dataIndex: "mobile",
    key: "mobile",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    ellipsis: true,
  },
  {
    title: "Items",
    dataIndex: "items",
    key: "items",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
          STATUS_STYLE[status] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (date: string) => dayjs(date).format("DD MMM YYYY"),
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
    align: "right" as const,
    render: (total: number) => (
      <span className="font-semibold text-gray-800 dark:text-white">
        ৳{total?.toLocaleString()}
      </span>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
const CombinedOrderTab = () => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("incoming");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: overviewData, isLoading: isOverviewLoading } =
    useGetCombinedOrderOverviewQuery([
      { name: "startDate", value: dateRange?.[0] },
      { name: "endDate", value: dateRange?.[1] },
    ]);

  const {
    data: orderListData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetCombinedOrderListQuery([
    { name: "startDate", value: dateRange?.[0] },
    { name: "endDate", value: dateRange?.[1] },
    { name: "type", value: filterType },
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
  ]);

  const overview = overviewData?.data || {};
  const orderList: OrderItem[] = orderListData?.data || [];
  const meta = orderListData?.meta || {};

  // Printable data — same pattern as ProductList
  const printableData = orderList.map((order, index) => ({
    SL: index + 1,
    "Order No": order.orderNumber ? `#${order.orderNumber}` : "-",
    Customer: order.customer || "-",
    Mobile: order.mobile || "-",
    Address: order.address || "-",
    Items: order.items ?? "-",
    Status: order.status || "-",
    Date: order.date ? dayjs(order.date).format("DD MMM YYYY") : "-",
    "Total (৳)": order.total ? order.total.toLocaleString() : "0",
  }));

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const openListModal = (type: FilterType) => {
    setFilterType(type);
    setPage(1);
    setIsModalOpen(true);
  };

  const handleTabChange = (key: string) => {
    setFilterType(key as FilterType);
    setPage(1);
  };

  // ─── Shared card class ─────────────────────────────────────────────────────
  const clickableCard =
    "cursor-pointer hover:scale-[1.015] transition-transform duration-200";

  return (
    <div className="bg-white dark:bg-gray-900 mb-10 rounded-lg border-y border-gray-200 dark:border-gray-800 overflow-hidden font-outfit relative">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ── Header ── */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-row flex-wrap justify-between items-center gap-x-6 gap-y-3 bg-gray-50/20 dark:bg-gray-800/10 relative">
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white whitespace-nowrap">
              Order Pipeline Analysis
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
                {isOverviewLoading ? "Syncing..." : "Real-time Flow"}
              </span>
            </div>
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
          <CustomDatePicker
            onChange={(dates) => setDateRange(dates)}
            selectedData={dateRange}
          />
        </div>

        <div className="flex flex-col items-end ml-auto">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-tighter">
            Gross Pipeline Value
          </p>
          <h4 className="text-sm font-black text-primary">
            ৳
            <CountUp
              end={overview?.totalIncoming?.amount || 0}
              separator=","
              duration={1.5}
            />
          </h4>
        </div>
      </div>

      {/* ── Pipeline Visualization ── */}
      <div className="p-10 lg:p-14 relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Stage 1: Ingestion */}
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-8 group">
              <div className="hidden lg:flex flex-col items-end text-right w-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Stage 01
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                  Initial Ingestion
                </p>
              </div>

              <div
                className={`relative ${clickableCard}`}
                onClick={() => openListModal("incoming")}
              >
                <div className="w-20 h-20 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-900 group-hover:border-primary/50 transition-colors">
                  <div className="w-14 h-14 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FiInbox className="text-2xl" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md">
                  <span className="text-[11px] font-black text-gray-800 dark:text-white">
                    <CountUp end={overview?.totalIncoming?.count || 0} />
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex w-40 items-center gap-2">
                <FiLayers className="text-primary text-xs" />
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                  Entry Node
                </span>
              </div>
            </div>
          </div>

          {/* Connector 1 */}
          <div className="h-12 w-0.5 bg-gradient-to-b from-primary/40 to-primary/80 relative">
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 translate-x-full">
              <FiFilter className="text-gray-300 text-xs" />
            </div>
          </div>

          {/* Stage 2: Web Portal Origins */}
          <div
            className={`relative w-full max-w-lg mb-4 ${clickableCard}`}
            onClick={() => openListModal("website")}
          >
            <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary">
                  <FiGlobe
                    className="text-xl"
                    style={{ animation: "spin 8s linear infinite" }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Web Portal Origins
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Main Traffic Source
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h5 className="text-xl font-black text-primary">
                  <CountUp end={overview?.website?.count || 0} duration={1.5} />
                </h5>
                <p className="text-[10px] font-semibold text-primary/40 uppercase">
                  ৳{(overview?.website?.amount || 0).toLocaleString()} Value
                </p>
              </div>
            </div>
          </div>

          {/* SVG Split Connector */}
          <div className="w-full max-w-[500px] h-20 -mt-2 -mb-2 relative">
            <svg
              className="w-full h-full text-gray-200 dark:text-gray-800"
              preserveAspectRatio="none"
              viewBox="0 0 400 100"
            >
              <path
                d="M 200 0 L 200 30 Q 200 50 150 50 L 50 50 Q 25 50 25 75 L 25 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 200 0 L 200 30 Q 200 50 250 50 L 350 50 Q 375 50 375 75 L 375 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                r="2.5"
                fill="#ff3d0a"
                style={{
                  offsetPath:
                    "path('M 200 0 L 200 30 Q 200 50 150 50 L 50 50 Q 25 50 25 75 L 25 100')",
                  animation: "pathFlow 3s infinite linear",
                }}
              />
              <circle
                r="2.5"
                fill="#ff3d0a"
                style={{
                  offsetPath:
                    "path('M 200 0 L 200 30 Q 200 50 250 50 L 350 50 Q 375 50 375 75 L 375 100')",
                  animation: "pathFlow 3s infinite linear",
                  animationDelay: "1.5s",
                }}
              />
            </svg>
          </div>

          {/* Stage 3: Validation Split */}
          <div className="grid grid-cols-2 gap-12 w-full max-w-3xl mb-12">
            {/* Approved Web */}
            <div
              className={`flex flex-col items-center ${clickableCard}`}
              onClick={() => openListModal("approved_web")}
            >
              <div className="w-full bg-gray-50/30 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex flex-col items-center group hover:bg-white dark:hover:bg-gray-900 transition-all">
                <div className="flex flex-col items-center gap-1">
                  <FiShield className="text-primary text-xl mb-1" />
                  <p className="text-sm font-black text-gray-800 dark:text-white leading-none">
                    <CountUp
                      end={overview?.approvedWeb?.count || 0}
                      duration={1.5}
                    />
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">
                    Approved Web Portal
                  </p>
                </div>
                <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full opacity-80 transition-all"
                    style={{
                      width: `${(overview?.approvedWeb?.count / (overview?.website?.count || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Approved Outside */}
            <div
              className={`flex flex-col items-center ${clickableCard}`}
              onClick={() => openListModal("approved_outside")}
            >
              <div className="w-full bg-gray-50/30 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex flex-col items-center group hover:bg-white dark:hover:bg-gray-900 transition-all">
                <div className="flex flex-col items-center gap-1">
                  <FiDatabase className="text-gray-400 text-xl mb-1" />
                  <p className="text-sm font-black text-gray-800 dark:text-white leading-none">
                    <CountUp
                      end={overview?.approvedOutside?.count || 0}
                      duration={1.5}
                    />
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">
                    Outside Web Entries
                  </p>
                </div>
                <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-300 dark:bg-gray-600 rounded-full opacity-40 hover:opacity-80 transition-all"
                    style={{
                      width: `${(overview?.approvedOutside?.count / (overview?.totalIncoming?.count || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stage 4: Aggregated */}
          <div className="relative pt-10 pb-6 w-full flex flex-col items-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-10 flex justify-between px-6 pointer-events-none">
              <div className="w-px h-full bg-gray-200 dark:bg-gray-800 rotate-[25deg] origin-top" />
              <div className="w-px h-full bg-gray-200 dark:bg-gray-800 -rotate-[25deg] origin-top" />
            </div>
            <div
              className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1.5 flex items-center gap-4 ${clickableCard}`}
              onClick={() => openListModal("total_approved")}
            >
              <div className="bg-primary px-8 py-4 rounded-lg flex items-center gap-10 border border-primary/20">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase font-semibold text-white/60 tracking-[0.2em]">
                    Aggregated
                  </span>
                  <span className="text-2xl font-black text-white leading-none mt-1">
                    <CountUp
                      end={overview?.totalApproved?.count || 0}
                      duration={1.5}
                    />
                  </span>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-[9px] uppercase font-semibold text-white/60 tracking-[0.2em] mb-1">
                    Effective Value
                  </p>
                  <p className="text-xl font-black text-white">
                    ৳{(overview?.totalApproved?.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 5: Output Distribution */}
          <div className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <span className="text-[10px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em] whitespace-nowrap">
                Output Distribution
              </span>
            </div>

            {/* Delivered */}
            <div
              className={`bg-gray-50/10 dark:bg-gray-800/5 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex items-center gap-4 ${clickableCard}`}
              onClick={() => openListModal("delivered")}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center text-primary">
                <FiTruck className="text-2xl" />
              </div>
              <div>
                <h5 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  <CountUp end={overview?.delivered?.count || 0} duration={1} />
                </h5>
                <p className="text-[10px] font-semibold text-primary uppercase mt-1 tracking-widest">
                  Delivered
                </p>
              </div>
            </div>

            {/* Cancelled */}
            <div
              className={`bg-gray-50/10 dark:bg-gray-800/5 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex items-center gap-4 ${clickableCard}`}
              onClick={() => openListModal("cancelled")}
            >
              <div>
                <h5 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  <CountUp end={overview?.cancelled?.count || 0} duration={1} />
                </h5>
                <p className="text-[10px] font-semibold text-rose-500 uppercase mt-1 tracking-widest">
                  Cancelled
                </p>
              </div>
            </div>

            {/* Returned */}
            <div
              className={`bg-gray-50/10 dark:bg-gray-800/5 border border-gray-300 dark:border-gray-800 rounded-lg p-5 flex items-center gap-4 ${clickableCard}`}
              onClick={() => openListModal("returned")}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                <FiRotateCcw className="text-2xl" />
              </div>
              <div>
                <h5 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  <CountUp end={overview?.returned?.count || 0} duration={1} />
                </h5>
                <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1 tracking-widest">
                  Returned
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Order List Modal ── */}
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1000}
        className="custom-pipeline-modal"
        centered
        styles={{ body: { height: "90vh", overflowY: "auto" } }}
      >
        <div className="flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-1">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {FILTER_TITLES[filterType]}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Pipeline segment data
              </p>
            </div>
            <div className="flex items-center gap-2 mr-10">
              <PageListPrint
                tableData={printableData}
                fileName={`${FILTER_TITLES[filterType]}-${filterType}`}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs
            activeKey={filterType}
            onChange={handleTabChange}
            items={TAB_ITEMS}
            className="mb-2"
          />

          {/* Table */}
          <DataTable
            columns={TABLE_COLUMNS}
            data={orderList}
            loading={isListLoading || isListFetching}
            isPaginate={true}
            total={meta?.total || 0}
            currentPage={page}
            limit={limit}
            setCurrentPage={setPage}
            setLimit={setLimit}
            showSizeChanger={true}
            scroll={{ x: "100%" }}
          />
        </div>
      </Modal>

      {/* ── Footer ── */}
    </div>
  );
};

export default CombinedOrderTab;
