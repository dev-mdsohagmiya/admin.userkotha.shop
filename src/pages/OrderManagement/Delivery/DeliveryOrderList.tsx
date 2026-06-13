import {
  Button,
  Dropdown,
  Input,
  Popover,
  Progress,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import {
  Box,
  CheckCircle,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  Printer,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCheckCircle, FiCopy, FiMapPin, FiPhone } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { moduleHasAction } from "../../../utils/permissions";

import { FaPhone } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { toast } from "react-toastify";
import OrderInvoicePrint from "../../../components/common/CommonPrintCsvAndPdf/OrderInvoicePrint";
import OrderStickerPrint from "../../../components/common/CommonPrintCsvAndPdf/OrderStickerPrint";
import PageListPrint from "../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import "../../../components/common/Tables/AntTable.css";
import { config } from "../../../config";
import { useSidebar } from "../../../context/SidebarContext";
import {
  useGetCourierDashboardStatsQuery,
  useGetCourierOrdersQuery,
} from "../../../redux/features/courier/courierApi";
import { OrderStatus } from "../../../types/order";
import { CurrencyIcon } from "../../../utils/currency";
import { debounce } from "../../../utils/debounce";

const DELIVERY_ORDERS_MODULE = "Delivery Orders";

/** Keys from courier dashboard `statusCounts` / order summary → designation action. */
const DELIVERY_STATS_KEY_TO_ACTION: Record<string, string> = {
  pending: "view_pending",
  delivered: "view_delivered",
  cancelled: "view_cancelled",
  in_review: "view_in_review",
  sent: "view_in_review",
  return_pending: "view_return_pending",
  returned: "view_return",
  unknown: "view_unknown",
};

/** Sub-row: delivery channel tabs (each needs its own permission; `view_all` only unlocks “All”). */
const DELIVERY_METHOD_TAB_DEFS: Array<{
  key: string;
  label: string;
  permission: string;
}> = [
  { key: "all", label: "All", permission: "view_all" },
  { key: "STEADFAST", label: "Steadfast", permission: "view_steadfast" },
  { key: "PATHAO", label: "Pathao", permission: "view_pathao" },
  {
    key: "OFFICE_DELIVERY",
    label: "Office Delivery",
    permission: "view_office_delivery",
  },
  { key: "OTHER", label: "Other", permission: "view_other" },
];

const DeliveryOrderList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isExpanded } = useSidebar();
  const { allActions, isProfileLoading } = useModulePermissions(
    DELIVERY_ORDERS_MODULE,
  );

  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [isExplicitFetch, setIsExplicitFetch] = useState(false);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "createdAt",
    "user",
    "successRate",
    "items",
    "summary",
    "tracking",
    "note",
    "status",
    "actions",
  ]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // const [filters, setFilters] = useState<any>({
  //   sortBy: "created_at_desc",
  //   source: "all",
  // });

  // const { data: orderSourcesData } = useGetAllOrderSourcesQuery();
  // const orderSources = orderSourcesData?.data || [];
  const [activeStatsTab, setActiveStatsTab] = useState<string>("");

  // ==============================
  // SEARCH & FILTER HANDLERS
  // ==============================

  const handlePageChange = useCallback((p: number) => {
    setIsExplicitFetch(true);
    setPage(p);
  }, []);

  const handleLimitChange = useCallback((l: number) => {
    setIsExplicitFetch(true);
    setLimit(l);
  }, []);

  // Debounced search
  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
    }),
  ).current;

  const handleTabChange = useCallback(
    (key: string) => {
      setIsExplicitFetch(true);
      setActiveTab(key);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", key.toLowerCase());
        return next;
      });
      setSearchText("");
      setPage(1);
    },
    [setSearchParams],
  );

  const handleStatsTabChange = useCallback(
    (key: string) => {
      setIsExplicitFetch(true);
      setActiveStatsTab(key);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("statusTab", String(key).toLowerCase());
        return next;
      });
      setPage(1);
    },
    [setSearchParams],
  );

  const { data: courierStats } = useGetCourierDashboardStatsQuery(
    {
      startDate: dateRange[0] || undefined,
      endDate: dateRange[1] || undefined,
    },
    {
      pollingInterval: 120000,
    },
  );

  const statsEntries = useMemo(
    () =>
      courierStats?.data?.statusCounts
        ? Object.entries(courierStats.data.statusCounts)
        : [],
    [courierStats],
  );

  const normalizeStatsKey = useCallback((key: string) => {
    return String(key).trim().toLowerCase().replace(/\s+/g, "_");
  }, []);

  const deliveryOrderModuleActions = useMemo(
    () => [
      "view",
      "create",
      "update",
      "view_pending",
      "view_delivered",
      "view_cancelled",
      "view_in_review",
      "view_return_pending",
      "view_return",
      "view_unknown",
      "view_all",
      "view_steadfast",
      "view_pathao",
      "view_office_delivery",
      "view_other",
    ],
    [],
  );

  const hasAnyDeliveryOrdersAccess = useMemo(
    () =>
      deliveryOrderModuleActions.some((action) =>
        moduleHasAction(allActions, action),
      ),
    [allActions, deliveryOrderModuleActions],
  );

  /** Sub-menu: one row per permission the user has (e.g. only `view_all` → only “All”). */
  const visibleDeliveryMethodTabs = useMemo(
    () =>
      DELIVERY_METHOD_TAB_DEFS.filter((t) =>
        moduleHasAction(allActions, t.permission),
      ),
    [allActions],
  );

  const deliveryMethodTabsForUi = useMemo(
    () =>
      visibleDeliveryMethodTabs.map(({ key, label }) => ({ key, label })),
    [visibleDeliveryMethodTabs],
  );

  const deliveryMethodForApi = useMemo(() => {
    if (visibleDeliveryMethodTabs.length === 0) {
      return undefined;
    }
    const allowed = new Set(visibleDeliveryMethodTabs.map((t) => t.key));
    const effectiveKey = allowed.has(activeTab)
      ? activeTab
      : visibleDeliveryMethodTabs[0].key;
    if (effectiveKey === "all") {
      return undefined;
    }
    return effectiveKey;
  }, [visibleDeliveryMethodTabs, activeTab]);

  const canViewCourierStatsTab = useCallback(
    (statusKey: string) => {
      const k = normalizeStatsKey(statusKey);
      const action = DELIVERY_STATS_KEY_TO_ACTION[k];
      if (action) {
        return moduleHasAction(allActions, action);
      }
      return moduleHasAction(allActions, "view");
    },
    [allActions, normalizeStatsKey],
  );

  const permittedStatsEntries = useMemo(
    () =>
      statsEntries.filter(([status]) => canViewCourierStatsTab(String(status))),
    [statsEntries, canViewCourierStatsTab],
  );

  useEffect(() => {
    if (permittedStatsEntries.length > 0 && !activeStatsTab) {
      setActiveStatsTab(String(permittedStatsEntries[0][0]));
    }
  }, [permittedStatsEntries, activeStatsTab]);

  useEffect(() => {
    if (permittedStatsEntries.length === 0) return;
    const allowed = new Set(permittedStatsEntries.map(([k]) => String(k)));
    if (activeStatsTab && !allowed.has(activeStatsTab)) {
      const nextKey = String(permittedStatsEntries[0][0]);
      setActiveStatsTab(nextKey);
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("statusTab", nextKey.toLowerCase());
        return p;
      });
    }
  }, [permittedStatsEntries, activeStatsTab, setSearchParams]);

  const {
    data: ordersData,
    isLoading,
    isFetching: tableFetching,
    refetch,
  } = useGetCourierOrdersQuery(
    {
      page,
      limit,
      search: searchText || undefined,
      deliveryMethod: deliveryMethodForApi,
      courierOrderStatus: activeStatsTab
        ? normalizeStatsKey(activeStatsTab)
        : undefined,
      startDate: dateRange[0] || undefined,
      endDate: dateRange[1] || undefined,
    },
    {
      pollingInterval: 120000,
    },
  );

  const handleDateChange = useCallback(
    (dates: [string | null, string | null]) => {
      setIsExplicitFetch(true);
      setDateRange(dates);
      setPage(1);
    },
    [],
  );

  // Manual refresh that ensures fetch indicator works correctly
  const handleRefresh = useCallback(async () => {
    setIsExplicitFetch(true);
    await refetch();
  }, [refetch]);

  // const handleResetFilters = () => {
  //   setFilters({
  //     sortBy: "created_at_desc",
  //     source: "all",
  //   });
  //   setSearchText("");
  //   setActiveTab("all");
  //   setDateRange([null, null]);
  //   setPage(1);
  // };

  useEffect(() => {
    if (!tableFetching) {
      setIsExplicitFetch(false);
    }
  }, [tableFetching]);

  const orders = useMemo(() => ordersData?.data || [], [ordersData?.data]);
  const meta = useMemo(
    () => ordersData?.meta || { total: 0, page: 1, limit: 10 },
    [ordersData?.meta],
  );

  const loading =
    isLoading ||
    (isExplicitFetch && tableFetching) ||
    isProfileLoading;

  // Keep delivery-method tab in sync with visible permissions
  useEffect(() => {
    if (deliveryMethodTabsForUi.length === 0) return;
    if (!deliveryMethodTabsForUi.find((t) => t.key === activeTab)) {
      const fallback = deliveryMethodTabsForUi[0].key;
      setActiveTab(fallback);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", fallback.toLowerCase());
        return next;
      });
    }
  }, [deliveryMethodTabsForUi, activeTab, setSearchParams]);

  // Restore delivery-method tab from URL (only when that sub-row exists)
  useEffect(() => {
    if (deliveryMethodTabsForUi.length === 0) return;
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (!tabParam) return;
    const matchedTabKey = deliveryMethodTabsForUi.find(
      (tab) => tab.key.toLowerCase() === tabParam,
    )?.key;
    if (matchedTabKey && matchedTabKey !== activeTab) {
      setActiveTab(matchedTabKey);
    }
  }, [searchParams, deliveryMethodTabsForUi, activeTab]);

  // Restore stats tab from URL query param (lowercase)
  useEffect(() => {
    const statusTabParam = searchParams.get("statusTab")?.toLowerCase();
    if (!statusTabParam || permittedStatsEntries.length === 0) return;
    const matchedStatusKey = permittedStatsEntries.find(
      ([key]) => String(key).toLowerCase() === statusTabParam,
    )?.[0];
    if (matchedStatusKey && matchedStatusKey !== activeStatsTab) {
      setActiveStatsTab(String(matchedStatusKey));
    }
  }, [searchParams, permittedStatsEntries, activeStatsTab]);

  const handleCopyCustomerInfo = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();

    const user = record.user || record.customer;
    const customerInfo = `Name: ${user?.name || "N/A"}
Mobile: ${user?.phone || "N/A"}
Address: ${record.address || "N/A"}`;

    navigator.clipboard
      .writeText(customerInfo)
      .then(() => {
        setCopiedOrderId(record.id);
        setTimeout(() => {
          setCopiedOrderId(null);
        }, 2000);
      })
      .catch(() => {});
  };

  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    const zeroOneIndex = cleaned.indexOf("01");
    if (zeroOneIndex !== -1) {
      cleaned = cleaned.substring(zeroOneIndex);
    }
    return "88" + cleaned;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Pending",
      HOLD: "Hold",
      CONFIRM: "Confirm",
      NO_RESPONSE: "No Response",
      GOOD_BUT_NO_RESPONSE: "Good But No Response",
      ADVANCE_REQUIRED: "Advance Required",
      CANCELLED: "Cancelled",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
    };
    if (!status) return "N/A";
    const label = labels[status] || status;
    return label.replace(/_/g, " ");
  };

  // const handleBulkUpdateStatus = (newStatus: string | null) => {
  //   if (!newStatus || selectedOrderIds.length === 0) return;

  //   const isHoldTransition = newStatus === "HOLD";
  //   const statusLabel = getStatusLabel(newStatus);

  //   if (isHoldTransition) {
  //     bulkForm.resetFields();
  //   }

  //   Modal.confirm({
  //     title: (
  //       <span className="text-gray-800 font-semibold">Bulk Status Update</span>
  //     ),
  //     icon: null,
  //     content: (
  //       <div className="py-2">
  //         <p className="text-gray-600 mb-2 text-sm">
  //           You are about to move{" "}
  //           <span className="font-bold text-gray-800">
  //             {selectedOrderIds.length}
  //           </span>{" "}
  //           orders to{" "}
  //           <span className="font-bold uppercase tracking-tight">
  //             {newStatus}
  //           </span>
  //           .
  //         </p>

  //         {isHoldTransition && (
  //           <div className="mt-4">
  //             <Form form={bulkForm} layout="vertical">
  //               <Form.Item
  //                 label={
  //                   <span className="text-xs font-semibold text-gray-700">
  //                     Follow-up Date
  //                   </span>
  //                 }
  //                 name="followUpDate"
  //                 rules={[
  //                   {
  //                     required: true,
  //                     message: "Please select follow-up date",
  //                   },
  //                 ]}
  //               >
  //                 <DatePicker
  //                   showTime
  //                   format="YYYY-MM-DD HH:mm:ss"
  //                   className="w-full border !border-primary"
  //                   placeholder="Select follow-up date and time"
  //                   placement="topRight"
  //                   getPopupContainer={() => document.body}
  //                 />
  //               </Form.Item>

  //               <Form.Item
  //                 label={
  //                   <span className="text-xs font-semibold text-gray-700">
  //                     Follow-up Note (Reason)
  //                   </span>
  //                 }
  //                 name="followUpDescription"
  //                 rules={[
  //                   {
  //                     required: true,
  //                     message: "Please provide a reason",
  //                   },
  //                 ]}
  //               >
  //                 <TextArea
  //                   rows={3}
  //                   placeholder="Reason for holding (e.g., Customer not reachable)"
  //                   className="text-sm border !border-primary"
  //                 />
  //               </Form.Item>
  //             </Form>
  //           </div>
  //         )}

  //         <p className="text-[10px] text-gray-400 mt-3 italic">
  //           This action will update the status of all selected items
  //           immediately.
  //         </p>
  //       </div>
  //     ),
  //     okText: "Confirm Update",
  //     okType: "primary",
  //     okButtonProps: {
  //       className: "bg-primary border-primary",
  //       style: { backgroundColor: "#ff3d0a", borderColor: "#ff3d0a" },
  //     },
  //     cancelText: "Cancel",
  //     centered: true,
  //     width: 600,
  //     onOk: async () => {
  //       let followUpData = undefined;

  //       if (isHoldTransition) {
  //         try {
  //           const values = await bulkForm.validateFields();
  //           followUpData = {
  //             followUpDate: values.followUpDate.toISOString(),
  //             description: values.followUpDescription,
  //           };
  //         } catch {
  //           return Promise.reject();
  //         }
  //       }

  //       const toastId = toast.loading("Processing orders...");
  //       let successCount = 0;
  //       let failCount = 0;
  //       let errorMessage = "";

  //       try {
  //         for (let i = 0; i < selectedOrderIds.length; i++) {
  //           const orderId = selectedOrderIds[i];
  //           const currentNumber = i + 1;
  //           const total = selectedOrderIds.length;

  //           toast.update(toastId, {
  //             render: `Processing ${currentNumber}/${total}...`,
  //           });

  //           try {
  //             const result = await updateOrderStatus({
  //               orderId,
  //               data: {
  //                 status: newStatus as OrderStatus,
  //                 followUp: followUpData,
  //               },
  //             }).unwrap();

  //             if (result.success) {
  //               successCount++;
  //             } else {
  //               failCount++;
  //               errorMessage = result.message || "Unknown error";
  //             }
  //           } catch (err: any) {
  //             failCount++;
  //             errorMessage =
  //               err?.data?.message || err?.message || "Network error";
  //           }
  //         }

  //         if (failCount === 0) {
  //           toast.update(toastId, {
  //             render: `Successfully updated all ${successCount} orders to ${statusLabel}`,
  //             type: "success",
  //             isLoading: false,
  //             autoClose: 3000,
  //           });
  //         } else if (successCount > 0) {
  //           toast.update(toastId, {
  //             render: `Updated ${successCount} orders. ${failCount} failed: ${errorMessage}`,
  //             type: "warning",
  //             isLoading: false,
  //             autoClose: 5000,
  //           });
  //         } else {
  //           toast.update(toastId, {
  //             render: `All ${failCount} orders failed: ${errorMessage}`,
  //             type: "error",
  //             isLoading: false,
  //             autoClose: 5000,
  //           });
  //         }

  //         setSelectedOrderIds([]);
  //         refetch();
  //       } catch (error: any) {
  //         console.error("Bulk status update unexpected error:", error);
  //         toast.update(toastId, {
  //           render: "An unexpected error occurred during bulk update",
  //           type: "error",
  //           isLoading: false,
  //           autoClose: 3000,
  //         });
  //       }
  //     },
  //   });
  // };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string, record: any) => (
        <Link
          to={`/orders/${record.id}`}
          className="block hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-0.5">
            <div className="text-xs font-semibold text-gray-900">
              {new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              {new Date(date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            {record.sale?.invoiceNumber && (
              <div className="text-[10px] font-semibold text-[#1BA143]">
                #{record.sale.invoiceNumber}
              </div>
            )}
          </div>
        </Link>
      ),
    },
    {
      title: "Customer",
      dataIndex: "user",
      width: 250,
      key: "user",
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: any, record: any) => {
        const user = record.user || record.customer;

        return (
          <div
            className="flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Link
                to={`/orders/${record.id}`}
                className="font-semibold text-gray-900 truncate hover:text-[#1BA143] flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {user?.name || "N/A"}
              </Link>
              <Tooltip
                title={copiedOrderId === record.id ? "Copied!" : "Copy info"}
              >
                <div
                  className={`cursor-pointer ${
                    copiedOrderId === record.id
                      ? "text-[#1BA143]"
                      : "text-gray-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCustomerInfo(e, record);
                  }}
                >
                  {copiedOrderId === record.id ? (
                    <FiCheckCircle size={14} />
                  ) : (
                    <FiCopy size={14} />
                  )}
                </div>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FiPhone size={12} />
              <span className="font-semibold">{user?.phone || "N/A"}</span>
              {user?.phone && (
                <div className="flex items-center gap-1">
                  <a href={`tel:${user.phone}`} className="text-blue-500">
                    <FaPhone size={10} />
                  </a>
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(user.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-500"
                  >
                    <IoLogoWhatsapp size={12} />
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500 italic">
              <FiMapPin size={12} className="mt-0.5" />
              <span className="line-clamp-1">{record.address || "N/A"}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Success Rate",
      key: "successRate",
      width: 180,
      render: (_: any, record: any) => {
        const fraud = record.fraudCheck || {
          total_parcels: 0,
          total_delivered: "0",
          total_cancelled: "0",
          total_fraud_reports: [],
        };

        const totalParcels = Number(fraud.total_parcels || 0);
        const delivered = Number(fraud.total_delivered || 0);
        const successRate =
          totalParcels > 0 ? Math.round((delivered / totalParcels) * 100) : 0;

        return (
          <div className="flex items-center gap-3 py-1">
            <Progress
              type="circle"
              percent={successRate}
              size={36}
              strokeWidth={12}
              showInfo={false}
              strokeColor={
                successRate >= 80
                  ? "#1BA143"
                  : successRate >= 50
                    ? "#faad14"
                    : "#ff4d4f"
              }
              trailColor="#f0f0f0"
              className="flex-shrink-0"
            />
            <div className="flex flex-col gap-0.5 min-w-[100px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                  Courier
                </span>
                <span
                  className={`text-[10px] font-semibold whitespace-nowrap ${
                    successRate >= 80
                      ? "text-[#1BA143]"
                      : successRate >= 50
                        ? "text-orange-500"
                        : "text-red-500"
                  }`}
                >
                  {successRate}% ({delivered}/{totalParcels})
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                  Cancelled
                </span>
                <span className="text-[10px] text-red-500 font-semibold whitespace-nowrap">
                  {fraud.total_cancelled}
                </span>
              </div>
              {/* {fraud.total_fraud_reports?.length > 0 && (
                <div className="flex items-center gap-1 text-red-500 pt-0.5 whitespace-nowrap">
                  <ShieldAlert size={10} />
                  <span className="text-[9px] font-bold uppercase whitespace-nowrap">
                    Reports: {fraud.total_fraud_reports.length}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        );
      },
    },
    {
      title: "Items",
      key: "items",
      width: 200,
      render: (_: any, record: any) => {
        const items = record.orderProducts || [];
        if (items.length === 0)
          return <span className="text-gray-400">No items</span>;

        const firstItem = items[0];

        const renderItem = (item: any) => {
          const product = item.product || item.comboProduct;
          const variant = item.variant || item.comboVariant;
          const imgUrl = product?.thumbnail?.url;

          return (
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg mb-2 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {imgUrl ? (
                  <img
                    src={
                      imgUrl.startsWith("http")
                        ? imgUrl
                        : config.image_access_url +
                          imgUrl.split("/").map(encodeURIComponent).join("/")
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-bold">
                    {(product?.name || "P").charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                  {product?.name || "Product"}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.2 py-0.2 rounded border border-primary/10">
                      {item.quantity}x
                    </span>
                    {variant?.name && (
                      <span className="text-[10px] text-gray-500 font-medium">
                        {variant.name}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-green-600">
                    <CurrencyIcon size={10} className="inline mr-0.5" />
                    {item.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        };

        const popoverContent = (
          <div className="w-72 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {items.map((item: any, idx: number) => (
              <div key={idx}>{renderItem(item)}</div>
            ))}
          </div>
        );

        const firstProduct = firstItem.product || firstItem.comboProduct;
        const firstVariant = firstItem.variant || firstItem.comboVariant;
        const firstImgUrl = firstProduct?.thumbnail?.url;

        return (
          <Popover
            content={popoverContent}
            title={
              <span className="font-bold text-gray-800">
                Order Items ({items.length})
              </span>
            }
            trigger="hover"
            placement="bottomLeft"
          >
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {firstImgUrl ? (
                  <img
                    src={
                      firstImgUrl.startsWith("http")
                        ? firstImgUrl
                        : config.image_access_url + firstImgUrl
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold">
                    {(firstProduct?.name || "P").charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-gray-800 truncate group-hover:text-primary transition-colors">
                  {firstProduct?.name || "Product"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">
                    {firstItem.quantity}x{" "}
                    {firstVariant?.name ? `(${firstVariant.name})` : ""}
                  </span>
                  {items.length > 1 && (
                    <Tag className="m-0 text-[11px] border-primary/20 bg-primary/5 text-primary font-bold px-1.2 leading-4">
                      +{items.length - 1} more
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </Popover>
        );
      },
    },
    {
      title: "Order Summary",
      key: "summary",
      width: 150,
      render: (_: any, record: any) => {
        const totalPrice = record.totalPrice || 0;
        const advance = record.advanceAmount || 0;
        const subTotal = record.subTotal || 0;
        const deliveryCharge = record.deliveryCharge || 0;

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-medium flex items-center gap-1">
                <CurrencyIcon size={12} className="text-gray-600" />
                {subTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Delivery:</span>
              <span className="font-medium flex items-center gap-1">
                <CurrencyIcon size={12} className="text-gray-600" />
                {deliveryCharge.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Total:</span>
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <CurrencyIcon size={12} className="text-gray-700" />
                {totalPrice.toLocaleString()}
              </span>
            </div>
            {advance > 0 && (
              <div className="flex justify-between text-[11px]">
                <span className="text-red-500 font-medium">Advance:</span>
                <span className="font-semibold text-red-500 flex items-center gap-1">
                  -<CurrencyIcon size={12} className="text-red-500" />
                  {advance.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Tracking & Payment",
      key: "tracking",
      width: 180,
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: any, record: any) => {
        // const metadata = record.courierMetadata;
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-[#1BA143]/10 text-[#1BA143] px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-[#1BA143]/20">
                {record.deliveryMethod || "N/A"}
              </span>
              {record.paymentMethod && (
                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-orange-100">
                  {record.paymentMethod.replace(/-/g, " ")}
                </span>
              )}
            </div>
            {/* {metadata?.tracking_code && (
              <Tooltip title="Click to copy tracking code">
                <div
                  className="bg-gray-300 text-gray-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-gray-800 cursor-pointer flex items-center gap-1 w-fit"
                  onClick={() => {
                    navigator.clipboard.writeText(metadata.tracking_code);
                    toast.success("Tracking code copied!");
                  }}
                >
                  <FiCopy size={10} />
                  {metadata.tracking_code}
                </div>
              </Tooltip>
            )} */}
            {record.courierConsignmentId && (
              <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-100 flex items-center gap-1 w-fit">
                <span className="text-[9px] uppercase opacity-70">
                  Cons. ID:
                </span>
                {record.courierConsignmentId}
              </div>
            )}
            <div className="flex gap-1 flex-wrap">
              {record.isPreorder && (
                <span className="text-[9px] font-semibold text-purple-600 bg-purple-50 px-1 rounded border border-purple-100 uppercase">
                  Pre-order
                </span>
              )}
              {record.isCrossSale && (
                <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1 rounded border border-indigo-100 uppercase">
                  Cross-sale
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Note",
      key: "note",
      width: 160,
      render: (_: any, record: any) => {
        const metadata = record.courierMetadata;
        return (
          <div className="flex flex-col gap-1.5">
            {record.shippingNote && (
              <Tooltip title={record.shippingNote}>
                <div className="text-[10px] text-gray-500 italic leading-tight border-l-2 border-[#1BA143]/30 pl-1.5 py-0.5 mt-0.5 truncate max-w-[145px]">
                  {record.shippingNote}
                </div>
              </Tooltip>
            )}
            {metadata?.note && (
              <Tooltip title={metadata.note}>
                <div className="text-[10px] text-gray-500 italic leading-tight border-l-2 border-orange-200 pl-1.5 py-0.5 mt-1 truncate max-w-[145px]">
                  {metadata.note}
                </div>
              </Tooltip>
            )}
            {!record.shippingNote && !metadata?.note && (
              <span className="text-gray-300 italic text-[10px]">No notes</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: OrderStatus) => {
        const getStatusColor = (s: string) => {
          const colors: Record<string, string> = {
            PENDING: "orange",
            HOLD: "gold",
            PROCESSING: "blue",
            CONFIRM: "cyan",
            SHIPPED: "purple",
            DELIVERED: "green",
            CANCELLED: "red",
            NO_RESPONSE: "gray",
            GOOD_BUT_NO_RESPONSE: "blue",
            ADVANCE_REQUIRED: "orange",
          };
          return colors[s] || "default";
        };
        return (
          <Tag
            bordered={false}
            color={getStatusColor(status)}
            className="rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase"
          >
            {getStatusLabel(status)}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center" as const,
      fixed: "right" as const,
      className: "bg-white fix-right-column",
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            padding: "4px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            dropdownRender={() => (
              <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-1.5 min-w-[150px]">
                <div className="px-2 py-1 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Print Options
                  </span>
                </div>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md transition-colors text-left"
                  onClick={() => OrderInvoicePrint.printBulk([record])}
                >
                  <FileText size={13} className="text-blue-500" />
                  Invoice
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#1BA143] rounded-md transition-colors text-left"
                  onClick={() => OrderStickerPrint.print([record])}
                >
                  <Box size={13} className="text-[#1BA143]" />
                  Sticker
                </button>
              </div>
            )}
          >
            <Button
              size="middle"
              className="flex items-center justify-center h-9 w-9 border-gray-300 text-gray-600 hover:!border-gray-400 hover:!text-gray-800"
              icon={<MoreVertical size={18} />}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  // const filterMenu = (
  //   <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-4 w-[300px]">
  //     <div className="flex items-center justify-between mb-4 px-0.5">
  //       <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
  //         Active Filters
  //       </h3>
  //       <button
  //         onClick={handleResetFilters}
  //         className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded"
  //       >
  //         Reset <RotateCcw size={12} />
  //       </button>
  //     </div>

  //     <div className="space-y-4">
  //       {/* Sort Section */}
  //       <div>
  //         <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
  //           Sort Order
  //         </label>
  //         <Select
  //           className="w-full h-9"
  //           value={filters.sortBy}
  //           onChange={(val) =>
  //             setFilters((prev: any) => ({ ...prev, sortBy: val }))
  //           }
  //           options={[
  //             { label: "Newest First", value: "created_at_desc" },
  //             { label: "Oldest First", value: "created_at_asc" },
  //             { label: "Amount: High to Low", value: "amount_desc" },
  //             { label: "Amount: Low to High", value: "amount_asc" },
  //           ]}
  //         />
  //       </div>

  //       {/* Source Section */}
  //       <div>
  //         <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
  //           Order Source
  //         </label>
  //         <Select
  //           placeholder="Select Source"
  //           value={filters.source}
  //           onChange={(val) =>
  //             setFilters((prev: any) => ({ ...prev, source: val }))
  //           }
  //           className="w-full h-9"
  //           options={[
  //             { label: "All Sources", value: "all" },
  //             ...orderSources.map((s: any) => ({
  //               label: s.name,
  //               value: s.id,
  //             })),
  //           ]}
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );
  const actionsMenu = (
    <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg border border-gray-200 dark:border-gray-800 p-4 w-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <CheckCircle size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 italic">
            Bulk Actions
          </h3>
          <p className="text-[10px] text-gray-400 font-medium">
            {selectedOrderIds.length} orders selected
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />

      {/* Print Options */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-1">
          <Printer size={12} /> Print Options
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            type="default"
            size="middle"
            onClick={() => {
              const selectedOrders = orders.filter((o: any) =>
                selectedOrderIds.includes(o.id),
              );
              if (selectedOrders.length > 0) {
                OrderInvoicePrint.printBulk(selectedOrders);
              } else {
                toast.error("Please select orders to print");
              }
            }}
            className="h-9 text-[12px] font-bold w-full flex items-center justify-center gap-2"
          >
            <FileText size={15} className="text-gray-400" /> Invoice
          </Button>
          <Button
            type="default"
            size="middle"
            onClick={() => {
              const selectedOrders = orders.filter((o: any) =>
                selectedOrderIds.includes(o.id),
              );
              if (selectedOrders.length > 0) {
                OrderStickerPrint.print(selectedOrders);
              } else {
                toast.error("Please select orders to print");
              }
            }}
            className="h-9 text-[12px] font-bold w-full flex items-center justify-center gap-2"
          >
            <Box size={15} className="text-gray-400" /> Sticker
          </Button>
        </div>
        <div className="w-full">
          <PageListPrint
            customText="Sheet & Lists"
            customIcon={<FileSpreadsheet size={15} className="text-gray-400" />}
            type="default"
            className="h-9 text-[12px] font-bold w-full flex items-center justify-center gap-4"
            groups={[
              {
                title: "Packing List",
                fileName: "Packing_List",
                tableData: orders
                  .filter((o: any) => selectedOrderIds.includes(o.id))
                  .flatMap((order: any) =>
                    (order.orderProducts || []).map(
                      (item: any, idx: number) => ({
                        SL: idx + 1,
                        Image: item.product?.thumbnail?.url || "",
                        Invoice:
                          order.sale?.invoiceNumber ||
                          order.id?.substr(-8).toUpperCase(),
                        Customer:
                          order.user?.name || order.customer?.name || "N/A",
                        SKU: item.product?.sku || "N/A",
                        Product: item.product?.name || "N/A",
                        Qty: item.quantity,
                        Total: item.price * item.quantity,
                      }),
                    ),
                  ),
              },
              {
                title: "Order Sheet",
                fileName: "Order_List",
                tableData: orders
                  .filter((o: any) => selectedOrderIds.includes(o.id))
                  .map((o: any) => ({
                    Date: new Date(o.createdAt).toLocaleDateString(),
                    Invoice:
                      o.sale?.invoiceNumber || o.id?.substr(-8).toUpperCase(),
                    Customer: o.user?.name || o.customer?.name || "N/A",
                    Phone: o.user?.phone || o.customer?.phone || "N/A",
                    Total: o.totalPrice,
                    Status: o.status,
                  })),
              },
            ]}
          />
        </div>
      </div>

      <div className="mb-6" />

      {/* Status Update */}
      {/* <div className="mb-4">
        <label className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-1">
          <CheckCircle size={12} /> Status Update
        </label>
        <Select
          placeholder="Select new status..."
          className="w-full h-10"
          onChange={(value) => {
            if (value) handleBulkUpdateStatus(value);
          }}
          options={[
            { label: "Processing", value: "PROCESSING" },
            { label: "Shipped", value: "SHIPPED" },
            { label: "Delivered", value: "DELIVERED" },
            { label: "Hold", value: "HOLD" },
            { label: "Cancelled", value: "CANCELLED" },
          ]}
        />
        <p className="text-[10px] text-gray-400 italic mt-2 px-1">
          * Updating {selectedOrderIds.length} items
        </p>
      </div> */}
    </div>
  );

  if (!hasAnyDeliveryOrdersAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to view delivery orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <PageMeta
        title="Delivery Management | UserKotha.Shop"
        description="Manage and track orders by their delivery methods including Steadfast, RedX, Pathao, and more."
      />
      <PageHeader
        title="Delivery Management"
        subtitle="Manage orders by delivery method"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Orders" },
          { title: "Delivery" },
        ]}
        extra={
          <div className="flex items-center gap-2">
            <PageListPrint
              tableData={orders.map((order: any) => {
                const customerData = order.user || order.customer;
                const items = order.orderProducts || [];
                const productDetails = items
                  .map((item: any) => {
                    const name = item.product?.name || "Unknown";
                    const variantName = item.variant?.name
                      ? `(${item.variant.name})`
                      : "";
                    return `<div style="margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 2px;">
                      <span style="font-weight:600; font-size: 11px;">${name}</span> 
                      <span style="font-size:10px;color:#666;">${variantName}</span> 
                      <span style="font-weight:700; font-size: 11px;">x${item.quantity}</span>
                    </div>`;
                  })
                  .join("");

                return {
                  "Order Info": `
                    <div>
                      <span style="font-weight:bold;">#${order.sale?.invoiceNumber || order.id.substr(-6).toUpperCase()}</span><br/>
                      <span style="font-size:11px; color: #555;">${new Date(
                        order.createdAt,
                      ).toLocaleDateString("en-GB")}</span><br/>
                      <span style="font-size:10px; color: #888;">${new Date(
                        order.createdAt,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</span>
                    </div>`,
                  Customer: `
                    <div style="line-height:1.4;">
                      <span style="font-weight:bold; color: #111;">${
                        customerData?.name || "N/A"
                      }</span><br/>
                      <span style="font-size:11px;">${
                        customerData?.phone || "N/A"
                      }</span><br/>
                      <span style="font-size:10px;color:#666; display:block; max-width: 150px; white-space: normal;">${
                        order.address || "N/A"
                      }</span>
                    </div>
                  `,
                  "Products & Qty": `<div style="font-size:11px;">${productDetails}</div>`,
                  Amount: `
                    <div style="text-align: right; font-size: 11px;">
                      <div style="display: flex; justify-content: flex-end; gap: 8px; color: #666;">
                        <span>Subtotal:</span>
                        <span style="font-weight: 500; min-width: 50px;">${order.subTotal?.toLocaleString()}</span>
                      </div>
                      <div style="display: flex; justify-content: flex-end; gap: 8px; color: #666;">
                        <span>Delivery:</span>
                        <span style="font-weight: 500; min-width: 50px;">${order.deliveryCharge?.toLocaleString()}</span>
                      </div>
                      <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #ddd; margin-top: 2px; padding-top: 2px; color: #111;">
                        <span style="font-weight: 600;">Total:</span>
                        <span style="font-weight: 700; color: #1BA143; min-width: 50px;">${order.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  `,
                  Status: order.status,
                };
              })}
              fileName="Delivery_Orders_List"
            />

            <Button
              type="default"
              icon={<RefreshCcw size={16} />}
              onClick={handleRefresh}
              className="flex items-center"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Courier Stats Dashboard */}
      {courierStats?.data && permittedStatsEntries.length > 0 && (
        <div
          className={`w-full overflow-x-auto ant-table-wrapper !bg-transparent mb-6 ${
            isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
          }`}
        >
          {/* <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary text-white px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-2 flex-shrink-0">
              <span className="font-medium text-xs capitalize opacity-90">
                Current Balance:
              </span>
              <span className="font-semibold text-base">
                <DisplayCurrency
                  amount={courierStats?.data?.accountInfo?.currentBalance || 0}
                />
              </span>
            </div>
          </div> */}
          <Tabs
            activeKey={activeStatsTab}
            onChange={handleStatsTabChange}
            items={permittedStatsEntries.map(
              ([status, count]: [string, any]) => ({
                key: status,
                label: (
                  <span
                    className="flex items-center gap-2"
                    style={{
                      color: activeStatsTab === status ? "#ff3d0a" : "black",
                      fontWeight: activeStatsTab === status ? "600" : "500",
                    }}
                  >
                    <span className="capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                    <Tag
                      style={{
                        backgroundColor:
                          activeStatsTab === status ? "#ff3d0a" : "#9e9e9e",
                        color: "white",
                        borderRadius: "9999px",
                        border: "none",
                      }}
                    >
                      {count}
                    </Tag>
                  </span>
                ),
              }),
            )}
            tabBarGutter={20}
            className="w-full custom-tabs"
          />
        </div>
      )}

      <div className="bg-white rounded-lg border -mt-4 border-gray-200">
        <div className="p-4 border-b border-gray-50 flex flex-col">
          {/* Delivery method sub-row: each tab gated by its action (`view_all` = “All” only). */}
          {deliveryMethodTabsForUi.length > 0 && (
            <div className="flex items-center -mt-3">
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                className="delivery-tabs"
                items={deliveryMethodTabsForUi}
              />
            </div>
          )}

          {/* Row 2: Search & Filters */}
          <div className="flex flex-col  md:flex-row items-center justify-between gap-4">
            <Input
              disabled={meta.total < 0}
              placeholder="Search by order ID, customer name, phone, invoice..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              onChange={(e) => debounceSearch(e.target.value)}
              className="w-full md:max-w-md"
              size="middle"
              allowClear
            />

            <div className="flex items-center gap-3">
              {/* <Dropdown overlay={filterMenu} trigger={["click"]}>
                <Button className="flex items-center gap-2 h-9 px-4 font-semibold border-gray-200 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-all bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Filter size={14} className="text-gray-400" />
                  <span className="text-[13px]">Filters</span>
                </Button>
              </Dropdown> */}

              <Dropdown
                overlay={actionsMenu}
                trigger={["click"]}
                disabled={selectedOrderIds.length === 0}
              >
                <Button className="flex items-center gap-2 h-9 px-4 font-semibold border-gray-200 text-gray-900 dark:text-gray-100 hover:border-primary hover:text-primary transition-all group bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <span className="text-[13px]">Actions</span>
                  <ChevronDown
                    size={14}
                    className="text-gray-400 group-hover:text-primary transition-colors ml-0.5"
                  />
                </Button>
              </Dropdown>

              <CustomDatePicker
                selectedData={dateRange}
                onChange={handleDateChange}
              />

              <FilterColumn
                tableName="delivery_orders_v2"
                columns={columns}
                onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
              />
            </div>
          </div>
        </div>

        <div className="">
          <DataTable
            selectRow={true}
            loading={loading || tableFetching}
            data={orders}
            columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
            rowKey="id"
            isPaginate={meta?.total > 10}
            currentPage={page}
            setCurrentPage={handlePageChange}
            limit={limit}
            setLimit={handleLimitChange}
            showSizeChanger={meta?.total > 10}
            total={meta?.total || 0}
            clearSelectionTrigger={selectedOrderIds.length === 0}
            onSelectRowsChange={(selectedRows: any[]) => {
              const ids = selectedRows.map((row) => row.id);
              setSelectedOrderIds(ids);
            }}
            onRow={(record: any) => ({
              onClick: () => navigate(`/orders/${record.id}`),
              style: { cursor: "pointer" },
            })}
          />
        </div>
      </div>
      <div />
    </div>
  );
};

export default DeliveryOrderList;
