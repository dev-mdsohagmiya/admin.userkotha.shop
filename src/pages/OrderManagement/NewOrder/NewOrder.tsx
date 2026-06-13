import { Plus } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Dropdown,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
  Tooltip,
} from "antd";
import { CheckCircle, Search, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader } from "../../../components/common/Loading";
import PageMeta from "../../../components/common/Meta/PageMeta";
import CustomerCourierOrdersModal from "../../../components/common/Modals/OrderManagement/CustomerCourierOrdersModal";
import OrderSourceModal from "../../../components/common/Modals/OrderManagement/OrderSourceModal";
import ShippingNoteModal from "../../../components/common/Modals/OrderManagement/ShippingNoteModal";
import OrderProductCard from "../../../components/OrderManagement/OrderProductCard";
import { config } from "../../../config";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { useCheckFraudQuery } from "../../../redux/features/courier/courierApi";
import { useCheckCustomerByPhoneQuery } from "../../../redux/features/customers/customersApi";
import {
  addToCart,
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../../../redux/features/newOrder/newOrderCartSlice";
import {
  useCreateAdminOrderMutation,
  useMyWebsiteOrderSpecifyCustomerOrderListQuery,
} from "../../../redux/features/order/orderApi";
import { useGetAllOrderSourcesQuery } from "../../../redux/features/orderSource/orderSourceApi";
import { useGetEcommerceProductListQuery } from "../../../redux/features/product/productApi";
import { useGetAllShippingNotesQuery } from "../../../redux/features/shippingNote/shippingNoteApi";
import { RootState } from "../../../redux/features/store";
import { CurrencyIcon } from "../../../utils/currency";

const { TextArea } = Input;

const NewOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.newOrderCart.items);
  const { hasCreate, isProfileLoading } = useModulePermissions("New Orders");

  const [searchInput, setSearchInput] = useState(""); // User input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced value for API
  const [shippingNote, setShippingNote] = useState(""); // Shipping note value
  const [templateSearch, setTemplateSearch] = useState(""); // Template search

  // Form inputs
  const [mobileNumber, setMobileNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("STEADFAST");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [address, setAddress] = useState("");
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [advancePaymentDeliveryMethod, setAdvancePaymentDeliveryMethod] =
    useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
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
  const [discountError, setDiscountError] = useState("");
  const [advanceError, setAdvanceError] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");

  // Create Order Mutation
  const [createAdminOrder, { isLoading: isCreatingOrder }] =
    useCreateAdminOrderMutation();

  // Debounce phone number for API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhone(mobileNumber);
    }, 500);
    return () => clearTimeout(timer);
  }, [mobileNumber]);

  // Customer check API - only triggers when phone number is valid (11 digits starting with 01)
  const isValidPhone =
    debouncedPhone.length === 11 && debouncedPhone.startsWith("01");
  const hasValidMobileInput =
    mobileNumber.length >= 11 && mobileNumber.startsWith("01");
  const { data: customerData, isLoading: isCheckingCustomer } =
    useCheckCustomerByPhoneQuery(debouncedPhone, { skip: !isValidPhone });

  // Fraud Check API
  const { data: fraudData } = useCheckFraudQuery(debouncedPhone, {
    skip: !isValidPhone,
  });

  // My Website Order Specify Customer Order List
  const { data: customerOrderData } =
    useMyWebsiteOrderSpecifyCustomerOrderListQuery(debouncedPhone, {
      skip: !isValidPhone,
    });
  const orderCountData = customerOrderData?.summary || {};
  const customerOrderDetails = customerOrderData?.data;

  const fraudInfo = fraudData?.data;

  // API Hooks for templates and sources
  const { data: shippingNotesData } = useGetAllShippingNotesQuery();
  const { data: sourcesData } = useGetAllOrderSourcesQuery();

  const shippingNoteTemplates =
    shippingNotesData?.data?.filter((note) => note.isActive) || [];
  const orderSourceOptions =
    sourcesData?.data
      ?.filter((source) => source.isActive)
      ?.map((source) => ({
        value: source.id || source.name,
        label: (
          <div className="flex items-center gap-2">
            {source.icon && (
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <i className={source.icon} style={{ fontSize: "12px" }}></i>
              </div>
            )}
            <span>{source.name}</span>
          </div>
        ),
      })) || [];

  // Filter templates based on search
  const filteredTemplates = shippingNoteTemplates.filter((template) =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase()),
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Auto-fill customer data when found
  useEffect(() => {
    if (!isValidPhone) {
      setIsExistingCustomer(false);
      setCustomerId(null);
      return;
    }

    if (customerData?.data) {
      const customer = customerData.data;
      console.log("customer", customer);
      setCustomerName(customer.name || "");
      setAddress(customer.address || "");
      setIsExistingCustomer(true);
      setCustomerId(customer.id);
    } else if (customerData && !customerData.data) {
      setIsExistingCustomer(false);
      setCustomerId(null);
    }
  }, [customerData, isValidPhone]);

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
  const handleAddToCart = (product: any, variant: any) => {
    const cartItem = {
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
    };

    dispatch(addToCart(cartItem));
  };

  const handleRemoveFromCart = (variantId: string) => {
    dispatch(removeFromCart(variantId));
  };

  const handleIncrementQuantity = (variantId: string) => {
    dispatch(incrementQuantity(variantId));
  };

  const handleDecrementQuantity = (variantId: string) => {
    dispatch(decrementQuantity(variantId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setPhoneError("");
    setNameError("");
    setAddressError("");
    setDiscountError("");
    setAdvanceError("");

    // Validation
    let hasError = false;

    const bdPhoneRegex = /^01\d{9}$/;
    if (!mobileNumber) {
      setPhoneError("Phone number is required");
      hasError = true;
    } else if (!bdPhoneRegex.test(mobileNumber)) {
      setPhoneError("Must be a valid Bangladeshi number (e.g., 01xxxxxxxxx)");
      hasError = true;
    }

    if (!customerName.trim()) {
      setNameError("Customer name is required");
      hasError = true;
    }

    if (!address.trim()) {
      setAddressError("Customer address is required");
      hasError = true;
    }

    if (cartItems.length === 0) {
      toast.error("Please add at least one product to cart");
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

    if (advance > finalGrandTotal) {
      setAdvanceError(`Max: ${finalGrandTotal > 0 ? finalGrandTotal : 0}`);
      hasError = true;
    }

    const totalAfterAdvance = finalGrandTotal - advance;
    if (totalAfterAdvance < 0) {
      toast.error(
        "Grand Total cannot be negative. Please check discounts and advance.",
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Format order data for API
    const orderPayload: any = {
      customerId: customerId || undefined,
      customerPhone: mobileNumber,
      customerName,
      customerAddress: address,
      products: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.id,
      })),
      deliveryMethod,
      deliveryCharge,
      paymentMethod,
      orderSourceId: orderSource !== "unknown" ? orderSource : undefined,
      shippingNote,
      isPreorder,
      isCrossSale,
      discount,
      extraDiscount: extraDiscount || 0,
      advance,
      advancePaymentDeliveryMethod,
      transactionId,
      status: "CONFIRM",
    };

    console.log("order Payload", orderPayload);

    try {
      const res = await createAdminOrder(orderPayload).unwrap();
      console.log("order Response", res);
      if (res.success) {
        toast.success(res.message || "Order created successfully!");
        // Reset form after successful order
        setMobileNumber("");
        setCustomerName("");
        setAddress("");
        setDiscount(0);
        setAdvance(0);
        setAdvancePaymentDeliveryMethod(null);
        setTransactionId("");
        setDeliveryCharge(0);
        setExtraDiscount(0);
        setShippingNote("");
        setIsPreorder(false);
        setIsCrossSale(false);
        setDeliveryMethod("STEADFAST");
        setPhoneError("");
        setNameError("");
        setAddressError("");
        // Clear cart
        dispatch(clearCart());

        // Navigate to Approved tab
        navigate("/orders/complete", { state: { activeTab: "CONFIRM" } });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create order");
    }
  };
  if (!hasCreate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-4 md:pb-10 mt-3">
        <PageMeta
          title="New Order"
          description="Create a new order for Amzad Food"
        />

        {/* Stats Cards */}
        {hasValidMobileInput && (
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
                </div>
              );
            })}
          </div>
        )}
        <div className="border border-gray-200 rounded-[6px] mb-6 bg-white p-4">
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
                      placeholder="Enter Your Mobile Number"
                      value={mobileNumber}
                      status={phoneError ? "error" : ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // Only digits
                        setMobileNumber(value);
                        setPhoneError(""); // Clear error on typing
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
                    {isExistingCustomer && !phoneError && (
                      <span className="text-[10px] text-primary absolute -bottom-4 left-0">
                        Existing Customer
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
                        setNameError(""); // Clear error on typing
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
                        setAddressError(""); // Clear error on typing
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
                          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-80">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  -mt-1">
                {/* Advance Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Advance Payment Method
                  </label>
                  <Select
                    className="w-full"
                    placeholder="Select Payment Method"
                    value={advancePaymentDeliveryMethod}
                    onChange={(val) => setAdvancePaymentDeliveryMethod(val)}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    allowClear
                    options={[
                      { value: "Nagad", label: "Nagad" },
                      { value: "bKash", label: "bKash" },
                      { value: "Rocket", label: "Rocket" },
                      { value: "Bank", label: "Bank" },
                      { value: "Other", label: "Other" },
                    ]}
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Transaction ID
                  </label>
                  <Input
                    placeholder="e.g., 70XD4530"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Advance Amount
                  </label>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="0"
                    status={advanceError ? "error" : ""}
                    value={advance}
                    type="number"
                    onChange={(value) => {
                      const val = value || 0;
                      const subTotal = calculateTotal();
                      const currentGrandTotal =
                        subTotal +
                        deliveryCharge -
                        discount -
                        (extraDiscount || 0);

                      if (val > currentGrandTotal) {
                        setAdvanceError(
                          `Max: ${currentGrandTotal > 0 ? currentGrandTotal : 0}`,
                        );
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
              </div>
            </div>

            {/* Right Side: Extra Options */}
            <div className="lg:col-span-4 -ml-2">
              <label className="block text-sm font-medium text-gray-700 pb-2">
                Extra Options
              </label>
              <div className="border border-gray-300 rounded-lg p-3 space-y-4">
                {/* Delivery Method & Payment Method side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 pb-2">
                      Delivery Method
                    </label>
                    <Select
                      value={deliveryMethod || undefined}
                      onChange={(value) => setDeliveryMethod(value)}
                      size="middle"
                      className="w-full"
                      placeholder="Method"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={[
                        { value: "OFFICE_DELIVERY", label: "Office Delivery" },
                        { value: "STEADFAST", label: "Steadfast Delivery" },
                        { value: "PATHAO", label: "Pathao Delivery" },
                        { value: "OTHER", label: "Other Delivery" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 pb-2">
                      Payment Method
                    </label>
                    <Select
                      value={paymentMethod}
                      onChange={(value) => setPaymentMethod(value)}
                      size="middle"
                      className="w-full"
                      placeholder="Payment"
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
                  <div className="">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 pb-2">
                        Order Source
                      </label>
                      <Select
                        value={orderSource}
                        onChange={(value) => setOrderSource(value)}
                        size="middle"
                        className="w-full"
                        options={orderSourceOptions}
                        placeholder="Select Source"
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

                  <div className="flex flex-col  gap-4 pt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">
                        Pre Order
                      </span>
                      <Switch
                        size="default"
                        checked={isPreorder}
                        onChange={setIsPreorder}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">
                        Cross Sale
                      </span>
                      <Switch
                        size="default"
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
            {/* Left Column: Customer Form & Ordered Products */}
            <div className="lg:col-span-7 h-[540px] overflow-y-auto bg-white custom-scrollbar border rounded-[6px] border-gray-200">
              <div className="border-b border-gray-200 p-4 bg-white">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">Ordered Products</span>
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
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border pr-4 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                        >
                          {/* Product Image */}
                          <img
                            src={config.image_access_url + item.thumbnail?.url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 flex-shrink-0"
                          />

                          {/* Product Info & Quantity Controls */}
                          <div className="flex-1 min-w-0">
                            {/* Product Name & Variant */}
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

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                                <button
                                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-medium transition-colors"
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
                                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-medium transition-colors"
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
                                type="default"
                                danger
                                size="small"
                                icon={<X size={14} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromCart(item.id);
                                }}
                                className="h-6 w-6 p-0 flex items-center justify-center"
                              />
                            </div>
                          </div>

                          {/* Price on Right */}
                          <div className="flex-shrink-0 text-right">
                            <div className="text-[13px] font-semibold text-primary flex items-center gap-1 justify-end">
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
                    type="number"
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

                      // Re-validate advance
                      const newGrandTotal =
                        subTotal + deliveryCharge - val - (extraDiscount || 0);
                      if (advance > newGrandTotal) {
                        setAdvanceError(
                          `Max: ${newGrandTotal > 0 ? newGrandTotal : 0}`,
                        );
                      } else {
                        setAdvanceError("");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
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
                    Sub Total
                  </label>
                  <Input
                    className="w-full bg-gray-50"
                    value={calculateTotal()}
                    style={{ width: "100%" }}
                    readOnly
                    disabled
                    type="number"
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
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
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
                    value={extraDiscount}
                    onChange={(value) => {
                      const val = value || 0;
                      setExtraDiscount(val);

                      // Re-validate advance
                      const subTotal = calculateTotal();
                      const newGrandTotal =
                        subTotal + deliveryCharge - discount - val;
                      if (advance > newGrandTotal) {
                        setAdvanceError(
                          `Max: ${newGrandTotal > 0 ? newGrandTotal : 0}`,
                        );
                      } else {
                        setAdvanceError("");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-red-400 mb-1">
                    Grand Total
                  </label>
                  <Input
                    className="w-full bg-blue-50 text-[#1BA143] font-bold"
                    value={
                      calculateTotal() +
                      deliveryCharge -
                      discount -
                      extraDiscount -
                      advance
                    }
                    status={
                      calculateTotal() +
                        deliveryCharge -
                        discount -
                        extraDiscount -
                        advance <
                      0
                        ? "error"
                        : ""
                    }
                    disabled
                    type="number"
                    readOnly
                    prefix={<CurrencyIcon size={12} className="text-red-500" />}
                  />
                  {calculateTotal() +
                    deliveryCharge -
                    discount -
                    extraDiscount -
                    advance <
                    0 && (
                    <div className="text-[10px] text-red-500 font-bold mt-1">
                      Grand Total cannot be negative
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="primary"
                block
                size="middle"
                className="h-12 bg-[#1BA143] mt-3 hover:bg-[#1BA143]/90 border-[#1BA143] font-bold text-lg"
                onClick={handleSubmit}
                loading={isCreatingOrder}
                disabled={isCreatingOrder || !hasCreate}
              >
                Create Order (
                <CurrencyIcon size={14} className="text-white" />
                {(
                  calculateTotal() +
                  deliveryCharge -
                  discount -
                  extraDiscount -
                  advance
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
        phoneHint={mobileNumber.replace(/\D/g, "")}
      />
    </>
  );
};

export default NewOrder;
