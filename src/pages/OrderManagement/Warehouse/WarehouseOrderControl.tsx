import {
  Button,
  Dropdown,
  Input,
  Modal,
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
  Lock,
  Printer,
  RefreshCcw,
  Search,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { FiCheckCircle, FiCopy } from "react-icons/fi";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import FilterColumn from "../../../components/common/FilterColumn/FilterColumn";
import UpdateCustomerModal from "../../../components/common/Modals/Customer/UpdateCustomerModal";
import SendToCourierModal from "../../../components/common/Modals/OrderManagement/SendToCourierModal";
import { DataTable } from "../../../components/common/Tables";
import {
  useGetWarehouseOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../../redux/features/order/orderApi";
import { OrderStatus } from "../../../types/order";
import { debounce } from "../../../utils/debounce";

import { FaPhone } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import OrderInvoicePrint from "../../../components/common/CommonPrintCsvAndPdf/OrderInvoicePrint";
import OrderStickerPrint from "../../../components/common/CommonPrintCsvAndPdf/OrderStickerPrint";
import PageListPrint from "../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import "../../../components/common/Tables/AntTable.css";
import { config } from "../../../config";
import { CurrencyIcon } from "../../../utils/currency";

import { useSidebar } from "../../../context/SidebarContext";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { moduleHasAction } from "../../../utils/permissions";

const WAREHOUSE_ORDERS_MODULE = "Warehouse Orders";

/** Main status tabs → designation action (must match `designationModuleActions` Warehouse Orders). */
const WAREHOUSE_TAB_PERMISSION_MAP: Record<string, string> = {
  CONFIRM: "view_pending",
  unprint: "view_unprint",
  print: "view_print",
  SHIPPED: "view_shipped",
};

const WAREHOUSE_DELIVERY_METHOD_KEYS = [
  "STEADFAST",
  "PATHAO",
  "OFFICE_DELIVERY",
  "OTHER",
] as const;

/** Map query value (e.g. `office_delivery`) to canonical API key `OFFICE_DELIVERY`. */
function warehouseDeliveryMethodFromQuery(param: string): string | null {
  const p = param.trim().toLowerCase().replace(/-/g, "_");
  for (const key of WAREHOUSE_DELIVERY_METHOD_KEYS) {
    if (key.toLowerCase() === p) return key;
  }
  const pCompact = p.replace(/_/g, "");
  for (const key of WAREHOUSE_DELIVERY_METHOD_KEYS) {
    if (key.toLowerCase().replace(/_/g, "") === pCompact) return key;
  }
  return null;
}

const WAREHOUSE_MAIN_TAB_KEYS = [
  "CONFIRM",
  "unprint",
  "print",
  "SHIPPED",
] as const;

/** URL `tab=` slug (Pending uses `pending`, not backend name `confirm`). */
function warehouseMainTabQuerySlug(internalKey: string): string {
  if (internalKey === "CONFIRM") return "pending";
  return internalKey.toLowerCase();
}

/** Resolve `tab=` query to internal tab key (`confirm` kept for old links). */
function warehouseMainTabKeyFromQuery(tabParam: string): string | null {
  const p = tabParam.trim().toLowerCase();
  if (p === "pending" || p === "confirm") return "CONFIRM";
  for (const key of WAREHOUSE_MAIN_TAB_KEYS) {
    if (key.toLowerCase() === p) return key;
  }
  return null;
}

export interface CompletedOrdersRef {
  refetch: () => void;
}

const WarehouseOrderControl = forwardRef<CompletedOrdersRef>((props, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isExpanded } = useSidebar();

  const { hasView, isSuperAdmin, allActions, isProfileLoading } =
    useModulePermissions(WAREHOUSE_ORDERS_MODULE);

  const [activeTab, setActiveTab] = useState<string>("CONFIRM");
  const [activeDeliveryMethod, setActiveDeliveryMethod] =
    useState<string>("STEADFAST");
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
    "tracking",
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
  // };

  // const [filters, setFilters] = useState(initialFilters);

  // const { data: orderSourcesData } = useGetAllOrderSourcesQuery(undefined);
  // const orderSources = orderSourcesData?.data || [];

  // Customer update modal state
  const [updateCustomerModalOpen, setUpdateCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const [sendToCourierModalOpen, setSendToCourierModalOpen] = useState(false);
  const [courierTargetIds, setCourierTargetIds] = useState<string[]>([]);

  useEffect(() => {
    if (location.state?.activeTab) {
      const raw =
        location.state.activeTab === "all"
          ? "CONFIRM"
          : location.state.activeTab;
      const key = String(raw);
      const perm = WAREHOUSE_TAB_PERMISSION_MAP[key];
      if (
        !perm ||
        isSuperAdmin ||
        moduleHasAction(allActions, perm)
      ) {
        setActiveTab(key);
      }
    }
    if (location.state?.lockedByOther || location.state?.activeTab) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    location.state,
    location.pathname,
    navigate,
    allActions,
    isSuperAdmin,
  ]);

  // ==============================
  // BULK ACTION HANDLERS
  // ==============================

  // Handles opening the modal for sending selected orders to a courier
  const handleBulkSendToCourier = useCallback(() => {
    if (selectedOrderIds.length === 0) return;
    setCourierTargetIds(selectedOrderIds);
    setSendToCourierModalOpen(true);
  }, [selectedOrderIds]);

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  // Handles the mass update to SHIPPED status for selected orders via confirmation modal
  const handleBulkSendToShipped = () => {
    if (selectedOrderIds.length === 0) return;

    Modal.confirm({
      title: "Confirm Update Status",
      content: `Are you sure you want to mark ${selectedOrderIds.length} orders as SHIPPED?`,
      okText: "Confirm",
      okType: "primary",
      okButtonProps: {
        className: "bg-primary border-primary",
        style: { backgroundColor: "#ff3d0a", borderColor: "#ff3d0a" },
      },
      cancelText: "Cancel",
      onOk: async () => {
        const total = selectedOrderIds.length;
        const toastId = toast.loading(
          `Updating 0/${total} orders to SHIPPED...`,
        );
        let successCount = 0;
        let failCount = 0;

        // Loop through the selected IDs and update them one by one
        for (let i = 0; i < total; i++) {
          const orderId = selectedOrderIds[i];
          const currentNumber = i + 1;

          toast.update(toastId, {
            render: `Processing ${currentNumber}/${total}...`,
          });

          try {
            await updateOrderStatus({
              orderId,
              data: { status: "SHIPPED" as OrderStatus },
            }).unwrap();
            successCount++;
          } catch {
            failCount++;
          }
        }

        // Notify the user about the success/failure state
        toast.update(toastId, {
          render: `Updated ${successCount} orders to SHIPPED. ${failCount > 0 ? `${failCount} failed.` : ""}`,
          type: failCount > 0 ? "warning" : "success",
          isLoading: false,
          autoClose: 3000,
        });

        // Clear selection to prevent accidental multi-clicks
        setSelectedOrderIds([]);
        handleRefresh();
      },
    });
  };

  // ==============================
  // FILTER & SEARCH HANDLERS
  // ==============================

  // Debounces the search input so the API isn't called on every single keystroke
  const debounceSearch = useRef(
    debounce((value: string) => {
      setIsExplicitFetch(true);
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // Handles updating input field value and triggering the debounced search
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debounceSearch(value);
    },
    [debounceSearch],
  );

  // Handles switching between different order tabs (e.g. Unprint, Print, Shipped)
  const handleTabChange = useCallback(
    (key: string) => {
      setIsExplicitFetch(true);
      setActiveTab(key);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", warehouseMainTabQuerySlug(key));
        return next;
      });
      setSearchText("");
      setPage(1);
      setSelectedOrderIds([]); // Clear selection when tab changes to avoid carrying over bulk actions
    },
    [setSearchParams],
  );

  // const handleResetFilters = () => {
  //   setFilters({ ...initialFilters });
  //   setInputValue("");
  //   setSearchText("");
  //   setActiveTab("CONFIRM");
  //   setActiveDeliveryMethod("all");
  //   setDateRange([null, null]);
  //   setPage(1);
  //   setSelectedOrderIds([]);
  // };

  // Map virtual tab keys like 'unprint' to proper backend status parameters e.g., 'UN_PRINT'
  const tabToStatus: Record<string, string> = useMemo(
    () => ({
      CONFIRM: "CONFIRM",
      unprint: "UN_PRINT",
      print: "PRINT",
      SHIPPED: "SHIPPED",
    }),
    [],
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (!tabParam) return;
    if (tabParam === "all") {
      setActiveTab("CONFIRM");
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", warehouseMainTabQuerySlug("CONFIRM"));
          return next;
        },
        { replace: true },
      );
      return;
    }
    const matchedTabKey = warehouseMainTabKeyFromQuery(tabParam);
    if (!matchedTabKey) return;

    if (tabParam === "confirm") {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", warehouseMainTabQuerySlug("CONFIRM"));
          return next;
        },
        { replace: true },
      );
    }

    if (matchedTabKey === activeTab) return;
    const perm = WAREHOUSE_TAB_PERMISSION_MAP[matchedTabKey];
    if (
      perm &&
      !isSuperAdmin &&
      !moduleHasAction(allActions, perm)
    ) {
      return;
    }
    setActiveTab(matchedTabKey);
  }, [searchParams, setSearchParams, activeTab, allActions, isSuperAdmin]);

  const resolvedStatus = tabToStatus[activeTab] || activeTab;

  const fullTabConfig = useMemo(
    () => [
      { key: "CONFIRM", label: "Pending" },
      { key: "unprint", label: "Unprint" },
      { key: "print", label: "Print" },
      { key: "SHIPPED", label: "Shipped" },
    ],
    [],
  );

  const tabConfig = useMemo(
    () =>
      fullTabConfig.filter((tab) => {
        if (isSuperAdmin) return true;
        const permission = WAREHOUSE_TAB_PERMISSION_MAP[tab.key];
        return permission
          ? moduleHasAction(allActions, permission)
          : false;
      }),
    [fullTabConfig, isSuperAdmin, allActions],
  );

  const deliveryMethodPermissionMap: Record<string, string> = useMemo(
    () => ({
      STEADFAST: "view_steadfast",
      PATHAO: "view_pathao",
      OFFICE_DELIVERY: "view_office_delivery",
      OTHER: "view_other",
    }),
    [],
  );

  const permittedDeliveryMethodKeys = useMemo(() => {
    if (isSuperAdmin) {
      return Object.keys(deliveryMethodPermissionMap);
    }
    return Object.entries(deliveryMethodPermissionMap)
      .filter(([, perm]) => moduleHasAction(allActions, perm))
      .map(([key]) => key);
  }, [isSuperAdmin, allActions, deliveryMethodPermissionMap]);

  const canApplyDeliveryMethodFilter = useMemo(
    () => permittedDeliveryMethodKeys.includes(activeDeliveryMethod),
    [permittedDeliveryMethodKeys, activeDeliveryMethod],
  );

  useEffect(() => {
    if (tabConfig.length === 0) return;
    if (!tabConfig.some((t) => t.key === activeTab)) {
      const next = tabConfig[0].key;
      setActiveTab(next);
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev);
          n.set("tab", warehouseMainTabQuerySlug(next));
          return n;
        },
        { replace: true },
      );
    }
  }, [tabConfig, activeTab, setSearchParams]);

  /** Keep `deliveryMethod` query + state aligned with current permissions (replace invalid URLs). */
  useEffect(() => {
    const raw = searchParams.get("deliveryMethod");
    const param = raw?.trim() ?? "";

    if (param === "") {
      if (
        permittedDeliveryMethodKeys.length > 0 &&
        !permittedDeliveryMethodKeys.includes(activeDeliveryMethod)
      ) {
        setActiveDeliveryMethod(permittedDeliveryMethodKeys[0]);
      }
      return;
    }

    const resolved = warehouseDeliveryMethodFromQuery(param);
    const allowed =
      resolved !== null &&
      permittedDeliveryMethodKeys.includes(resolved);

    if (!allowed) {
      if (permittedDeliveryMethodKeys.length > 0) {
        const next = permittedDeliveryMethodKeys[0];
        setActiveDeliveryMethod(next);
        setSearchParams(
          (prev) => {
            const n = new URLSearchParams(prev);
            n.set("deliveryMethod", next.toLowerCase());
            return n;
          },
          { replace: true },
        );
      } else {
        setSearchParams(
          (prev) => {
            const n = new URLSearchParams(prev);
            n.delete("deliveryMethod");
            return n;
          },
          { replace: true },
        );
      }
      return;
    }

    if (resolved !== activeDeliveryMethod) {
      setActiveDeliveryMethod(resolved);
    }
  }, [
    searchParams,
    permittedDeliveryMethodKeys,
    activeDeliveryMethod,
    setSearchParams,
  ]);

  // ==============================
  // DATA FETCHING (API)
  // ==============================

  const {
    data: ordersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetWarehouseOrdersQuery(
    [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      searchText && { name: "search", value: searchText },
      { name: "status", value: resolvedStatus },
      canApplyDeliveryMethodFilter && {
        name: "deliveryMethod",
        value: activeDeliveryMethod,
      },
      dateRange[0] && { name: "startDate", value: dateRange[0] },
      dateRange[1] && { name: "endDate", value: dateRange[1] },
    ].filter(Boolean),
    {
      // pollingInterval: 60000,
    },
  );

  // Summary counts are fetched without the delivery filter so they remain stable
  const { data: summaryData } = useGetWarehouseOrdersQuery(
    [
      { name: "page", value: "1" },
      { name: "limit", value: "1" },
      searchText && { name: "search", value: searchText },
      { name: "status", value: resolvedStatus },
      dateRange[0] && { name: "startDate", value: dateRange[0] },
      dateRange[1] && { name: "endDate", value: dateRange[1] },
    ].filter(Boolean),
  );

  // Manual refresh triggers refetch but provides loading state separately
  const handleRefresh = useCallback(async () => {
    setIsManualRefetch(true);
    try {
      await refetch();
    } finally {
      setIsManualRefetch(false);
    }
  }, [refetch]);

  // Reset explicit fetch state when fetching completes
  useEffect(() => {
    if (!isFetching) {
      setIsExplicitFetch(false);
    }
  }, [isFetching]);

  const orders = useMemo(() => ordersData?.data || [], [ordersData?.data]);

  const orderMethod = useMemo(
    () =>
      summaryData?.summary?.deliveryMethod ||
      summaryData?.summary?.deliveryMethods ||
      summaryData?.deliveryMethod ||
      summaryData?.deliveryMethods ||
      [],
    [summaryData],
  );

  // ==============================
  // PRINT ACTION HANDLERS
  // ==============================

  // Handle printing bulk invoices and updating status to PRINT if required
  const handlePrintInvoice = useCallback(async () => {
    const selectedOrders = orders.filter((o: any) =>
      selectedOrderIds.includes(o.id),
    );
    OrderInvoicePrint.printBulk(selectedOrders);

    if (activeTab === "unprint") {
      const total = selectedOrderIds.length;
      const toastId = toast.loading(`Updating 0/${total} orders to PRINT...`);
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < total; i++) {
        const orderId = selectedOrderIds[i];
        const currentNumber = i + 1;

        toast.update(toastId, {
          render: `Processing ${currentNumber}/${total}...`,
        });

        try {
          await updateOrderStatus({
            orderId,
            data: { status: "PRINT" as OrderStatus },
          }).unwrap();
          successCount++;
        } catch {
          failCount++;
        }
      }

      toast.update(toastId, {
        render: `Updated ${successCount} orders to PRINT. ${failCount > 0 ? `${failCount} failed.` : ""}`,
        type: failCount > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: 3000,
      });
      setSelectedOrderIds([]);
      handleRefresh();
    }
  }, [orders, selectedOrderIds, activeTab, updateOrderStatus, handleRefresh]);

  // Handle printing bulk stickers
  const handlePrintSticker = useCallback(() => {
    const selectedOrders = orders.filter((o: any) =>
      selectedOrderIds.includes(o.id),
    );
    OrderStickerPrint.print(selectedOrders);
  }, [orders, selectedOrderIds]);

  // Memoize summary counts to avoid recalculating on every re-render
  const summeryTab = useMemo(
    () => summaryData?.summary?.warehouse || {},
    [summaryData?.summary?.warehouse],
  );

  const meta = ordersData?.meta || { total: 0, page: 1, limit: 10 };

  // Total helper: counts from per-response warehouse summary keys (CONFIRM, UN_PRINT, …)
  const getTabCount = useCallback(
    (tabKey: string): number => {
      const realStatus = tabToStatus[tabKey] || tabKey;
      return Number(summeryTab[realStatus as keyof typeof summeryTab]) || 0;
    },
    [summeryTab, tabToStatus],
  );

  // Expose refetch function to parent component
  useImperativeHandle(ref, () => ({
    refetch: handleRefresh,
  }));

  // Table loading state considers initial loading, manual refetch and pagination actions
  const loading =
    isLoading ||
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

  // Defines what the tabs look like at the top and injects the count tags
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
              {getTabCount(key)}
            </Tag>
          </span>
        ),
      })),
    [activeTab, getTabCount, tabConfig],
  );

  const deliveryTabs = useMemo(() => {
    const getOrder = (name: string) => {
      if (name === "STEADFAST") return 0;
      if (name === "OTHER") return 100;
      if (name === "Unknown") return 99;
      return 10;
    };

    const sortedMethods = [...permittedDeliveryMethodKeys].sort(
      (a, b) => getOrder(a) - getOrder(b),
    );

    return sortedMethods.map((name) => {
      const match = orderMethod.find(
        (m: any) =>
          m.name?.toString().toUpperCase().replace(/[\s_]/g, "") ===
          name.toUpperCase().replace(/[\s_]/g, ""),
      );
      const count = match ? Number(match.count) : 0;

      const formattedLabel = name
        .toLowerCase()
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        key: name,
        label: (
          <span className="flex items-center gap-2">
            <span className="font-medium">{formattedLabel}</span>
            <Tag
              style={{
                backgroundColor:
                  activeDeliveryMethod === name ? "#ff3d0a" : "#9e9e9e",
                color: "white",
                borderRadius: "9999px",
                border: "none",
              }}
            >
              {count}
            </Tag>
          </span>
        ),
      };
    });
  }, [orderMethod, activeDeliveryMethod, permittedDeliveryMethodKeys]);

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
    };
    return labels[status] || status;
  };

  const handleCopyCustomerInfo = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();

    const name =
      record.customer?.name ||
      record.user?.customerProfile?.name ||
      record.user?.name;
    const phone =
      record.customer?.phone ||
      record.user?.customerProfile?.phone ||
      record.user?.phone;
    const address = record.address;

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
        const detailUrl = `/orders/${record.id}`;
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
        const detailUrl = `/orders/${record.id}`;

        // Prioritize customer data
        const customerName =
          record.customer?.name ||
          record.user?.customerProfile?.name ||
          record.user?.name;
        const customerPhone =
          record.customer?.phone ||
          record.user?.customerProfile?.phone ||
          record.user?.phone;
        const customerAddress = record.address;

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
          const imgUrl = mainProduct?.thumbnail?.url || "";

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
                  <span className="text-[10px] text-gray-400">N/A</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 line-clamp-1">
                  {mainProduct?.name || item.productName || "Unknown Product"}
                  {variant?.name && (
                    <span className="text-[10px] text-primary ml-1 font-semibold">
                      ({variant.name})
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
              to={`/orders/${record.id}`}
              className="flex items-center gap-3 cursor-pointer group p-1 rounded-lg transition-colors border border-transparent hover:border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden  transition-colors">
                {(() => {
                  const imgUrl =
                    firstItem.product?.thumbnail?.url ||
                    firstItem.comboProduct?.thumbnail?.url;
                  if (!imgUrl)
                    return (
                      <span className="text-xs text-gray-400 font-bold">
                        {(
                          firstItem.product?.name ||
                          firstItem.comboProduct?.name ||
                          "P"
                        ).charAt(0)}
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
                      firstItem.productName ||
                      "Product"}
                  </span>
                  {(firstItem.variant?.name ||
                    firstItem.comboVariant?.name) && (
                    <span className="text-primary/80 font-bold px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10 text-[9px] uppercase tracking-wider flex-shrink-0 whitespace-nowrap">
                      {firstItem.variant?.name || firstItem.comboVariant?.name}
                    </span>
                  )}
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
        const advance = record.advance || 0;
        const totalPrice = record.totalPrice || 0;

        return (
          <div className="space-y-1">
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
      title: "Status",
      key: "status",
      width: 180,
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
                {
                  (record.lockStatus || record.lock)?.isLocked &&
                  (record.lockStatus || record.lock)?.maintainer ? (
                    <Tooltip
                      title={`Locked by ${(record.lockStatus || record.lock).maintainer.name}`}
                    >
                      <div className="flex items-center justify-center px-1 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 flex-shrink-0 w-9 h-9">
                        <Lock size={15} className="shrink-0 font-bold" />
                      </div>
                    </Tooltip>
                  ) : null
                  /* <Tooltip title="Update Status">
                    <Button
                      size="middle"
                      className="flex items-center justify-center h-9 w-9"
                      icon={<FiEdit size={15} />}
                      disabled={!hasUpdate}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(record.id, record.status);
                      }}
                    />
                  </Tooltip> */
                }
              </>
            )}
          </div>
        );
      },
    },
  ];

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

      <div className="space-y-3">
        {activeTab === "unprint" && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-1">
              <Button
                size="middle"
                className="flex items-center justify-center gap-2 h-10 border border-gray-200 dark:border-gray-700 rounded-lg text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:border-primary transition-all shadow-sm"
                onClick={handlePrintInvoice}
              >
                <Printer size={15} className="text-gray-400" /> Invoice
              </Button>
              <Button
                size="middle"
                className="flex items-center justify-center gap-2 h-10 border border-gray-200 dark:border-gray-700 rounded-lg text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:border-primary transition-all shadow-sm"
                onClick={handlePrintSticker}
              >
                <Box size={15} className="text-gray-400" /> Sticker
              </Button>
            </div>
            <div className="border-b border-gray-100 dark:border-gray-800 pb-1 mb-2"></div>
          </>
        )}

        <label className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 px-1">
          Change Status
        </label>

        <div className="flex flex-col gap-2.5">
          {activeTab === "CONFIRM" && (
            <Button
              size="middle"
              block
              className="flex items-center justify-center gap-2 border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all font-bold text-[13px] rounded-lg shadow-sm"
              onClick={handleBulkSendToCourier}
            >
              Send to Courier
            </Button>
          )}
          {activeTab === "print" && (
            <Button
              size="middle"
              block
              className="flex items-center justify-center gap-2 border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all font-bold text-[13px] rounded-lg shadow-sm"
              onClick={handleBulkSendToShipped}
            >
              Send to Shipped
            </Button>
          )}

          {/* <div className="w-full">
            <Select
              placeholder="Select new status..."
              className="w-full"
              size="middle"
              onChange={(value) => {
                if (value) handleBulkUpdateStatus(value);
              }}
              value={undefined}
              popupClassName="status-dropdown-popup"
              options={tabConfig.map((tab) => ({
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
          </div> */}

          <p className="text-[10px] text-gray-400 italic px-1">
            * Selected orders will be updated immediately
          </p>
        </div>
      </div>
    </div>
  );

  if (!hasView || (!isSuperAdmin && tabConfig.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>
            You do not have permission to view Warehouse Orders, or no status
            tab is allowed for your role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <PageMeta
        title="Warehouse Orders | Amzad Food"
        description="Manage warehouse parcel dispatch, printing, and shipping."
      />

      <PageHeader
        title="Warehouse Orders"
        subtitle="Manage parcel dispatch, print status, and courier shipping"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Order Management", path: "/orders" },
          { title: "Warehouse Orders" },
        ]}
        extra={
          <div className="flex items-center gap-2">
            <PageListPrint
              tableData={orders.map((order: any) => {
                const name =
                  order.customer?.name ||
                  order.user?.customerProfile?.name ||
                  order.user?.name;
                const phone =
                  order.customer?.phone ||
                  order.user?.customerProfile?.phone ||
                  order.user?.phone;
                const address = order.address;

                const items = order.orderProducts || [];
                const productDetails = items
                  .map((item: any) => {
                    const isCombo = !!item.comboProduct;
                    const mainProduct = isCombo
                      ? item.comboProduct
                      : item.product;
                    const variant = isCombo ? item.comboVariant : item.variant;
                    const itemName = mainProduct?.name || "Unknown";
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
          {/* Sub-row: Steadfast / Pathao / … — each requires its warehouse action */}
          {deliveryTabs.length > 0 && (
            <div className="flex items-center -mt-3">
              <Tabs
                activeKey={activeDeliveryMethod}
                onChange={(key) => {
                  setIsExplicitFetch(true);
                  setActiveDeliveryMethod(key);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("deliveryMethod", String(key).toLowerCase());
                    return next;
                  });
                  setPage(1);
                }}
                className="delivery-tabs"
                items={deliveryTabs}
              />
            </div>
          )}

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

              {selectedOrderIds.length > 0 && (
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
          selectRow={true}
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
            return {
              onClick: (e: React.MouseEvent) => {
                const url = `/orders/${record.id}`;
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

      <SendToCourierModal
        open={sendToCourierModalOpen}
        setOpen={setSendToCourierModalOpen}
        orderIds={courierTargetIds}
        onSuccess={() => {
          handleRefresh();
          setSelectedOrderIds([]);
        }}
      />

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

WarehouseOrderControl.displayName = "WarehouseOrderControl";

export default WarehouseOrderControl;
