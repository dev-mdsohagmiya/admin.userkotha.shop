import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Popover,
  Progress,
  Select,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import {
  CheckCircle,
  ChevronDown,
  Lock,
  RefreshCcw,
  Search,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FiCheckCircle, FiCopy, FiTrash2 } from "react-icons/fi";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  useDeleteOrderMutation,
  // useGetOrderStatusSummaryQuery,
  useGetCompletedOrdersQuery,
  useGetIncompleteCheckoutOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../../redux/features/order/orderApi";

import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import FilterColumn from "../../../components/common/FilterColumn/FilterColumn";
import UpdateCustomerModal from "../../../components/common/Modals/Customer/UpdateCustomerModal";
import { DataTable } from "../../../components/common/Tables";
import { OrderStatus } from "../../../types/order";
import { debounce } from "../../../utils/debounce";

import { FaPhone } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { toast } from "react-toastify";
import PageListPrint from "../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { config } from "../../../config";
import { useSidebar } from "../../../context/SidebarContext";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { moduleHasAction } from "../../../utils/permissions";
import { CurrencyIcon } from "../../../utils/currency";
const { TextArea } = Input;

export interface CompletedOrdersRef {
  refetch: () => void;
}

const CompletedOrderList = forwardRef<CompletedOrdersRef>((props, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isExpanded } = useSidebar();
  const { hasUpdate, allActions, isProfileLoading } =
    useModulePermissions("Orders");

  const [activeTab, setActiveTab] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "createdAt",
    "user",
    "note",
    "products",
    "successRate",
    "summary",
    "status",
    "action",
  ]);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  // Modal state
  // const [statusModalOpen, setStatusModalOpen] = useState(false);
  // const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // const [currentOrderStatus, setCurrentOrderStatus] = useState<
  //   OrderStatus | ""
  // >("");
  const [isManualRefetch, setIsManualRefetch] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [isExplicitFetch, setIsExplicitFetch] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // const initialFilters = {
  //   sortBy: "created_at_desc",
  //   source: "all",
  //   paymentMethod: "all",
  //   sku: "",
  // };

  // const [filters, setFilters] = useState(initialFilters);

  // const { data: orderSourcesData } = useGetAllOrderSourcesQuery(undefined);
  // const orderSources = orderSourcesData?.data || [];

  // Customer update modal state
  const [updateCustomerModalOpen, setUpdateCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const [bulkForm] = Form.useForm();

  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  // const { data: summaryResponse } = useGetOrderStatusSummaryQuery(
  //   [
  //     dateRange[0] && { name: "startDate", value: dateRange[0] },
  //     dateRange[1] && { name: "endDate", value: dateRange[1] },
  //   ].filter(Boolean),
  //   {
  //     pollingInterval: 10000,
  //   },
  // );
  // const summary = summaryResponse?.data || {};

  // ==============================
  // SEARCH & FILTER HANDLERS
  // ==============================

  // Debounced search to prevent excessive API calls
  const debounceSearch = useRef(
    debounce((value: string) => {
      setIsExplicitFetch(true);
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debounceSearch(value);
    },
    [debounceSearch],
  );

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
      setSelectedOrderIds([]); // Clear selection when tab changes to avoid bulk action mistakes
    },
    [setSearchParams],
  );

  // const handleResetFilters = () => {
  //   setFilters({ ...initialFilters });
  //   setInputValue("");
  //   setSearchText("");
  //   setActiveTab("PENDING");
  //   setDateRange([null, null]);
  //   setPage(1);
  //   setSelectedOrderIds([]);
  // };

  // Fetch main completed orders based on current filters
  const {
    data: ordersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetCompletedOrdersQuery(
    [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      searchText && { name: "search", value: searchText },
      // Skip status filter when INCOMPLETE - that tab uses a separate API

      activeTab &&
        activeTab !== "INCOMPLETE" && { name: "status", value: activeTab },
      dateRange[0] && { name: "startDate", value: dateRange[0] },
      dateRange[1] && { name: "endDate", value: dateRange[1] },
    ].filter(Boolean),
    {
      // pollingInterval: 10000,
      // Skip main query when INCOMPLETE tab is active — separate API handles it
      skip: !activeTab || activeTab === "INCOMPLETE",
    },
  );

  // Memoize summary counts to prevent unnecessary recalculation
  const orderSummary = useMemo(
    () => ordersData?.summary?.order || {},
    [ordersData?.summary?.order],
  );
  const summary = orderSummary; // For backward compatibility with tabs count logic

  // --- Incomplete orders: separate API (same as IncompleteOrderList) ---
  const {
    data: incompleteOrdersData,
    isLoading: isIncompleteLoading,
    isFetching: isIncompleteFetching,
    refetch: refetchIncomplete,
  } = useGetIncompleteCheckoutOrdersQuery(
    [
      dateRange[0] && { name: "startDate", value: dateRange[0] },
      dateRange[1] && { name: "endDate", value: dateRange[1] },
      searchText && { name: "search", value: searchText },
    ].filter(Boolean),
    { skip: !activeTab || activeTab !== "INCOMPLETE" },
  );

  const incompleteOrders = useMemo(
    () => incompleteOrdersData?.data || [],
    [incompleteOrdersData?.data],
  );
  const incompleteCount = incompleteOrders.length;

  /** Incomplete tab query only runs on that tab; badge on other tabs must use API summary. */
  const incompleteTabBadgeCount = useMemo(() => {
    if (activeTab === "INCOMPLETE") {
      return incompleteCount;
    }
    return Number(summary.INCOMPLETE ?? 0) || 0;
  }, [activeTab, incompleteCount, summary.INCOMPLETE]);

  // --- Unified orders & meta depending on active tab ---
  const orders = useMemo(
    () =>
      activeTab === "INCOMPLETE" ? incompleteOrders : ordersData?.data || [],
    [activeTab, incompleteOrders, ordersData?.data],
  );

  const meta = useMemo(
    () =>
      activeTab === "INCOMPLETE"
        ? { total: incompleteCount, page: 1, limit: incompleteCount }
        : ordersData?.meta || { total: 0, page: 1, limit: 10 },
    [activeTab, incompleteCount, ordersData?.meta],
  );

  const tabPermissionMap: Record<string, string> = useMemo(
    () => ({
      all: "view_all",
      PENDING: "view_pending",
      INCOMPLETE: "view_incomplete",
      NO_RESPONSE: "view_no_response",
      GOOD_BUT_NO_RESPONSE: "view_good_but_no_response",
      ADVANCE_REQUIRED: "view_advance_required",
      HOLD: "view_hold",
      preorder: "view_preorder",
      CONFIRM: "view_confirm",
      CANCELLED: "view_cancelled",
    }),
    [],
  );

  const orderModuleActions = useMemo(
    () => [
      "view",
      "update",
      "view_all",
      "view_pending",
      "view_incomplete",
      "view_no_response",
      "view_good_but_no_response",
      "view_advance_required",
      "view_hold",
      "view_confirm",
      "view_preorder",
      "view_cancelled",
    ],
    [],
  );

  const hasAnyOrdersAccess = useMemo(
    () => orderModuleActions.some((action) => moduleHasAction(allActions, action)),
    [allActions, orderModuleActions],
  );

  const fullTabConfig = useMemo(
    () => [
      { key: "all", label: "All Order" },
      { key: "PENDING", label: "Pending" },
      { key: "INCOMPLETE", label: "Incomplete" },
      { key: "NO_RESPONSE", label: "No Response" },
      { key: "GOOD_BUT_NO_RESPONSE", label: "Good But No Response" },
      { key: "ADVANCE_REQUIRED", label: "Advance Required" },
      { key: "HOLD", label: "Hold" },
      { key: "preorder", label: "Pre Order" },
      { key: "CONFIRM", label: "Confirm" },
      { key: "CANCELLED", label: "Cancelled" },
    ],
    [],
  );

  const tabConfig = useMemo(
    () =>
      fullTabConfig.filter((tab) => {
        const permission = tabPermissionMap[tab.key];
        return moduleHasAction(allActions, permission);
      }),
    [fullTabConfig, allActions, tabPermissionMap],
  );

  /** First allowed tab (or URL `tab=`) — never default to PENDING without `view_pending`. */
  useLayoutEffect(() => {
    if (tabConfig.length === 0) return;
    setActiveTab((prev) => {
      const tabParam = searchParams.get("tab")?.toLowerCase();
      const fromUrl = tabParam
        ? tabConfig.find((t) => t.key.toLowerCase() === tabParam)?.key
        : undefined;
      if (fromUrl) return fromUrl;
      if (tabConfig.some((t) => t.key === prev)) return prev;
      return tabConfig[0].key;
    });
  }, [tabConfig, searchParams]);

  useEffect(() => {
    if (!location.state?.activeTab && !location.state?.lockedByOther) return;

    if (location.state?.activeTab) {
      const raw = location.state.activeTab;
      const key =
        typeof raw === "string"
          ? raw
          : raw != null
            ? String(raw)
            : "";
      const match = tabConfig.find(
        (t) => t.key === key || t.key.toLowerCase() === key.toLowerCase(),
      );
      if (match) setActiveTab(match.key);
    }

    if (location.state?.lockedByOther || location.state?.activeTab) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate, tabConfig]);

  // Restore tab from URL query param
  useEffect(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (!tabParam) return;
    const matchedTabKey = tabConfig.find(
      (tab) => tab.key.toLowerCase() === tabParam,
    )?.key;
    if (matchedTabKey && matchedTabKey !== activeTab) {
      setActiveTab(matchedTabKey);
    }
  }, [searchParams, tabConfig, activeTab]);

  // Ensure activeTab is valid based on permissions
  useEffect(() => {
    if (tabConfig.length > 0 && !tabConfig.find((t) => t.key === activeTab)) {
      const fallbackKey = tabConfig[0].key;
      setActiveTab(fallbackKey);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", fallbackKey.toLowerCase());
        return next;
      });
    }
  }, [tabConfig, activeTab, setSearchParams]);

  // Handle manual data refresh
  const handleRefresh = useCallback(async () => {
    setIsManualRefetch(true);
    try {
      if (activeTab === "INCOMPLETE") {
        await refetchIncomplete();
      } else {
        await refetch();
      }
    } finally {
      setIsManualRefetch(false);
    }
  }, [activeTab, refetchIncomplete, refetch]);

  // Reset explicit fetch state when fetching completes
  useEffect(() => {
    if (!isFetching && !isIncompleteFetching) {
      setIsExplicitFetch(false);
    }
  }, [isFetching, isIncompleteFetching]);

  // Expose refetch function to parent component
  useImperativeHandle(ref, () => ({
    refetch: handleRefresh,
  }));

  // Table loading state
  const loading =
    activeTab === "INCOMPLETE"
      ? isIncompleteLoading ||
        isManualRefetch ||
        (isExplicitFetch && isIncompleteFetching) ||
        isProfileLoading
      : isLoading ||
        isManualRefetch ||
        (isExplicitFetch && isFetching) ||
        isProfileLoading;

  const handlePageChange = useCallback((p: number) => {
    setIsExplicitFetch(true);
    setPage(p);
  }, []);

  const handleLimitChange = useCallback((l: number) => {
    setIsExplicitFetch(true);
    setLimit(l);
  }, []);

  // Memoized tabs generation to render counts and styles
  const tabs = useMemo(
    () =>
      tabConfig.map(({ key, label }) => ({
        key,
        label: (
          <span
            className={`flex items-center gap-2`}
            style={{
              color: activeTab === key ? "#ff3d0a" : "black",
              fontWeight: activeTab === key ? "600" : "500",
            }}
          >
            {label}{" "}
            <Tag
              style={{
                backgroundColor: activeTab === key ? "#ff3d0a" : "#9e9e9e",
                color: "white",
                borderRadius: "9999px",
                border: "none",
              }}
            >
              {key === "INCOMPLETE"
                ? incompleteTabBadgeCount
                : summary[key as keyof typeof summary] || 0}
            </Tag>
          </span>
        ),
      })),
    [activeTab, tabConfig, incompleteTabBadgeCount, summary],
  );

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
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
      preorder: "blue",
    };
    return colors[status] || "default";
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
      preorder: "Pre Order",
    };
    return labels[status] || status;
  };

  const handleBulkUpdateStatus = (newStatus: string | null) => {
    if (!hasUpdate) return;
    if (!newStatus || selectedOrderIds.length === 0) return;

    const isHoldTransition = activeTab === "PENDING" && newStatus === "HOLD";

    if (isHoldTransition) {
      bulkForm.resetFields();
    }

    Modal.confirm({
      title: (
        <span className="text-gray-800 font-semibold">Bulk Status Update</span>
      ),
      icon: null,
      content: (
        <div className="py-2">
          <p className="text-gray-600 mb-2 text-sm">
            You are about to move{" "}
            <span className="font-bold text-gray-800">
              {selectedOrderIds.length}
            </span>{" "}
            orders.
          </p>
          <div className="flex items-center gap-2 text-[11px] bg-gray-50 text-gray-700 p-2 rounded border border-gray-200">
            <span className="font-medium opacity-70 uppercase tracking-tight">
              {activeTab}
            </span>
            <span className="text-gray-400">➔</span>
            <span className="font-bold uppercase tracking-tight">
              {newStatus}
            </span>
          </div>

          {isHoldTransition && (
            <div className="mt-4">
              <Form form={bulkForm} layout="vertical">
                <Form.Item
                  label={
                    <span className="text-xs font-semibold text-gray-700">
                      Follow-up Date
                    </span>
                  }
                  name="followUpDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select follow-up date",
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    className="w-full border !border-primary"
                    placeholder="Select follow-up date and time"
                    placement="topRight"
                    getPopupContainer={() => document.body}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-xs font-semibold text-gray-700">
                      Follow-up Note (Reason)
                    </span>
                  }
                  name="followUpDescription"
                  rules={[
                    {
                      required: true,
                      message: "Please provide a reason",
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Reason for holding (e.g., Customer not reachable)"
                    className="text-sm border !border-primary"
                  />
                </Form.Item>
              </Form>
            </div>
          )}

          <p className="text-[10px] text-gray-400 mt-3 italic">
            This action will update the status of all selected items
            immediately.
          </p>
        </div>
      ),
      okText: "Confirm Update",
      okType: "primary",
      okButtonProps: {
        className: "bg-primary border-primary",
        style: { backgroundColor: "#ff3d0a", borderColor: "#ff3d0a" },
      },
      cancelText: "Cancel",
      centered: true,
      width: 600,
      onOk: async () => {
        let followUpData = undefined;

        if (isHoldTransition) {
          try {
            const values = await bulkForm.validateFields();
            followUpData = {
              followUpDate: values.followUpDate.toISOString(),
              description: values.followUpDescription,
            };
          } catch {
            return Promise.reject();
          }
        }

        console.log(
          "Starting bulk update for",
          selectedOrderIds.length,
          "orders to",
          newStatus,
        );
        const toastId = toast.loading("Processing orders...");
        let successCount = 0;
        let failCount = 0;
        let errorMessage = "";

        try {
          // Process sequentially to avoid backend race conditions (unique constraint errors)
          for (let i = 0; i < selectedOrderIds.length; i++) {
            const orderId = selectedOrderIds[i];
            const currentNumber = i + 1;
            const total = selectedOrderIds.length;

            // Update loading message
            toast.update(toastId, {
              render: `Processing ${currentNumber}/${total}...`,
            });

            try {
              const result = await updateOrderStatus({
                orderId,
                data: {
                  status: newStatus as OrderStatus,
                  followUp: followUpData,
                },
              }).unwrap();

              if (result.success) {
                successCount++;
              } else {
                failCount++;
                errorMessage = result.message || "Unknown error";
              }
            } catch (err: any) {
              failCount++;
              errorMessage =
                err?.data?.message || err?.message || "Network error";
            }
          }

          // Final toast update
          if (failCount === 0) {
            toast.update(toastId, {
              render: `Successfully updated all ${successCount} orders to ${newStatus}`,
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
          } else if (successCount > 0) {
            toast.update(toastId, {
              render: `Updated ${successCount} orders. ${failCount} failed: ${errorMessage}`,
              type: "warning",
              isLoading: false,
              autoClose: 5000,
            });
          } else {
            toast.update(toastId, {
              render: `All ${failCount} orders failed: ${errorMessage}`,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
          }

          // Clear selection and refetch
          setSelectedOrderIds([]);
          refetch();
        } catch (error: any) {
          console.error("Bulk status update unexpected error:", error);
          toast.update(toastId, {
            render: "An unexpected error occurred during bulk update",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      },
    });
  };

  const handleDeleteOrder = (id: string) => {
    Modal.confirm({
      title: "Delete this order?",
      content:
        "This will permanently delete the order and all related data. This cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteOrder(id).unwrap();
        } catch {
          Modal.error({ title: "Failed to delete order" });
        }
      },
    });
  };

  const handleCopyCustomerInfo = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();

    const isInc = activeTab === "INCOMPLETE" || !record.status;
    const name = isInc
      ? record.customerName
      : record.customer?.name ||
        record.user?.customerProfile?.name ||
        record.user?.name;
    const phone = isInc
      ? record.customerPhone
      : record.customer?.phone ||
        record.user?.customerProfile?.phone ||
        record.user?.phone;
    const address = isInc ? record.customerAddress : record.address;

    const customerInfo = `Name: ${name || "N/A"}
Mobile: ${phone || "N/A"}
Address: ${address || "N/A"}`;

    navigator.clipboard
      .writeText(customerInfo)
      .then(() => {
        setCopiedOrderId(record.id);
        setTimeout(() => {
          setCopiedOrderId(null);
        }, 2000);
      })
      .catch(() => {
        // Silently fail
      });
  };

  // Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return "";

    // Remove all non-numeric characters
    let cleaned = phone.replace(/[^0-9]/g, "");

    // Find the first occurrence of "01" and keep everything from there
    const zeroOneIndex = cleaned.indexOf("01");
    if (zeroOneIndex !== -1) {
      cleaned = cleaned.substring(zeroOneIndex);
    }

    // Always ensure it starts with 88
    return "88" + cleaned;
  };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string, record: any) => {
        const isInc = activeTab === "INCOMPLETE" || !record.status;
        const detailUrl = isInc
          ? `/orders/incomplete/${record.id}`
          : `/orders/${record.id}`;
        return (
          <Link
            to={detailUrl}
            className="block hover:opacity-80"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="text-xs font-medium text-gray-900">
              {new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </Link>
        );
      },
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Customer",
      dataIndex: "user",
      width: 280,
      key: "user",
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: any, record: any) => {
        const isInc = activeTab === "INCOMPLETE" || !record.status;
        const detailUrl = isInc
          ? `/orders/incomplete/${record.id}`
          : `/orders/${record.id}`;

        // Prioritize customer data
        const customerName = isInc
          ? record.customerName
          : record.customer?.name ||
            record.user?.customerProfile?.name ||
            record.user?.name;
        const customerPhone = isInc
          ? record.customerPhone
          : record.customer?.phone ||
            record.user?.customerProfile?.phone ||
            record.user?.phone;
        const customerAddress = isInc ? record.customerAddress : record.address;

        return (
          <div
            className="flex flex-col gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Name Row with Edit & Copy */}
            <div className="flex items-center gap-2">
              <Link
                to={detailUrl}
                className="font-medium text-gray-900 truncate hover:text-primary flex-1 min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                {customerName || "N/A"}
              </Link>

              <Tooltip
                title={
                  copiedOrderId === record.id ? "Copied!" : "Copy customer info"
                }
              >
                <div
                  className={`cursor-pointer flex-shrink-0 ${
                    copiedOrderId === record.id
                      ? "text-green-500"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCustomerInfo(e, record);
                  }}
                >
                  {copiedOrderId === record.id ? (
                    <FiCheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <FiCopy className="w-3.5 h-3.5" />
                  )}
                </div>
              </Tooltip>
            </div>

            {/* Phone Row */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="truncate">{customerPhone || "N/A"}</span>
              {customerPhone && (
                <div className="flex items-center gap-2 ml-1">
                  <Tooltip title="Call">
                    <a
                      href={`tel:${customerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#007bff] hover:text-[#0056b3] transition-colors flex items-center"
                    >
                      <FaPhone className="w-3 h-3" />
                    </a>
                  </Tooltip>
                  <Tooltip title="WhatsApp">
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(customerPhone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#25D366] hover:text-[#128C7E] transition-colors flex items-center"
                    >
                      <IoLogoWhatsapp className="w-4 h-4" />
                    </a>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Address Row */}
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <span className="line-clamp-1 break-all">
                {customerAddress || "N/A"}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      title: "Note",
      key: "note",
      width: 220,
      render: (_: any, record: any) => {
        const followUps = record?.followUps || [];

        const latestFollowUp =
          followUps.length > 0
            ? [...followUps].sort((a: any, b: any) => {
                const dateA = new Date(a.followUpDate || a.createdAt).getTime();
                const dateB = new Date(b.followUpDate || b.createdAt).getTime();
                return dateB - dateA; // latest first
              })[0]
            : null;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
              {latestFollowUp
                ? new Date(
                    latestFollowUp.followUpDate || latestFollowUp.createdAt,
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}{" "}
              {latestFollowUp
                ? new Date(latestFollowUp.createdAt).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    },
                  )
                : ""}
            </span>

            {/* Description with tooltip */}
            <Tooltip
              title={latestFollowUp?.description || "N/A"}
              placement="topLeft"
            >
              <div className="text-xs text-gray-600 line-clamp-2 max-w-[200px] cursor-pointer">
                {latestFollowUp?.description || "N/A"}
              </div>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Products & Variants",
      key: "products",
      width: 220,
      render: (_: any, record: any) => {
        const items = record.orderProducts || record.checkoutProducts || [];
        if (items.length === 0)
          return <span className="text-gray-400">No items</span>;

        const firstItem = items[0];

        const renderItem = (item: any) => {
          const isCombo = !!item.comboProduct;
          const mainProduct = isCombo ? item.comboProduct : item.product;
          const variant = isCombo ? item.comboVariant : item.variant;
          // For incomplete/checkout orders, image is nested under variant.product.thumbnail
          const imgUrl =
            mainProduct?.thumbnail?.url ||
            variant?.product?.thumbnail?.url ||
            "";
          const productName =
            mainProduct?.name ||
            variant?.product?.name ||
            item.productName ||
            "Unknown Product";
          const productSku = mainProduct?.sku || variant?.product?.sku || "";
          const variantSku = variant?.sku || "";
          const variantName = variant?.name || "";

          return (
            <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {imgUrl ? (
                  <img
                    src={
                      imgUrl.startsWith("http")
                        ? imgUrl
                        : config.image_access_url + imgUrl
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold">
                    {productName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  {productSku && (
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1 rounded border border-gray-200 uppercase">
                      {productSku}
                    </span>
                  )}
                  {variantSku && variantSku !== productSku && (
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-500 px-1 rounded border border-blue-100 uppercase">
                      {variantSku}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-gray-900 line-clamp-1">
                  {productName}
                  {variantName && (
                    <span className="text-[10px] text-primary ml-1 font-semibold">
                      ({variantName})
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] font-medium text-gray-500">
                    Qty: {item.quantity}
                  </span>
                  <div className="flex flex-col items-end">
                    {item.discountPrice > 0 &&
                    item.discountPrice <
                      (variant?.sellingPrice || item.price) ? (
                      <>
                        <span className="text-[11px] font-bold text-green-600 flex items-center gap-1">
                          <CurrencyIcon size={12} className="text-green-600" />
                          {item.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-gray-400 line-through flex items-center gap-1">
                          <CurrencyIcon size={10} className="text-gray-400" />
                          {(
                            variant?.sellingPrice ||
                            item.price ||
                            0
                          ).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-green-600 flex items-center gap-1">
                        <CurrencyIcon size={12} className="text-green-600" />
                        {(item.discountPrice > 0
                          ? item.discountPrice
                          : variant?.sellingPrice || item.price || 0
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
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

        return (
          <Popover
            content={popoverContent}
            title={
              <span className="font-bold text-gray-800">
                Order Items ({items.length})
              </span>
            }
            trigger="hover"
            placement="left"
          >
            <Link
              to={
                activeTab === "INCOMPLETE"
                  ? `/orders/incomplete/${record.id}`
                  : `/orders/${record.id}`
              }
              className="flex items-center gap-3 cursor-pointer group p-1 rounded-lg transition-colors border border-transparent hover:border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden  transition-colors">
                {(() => {
                  // For incomplete orders: image is in variant.product.thumbnail.url
                  // For regular orders: image is in product.thumbnail.url or comboProduct.thumbnail.url
                  const imgUrl =
                    firstItem.product?.thumbnail?.url ||
                    firstItem.comboProduct?.thumbnail?.url ||
                    firstItem.variant?.product?.thumbnail?.url ||
                    firstItem.comboVariant?.product?.thumbnail?.url;

                  const fallbackName =
                    firstItem.product?.name ||
                    firstItem.comboProduct?.name ||
                    firstItem.variant?.product?.name ||
                    firstItem.productName ||
                    "P";

                  if (!imgUrl)
                    return (
                      <span className="text-xs text-gray-400 font-bold">
                        {fallbackName.charAt(0)}
                      </span>
                    );
                  return (
                    <img
                      src={
                        imgUrl.startsWith("http")
                          ? imgUrl
                          : config.image_access_url + imgUrl
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 leading-relaxed py-0.5 overflow-hidden">
                  <span className="text-[13px] font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
                    {firstItem.product?.name ||
                      firstItem.comboProduct?.name ||
                      firstItem.variant?.product?.name ||
                      firstItem.productName ||
                      "Product"}
                  </span>
                  {(firstItem.variant?.name ||
                    firstItem.comboVariant?.name) && (
                    <span className="text-primary/80 font-bold px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10 text-[9px] uppercase tracking-wider flex-shrink-0 whitespace-nowrap">
                      {firstItem.variant?.name || firstItem.comboVariant?.name}
                    </span>
                  )}
                  {(() => {
                    const pSku =
                      firstItem.product?.sku ||
                      firstItem.comboProduct?.sku ||
                      firstItem.variant?.product?.sku ||
                      firstItem.comboVariant?.product?.sku;
                    const vSku =
                      firstItem.variant?.sku || firstItem.comboVariant?.sku;

                    return (
                      <div className="flex items-center gap-1">
                        {pSku && (
                          <span className="text-gray-500 font-medium px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-[9px] uppercase tracking-wider flex-shrink-0 whitespace-nowrap">
                            {pSku}
                          </span>
                        )}
                        {vSku && vSku !== pSku && (
                          <span className="text-blue-500 font-medium px-1.5 py-0.5 bg-blue-50 rounded border border-blue-100 text-[9px] uppercase tracking-wider flex-shrink-0 whitespace-nowrap">
                            {vSku}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-bold text-green-600 flex items-center gap-1">
                    <CurrencyIcon size={14} className="text-green-600" />
                    {(firstItem.discountPrice > 0
                      ? firstItem.discountPrice
                      : firstItem.comboVariant?.sellingPrice ||
                        firstItem.variant?.sellingPrice ||
                        firstItem.price ||
                        0
                    ).toLocaleString()}
                  </span>
                  {items.length > 1 && (
                    <Tag className="m-0 text-[10px] border-primary/20 bg-primary/5 text-primary font-bold px-1.5 leading-4">
                      +{items.length - 1} more
                    </Tag>
                  )}
                </div>
              </div>
            </Link>
          </Popover>
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

        const delivered = parseInt(fraud.total_delivered) || 0;
        const total = fraud.total_parcels || 0;
        const fraudSuccessRate =
          total > 0 ? Math.round((delivered / total) * 100) : 0;

        return (
          <div className="flex items-center gap-3 py-1">
            <Progress
              type="circle"
              percent={fraudSuccessRate}
              size={40}
              strokeWidth={12}
              showInfo={false}
              strokeColor={
                fraudSuccessRate >= 80
                  ? "#1BA143"
                  : fraudSuccessRate >= 50
                    ? "#faad14"
                    : "#f5222d"
              }
              className="flex-shrink-0"
            />
            <div className="flex flex-col gap-0.5 min-w-[100px]">
              {/* Courier Stats */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap uppercase tracking-wider">
                  Courier:
                </span>
                <span className="text-[10px] text-green-600 font-bold whitespace-nowrap">
                  {fraudSuccessRate}% ({delivered}/{total})
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap uppercase tracking-wider">
                  Cancelled:
                </span>
                <span className="text-[10px] text-red-500 font-bold whitespace-nowrap">
                  {fraud.total_cancelled}
                </span>
              </div>
              {/* {fraud.total_fraud_reports?.length > 0 && (
                <div className="flex items-center gap-1 text-red-500 bg-red-50 px-1 rounded mt-0.5 whitespace-nowrap">
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
      title: "Order Summary",
      key: "summary",
      width: 170,
      render: (_: any, record: any) => {
        const isInc = activeTab === "INCOMPLETE" || !record.status;
        const advance = record.advance || 0;
        const totalPrice = isInc
          ? record.checkoutProducts?.reduce(
              (sum: number, item: any) =>
                sum + (item.sellingPrice || 0) * (item.quantity || 1),
              0,
            ) || 0
          : record.totalPrice || 0;

        return (
          <div className="space-y-1">
            {!isInc && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium flex items-center gap-1">
                    <CurrencyIcon size={12} className="text-gray-600" />
                    {record.subTotal?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Delivery:</span>
                  <span className="font-medium flex items-center gap-1">
                    <CurrencyIcon size={12} className="text-gray-600" />
                    {record.deliveryCharge?.toLocaleString() || 0}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Total:</span>
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <CurrencyIcon size={12} className="text-gray-700" />
                {totalPrice.toLocaleString()}
              </span>
            </div>
            {advance > 0 && (
              <div className="flex justify-between text-xs">
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
      title: "Status",
      key: "status",
      width: 160,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Tag
            color={getStatusColor(record.status)}
            className="px-2 py-0.5 text-[10px] font-bold m-0 uppercase"
          >
            {getStatusLabel(record.status)}
          </Tag>
          {/* <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider">
            {record.paymentMethod?.replace(/-/g, " ").toUpperCase() || "N/A"}
          </span> */}
        </div>
      ),
    },
    {
      title: "Maintainer",
      key: "action",
      width: 120,
      align: "center" as const,
      fixed: "right" as const,
      className: "bg-white fix-right-column",
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: any, record: any) => {
        return (
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
            {/* <Tooltip title="View">
              <Link
                to={`/orders/${record.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="middle"
                  className="flex items-center justify-center border-[#1BA143] text-[#1BA143] hover:!text-white hover:!bg-[#1BA143] h-9 w-9"
                  icon={<FiEye size={15} />}
                />
              </Link>
            </Tooltip> */}

            {record.status !== "CANCELLED" && (
              <>
                {(record.lockStatus || record.lock)?.isLocked &&
                (record.lockStatus || record.lock)?.maintainer ? (
                  <Tooltip
                    title={`Locked by ${(record.lockStatus || record.lock).maintainer.name}`}
                  >
                    <div className="flex items-center justify-center px-1 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 flex-shrink-0 w-9 h-9">
                      <Lock size={15} className="shrink-0 font-bold" />
                    </div>
                  </Tooltip>
                ) : null}
              </>
            )}
            {hasUpdate && (
              <Tooltip title="Delete">
                <Button
                  size="middle"
                  danger
                  className="flex items-center justify-center h-9 w-9"
                  icon={<FiTrash2 size={15} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(record.id);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ].filter((col) => {
    if (activeTab === "INCOMPLETE") {
      return !["successRate", "status", "action", "note", "summary"].includes(
        col.key as string,
      );
    }
    if (!hasUpdate && col.key === "action") {
      return false;
    }
    return true;
  });
  if (!hasAnyOrdersAccess || tabConfig.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to view any order tabs.</p>
        </div>
      </div>
    );
  }

  const actionsMenu = (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 p-4 w-72">
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

      {selectedOrderIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <CheckCircle
              size={24}
              className="text-gray-300 dark:text-gray-600"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center leading-relaxed italic">
            Please select some orders from the list below to perform bulk
            actions.
          </p>
        </div>
      ) : (
        <>
          {/* Status Update Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 px-1">
              Change Status
            </label>

            <div className="flex flex-col gap-2.5">
              <div className="w-full">
                <Select
                  placeholder="Select new status..."
                  className="w-full"
                  size="middle"
                  onChange={(value) => {
                    if (value) handleBulkUpdateStatus(value);
                  }}
                  value={undefined}
                  popupClassName="status-dropdown-popup"
                  options={(() => {
                    let allowedKeys: string[] = [];
                    if (activeTab === "PENDING") {
                      allowedKeys = [
                        "HOLD",
                        "CONFIRM",
                        "GOOD_BUT_NO_RESPONSE",
                        "NO_RESPONSE",
                        "CANCELLED",
                      ];
                    } else if (activeTab === "HOLD") {
                      allowedKeys = [
                        "CANCELLED",
                        "CONFIRM",
                        "PENDING",
                        "NO_RESPONSE",
                        "GOOD_BUT_NO_RESPONSE",
                        "ADVANCE_REQUIRED",
                      ];
                    } else if (
                      activeTab === "NO_RESPONSE" ||
                      activeTab === "GOOD_BUT_NO_RESPONSE"
                    ) {
                      allowedKeys = ["HOLD", "CONFIRM", "CANCELLED"];
                    } else if (activeTab === "CONFIRM") {
                      allowedKeys = ["CANCELLED"];
                    } else if (activeTab === "ADVANCE_REQUIRED") {
                      allowedKeys = ["CONFIRM", "CANCELLED"];
                    } else {
                      return fullTabConfig.filter(
                        (tab) => tab.key !== "all" && tab.key !== "incomplete",
                      );
                    }
                    return fullTabConfig.filter((tab) =>
                      allowedKeys.includes(tab.key),
                    );
                  })().map((tab) => ({
                    label: (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full shadow-sm" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {tab.label}
                        </span>
                      </div>
                    ),
                    value: tab.key,
                  }))}
                />
              </div>

              <p className="text-[10px] text-gray-400 italic px-1">
                * Selected orders will be updated immediately
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="pb-10">
      <PageMeta
        title={
          activeTab === "INCOMPLETE"
            ? "Incomplete Orders | Amzad Food"
            : "Orders | Amzad Food"
        }
        description={
          activeTab === "INCOMPLETE"
            ? "View and manage incomplete checkout orders."
            : "View and manage all orders."
        }
      />

      <PageHeader
        title={activeTab === "INCOMPLETE" ? "Incomplete Orders" : "Orders"}
        subtitle={
          activeTab === "INCOMPLETE"
            ? "Manage incomplete checkout orders"
            : "Manage all orders"
        }
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Order Management", path: "/orders" },
          {
            title: activeTab === "INCOMPLETE" ? "Incomplete Orders" : "Orders",
          },
        ]}
        extra={
          <div className="flex items-center gap-2">
            <PageListPrint
              tableData={orders.map((order: any) => {
                const isInc = activeTab === "INCOMPLETE" || !order.status;
                const name = isInc
                  ? order.customerName
                  : order.customer?.name ||
                    order.user?.customerProfile?.name ||
                    order.user?.name;
                const phone = isInc
                  ? order.customerPhone
                  : order.customer?.phone ||
                    order.user?.customerProfile?.phone ||
                    order.user?.phone;
                const address = isInc ? order.customerAddress : order.address;

                const items = isInc
                  ? order.checkoutProducts || []
                  : order.orderProducts || [];
                const productDetails = items
                  .map((item: any) => {
                    const isCombo = !!item.comboProduct;
                    const mainProduct = isCombo
                      ? item.comboProduct
                      : item.product;
                    const variant = isCombo ? item.comboVariant : item.variant;
                    const itemName = isInc
                      ? item.productName || "Unknown"
                      : mainProduct?.name || "Unknown";
                    const variantName = variant?.name
                      ? `(${variant.name})`
                      : "";
                    return `<div style="margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 2px;">
                      <span style="font-weight:600; font-size: 11px;">${itemName}</span> 
                      <span style="font-size:10px;color:#666;">${variantName}</span> 
                      <span style="font-weight:700; font-size: 11px;">x${item.quantity}</span>
                    </div>`;
                  })
                  .join("");

                const totalPrice = isInc
                  ? order.checkoutProducts?.reduce(
                      (sum: number, it: any) =>
                        sum + (it.sellingPrice || 0) * (it.quantity || 1),
                      0,
                    ) || 0
                  : order.totalPrice || 0;

                return {
                  "Order Info": `
                    <div>
                      <span style="font-weight:bold;">#${order.id
                        .substr(-6)
                        .toUpperCase()}</span><br/>
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
                        name || "N/A"
                      }</span><br/>
                      <span style="font-size:11px;">${
                        phone || "N/A"
                      }</span><br/>
                      <span style="font-size:10px;color:#666; display:block; max-width: 150px; white-space: normal;">${
                        address || "N/A"
                      }</span>
                    </div>
                  `,
                  "Products & Qty": `<div style="font-size:11px;">${productDetails}</div>`,
                  Amount: isInc
                    ? `<div style="text-align: right; font-size: 11px; font-weight: 700; color: #1BA143;">${totalPrice.toLocaleString()}</div>`
                    : `
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
                  Status: isInc ? "INCOMPLETE" : order.status,
                };
              })}
              fileName="Orders_List"
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

      <div
        className={`w-full mb-4 overflow-x-auto ant-table-wrapper !bg-transparent ${
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarGutter={20}
          items={tabs.map((tab) => ({
            key: tab.key,
            label: <span className="whitespace-nowrap">{tab.label}</span>,
          }))}
          className="mb-4 w-full"
        />
      </div>
      <div className="bg-white rounded-lg border -mt-4 border-gray-200">
        <div className="p-4 border-b border-gray-50 flex flex-col">
          {/* Row 1: Tabs */}

          {/* Row 2: Search & Filters */}
          <div className="flex flex-col  md:flex-row items-center justify-between gap-4">
            <Input
              placeholder="Search by order ID, customer name, phone, invoice..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              size="middle"
              value={inputValue}
              onChange={handleSearch}
              allowClear
              className="w-full md:max-w-sm"
            />

            <div className="flex items-center gap-3">
              {/* <Dropdown overlay={filterMenu} trigger={["click"]}>
                <Button className="flex items-center gap-2 h-9 px-4 font-semibold border-gray-200 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-all bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Filter size={14} className="text-gray-400" />
                  <span className="text-[13px]">Filters</span>
                </Button>
              </Dropdown> */}
              {hasUpdate &&
                selectedOrderIds.length > 0 &&
                activeTab !== "INCOMPLETE" && (
                  <Dropdown
                    overlay={actionsMenu}
                    trigger={["click"]}
                    disabled={false}
                  >
                    <Button
                      type="primary"
                      className="flex items-center gap-2 h-9 px-4 font-semibold transition-all group rounded-lg shadow-sm"
                    >
                      <span className="text-[13px]">Bulk Action</span>
                      <ChevronDown
                        size={14}
                        className="transition-colors ml-0.5"
                      />
                    </Button>
                  </Dropdown>
                )}

              <CustomDatePicker
                onChange={(dates) => {
                  setIsExplicitFetch(true);
                  setDateRange(dates);
                  setPage(1);
                }}
                selectedData={dateRange}
              />

              <FilterColumn
                tableName="completed_orders_v2"
                columns={columns}
                onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          selectRow={hasUpdate && activeTab !== "INCOMPLETE"}
          loading={loading}
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
          onRow={(record: any) => {
            const isIncomplete = activeTab === "INCOMPLETE" || !record.status;
            return {
              onClick: (e: React.MouseEvent) => {
                const url = isIncomplete
                  ? `/orders/incomplete/${record.id}`
                  : `/orders/${record.id}`;
                if (e.ctrlKey || e.metaKey) {
                  window.open(url, "_blank");
                } else {
                  navigate(url);
                }
              },
              style: { cursor: "pointer" },
            };
          }}
        />
      </div>

      {/* <UpdateOrderStatusModal
        open={statusModalOpen}
        setOpen={setStatusModalOpen}
        // orderId={selectedOrderId}
        // currentStatus={currentOrderStatus}
        onSuccess={() => handleRefresh()}
      /> */}

      {/* Update Customer Modal */}
      {updateCustomerModalOpen && (
        <UpdateCustomerModal
          open={updateCustomerModalOpen}
          setOpen={(open) => {
            setUpdateCustomerModalOpen(open);
            if (!open) {
              setSelectedCustomer(null);
              refetch();
            }
          }}
          data={selectedCustomer}
        />
      )}
    </div>
  );
});

CompletedOrderList.displayName = "CompletedOrders";

export default CompletedOrderList;
