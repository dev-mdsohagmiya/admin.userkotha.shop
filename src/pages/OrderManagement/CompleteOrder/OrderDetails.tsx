import { Plus } from "@phosphor-icons/react";
import {
  Tag as AntTag,
  Badge,
  Button,
  Card,
  DatePicker,
  Divider,
  Dropdown,
  Input,
  InputNumber,
  Select,
  Switch,
  Timeline,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLockRefresh } from "../../../hooks/useLockRefresh";

import { Box, FileText, Lock, Search, Star, X } from "lucide-react";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import OrderProductCard from "../../../components/OrderManagement/OrderProductCard";
import OrderInvoicePrint from "../../../components/common/CommonPrintCsvAndPdf/OrderInvoicePrint";
import OrderStickerPrint from "../../../components/common/CommonPrintCsvAndPdf/OrderStickerPrint";
import Loader from "../../../components/common/Loading/Loader";
import PageMeta from "../../../components/common/Meta/PageMeta";
import CustomerCourierOrdersModal from "../../../components/common/Modals/OrderManagement/CustomerCourierOrdersModal";
import OrderSourceModal from "../../../components/common/Modals/OrderManagement/OrderSourceModal";
import ShippingNoteModal from "../../../components/common/Modals/OrderManagement/ShippingNoteModal";
import OrderDetailsSkeleton from "../../../components/skeleton/OrderDetailsSkeleton";
import { config } from "../../../config";
import { useSidebar } from "../../../context/SidebarContext";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { useAppSelector } from "../../../redux/features/hooks";
import {
  useAddFollowUpMutation,
  useGetFollowUpsQuery,
  useGetLockStatusQuery,
  useGetOrderByIdQuery,
  useLockOrderMutation,
  useMyWebsiteOrderSpecifyCustomerOrderListQuery,
  useRefreshLockMutation,
  useSendAdvanceSMSMutation,
  useSendReminderSMSMutation,
  useUnlockOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
} from "../../../redux/features/order/orderApi";
import { useGetAllOrderSourcesQuery } from "../../../redux/features/orderSource/orderSourceApi";
import { useGetEcommerceProductListQuery } from "../../../redux/features/product/productApi";
import { useGetAllShippingNotesQuery } from "../../../redux/features/shippingNote/shippingNoteApi";
import {
  IUpdateOrderPayload,
  IUpdateOrderStatusPayload,
  OrderStatus,
} from "../../../types/order";
import { CurrencyIcon, DisplayCurrency } from "../../../utils/currency";

import { useModulePermissions } from "../../../hooks/usePermissions";
import { useCheckFraudQuery } from "../../../redux/features/courier/courierApi";

