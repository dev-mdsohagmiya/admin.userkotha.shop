import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Select,
  Button,
  InputNumber,
  Switch,
  Badge,
  Dropdown,
  Spin,
  Tooltip,
} from "antd";
import { Plus } from "@phosphor-icons/react";
import PageMeta from "../../../components/common/Meta/PageMeta";
import { useGetEcommerceProductListQuery } from "../../../redux/features/product/productApi";
import { useGetAllOrderSourcesQuery } from "../../../redux/features/orderSource/orderSourceApi";
import { useGetAllShippingNotesQuery } from "../../../redux/features/shippingNote/shippingNoteApi";
import {
  Search,
  X,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Star,
} from "lucide-react";
import { config } from "../../../config";
import OrderSourceModal from "../../../components/common/Modals/OrderManagement/OrderSourceModal";
import ShippingNoteModal from "../../../components/common/Modals/OrderManagement/ShippingNoteModal";
import CustomerCourierOrdersModal from "../../../components/common/Modals/OrderManagement/CustomerCourierOrdersModal";
import OrderProductCard from "../../../components/OrderManagement/OrderProductCard";
import { useCheckCustomerByPhoneQuery } from "../../../redux/features/customers/customersApi";
import {
  useCompleteOrderMutation,
  useGetIncompleteCheckoutOrdersQuery,
  useUpdateOrderMutation,
  useMyWebsiteOrderSpecifyCustomerOrderListQuery,
} from "../../../redux/features/order/orderApi";
import { toast } from "react-toastify";
import { CurrencyIcon } from "../../../utils/currency";
import { useCheckFraudQuery } from "../../../redux/features/courier/courierApi";
import { IUncompletedOrder } from "../../../types/uncompletedOrder";
import { useGetDeliveryChargeListQuery } from "../../../redux/features/deliveryCharge/deliveryChargeApi";
import OrderDetailsSkeleton from "../../../components/skeleton/OrderDetailsSkeleton";
import { Loader } from "../../../components/common/Loading";

const { TextArea } = Input;

const IncompleteOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");

  // Form inputs
  const [mobileNumber, setMobileNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [address, setAddress] = useState("");
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [orderSource, setOrderSource] = useState("unknown");
  const [isOrderSourceModalOpen, setIsOrderSourceModalOpen] = useState(false);
  const [isShippingNoteModalOpen, setIsShippingNoteModalOpen] = useState(false);
  const [customerCourierOrdersModalOpen, setCustomerCourierOrdersModalOpen] =
    useState(false);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [debouncedPhone, setDebouncedPhone] = useState("");
  const [isPreorder, setIsPreorder] = useState(false);
  const [isCrossSale, setIsCrossSale] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("PENDING");

  // Errors
  const [discountError, setDiscountError] = useState("");
  const [extraDiscountError, setExtraDiscountError] = useState("");
  const [advanceError, setAdvanceError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");

  // API Hooks
  const { data: incompleteOrdersData, isLoading: isOrderLoading } =
    useGetIncompleteCheckoutOrdersQuery(undefined);

  const [completeOrder, { isLoading: isCompleting }] =
    useCompleteOrderMutation();

  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  // get data for api redux
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useGetEcommerceProductListQuery([
    { name: "search", value: debouncedSearchTerm },
    { name: "page", value: "1" },
    { name: "limit", value: "100" },
    ...(isFeaturedOnly ? [{ name: "isFeatured", value: true }] : []),
  ]);

  const { data: shippingNotesData } = useGetAllShippingNotesQuery();
  const { data: sourcesData } = useGetAllOrderSourcesQuery();
  const { data: deliveryChargeData } = useGetDeliveryChargeListQuery(undefined);
  // incomplete order  use how to create completed order and this time update  and  send  update this product
  const isDataInitialized = useRef(false);

  // Load Initial Data
  useEffect(() => {
    if (incompleteOrdersData?.data && id && !isDataInitialized.current) {
      const order = incompleteOrdersData.data.find(
        (o: IUncompletedOrder) => o.id === id,
      ) as IUncompletedOrder | undefined;

      if (order) {
        setMobileNumber(order.customerPhone?.replace(/^\+88/, "") || "");
        setCustomerName(order.customerName || "");
        setAddress(order.customerAddress || "");
        setCustomerId(order.customerId || null);

        // Map products
        if (order.checkoutProducts) {
          const mappedItems = order.checkoutProducts.map((item) => ({
            id: item.variantId || item.id,
            productId: item.id, // Assuming id is product ID if variantId null, adjust as needed
            name: item.productName,
            productName: item.productName,
            price: Number(item.discountPrice || item.sellingPrice || 0),
            sellingPrice: Number(item.sellingPrice || 0),
            discountedPrice: Number(item.discountPrice || 0),
            quantity: Number(item.quantity || 1),
            thumbnail: null, // Initial load might miss images if not in uncompleted order object
            currentStock: 100, // Default or fetch if needed
          }));
          setCartItems(mappedItems);
        }
        isDataInitialized.current = true;
      }
    }
  }, [incompleteOrdersData, id]);

  // Debounce phone
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhone(mobileNumber);
    }, 500);
    return () => clearTimeout(timer);
  }, [mobileNumber]);

  // Customer Check (11+ digits; local 01… or 880…)
  const debouncedDigits = debouncedPhone.replace(/\D/g, "");
  const isValidPhone =
    debouncedDigits.length >= 11 &&
    (debouncedDigits.startsWith("01") || debouncedDigits.startsWith("880"));
  const { data: customerData, isLoading: isCheckingCustomer } =
    useCheckCustomerByPhoneQuery(debouncedDigits, { skip: !isValidPhone });

  const { data: fraudData } = useCheckFraudQuery(debouncedDigits, {
    skip: !isValidPhone,
  });

  const mobileDigits = mobileNumber.replace(/\D/g, "");
  const isValidPhoneForStats =
    mobileDigits.length >= 11 &&
    (mobileDigits.startsWith("01") || mobileDigits.startsWith("880"));
  const { data: customerOrderData } =
    useMyWebsiteOrderSpecifyCustomerOrderListQuery(mobileDigits, {
      skip: !isValidPhoneForStats,
    });
  const orderCountData = customerOrderData?.summary || {};
  const customerOrderDetails = customerOrderData?.data;

  const fraudInfo = fraudData?.data;

  // Set default delivery method
  useEffect(() => {
    if (deliveryChargeData?.data?.length > 0 && !deliveryMethod) {
      // Prioritize "Steadfast", then "Inside Dhaka", otherwise take the first one
      const defaultOption =
        deliveryChargeData.data.find(
          (d: any) => d.name === "Steadfast" || d.name === "Inside Dhaka",
        ) || deliveryChargeData.data[0];

      if (defaultOption) {
        setDeliveryMethod(defaultOption.id);
        setDeliveryCharge(defaultOption.deliveryCharge); // 60 or whatever
      }
    }
  }, [deliveryChargeData, deliveryMethod]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update Existing Customer State
  useEffect(() => {
    if (customerData?.data) {
      setIsExistingCustomer(true);
    } else {
      setIsExistingCustomer(false);
    }
  }, [customerData]);

  // Derived Data
  const products = useMemo(
    () => productsData?.data || [],
    [productsData?.data],
  );
  const shippingNoteTemplates = useMemo(
    () => shippingNotesData?.data?.filter((note: any) => note.isActive) || [],
    [shippingNotesData?.data],
  );

  const filteredTemplates = useMemo(
    () =>
      shippingNoteTemplates.filter((template: any) =>
        template.name.toLowerCase().includes(templateSearch.toLowerCase()),
      ),
    [shippingNoteTemplates, templateSearch],
  );

  const orderSourceOptions = useMemo(
    () =>
      sourcesData?.data
        ?.filter((source: any) => source.isActive)
        ?.map((source: any) => ({
          value: source.id || source.name,
          label: (
            <div className="flex items-center gap-2">
              {source.icon && (
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <i className={source.icon} style={{ fontSize: "12px" }}></i>
                </div>
              )}
              <span>{source.name?.replace(/_/g, " ")}</span>
            </div>
          ),
        })) || [],
    [sourcesData?.data],
  );

  const deliveryOptions = useMemo(
    () =>
      deliveryChargeData?.data?.map((option: any) => ({
        value: option.id,
        label: `${option.name?.replace(/_/g, " ")} - ${option.deliveryCharge} Tk`,
      })) || [],
    [deliveryChargeData?.data],
  );

  // Handlers
  const handleAddToCart = useCallback((product: any, variant: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
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

  const handleRemoveFromCart = useCallback((variantId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== variantId));
  }, []);

  const handleIncrementQuantity = useCallback((variantId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === variantId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const handleDecrementQuantity = useCallback((variantId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === variantId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }, []);



  const calculateTotal = useCallback(() => {
    return cartItems.reduce(
      (acc, item) =>
        acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0,
    );
  }, [cartItems]);

  const handleSubmit = async () => {
    // Validation
    setPhoneError("");
    setNameError("");
    setAddressError("");
    setDiscountError("");
    setExtraDiscountError("");
    setAdvanceError("");

    let hasError = false;
    const cleanedPhone = mobileNumber.replace(/\D/g, "");

    if (!cleanedPhone) {
      setPhoneError("Phone required");
      hasError = true;
    } else if (
      cleanedPhone.length < 11 ||
      !(cleanedPhone.startsWith("01") || cleanedPhone.startsWith("880"))
    ) {
      setPhoneError("Invalid number (min 11 digits, start with 01 or 880)");
      hasError = true;
    }

    if (!customerName.trim()) {
      setNameError("Name required");
      hasError = true;
    }

    if (!address.trim()) {
      setAddressError("Address required");
      hasError = true;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      hasError = true;
    }

    const subTotal = calculateTotal();
    const maxAllowedDiscount = subTotal + deliveryCharge;
    const finalGrandTotal =
      subTotal + deliveryCharge - discount - extraDiscount;

    if (discount > maxAllowedDiscount) {
      setDiscountError(`Max: ${maxAllowedDiscount}`);
      hasError = true;
    }

    const maxAllowedExtraDiscount = subTotal + deliveryCharge - discount;
    if (extraDiscount > maxAllowedExtraDiscount) {
      setExtraDiscountError(`Max: ${maxAllowedExtraDiscount}`);
      hasError = true;
    }

    if (advance > finalGrandTotal) {
      setAdvanceError(`Max: ${finalGrandTotal}`);
      hasError = true;
    }

    if (hasError) return;

    if (!id) {
      toast.error("Incomplete Order ID not found");
      return;
    }

    const orderPayload = {
      checkoutId: id,
      draftOrderId: id,
      customerId: customerId || undefined,
      customerPhone: mobileNumber,
      customerName,
      customerAddress: address,
      checkoutProducts: cartItems.map((item) => ({
        variantId: item.id !== item.productId ? item.id : undefined,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        sellingPrice: item.sellingPrice,
        discountedPrice: item.discountedPrice,
      })),
      deliveryOptionId: deliveryMethod || undefined, // Allow optional delivery method
      deliveryCharge,
      paymentMethod,
      orderSourceId: orderSource !== "unknown" ? orderSource : undefined,
      orderNote: shippingNote, // Mapping shippingNote to orderNote
      discountAmount: discount + extraDiscount, // Combining for discountAmount
      couponId: null,
      total: finalGrandTotal,
      totalPrice: finalGrandTotal,
      subTotal: subTotal,
      subtotal: subTotal,
      status: orderStatus,
      selectedPayment: paymentMethod,
    };

    // Determine valid delivery method enum for the update payload
    const selectedOption = deliveryChargeData?.data?.find(
      (d: any) => d.id === deliveryMethod,
    );
    const selectedName = selectedOption?.name?.toUpperCase() || "";
    let finalDeliveryMethod = "STEADFAST";
    if (selectedName.includes("PATHAO")) finalDeliveryMethod = "PATHAO";
    else if (selectedName.includes("OFFICE"))
      finalDeliveryMethod = "OFFICE_DELIVERY";
    else if (selectedName.includes("REDX")) finalDeliveryMethod = "REDX";
    else if (selectedName.includes("STEADFAST"))
      finalDeliveryMethod = "STEADFAST";
    else finalDeliveryMethod = "STEADFAST"; // Default for "Inside Dhaka" etc.

    // If we have already created the order, update it directly
    if (createdOrderId) {
      const updatePayload = {
        customerPhone: mobileNumber,
        customerName,
        customerAddress: address,
        products: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.id !== item.productId ? item.id : undefined,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryMethod: finalDeliveryMethod,
        deliveryCharge,
        paymentMethod,
        orderSourceId: orderSource !== "unknown" ? orderSource : undefined,
        shippingNote: shippingNote,
        isPreorder,
        isCrossSale,
        discount,
        extraDiscount,
        advance,
        status: orderStatus,
      };

      try {
        await updateOrder({
          orderId: createdOrderId,
          data: updatePayload as any,
        }).unwrap();
        isDataInitialized.current = false;
        toast.success("Order updated successfully!");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update order");
      }
      return;
    }

    try {
      // 1. Create Order
      const res = await completeOrder(orderPayload).unwrap();
      const newOrderId = res?.data?.id;

      if (newOrderId) {
        setCreatedOrderId(newOrderId);

        // 2. Immediately Update Order with latest form state
        const updatePayload = {
          customerPhone: mobileNumber,
          customerName,
          customerAddress: address,
          products: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.id !== item.productId ? item.id : undefined,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryMethod: finalDeliveryMethod,
          deliveryCharge,
          paymentMethod,
          orderSourceId: orderSource !== "unknown" ? orderSource : undefined,
          shippingNote: shippingNote,
          isPreorder,
          isCrossSale,
          discount,
          extraDiscount,
          advance,
          status: orderStatus,
        };

        const resUpdate = await updateOrder({
          orderId: newOrderId,
          data: updatePayload as any,
        }).unwrap();

        if (resUpdate.success) {
          isDataInitialized.current = false;
          navigate("/orders/complete", { state: { activeTab: orderStatus } });
          toast.success("Order confirmed and updated successfully!");
        }
      } else {
        toast.success("Order confirmed!");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to confirm order");
    }
  };

  if (isOrderLoading) return <OrderDetailsSkeleton />;

  // Copying Layout from NewOrder.tsx strictly
  return (
    <>
      <div className="pb-4 md:pb-10">
        <PageMeta
          title="Incomplete Order | UserKotha.Shop"
          description="Complete your order"
        />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate("/orders/complete")}
              className="border-none shadow-none p-0"
            />
            <h1 className="text-xl font-semibold text-gray-600">
              Update Complete Order
            </h1>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase">
              Incomplete / Abandoned
            </span>
          </div>
        </div>

        {/* Stats Cards — when phone is valid for courier APIs */}
        {isValidPhoneForStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                        total: fraudInfo.total_parcels,
                        delivered: fraudInfo.total_delivered,
                        cancelled: fraudInfo.total_cancelled,
                        fraudReports:
                          fraudInfo.total_fraud_reports?.length || 0,
                        successRate:
                          fraudInfo.total_parcels > 0
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
              const color = getStatusColor(displayData.successRate);

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
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
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
                        {displayData.successRate}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 font-medium">
                        Total Parcels
                      </span>
                      <span className="text-[11px] font-bold text-gray-700">
                        {displayData.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 font-medium">
                        Delivered
                      </span>
                      <span className="text-[11px] font-bold text-[#1BA143]">
                        {displayData.delivered}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 font-medium">
                        Cancelled
                      </span>
                      <span className="text-[11px] font-bold text-red-600">
                        {displayData.cancelled}
                      </span>
                    </div>
                  </div>
                  {displayData.fraudReports > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-1 rounded border border-red-100">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        {displayData.fraudReports} Fraud Reports
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="border border-gray-200 rounded-[6px] mb-6 bg-white p-4 -mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Side: Customer Information */}
            <div className="lg:col-span-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="017xxxxxxxx / 880..."
                      value={mobileNumber}
                      status={phoneError ? "error" : ""}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, ""));
                        setPhoneError("");
                      }}
                      suffix={
                        isCheckingCustomer ? (
                          <Spin size="small" />
                        ) : isExistingCustomer ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : null
                      }
                    />
                    {phoneError && (
                      <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                        {phoneError}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Customer Name"
                      value={customerName}
                      status={nameError ? "error" : ""}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setNameError("");
                      }}
                    />
                    {nameError && (
                      <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                        {nameError}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-3">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TextArea
                      placeholder="Enter address"
                      autoSize={{ minRows: 3, maxRows: 3 }}
                      className="rounded-lg"
                      value={address}
                      status={addressError ? "error" : ""}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setAddressError("");
                      }}
                    />
                    {addressError && (
                      <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                        {addressError}
                      </span>
                    )}
                  </div>
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
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {filteredTemplates.map((template) => (
                                <div
                                  key={template.id}
                                  className="px-3 py-1 hover:bg-gray-50 rounded-md cursor-pointer border border-gray-200 transition-colors"
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
                          />
                        </Tooltip>
                      </Dropdown>
                    </div>
                  </div>
                  <TextArea
                    placeholder="Enter shipping note"
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    className="rounded-lg"
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Extra Options */}
            <div className="lg:col-span-4 -ml-2">
              <label className="block text-sm font-medium text-gray-700 pb-2">
                Extra Options
              </label>
              <div className="border border-gray-300 rounded-lg p-3 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-gray-500 block mb-1">
                      Delivery Method
                    </span>
                    <Select
                      value={deliveryMethod}
                      onChange={(value) => {
                        setDeliveryMethod(value);
                        if (!value) {
                          setDeliveryCharge(0);
                          return;
                        }
                        const selectedOption = deliveryChargeData?.data?.find(
                          (d: any) => d.id === value,
                        );
                        if (selectedOption) {
                          setDeliveryCharge(selectedOption.deliveryCharge);
                        }
                      }}
                      size="small"
                      allowClear
                      placeholder="Select Method"
                      className="w-full"
                      options={deliveryOptions}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-gray-500 block mb-1">
                      Payment Method
                    </span>
                    <Select
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      size="small"
                      className="w-full"
                      options={[
                        {
                          value: "CASH_ON_DELIVERY",
                          label: "Cash On Delivery",
                        },
                        { value: "BKASH", label: "bKash" },
                        { value: "NAGAD", label: "Nagad" },
                        { value: "ROCKET", label: "Rocket" },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-medium text-gray-500 block mb-1">
                        Order Status
                      </span>
                      <Select
                        size="small"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder="Select Status"
                        value={orderStatus}
                        onChange={setOrderStatus}
                        className="w-full"
                        options={[
                          { value: "PENDING", label: "Pending" },
                          { value: "NO_RESPONSE", label: "No Response" },
                          {
                            value: "GOOD_BUT_NO_RESPONSE",
                            label: "Good But No Response",
                          },
                          { value: "HOLD", label: "Hold" },
                          {
                            value: "ADVANCE_REQUIRED",
                            label: "Advance Payment",
                          },
                          { value: "CONFIRM", label: "Confirm" },
                          { value: "CANCELLED", label: "Cancel" },
                        ]}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-medium text-gray-500 block mb-1">
                        Order Source
                      </span>
                      <Select
                        value={orderSource}
                        onChange={setOrderSource}
                        size="small"
                        className="w-full"
                        options={orderSourceOptions}
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <Button
                              type="default"
                              block
                              icon={<Plus size={14} />}
                              className="flex items-center justify-start text-primary hover:text-primary-hover px-2 mt-2 mb-1 py-1"
                              onClick={() => setIsOrderSourceModalOpen(true)}
                            >
                              Add New
                            </Button>
                          </>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">
                        Pre Order
                      </span>
                      <Switch
                        size="small"
                        checked={isPreorder}
                        onChange={setIsPreorder}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">
                        Cross Sale
                      </span>
                      <Switch
                        size="small"
                        checked={isCrossSale}
                        onChange={setIsCrossSale}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <div className="grid grid-cols-1 -mt-2 lg:grid-cols-12 gap-4">
            {/* Left Column: Ordered Products */}
            <div className="lg:col-span-7 h-[540px] overflow-y-auto bg-white custom-scrollbar border rounded-[6px] border-gray-200">
              <div className="border-b border-gray-200 p-4 bg-white">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">Ordered Products</span>
                  <Badge count={cartItems.length} showZero color="#1BA143" />
                </div>
              </div>
              <div className="p-4">
                <div className="max-h-[432px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
                        >
                          <img
                            src={
                              item.thumbnail
                                ? config.image_access_url + item.thumbnail.url
                                : ""
                            }
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 leading-tight">
                              <h4 className="text-[13px] font-bold text-gray-800 line-clamp-1">
                                {item.productName
                                  ? item.productName.slice(0, 20)
                                  : ""}
                                {item.name &&
                                  item.name !== item.productName && (
                                    <span className="text-primary ml-1">
                                      - {item.name}
                                    </span>
                                  )}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                                <button
                                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-gray-600 font-medium transition-all active:scale-95"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDecrementQuantity(item.id);
                                  }}
                                >
                                  -
                                </button>
                                <span className="w-8 h-6 flex items-center justify-center text-center border-x border-gray-300 text-xs font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-gray-600 font-medium transition-all active:scale-95"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIncrementQuantity(item.id);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                              <Button
                                type="default"
                                danger
                                size="small"
                                icon={<X size={14} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromCart(item.id);
                                }}
                                className="h-6 w-6 p-0 flex items-center justify-center active:scale-90 transition-all"
                              />
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="text-[13px] font-semibold text-primary flex items-center gap-1 justify-end">
                              {item.sellingPrice > item.price && (
                                <span className="text-[10px] text-gray-400 line-through mr-1">
                                  {item.sellingPrice.toLocaleString()}
                                </span>
                              )}
                              <CurrencyIcon
                                size={12}
                                className="text-primary"
                              />
                              {(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Plus className="w-8 h-8 text-gray-400" />
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

            {/* Right Column: Add Products */}
            <div className="lg:col-span-5">
              <div className="border border-gray-200 rounded-[6px] mb-6 bg-white">
                <div className="border-b border-gray-200 p-4">
                  <span className="font-bold text-lg">
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
                    />
                    <Button
                      type={isFeaturedOnly ? "primary" : "default"}
                      onClick={() => setIsFeaturedOnly(!isFeaturedOnly)}
                      className="rounded-lg w-32 h-10 flex items-center justify-center gap-2"
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
                    {isProductsFetching && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader />
                      </div>
                    )}
                    {isProductsLoading ? (
                      <div className="text-center py-4">
                        <Loader />
                      </div>
                    ) : products.length > 0 ? (
                      products.map((product: any) => (
                        <OrderProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
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
            </div>
          </div>

          <div className="border -mt-2 border-gray-200 rounded-[6px] bg-white p-4">
            <div className="space-y-4">
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
                      const maxAllowedDiscount = subTotal + deliveryCharge;

                      if (val > maxAllowedDiscount) {
                        setDiscountError(`Max: ${maxAllowedDiscount}`);
                      } else {
                        setDiscountError("");
                      }

                      setDiscount(val);

                      // Re-validate Extra Discount
                      const maxAllowedExtraDiscount =
                        subTotal + deliveryCharge - val;
                      if (extraDiscount > maxAllowedExtraDiscount) {
                        setExtraDiscountError(
                          `Max: ${maxAllowedExtraDiscount}`,
                        );
                      } else {
                        setExtraDiscountError("");
                      }

                      // Also re-validate advance since grand total changed
                      const newGrandTotal =
                        subTotal + deliveryCharge - val - extraDiscount;
                      if (advance > newGrandTotal) {
                        setAdvanceError(`Max: ${newGrandTotal}`);
                      } else {
                        setAdvanceError("");
                      }
                    }}
                  />
                  {discountError && (
                    <div className="text-[10px] text-red-500 font-bold mt-1">
                      {discountError}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
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
                      const subTotal = calculateTotal();
                      const grandTotal =
                        subTotal + deliveryCharge - discount - extraDiscount;
                      if (val > grandTotal) {
                        setAdvanceError(`Max: ${grandTotal}`);
                      } else {
                        setAdvanceError("");
                      }
                      setAdvance(val);
                    }}
                  />
                  {advanceError && (
                    <div className="text-[10px] text-red-500 font-bold mt-1">
                      {advanceError}
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
                    value={deliveryCharge}
                    onChange={(value) => setDeliveryCharge(value || 0)}
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
                    status={extraDiscountError ? "error" : ""}
                    value={extraDiscount}
                    onChange={(value) => {
                      const val = value || 0;
                      const subTotal = calculateTotal();
                      const maxAllowedExtraDiscount =
                        subTotal + deliveryCharge - discount;

                      if (val > maxAllowedExtraDiscount) {
                        setExtraDiscountError(
                          `Max: ${maxAllowedExtraDiscount}`,
                        );
                      } else {
                        setExtraDiscountError("");
                      }
                      setExtraDiscount(val);

                      // Also re-validate advance since grand total changed
                      const newGrandTotal =
                        subTotal + deliveryCharge - discount - val;
                      if (advance > newGrandTotal) {
                        setAdvanceError(`Max: ${newGrandTotal}`);
                      } else {
                        setAdvanceError("");
                      }
                    }}
                  />
                  {extraDiscountError && (
                    <div className="text-[10px] text-red-500 font-bold mt-1">
                      {extraDiscountError}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-red-400 mb-1">
                    Grand Total
                  </label>
                  <Input
                    className="w-full bg-blue-50 text-[#1BA143] font-bold"
                    value={
                      (Number(calculateTotal()) || 0) +
                      (Number(deliveryCharge) || 0) -
                      (Number(discount) || 0) -
                      (Number(extraDiscount) || 0) -
                      (Number(advance) || 0)
                    }
                    readOnly
                    prefix={<CurrencyIcon size={12} className="text-red-500" />}
                  />
                </div>
              </div>

              <Button
                type="primary"
                block
                size="middle"
                className="h-12 bg-[#1BA143] mt-3 hover:bg-[#1BA143]/90 border-[#1BA143] font-bold text-lg"
                onClick={handleSubmit}
                loading={isCompleting || isUpdating}
              >
                {createdOrderId ? "Update Order" : "Confirm Order"} (
                <CurrencyIcon size={14} className="text-white" />
                {(
                  (Number(calculateTotal()) || 0) +
                  (Number(deliveryCharge) || 0) -
                  (Number(discount) || 0) -
                  (Number(extraDiscount) || 0) -
                  (Number(advance) || 0)
                ).toLocaleString()}
                )
              </Button>
            </div>
          </div>
        </div>
      </div>

      <OrderSourceModal
        open={isOrderSourceModalOpen}
        onClose={() => setIsOrderSourceModalOpen(false)}
        initialValues={null}
      />

      <ShippingNoteModal
        open={isShippingNoteModalOpen}
        onClose={() => setIsShippingNoteModalOpen(false)}
        initialValues={null}
      />

      <CustomerCourierOrdersModal
        open={customerCourierOrdersModalOpen}
        onClose={() => setCustomerCourierOrdersModalOpen(false)}
        data={customerOrderDetails}
        phoneHint={mobileDigits}
      />
    </>
  );
};

export default IncompleteOrderDetails;

// incomplete order  use how to create completed order and this time update  and  send  update this product