const { TextArea } = Input;
const MOUSE_INACTIVITY_UNLOCK_MS = 2 * 60 * 1000;

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSidebarExpanded } = useSidebar();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState(""); // User input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced value for API
  const [shippingNote, setShippingNote] = useState(""); // Shipping note value
  const [templateSearch, setTemplateSearch] = useState(""); // Template search
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false); // Source modal visibility
  const [isShippingNoteModalOpen, setIsShippingNoteModalOpen] = useState(false); // Shipping note modal visibility
  const [customerCourierOrdersModalOpen, setCustomerCourierOrdersModalOpen] =
    useState(false);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(false); // Featured filter state
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>();
  const [isStatusManuallyChanged, setIsStatusManuallyChanged] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState<dayjs.Dayjs | null>(dayjs());

  const currentUser = useAppSelector(selectCurrentUser);
  const { hasView, hasUpdate, isProfileLoading } =
    useModulePermissions("Orders");

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Pending",
      HOLD: "Hold",
      CONFIRM: "Confirm",
      NO_RESPONSE: "No Response",
      GOOD_BUT_NO_RESPONSE: "Good But No Response",
      ADVANCE_REQUIRED: "Advance Required",
      CANCELLED: "Cancelled",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
    };
    if (!status) return "N/A";
    const label = labels[status] || status;
    return label.replace(/_/g, " ");
  };

  const [mobileNumber, setMobileNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>();
  const [address, setAddress] = useState("");
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [orderSource, setOrderSource] = useState<string>();
  const [isPreorder, setIsPreorder] = useState(false);
  const [isCrossSale, setIsCrossSale] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [referenceLink, setReferenceLink] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [extraDiscountError, setExtraDiscountError] = useState("");
  const [advanceError, setAdvanceError] = useState("");
  const [advancePaymentDeliveryMethod, setAdvancePaymentDeliveryMethod] =
    useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // API Hooks
  const { data: orderData, isLoading: orderLoading } = useGetOrderByIdQuery(
    id as string,
    {
      skip: !id,
    },
  );
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [addFollowUp, { isLoading: isAddingFollowUp }] =
    useAddFollowUpMutation();
  const [sendReminderSMS, { isLoading: isSendingReminder }] =
    useSendReminderSMSMutation();
  const [sendAdvanceSMS, { isLoading: isSendingAdvance }] =
    useSendAdvanceSMSMutation();
  const { data: followUpsData } = useGetFollowUpsQuery(id as string, {
    skip: !id,
  });

  // Polling lock status every 5 seconds
  const { data: lockStatusData, isSuccess: isLockStatusLoaded } =
    useGetLockStatusQuery(id as string, {
      skip: !id,
      // pollingInterval: 60000,
    });

  const [lockOrder] = useLockOrderMutation();
  const [refreshLock] = useRefreshLockMutation();
  const [unlockOrder] = useUnlockOrderMutation();

  const lockData = lockStatusData?.data;
  const isLocked = lockData?.isLocked;
  const isLockedByMe = isLocked && lockData?.maintainer?.id === currentUser?.id;
  const isLockedByOther =
    isLocked && lockData?.maintainer?.id !== currentUser?.id;
  const lockExpiry = lockData?.lockExpiry;

  const digitsPhone = mobileNumber.replace(/\D/g, "");
  const isValidPhone =
    digitsPhone.length >= 11 &&
    (digitsPhone.startsWith("01") || digitsPhone.startsWith("880"));
  const { data: fraudData } = useCheckFraudQuery(digitsPhone, {
    skip: !isValidPhone,
  });

  // My Website Order Specify Customer Order List
  const { data: customerOrderData } =
    useMyWebsiteOrderSpecifyCustomerOrderListQuery(digitsPhone, {
      skip: !isValidPhone,
    });
  const orderCountData = customerOrderData?.summary || {};
  const customerOrderDetails = customerOrderData?.data;

  const fraudInfo = fraudData?.data;

  const isLockedByMeRef = useRef(isLockedByMe);
  const autoUnlockTriggeredRef = useRef(false);

  useEffect(() => {
    isLockedByMeRef.current = isLockedByMe;
  }, [isLockedByMe]);

  useEffect(() => {
    if (!isLockedByMe || !id) {
      autoUnlockTriggeredRef.current = false;
      return;
    }

    let inactivityTimer: ReturnType<typeof setTimeout>;

    const startInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        if (autoUnlockTriggeredRef.current) return;
        autoUnlockTriggeredRef.current = true;
        isLockedByMeRef.current = false;

        try {
          await unlockOrder(id).unwrap();
          navigate("/orders/complete?tab=pending", {
            state: { autoUnlocked: true },
          });
        } catch {
          autoUnlockTriggeredRef.current = false;
          isLockedByMeRef.current = true;
        }
      }, MOUSE_INACTIVITY_UNLOCK_MS);
    };

    const mouseEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "mouseup",
      "wheel",
    ];

    mouseEvents.forEach((eventName) => {
      window.addEventListener(eventName, startInactivityTimer, {
        passive: true,
      });
    });

    startInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      mouseEvents.forEach((eventName) => {
        window.removeEventListener(eventName, startInactivityTimer);
      });
    };
  }, [id, isLockedByMe, navigate, unlockOrder]);

  // Collapse sidebar on mount, expand on unmount
  useEffect(() => {
    // Always set to false when entering order details
    setSidebarExpanded(false);

    // Cleanup: Always expand when leaving
    return () => {
      setSidebarExpanded(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only on mount/unmount

  useEffect(() => {
    // Initial lock attempt
    // Attempt to lock the order only after we know its current status
    // and if it's not already locked by someone else
    if (id && isLockStatusLoaded && isLocked !== true && !isLockedByMe) {
      lockOrder(id);
    }
  }, [id, lockOrder, isLocked, isLockedByMe, isLockStatusLoaded]);

  // Auto-redirect if locked by someone else
  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout>;
    if (isLockedByOther) {
      redirectTimer = setTimeout(() => {
        navigate("/orders/complete", { state: { lockedByOther: true } });
      }, 10000); // Redirect after 10 seconds
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isLockedByOther, navigate]);

  useEffect(() => {
    // Cleanup: unlock on unmount if locked by me
    return () => {
      if (isLockedByMeRef.current && id) {
        unlockOrder(id);
      }
    };
  }, [id, unlockOrder]);

  const { data: templatesData } = useGetAllShippingNotesQuery();
  const { data: sourcesData } = useGetAllOrderSourcesQuery();
  const orderTransaction = orderData?.data?.transactions;
  const transactionTotal = useMemo(() => {
    return (
      orderTransaction?.reduce(
        (acc: number, t: any) => acc + (t.amount || 0),
        0,
      ) || 0
    );
  }, [orderTransaction]);

  const isDataInitialized = useRef(false);

  const getCartSignature = useCallback(
    (items: any[]) =>
      items
        .map((item) => ({
          id: item.id || item.productId,
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
        }))
        .sort((a, b) => String(a.id).localeCompare(String(b.id))),
    [],
  );

  const initialEditSnapshot = useMemo(() => {
    const order = orderData?.data;
    if (!order) return null;

    const phone = String(
      order.customer?.phone || order.user?.phone || "",
    ).replace(/\D/g, "");
    const profileAddress =
      order.customer?.address || order.user?.customerProfile?.address || "";
    const sourceVal =
      order.orderSourceId ||
      (typeof order.orderSource === "object"
        ? order.orderSource?.id
        : order.orderSource);
    const matchedSource = sourcesData?.data?.find(
      (s: any) => s.id === sourceVal || s.name === sourceVal,
    );

    return {
      mobileNumber: phone,
      customerName: order.customer?.name || order.user?.name || "",
      deliveryMethod: order.deliveryMethod || "STEADFAST",
      paymentMethod: order.paymentMethod || "",
      address: order.address || profileAddress || "",
      shippingNote: order.shippingNote || order.notes || "",
      orderSource: matchedSource?.id || sourceVal || "",
      isPreorder: Boolean(order.isPreorder),
      isCrossSale: Boolean(order.isCrossSale),
      discount: Number(order.couponDiscount || 0),
      advance: Number(order.advance || 0),
      deliveryCharge: Number(order.deliveryCharge || 0),
      extraDiscount: Number(order.extraDiscount || 0),
      cartItems: getCartSignature(
        (order.orderProducts || []).map((op: any) => {
          const isCombo = !!op.comboProduct;
          const mainItem = isCombo ? op.comboProduct : op.product;
          const mainVariant = isCombo ? op.comboVariant : op.variant;
          return {
            id: mainVariant?.id || mainItem?.id,
            productId: mainItem?.id,
            quantity: op.quantity,
            price:
              op.discountPrice ||
              op.price ||
              mainVariant?.sellingPrice ||
              mainItem?.sellingPrice ||
              0,
          };
        }),
      ),
    };
  }, [orderData?.data, sourcesData?.data, getCartSignature]);

  const currentEditSnapshot = useMemo(
    () => ({
      mobileNumber: mobileNumber.replace(/\D/g, ""),
      customerName,
      deliveryMethod: deliveryMethod || "",
      paymentMethod: paymentMethod || "",
      address,
      shippingNote,
      orderSource: orderSource || "",
      isPreorder,
      isCrossSale,
      discount: Number(discount || 0),
      advance: Number(advance || 0),
      deliveryCharge: Number(deliveryCharge || 0),
      extraDiscount: Number(extraDiscount || 0),
      cartItems: getCartSignature(cartItems),
    }),
    [
      mobileNumber,
      customerName,
      deliveryMethod,
      paymentMethod,
      address,
      shippingNote,
      orderSource,
      isPreorder,
      isCrossSale,
      discount,
      advance,
      deliveryCharge,
      extraDiscount,
      cartItems,
      getCartSignature,
    ],
  );

  const isEditingOrder = useMemo(() => {
    if (!hasUpdate || isLockedByOther || !initialEditSnapshot) return false;
    return (
      JSON.stringify(initialEditSnapshot) !==
      JSON.stringify(currentEditSnapshot)
    );
  }, [hasUpdate, isLockedByOther, initialEditSnapshot, currentEditSnapshot]);

  useLockRefresh(id, isLockedByMe, refreshLock, {
    isEditing: isEditingOrder,
    lockExpiry,
  });

  // Populate data when orderData is available
  useEffect(() => {
    if (orderData?.data && !isDataInitialized.current) {
      const order = orderData.data;
      // Get phone, name and address checking both customer and user objects
      const phone = String(
        order.customer?.phone || order.user?.phone || "",
      ).replace(/\D/g, "");
      const name = order.customer?.name || order.user?.name || "";
      const profileAddress =
        order.customer?.address || order.user?.customerProfile?.address || "";

      setMobileNumber(phone);
      setCustomerName(name);
      // Order address (shipping address) takes precedence, then profile address
      setAddress(order.address || profileAddress || "");
      setDeliveryMethod(order.deliveryMethod || "STEADFAST");
      const sourceVal =
        order.orderSourceId ||
        (typeof order.orderSource === "object"
          ? order.orderSource?.id
          : order.orderSource);
      const matchedSource = sourcesData?.data?.find(
        (s: any) => s.id === sourceVal || s.name === sourceVal,
      );
      setOrderSource(matchedSource?.id || sourceVal || undefined);
      setDiscount(order.couponDiscount || 0);

      setAdvance(order.advance || 0);
      setDeliveryCharge(order.deliveryCharge || 0);
      setExtraDiscount(order.extraDiscount || 0);
      setShippingNote(order.shippingNote || order.notes || "");
      setIsPreorder(order.isPreorder || false);
      setIsCrossSale(order.isCrossSale || false);
      setPaymentMethod(order.paymentMethod);
      setReferenceLink(order.referenceLink || "");
      setAdvancePaymentDeliveryMethod(
        order.advancePaymentDeliveryMethod || null,
      );
      setTransactionId(order.transactionId || "");
      setCustomerEmail(
        order.customerEmail || order.customer?.email || order.user?.email || "",
      );
      // Selected status is handled by nextOptions useEffect to ensure it points to a future action
      // setSelectedStatus(order.status);

      // Map orderProducts to cartItems format
      if (order.orderProducts) {
        const mappedItems = order.orderProducts.map((op: any) => {
          const isCombo = !!op.comboProduct;
          const mainItem = isCombo ? op.comboProduct : op.product;
          const mainVariant = isCombo ? op.comboVariant : op.variant;

          const effectivePrice =
            op.price ||
            mainVariant?.sellingPrice ||
            mainItem?.sellingPrice ||
            0;

          return {
            id: mainVariant?.id || mainItem?.id,
            productId: mainItem?.id,
            name: mainVariant?.name || mainItem?.name,
            productName: mainItem?.name,
            sku: mainVariant?.sku || mainItem?.sku,
            price: op.discountPrice || effectivePrice,
            sellingPrice:
              mainVariant?.sellingPrice ||
              mainItem?.sellingPrice ||
              effectivePrice,
            discountedPrice: op.discountPrice || effectivePrice,
            quantity: op.quantity,
            thumbnail: mainVariant?.thumbnail || mainItem?.thumbnail,
          };
        });
        setCartItems(mappedItems);
      }
      isDataInitialized.current = true;
    }
  }, [orderData, sourcesData]);

  const shippingNoteTemplates = useMemo(
    () => templatesData?.data?.filter((note: any) => note.isActive) || [],
    [templatesData?.data],
  );

  const orderSourceOptions = useMemo(
    () =>
      sourcesData?.data?.map((source: any) => ({
        value: source.id,
        label: (
          <div className="flex items-center gap-2">
            {source.icon && (
              <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                <i className={source.icon} style={{ fontSize: "10px" }}></i>
              </div>
            )}
            <span className="text-xs">{source.name?.replace(/_/g, " ")}</span>
          </div>
        ),
      })) || [],
    [sourcesData?.data],
  );

  // Filter templates based on search
  const filteredTemplates = useMemo(
    () =>
      shippingNoteTemplates.filter((template: any) =>
        template.name.toLowerCase().includes(templateSearch.toLowerCase()),
      ),
    [shippingNoteTemplates, templateSearch],
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: productsData,
    isLoading,
    isFetching,
  } = useGetEcommerceProductListQuery([
    { name: "search", value: debouncedSearchTerm },
    { name: "page", value: "1" },
    { name: "limit", value: "100" },
    ...(isFeaturedOnly ? [{ name: "isFeatured", value: true }] : []),
  ]);

  const products = productsData?.data || [];

  // Handle add to cart from OrderProductCard
  const handleAddToCart = useCallback((product: any, variant: any) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === variant.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prevItems,
        {
          id: variant.id,
          productId: product.id,
          name: variant.name,
          productName: product.name,
          sku: variant.sku,
          price: variant.discountedPrice || variant.sellingPrice,
          sellingPrice: variant.sellingPrice,
          discountedPrice: variant.discountedPrice,
          quantity: 1,
          currentStock: variant.currentStock,
          thumbnail: variant.thumbnail || product.thumbnail,
        },
      ];
    });
  }, []);

  const handleAddNote = async () => {
    if (!id || !actionNote.trim()) {
      toast.error("Please enter a note");
      return;
    }
    try {
      await addFollowUp({
        orderId: id,
        data: {
          description: actionNote,
          followUpDate:
            selectedStatus === "HOLD" && followUpDate
              ? followUpDate.toISOString()
              : new Date().toISOString(),
        },
      }).unwrap();
      toast.success("Note added");
      setActionNote("");
      // Reset date to current time
      setFollowUpDate(dayjs());
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add note");
    }
  };

  const handleReminderSMS = async () => {
    if (!id) return;
    try {
      await sendReminderSMS(id).unwrap();
      toast.success("Reminder SMS sent successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to send reminder SMS");
    }
  };

  const handleAdvanceSMS = async () => {
    if (!id) return;
    try {
      await sendAdvanceSMS(id).unwrap();
      toast.success("Advance payment SMS sent successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to send advance SMS");
    }
  };

  const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
      case "PENDING":
        return "gold";
      case "HOLD":
        return "purple";
      case "CONFIRM":
        return "cyan";
      case "SHIPPED":
        return "geekblue";
      case "DELIVERED":
        return "#1BA143";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const statusFlow: Record<string, { value: OrderStatus; label: string }[]> =
    useMemo(
      () => ({
        PENDING: [
          { value: "PENDING", label: "Pending" },
          { value: "NO_RESPONSE", label: "No Response" },
          { value: "GOOD_BUT_NO_RESPONSE", label: "Good But No Response" },
          { value: "CONFIRM", label: "Confirm" },
          { value: "ADVANCE_REQUIRED", label: "Advance Required" },
          { value: "HOLD", label: "Hold" },
          { value: "CANCELLED", label: "Cancel" },
        ],
        HOLD: [
          { value: "CONFIRM", label: "Confirm" },
          { value: "NO_RESPONSE", label: "No Response" },
          { value: "GOOD_BUT_NO_RESPONSE", label: "Good But No Response" },
          { value: "ADVANCE_REQUIRED", label: "Advance Required" },
          { value: "CANCELLED", label: "Cancel" },
        ],
        CONFIRM: [
          ...(deliveryMethod === "OFFICE_DELIVERY"
            ? [{ value: "DELIVERED" as OrderStatus, label: "Delivered" }]
            : []),
          { value: "HOLD", label: "Hold" },
          { value: "CANCELLED", label: "Cancel" },
          { value: "ADVANCE_REQUIRED", label: "Advance Required" },
        ],
        SHIPPED: [
          { value: "DELIVERED", label: "Delivered" },
          { value: "CANCELLED", label: "Cancel" },
        ],
        DELIVERED: [],
        CANCELLED: [{ value: "PENDING", label: "Pending" }],
        GOOD_BUT_NO_RESPONSE: [
          { value: "CANCELLED", label: "Cancel" },
          { value: "CONFIRM", label: "Confirm" },
        ],
        NO_RESPONSE: [
          { value: "CANCELLED", label: "Cancel" },
          { value: "CONFIRM", label: "Confirm" },
        ],
        ADVANCE_REQUIRED: [
          { value: "CANCELLED", label: "Cancel" },
          { value: "CONFIRM", label: "Confirm" },
        ],
      }),
      [deliveryMethod],
    );

  const nextOptions = useMemo(() => {
    const currentStatus = orderData?.data?.status || "PENDING";
    let options = (statusFlow[currentStatus] || []).filter(
      (opt) => opt.value !== currentStatus,
    );

    // According to user request:
    // "Uporer Order action a confirm button dawea lagbena" when in Pending
    if (currentStatus === "PENDING") {
      options = options.filter((opt) => opt.value !== "CONFIRM");
    }

    return options.map((opt) => ({
      ...opt,
      label: opt.label.replace(/_/g, " "),
    }));
  }, [orderData?.data?.status, statusFlow]);

  // useEffect that auto-sets the next option was removed as per user request ("faka dekak")
  useEffect(() => {
    setSelectedStatus(undefined);
    setIsStatusManuallyChanged(false);
  }, [orderData?.data?.status]);

  const handleRemoveFromCart = useCallback((variantId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== variantId),
    );
  }, []);

  const handleIncrementQuantity = useCallback((variantId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === variantId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const handleDecrementQuantity = useCallback((variantId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === variantId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }, []);

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  // handel order status

  const handleSubmit = async () => {
    if (!id) return;

    // Validation for HOLD status note if trying to save as HOLD or enforcing status selection
    if (
      isStatusManuallyChanged &&
      selectedStatus &&
      selectedStatus !== orderData?.data?.status
    ) {
      if (selectedStatus === "HOLD" && !actionNote.trim()) {
        toast.error(
          "Please enter a description in the note field for 'HOLD' status",
        );
        return;
      }
    }

    // Validation: Discount and Advance limits
    const subTotal = calculateTotal();
    const maxAllowedDiscount = subTotal + deliveryCharge;
    const grandTotal = subTotal + deliveryCharge - discount - extraDiscount;

    if (discount > maxAllowedDiscount) {
      setDiscountError(`Max: ${maxAllowedDiscount}`);
      return;
    }

    const maxAllowedExtraDiscount = subTotal + deliveryCharge - discount;
    if (extraDiscount > maxAllowedExtraDiscount) {
      setExtraDiscountError(`Max: ${maxAllowedExtraDiscount}`);
      return;
    }

    if (advance > grandTotal) {
      setAdvanceError(`Max: ${grandTotal}`);
      return;
    }

    try {
      const orderPayload: IUpdateOrderPayload = {
        customerPhone: mobileNumber,
        customerName: customerName,
        customerAddress: address,
        products: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.id !== item.productId ? item.id : undefined,
          quantity: item.quantity,
        })),
        deliveryMethod,
        deliveryCharge,
        paymentMethod,
        orderSourceId: orderSource,
        shippingNote: shippingNote,
        referenceLink,
        isPreorder,
        isCrossSale,
        discount,
        extraDiscount,
        advance,
        transactionId,
        advancePaymentDeliveryMethod,
        customerEmail,
      };
      await updateOrder({ orderId: id, data: orderPayload }).unwrap();
      isDataInitialized.current = false; // Allow fresh data to re-populate from server if needed

      // According to user request:
      // "Pending a thaka obosthai nicher update order a click korlei sei order confirm a chole jabe"
      let finalStatus = selectedStatus;
      let finalStatusChanged = isStatusManuallyChanged;

      if (!finalStatusChanged && orderData?.data?.status === "PENDING") {
        finalStatus = "CONFIRM" as OrderStatus;
        finalStatusChanged = true;
      }

      // If status has changed (either manually or automatically via PENDING->CONFIRM rule), update it as well
      if (
        finalStatusChanged &&
        finalStatus &&
        finalStatus !== orderData?.data?.status
      ) {
        const statusPayload: IUpdateOrderStatusPayload = {
          status: finalStatus,
        };

        if (finalStatus === "HOLD" && actionNote.trim()) {
          statusPayload.followUp = {
            followUpDate: followUpDate
              ? followUpDate.toISOString()
              : new Date().toISOString(),
            description: actionNote.trim(),
          };
        }

        // status update ===========

        await updateOrderStatus({
          orderId: id,
          data: statusPayload,
        }).unwrap();

        if (finalStatus === "HOLD") {
          setActionNote("");
        }
      }

      toast.success("Order updated successfully");

      // Navigate to the list with the updated status tab
      if (finalStatusChanged && finalStatus) {
        navigate("/orders/complete", { state: { activeTab: finalStatus } });
      } else {
        navigate(-1);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update order");
    }
  };

  if (!hasView) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to view Order Details.</p>
        </div>
      </div>
    );
  }

  if (isLockedByOther) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <PageMeta
          title="Order Locked | ERP"
          description="This order is currently locked by another user"
        />
        <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock size={32} className="text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Order is Locked
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            This order is currently being edited by another team member.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2 tracking-wider">
              Currently Editing
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                {(lockData?.maintainer?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-bold text-gray-900">
                  {lockData?.maintainer?.name || "Another User"}
                </div>
                <div className="text-[11px] text-red-500 font-medium animate-pulse">
                  ● Live Editing
                </div>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            block
            size="large"
            className="bg-primary hover:bg-primary/90 rounded-lg font-semibold h-11"
            onClick={() => navigate("/orders/complete")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (orderLoading) {
    return <OrderDetailsSkeleton />;
  }

  return (
    <div className="pb-4 md:pb-10">
      <PageMeta
        title="Order Details"
        description="View and update order details for UserKotha.Shop"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Order Details
          </h1>
          {isLockedByOther && (
            <Tooltip title={`Locked by ${lockData?.maintainer?.name}`}>
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100 animate-pulse">
                <Lock size={16} className="font-bold" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Locked by {lockData?.maintainer?.name}
                </span>
              </div>
            </Tooltip>
          )}
          {isLockedByMe && (
            <Tooltip title="You have locked this order for editing">
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                <Lock size={16} className="font-bold" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Locked by You
                </span>
              </div>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-3">
          {orderData?.data && (
            <>
              <Tooltip title="Print Sticker">
                <Button
                  icon={<Box size={15} />}
                  className="flex items-center gap-2 h-9 px-4 font-semibold border-gray-300 hover:border-[#1BA143] hover:text-[#1BA143] transition-all"
                  onClick={() => OrderStickerPrint.print([orderData.data])}
                >
                  <span className="hidden sm:inline">Sticker</span>
                </Button>
              </Tooltip>
              <Tooltip title="Print Invoice (Quick)">
                <Button
                  type="primary"
                  icon={<FileText size={15} />}
                  className="flex items-center gap-2 h-9 px-4 font-semibold border-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all"
                  onClick={() => OrderInvoicePrint.printBulk([orderData.data])}
                >
                  <span className="hidden sm:inline">Invoice</span>
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-[70%] w-full">
          {/* Stats Cards — when phone is valid for courier APIs (11+ digits, 01… or 880…) */}
          {isValidPhone && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {["All", "Steadfast", "Pathao", "Courier"].map((courier) => {
                const isFraudRelevant =
                  courier === "All" || courier === "Steadfast";
                const isCourierCard = courier === "Courier";

                const displayData =
                  isCourierCard && orderCountData
                    ? {
                        total: orderCountData?.totalOrdersCounts || 0,
                        delivered: orderCountData?.deliveredOrdersCounts || 0,
                        cancelled: orderCountData?.canceledOrdersCounts || 0,
                        fraudReports: 0,
                        successRate: orderCountData?.successRate || 0,
                      }
                    : isFraudRelevant && fraudInfo
                      ? {
                          total: fraudInfo?.total_parcels || 0,
                          delivered: fraudInfo?.total_delivered || 0,
                          cancelled: fraudInfo?.total_cancelled || 0,
                          fraudReports:
                            fraudInfo?.total_fraud_reports?.length || 0,
                          successRate:
                            fraudInfo?.total_parcels > 0
                              ? Math.round(
                                  (fraudInfo.total_delivered /
                                    fraudInfo.total_parcels) *
                                    100,
                                )
                              : 0,
                        }
                      : {
                          total: 0,
                          delivered: 0,
                          cancelled: 0,
                          fraudReports: 0,
                          successRate: 0,
                        };

                const getStatusColor = (rate: number) => {
                  if (rate >= 80) return "#1BA143";
                  if (rate >= 50) return "amber";
                  return "red";
                };

                const color = getStatusColor(displayData?.successRate);

                const openCourierDetails = isCourierCard;

                return (
                  <div
                    key={courier}
                    role={openCourierDetails ? "button" : undefined}
                    tabIndex={openCourierDetails ? 0 : undefined}
                    onClick={
                      openCourierDetails
                        ? () => setCustomerCourierOrdersModalOpen(true)
                        : undefined
                    }
                    onKeyDown={
                      openCourierDetails
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setCustomerCourierOrdersModalOpen(true);
                            }
                          }
                        : undefined
                    }
                    title={
                      openCourierDetails
                        ? "Click to view orders (total, delivered, cancelled)"
                        : undefined
                    }
                    className={`border border-gray-200 rounded-lg bg-white p-3.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
                      openCourierDetails
                        ? "cursor-pointer hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/25"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[13px] font-bold text-gray-700">
                        {courier}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-tight">
                          Success
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            color === "#1BA143"
                              ? "text-[#1BA143]"
                              : color === "amber"
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {displayData?.successRate}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500 font-medium">
                          Total Parcels
                        </span>
                        <span className="text-[11px] font-bold text-gray-700">
                          {displayData?.total}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500 font-medium">
                          Delivered
                        </span>
                        <span className="text-[11px] font-bold text-[#1BA143]">
                          {displayData?.delivered}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500 font-medium">
                          Cancelled
                        </span>
                        <span className="text-[11px] font-bold text-red-600">
                          {displayData?.cancelled}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border border-gray-200 rounded-[6px] mb-6 bg-white p-4">
            <div className="space-y-6">
              {/* Row 1: Mobile, Name, Delivery Method, Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="017xxxxxxxx / 880..."
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, ""));
                      }}
                      disabled={isLockedByOther || !hasUpdate}
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Name
                  </label>
                  <Input
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isLockedByOther || !hasUpdate}
                  />
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Delivery Method
                  </label>
                  <Select
                    value={deliveryMethod}
                    onChange={(value) => setDeliveryMethod(value)}
                    className="w-full h-9"
                    placeholder="Select Method"
                    allowClear
                    options={[
                      { value: "OFFICE_DELIVERY", label: "Office Delivery" },
                      { value: "STEADFAST", label: "Steadfast Delivery" },
                      { value: "PATHAO", label: "Pathao Delivery" },
                      { value: "OTHER", label: "Other Delivery" },
                    ]}
                    disabled={isLockedByOther || !hasUpdate}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Payment Method
                  </label>
                  <Select
                    value={paymentMethod}
                    onChange={(v) => setPaymentMethod(v)}
                    className="w-full h-9"
                    placeholder="-"
                    options={[
                      {
                        value: "CASH_ON_DELIVERY",
                        label: "Cash On Delivery",
                      },
                      { value: "BKASH", label: "Bkash" },
                      { value: "NAGAD", label: "Nagad" },
                      { value: "ROCKET", label: "Rocket" },
                    ]}
                    disabled={isLockedByOther || !hasUpdate}
                  />
                </div>
              </div>

              {/* Row 2: Address and Shipping Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Address
                  </label>
                  <TextArea
                    placeholder="Enter address"
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    className="rounded-lg"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isLockedByOther}
                  />
                </div>

                {/* Shipping Note */}
                <div className="">
                  <div className="relative mb-1">
                    <label className="block text-sm font-medium text-gray-700 pb-2">
                      Shipping Note
                    </label>
                    <div className="absolute right-0 -top-[1px]">
                      <Dropdown
                        trigger={["click"]}
                        popupRender={() => (
                          <div className="bg-white rounded-lg border border-gray-200 p-3 w-80">
                            {/* Search Input */}
                            <Input
                              placeholder="Search templates..."
                              prefix={
                                <Search className="text-gray-400 h-4 w-4" />
                              }
                              className="mb-3"
                              value={templateSearch}
                              onChange={(e) =>
                                setTemplateSearch(e.target.value)
                              }
                            />

                            {/* Template List */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {filteredTemplates.map((template: any) => (
                                <div
                                  key={template.id}
                                  className="px-3 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer border border-gray-200 transition-colors"
                                  onClick={() => {
                                    setShippingNote(template.text);
                                    setTemplateSearch("");
                                  }}
                                >
                                  <span className="text-sm font-medium text-gray-800">
                                    {template.name}
                                  </span>
                                </div>
                              ))}
                              {filteredTemplates.length === 0 && (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                  No templates found
                                </div>
                              )}
                            </div>

                            {/* Add New Template Button */}
                            <Button
                              type="default"
                              block
                              className="mt-3"
                              size="middle"
                              onClick={() => setIsShippingNoteModalOpen(true)}
                            >
                              Add New Template
                            </Button>
                          </div>
                        )}
                      >
                        <Tooltip title="Add Default Shipping Note">
                          <Button
                            size="small"
                            icon={<Plus />}
                            className="border border-primary text-primary hover:bg-primary/10"
                            type="default"
                            disabled={isLockedByOther}
                          />
                        </Tooltip>
                      </Dropdown>
                    </div>
                  </div>
                  <TextArea
                    placeholder="Enter shipping note"
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    className="rounded-lg !-mt-1"
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    disabled={isLockedByOther}
                  />
                </div>
              </div>

              {/* Row 3: Extra Options (Order Source, Reference Link, and Switches) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Customer Email
                  </label>
                  <Input
                    placeholder="Enter email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={isLockedByOther}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Order Source
                  </label>
                  <Select
                    value={orderSource}
                    onChange={(value) => setOrderSource(value)}
                    className="w-full h-9"
                    placeholder="Select Source"
                    options={orderSourceOptions}
                    popupRender={(menu) => (
                      <>
                        {menu}

                        <Button
                          type="default"
                          block
                          icon={<Plus size={14} />}
                          className="flex items-center justify-start text-primary hover:text-primary-hover px-2 mt-3 mb-1 py-1"
                          onClick={() => setIsSourceModalOpen(true)}
                        >
                          Add New
                        </Button>
                      </>
                    )}
                    disabled={isLockedByOther}
                  />
                </div>

                <div className=" flex items-end gap-6 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      Pre Order
                    </span>
                    <Switch
                      size="small"
                      checked={isPreorder}
                      onChange={(checked) => setIsPreorder(checked)}
                      disabled={isLockedByOther}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      Cross Sale
                    </span>
                    <Switch
                      size="small"
                      checked={isCrossSale}
                      onChange={(checked) => setIsCrossSale(checked)}
                      disabled={isLockedByOther}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Customer Email, Advance Payment Method, and Transaction ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Advance Payment Method
                  </label>
                  <Select
                    className="w-full"
                    placeholder="Select Method"
                    value={advancePaymentDeliveryMethod}
                    onChange={(val) => setAdvancePaymentDeliveryMethod(val)}
                    showSearch
                    onSearch={(val) => setAdvancePaymentDeliveryMethod(val)}
                    allowClear
                    options={[
                      { value: "Nagad", label: "Nagad" },
                      { value: "bKash", label: "bKash" },
                      { value: "Rocket", label: "Rocket" },
                      { value: "Bank", label: "Bank" },
                      { value: "Other", label: "Other" },
                    ]}
                    disabled={isLockedByOther}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Transaction ID
                  </label>
                  <Input
                    placeholder="e.g., 70XD4530"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    disabled={isLockedByOther}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Advance
                  </label>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="0"
                    status={advanceError ? "error" : ""}
                    value={advance}
                    onChange={(value) => {
                      const val = value || 0;
                      const grandTotal =
                        calculateTotal() +
                        deliveryCharge -
                        discount -
                        extraDiscount -
                        transactionTotal;
                      if (val > grandTotal) {
                        setAdvanceError(
                          `Max: ${grandTotal > 0 ? grandTotal : 0}`,
                        );
                      } else {
                        setAdvanceError("");
                      }
                      setAdvance(val);
                    }}
                    disabled={isLockedByOther}
                  />
                  {advanceError && (
                    <div className="text-[10px] text-red-500 font-bold mt-1">
                      {advanceError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="-mt-2">
            <div className="grid grid-cols-1  lg:grid-cols-12 gap-4">
              {/* Left Column: Customer Form & Ordered Products */}
              <div className="lg:col-span-6 h-[540px] overflow-y-auto bg-white custom-scrollbar border rounded-[6px] border-gray-200">
                <div className="border-b border-gray-200 p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      Ordered Products
                    </span>
                    <Badge count={cartItems.length} showZero color="#1BA143" />
                  </div>
                </div>
                <div className="p-4">
                  {" "}
                  <div className="max-h-[432px] overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.length > 0 ? (
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
                            onClick={() => {
                              const formattedItem = {
                                variantId: item.id,
                                productId: item.productId,
                                productName: item.productName,
                                quantity: item.quantity,
                                sellingPrice: item.sellingPrice,
                                discountPrice:
                                  item.discountedPrice || item.sellingPrice,
                              };
                              console.log("Clicked Item:", formattedItem);
                            }}
                          >
                            {/* Product Image */}
                            <img
                              src={
                                item?.thumbnail
                                  ? config.image_access_url + item.thumbnail.url
                                  : ""
                              }
                              alt={item.name || "Product"}
                              className="w-11 h-11 object-cover rounded-md border border-gray-100 flex-shrink-0"
                            />

                            {/* Product Info & Quantity Controls */}
                            <div className="flex-1 min-w-0">
                              {/* Product Name & Variant */}
                              <div className="mb-1 overflow-hidden">
                                <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 leading-relaxed">
                                  <span className="truncate py-0.5">
                                    {item.productName || ""}
                                  </span>
                                  {item.name &&
                                    item.name !== item.productName && (
                                      <span className="text-primary/80 font-bold px-1.2 py-0.5 bg-primary/5 rounded border border-primary/10 text-[9px] uppercase tracking-wider flex-shrink-0">
                                        {item.name}
                                      </span>
                                    )}
                                </h4>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-gray-200 rounded-md bg-white h-6">
                                  <button
                                    className="w-6 h-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-gray-600 font-bold transition-all active:scale-95"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDecrementQuantity(item.id);
                                    }}
                                  >
                                    -
                                  </button>
                                  <span className="w-8 h-full flex items-center justify-center text-center border-x border-gray-200 text-[12px] font-bold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    className="w-6 h-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-gray-600 font-bold transition-all active:scale-95"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleIncrementQuantity(item.id);
                                    }}
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Delete Button */}
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<X size={14} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFromCart(item.id);
                                  }}
                                  className="h-6 w-6 flex !border !border-red-300 active:scale-90 transition-all"
                                  disabled={isLockedByOther}
                                />
                              </div>
                            </div>

                            {/* Price on Right */}
                            <div className="flex-shrink-0 text-right">
                              <div className="text-[13px] font-bold text-gray-900 flex items-center gap-1">
                                <DisplayCurrency
                                  amount={
                                    (item.discountedPrice ||
                                      item.sellingPrice) * item.quantity
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-700 mb-1">
                              Your cart is empty
                            </h3>
                            <p className="text-sm text-gray-500">
                              Add products from the right panel to get started
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Right Column: Add Products & Summary */}
              <div className="lg:col-span-6">
                <div className="border border-gray-200 rounded-[6px] mb-6 bg-white">
                  <div className="border-b border-gray-200 p-4">
                    <span className="font-semibold text-lg">
                      Click To Add Products
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Type to Search Code/SKU..."
                        prefix={<Search className="text-gray-400 h-4 w-4" />}
                        className="rounded-lg"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        disabled={isLockedByOther}
                      />
                      <Button
                        type={isFeaturedOnly ? "primary" : "default"}
                        onClick={() => setIsFeaturedOnly(!isFeaturedOnly)}
                        className="rounded-lg w-32 h-10 flex items-center justify-center gap-2"
                        disabled={isLockedByOther}
                      >
                        <Star
                          className={`h-4 w-4 ${isFeaturedOnly ? "fill-white" : "text-gray-400"}`}
                        />
                        <span
                          className={
                            isFeaturedOnly ? "text-white" : "text-gray-600"
                          }
                        >
                          Featured
                        </span>
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative">
                      {isFetching && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                          <Loader />
                        </div>
                      )}
                      {isLoading ? (
                        <div className="text-center py-4">
                          <Loader />
                        </div>
                      ) : products.length > 0 ? (
                        products.map((product: any) => (
                          <OrderProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={(prod, variant) => {
                              if (isLockedByOther) {
                                return;
                              }
                              handleAddToCart(prod, variant);
                            }}
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          No products found
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
              </div>
            </div>
            <div className="border -mt-2 border-gray-200  rounded-[6px]  bg-white p-4">
              <div className="space-y-4">
                {/* All Fields in One Row */}
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Discount
                    </label>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="0"
                      status={discountError ? "error" : ""}
                      value={discount}
                      onChange={(value) => {
                        const val = value || 0;
                        const subTotal = calculateTotal();
                        const maxAllowedDiscount =
                          subTotal +
                          deliveryCharge -
                          extraDiscount -
                          advance -
                          transactionTotal;

                        if (val > maxAllowedDiscount) {
                          setDiscountError(
                            `Max: ${maxAllowedDiscount > 0 ? maxAllowedDiscount : 0}`,
                          );
                        } else {
                          setDiscountError("");
                        }
                        setDiscount(val);

                        // Also re-validate advance
                        const newGrandTotal =
                          subTotal +
                          deliveryCharge -
                          val -
                          extraDiscount -
                          transactionTotal;
                        if (advance > newGrandTotal) {
                          setAdvanceError(
                            `Max: ${newGrandTotal > 0 ? newGrandTotal : 0}`,
                          );
                        } else {
                          setAdvanceError("");
                        }
                      }}
                      disabled={isLockedByOther}
                    />
                    {discountError && (
                      <div className="text-[10px] text-red-500 font-bold mt-1">
                        {discountError}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Sub Total
                    </label>
                    <Input
                      className="w-full bg-gray-50"
                      value={calculateTotal()}
                      disabled
                      style={{ width: "100%" }}
                      readOnly
                      prefix={
                        <CurrencyIcon size={12} className="text-gray-400" />
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Delivery Charge
                    </label>
                    <InputNumber
                      className="w-full"
                      style={{ width: "100%" }}
                      min={0}
                      type="number"
                      placeholder="0"
                      value={deliveryCharge}
                      onChange={(value) => setDeliveryCharge(value || 0)}
                      disabled={isLockedByOther}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Extra Discount
                    </label>
                    <InputNumber
                      className="w-full"
                      style={{ width: "100%" }}
                      min={0}
                      type="number"
                      placeholder="0"
                      status={extraDiscountError ? "error" : ""}
                      value={extraDiscount}
                      onChange={(value) => {
                        const val = value || 0;
                        const subTotal = calculateTotal();
                        const maxAllowedExtraDiscount =
                          subTotal +
                          deliveryCharge -
                          discount -
                          advance -
                          transactionTotal;

                        if (val > maxAllowedExtraDiscount) {
                          setExtraDiscountError(
                            `Max: ${maxAllowedExtraDiscount > 0 ? maxAllowedExtraDiscount : 0}`,
                          );
                        } else {
                          setExtraDiscountError("");
                        }
                        setExtraDiscount(val);

                        // Also re-validate advance since grand total changed
                        const newGrandTotal =
                          subTotal +
                          deliveryCharge -
                          discount -
                          val -
                          transactionTotal;
                        if (advance > newGrandTotal) {
                          setAdvanceError(
                            `Max: ${newGrandTotal > 0 ? newGrandTotal : 0}`,
                          );
                        } else {
                          setAdvanceError("");
                        }
                      }}
                      disabled={isLockedByOther}
                    />
                    {extraDiscountError && (
                      <div className="text-[10px] text-red-500 font-bold mt-1">
                        {extraDiscountError}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-primary mb-1">
                      Grand Total
                    </label>
                    <Input
                      className="w-full bg-blue-50 text-[#1BA143] font-semibold"
                      disabled
                      value={
                        calculateTotal() +
                        deliveryCharge -
                        discount -
                        extraDiscount -
                        advance -
                        transactionTotal
                      }
                      readOnly
                    />
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  size="middle"
                  className="h-12 bg-green-500 mt-3 hover:bg-green-600 border-green-500 font-semibold text-lg"
                  onClick={handleSubmit}
                  loading={isUpdating}
                  disabled={isLockedByOther || !hasUpdate}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    Update Order (
                    <DisplayCurrency
                      amount={
                        calculateTotal() +
                        deliveryCharge -
                        discount -
                        extraDiscount -
                        advance
                      }
                    />
                    )
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* right side ar container */}
        <div className="lg:w-[30%] w-full space-y-6">
          {/* Order Summary Section */}
          <Card
            className="rounded-lg border border-gray-300"
            title={
              <span className="text-gray-800 font-semibold text-sm">
                Order Summary
              </span>
            }
            extra={<span className="text-gray-400 text-[10px]">#701384</span>}
            styles={{ body: { padding: "0" } }}
          >
            <div className="p-4 flex flex-wrap items-start gap-x-8 gap-y-5">
              {/* Order Date */}
              <div className="min-w-[140px]">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                  Order Date
                </div>
                <div className="text-sm text-gray-800 font-medium whitespace-nowrap">
                  {orderData?.data?.createdAt
                    ? new Date(orderData.data.createdAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              {/* Order Status */}
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                  Status
                </div>
                <AntTag
                  color={getStatusColor(orderData?.data?.status || "")}
                  className="rounded-full border-0 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                >
                  {getStatusLabel(orderData?.data?.status || "N/A")}
                </AntTag>
              </div>

              {/* Payment Method */}
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                  Payment
                </div>
                <div className="text-xs text-gray-800 font-bold uppercase bg-gray-100 px-2 py-1 rounded inline-block">
                  {(orderData?.data?.paymentMethod || "N/A").replace(/_/g, " ")}
                </div>
              </div>

              {/* Order Source */}
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                  Source
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {(() => {
                    const source = orderData?.data?.orderSource;
                    const name =
                      typeof source === "object"
                        ? source?.name
                        : typeof source === "string"
                          ? source
                          : "N/A";
                    return (name || "N/A").replace(/_/g, " ");
                  })()}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50/30">
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  Subtotal
                </span>
                <span className="text-gray-800 font-semibold">
                  <DisplayCurrency amount={calculateTotal()} />
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  Delivery
                </span>
                <span className="text-gray-800 font-semibold">
                  <DisplayCurrency amount={deliveryCharge} />
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-gray-500 font-medium flex items-center gap-1">
                    Coupon Discount
                  </span>
                  <span className="text-red-500 font-semibold">
                    -<DisplayCurrency amount={discount} />
                  </span>
                </div>
              )}
              {extraDiscount > 0 && (
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-gray-500 font-medium flex items-center gap-1">
                    Extra Discount
                  </span>
                  <span className="text-red-500 font-semibold">
                    -<DisplayCurrency amount={extraDiscount} />
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm py-2 border-t border-gray-200 mt-1">
                <span className="text-gray-800 font-semibold text-base flex items-center gap-1">
                  Total
                </span>
                <span className="text-primary font-semibold text-base">
                  <DisplayCurrency
                    amount={
                      calculateTotal() +
                      deliveryCharge -
                      discount -
                      extraDiscount
                    }
                  />
                </span>
              </div>
              {(advance > 0 || transactionTotal > 0) && (
                <>
                  <div className="flex justify-between items-center text-xs py-1 border-t border-dashed border-gray-300 mt-1 pt-2">
                    <span className="text-gray-500 font-medium">
                      Advance Paid
                    </span>
                    <span className="text-green-600 font-semibold">
                      <DisplayCurrency amount={advance + transactionTotal} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span className="text-gray-800 font-bold">Payable</span>
                    <span className="text-red-600 font-bold text-lg">
                      <DisplayCurrency
                        amount={
                          calculateTotal() +
                          deliveryCharge -
                          discount -
                          extraDiscount -
                          advance -
                          transactionTotal
                        }
                      />
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="">
                <div>
                  {/* <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    IP: {orderData?.data?.user?.id || "N/A"}
                  </div> */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-700">
                      Mobile:{" "}
                      {orderData?.data?.user?.phone ||
                        orderData?.data?.customer?.phone ||
                        "N/A"}
                    </span>
                    <AntTag
                      color="#1BA143"
                      className="rounded-full border-0 flex items-center gap-1 text-[10px] font-semibold"
                    >
                      Verified
                    </AntTag>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3">
                Order Items
              </div>
              <div className="space-y-3">
                {orderData?.data?.orderProducts?.map((op: any) => {
                  const isCombo = !!op.comboProduct;
                  const mainItem = isCombo ? op.comboProduct : op.product;
                  const mainVariant = isCombo ? op.comboVariant : op.variant;

                  const thumbnail =
                    mainVariant?.thumbnail || mainItem?.thumbnail;
                  const name = mainVariant?.name || mainItem?.name;
                  const productName = mainItem?.name;

                  return (
                    <div
                      key={op.id}
                      className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-lg border border-gray-200"
                    >
                      <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                        <img
                          src={
                            thumbnail?.url
                              ? config.image_access_url + thumbnail.url
                              : ""
                          }
                          alt={name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-primary">
                          {productName || name}
                          <span className="text-gray-400 font-medium text-[10px] ml-2">
                            {op.quantity}x
                          </span>
                        </div>
                        <div className="text-[9px] text-gray-400 font-semibold">
                          {name !== productName ? name : "Standard"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Order Tags Section */}

          {/* Order Actions Section */}
          <div className="bg-white border border-gray-200 rounded-lg !mt-4 p-4">
            <div className="mb-4">
              <span className="text-gray-800 font-semibold text-sm">
                Order Actions
              </span>
            </div>
            <div className="space-y-4 ">
              <div className="flex flex-wrap items-center gap-3">
                {nextOptions.length > 0 ? (
                  <div className="w-full">
                    <label className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                      Select Status
                    </label>
                    <Select
                      className="w-full"
                      placeholder="Next Action"
                      size="middle"
                      value={selectedStatus}
                      onChange={(value) => {
                        setSelectedStatus(value);
                        setIsStatusManuallyChanged(true);
                      }}
                      options={nextOptions}
                      disabled={isLockedByOther}
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs italic bg-gray-50 p-2 rounded w-full border border-dashed text-center">
                    No further actions available for{" "}
                    {getStatusLabel(orderData?.data?.status || "")} status.
                  </div>
                )}
                <div className="flex-1"></div>
              </div>

              <div className="-mt-2 space-y-4">
                {/* Follow-up Date Input - Only show if HOLD is selected */}
                {selectedStatus === "HOLD" && (
                  <div>
                    <label className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                      Next Follow-up Date
                    </label>
                    <DatePicker
                      showTime
                      className="w-full"
                      value={followUpDate}
                      onChange={(date) => setFollowUpDate(date)}
                      placeholder="Select Date & Time"
                      disabled={isLockedByOther}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    Add Note / Description
                  </label>
                  <TextArea
                    rows={3}
                    placeholder="Enter order note or follow-up details..."
                    className="border-gray-200 focus:border-emerald-500 rounded-lg"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    disabled={isLockedByOther || !hasUpdate}
                  />
                </div>

                <Button
                  type="default"
                  size="middle"
                  className="w-full text-emerald-600 border-emerald-200 bg-white font-semibold h-8"
                  onClick={handleAddNote}
                  loading={isAddingFollowUp}
                  disabled={isLockedByOther || !hasUpdate}
                >
                  Add Note
                </Button>
              </div>

              <Divider className="my-4" />

              <div className="flex gap-3">
                <Tooltip title="Send Reminder SMS">
                  <Button
                    size="middle"
                    className="bg-white text-gray-600 border-gray-200 font-semibold text-[11px] rounded px-2 h-8 flex items-center justify-center hover:text-emerald-600 w-full hover:border-emerald-600"
                    onClick={handleReminderSMS}
                    loading={isSendingReminder}
                    disabled={isLockedByOther || !hasUpdate}
                  >
                    Reminder SMS
                  </Button>
                </Tooltip>
                <Tooltip title="Send Advance SMS">
                  <Button
                    size="middle"
                    className="bg-white text-gray-600 border-gray-200 font-semibold text-[11px] rounded px-2 h-8 flex items-center justify-center hover:text-emerald-600 w-full hover:border-emerald-600"
                    onClick={handleAdvanceSMS}
                    loading={isSendingAdvance}
                    disabled={isLockedByOther || !hasUpdate}
                  >
                    Advance SMS
                  </Button>
                </Tooltip>
              </div>

              {/* Follow-up List Display */}
              <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50/30 overflow-hidden">
                <div className="bg-gray-100/50 px-3 py-1.5 border-b border-gray-200">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Follow-up History
                  </span>
                </div>
                <div className="p-2 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {followUpsData?.data && followUpsData.data.length > 0 ? (
                    [...followUpsData.data]
                      .sort((a: any, b: any) => {
                        const dateA = new Date(
                          a.followUpDate || a.createdAt,
                        ).getTime();
                        const dateB = new Date(
                          b.followUpDate || b.createdAt,
                        ).getTime();
                        return dateB - dateA; // latest first
                      })
                      .map((item: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white p-2.5 rounded border border-gray-200 hover:border-primary transition-colors"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <AntTag
                              color={getStatusColor(item.status || "PENDING")}
                              className="m-0 text-[8px] px-1.5 py-0 border-0 font-bold uppercase"
                            >
                              {getStatusLabel(item.status || "NOTE")}
                            </AntTag>

                            <span className="text-[9px] text-gray-400 font-medium">
                              {dayjs(
                                item.followUpDate || item.createdAt,
                              ).format("DD MMM, YYYY hh:mm A")}
                            </span>
                          </div>

                          {/* Description with tooltip */}
                          <Tooltip
                            title={item.description || item.notes || "N/A"}
                            placement="topLeft"
                          >
                            <div className="text-[12px] text-gray-700 leading-normal truncate cursor-pointer">
                              {item.description || item.notes}
                            </div>
                          </Tooltip>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-[10px] italic">
                      No follow-up history found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          {orderTransaction && orderTransaction.length > 0 && (
            <div className="bg-white border rounded-lg border-gray-200 overflow-hidden !-mt-2 mb-4">
              <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <span className="text-gray-800 font-bold text-sm tracking-tight">
                  Transactions
                </span>
                <AntTag className="m-0 bg-blue-100 text-blue-600 border-blue-200 text-[10px] font-bold px-2 rounded-full">
                  {orderTransaction.length} Payments
                </AntTag>
              </div>
              <div className="p-4 space-y-2">
                {orderTransaction.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/50 transition-all"
                  >
                    <div className="flex gap-3">
                      <div>
                        <div className="text-[13px] font-bold text-gray-800 leading-none mb-1">
                          {t.paymentMethod}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium font-mono">
                          {t.transactionId}
                        </div>
                        {t.notes && (
                          <div className="text-[10px] text-gray-400 mt-1 italic">
                            {t.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-black text-[#1BA143] leading-none mb-1">
                        <DisplayCurrency amount={t.amount} />
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium">
                        {dayjs(t.createdAt).format("DD MMM, YYYY hh:mm A")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log Section */}
          <div className="bg-white border rounded-xl border-gray-200 overflow-hidden !-mt-2">
            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-gray-800 font-bold text-sm tracking-tight">
                Activity Log
              </span>
              <AntTag className="m-0 bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2 rounded-full">
                {orderData?.data?.activityLogs?.length || 0} Actions
              </AntTag>
            </div>
            <div className="p-4">
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <Timeline
                  className="mt-4"
                  items={
                    orderData?.data?.activityLogs?.map(
                      (log: any, index: number) => ({
                        dot: (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm ring-1 ring-primary/20" />
                        ),
                        children: (
                          <div
                            className={`pb-3 px-1 ${index === 0 ? "mt-1" : ""}`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[12px] font-bold text-gray-800 leading-none">
                                  {log.user?.name || "System"}
                                </span>
                                <span className="text-[10px] font-medium text-gray-500">
                                  {dayjs(log.createdAt).format(
                                    "DD MMM, YYYY • hh:mm A",
                                  )}
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-primary mb-0.5">
                                {log.action?.replace(/_/g, " ")}
                              </div>
                              {log.details && (
                                <div className="text-[10px] text-gray-500 leading-normal">
                                  {log.details}
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      }),
                    ) || []
                  }
                />
                {(!orderData?.data?.activityLogs ||
                  orderData.data.activityLogs.length === 0) && (
                  <div className="text-center py-10">
                    <div className="text-gray-300 mb-2 italic text-sm">
                      No activity recorded yet
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderSourceModal
        open={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
      />

      <ShippingNoteModal
        open={isShippingNoteModalOpen}
        onClose={() => setIsShippingNoteModalOpen(false)}
      />

      <CustomerCourierOrdersModal
        open={customerCourierOrdersModalOpen}
        onClose={() => setCustomerCourierOrdersModalOpen(false)}
        data={customerOrderDetails}
        phoneHint={digitsPhone}
      />
    </div>
  );
};

export default OrderDetails;
