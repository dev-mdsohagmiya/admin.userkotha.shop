import React, { useState, useCallback, useMemo, useRef } from "react";
import { Search, Info, X, MoreVertical, Printer, Box } from "lucide-react";
import { Popover, Tooltip, Tag, Progress, Dropdown, Button, Input } from "antd";
import { FiCopy, FiCheckCircle } from "react-icons/fi";
import { FaPhone } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { CurrencyIcon } from "../../../utils/currency";
import { config } from "../../../config";
import { useGetCompletedOrdersQuery } from "../../../redux/features/order/orderApi";
import { DataTable } from "../../../components/common/Tables";
import PageMeta from "../../../components/common/Meta/PageMeta";
import { debounce } from "../../../utils/debounce";
import OrderStickerPrint from "../../../components/common/CommonPrintCsvAndPdf/OrderStickerPrint";
import OrderInvoicePrint from "../../../components/common/CommonPrintCsvAndPdf/OrderInvoicePrint";
import { OrderStatus } from "../../../types/order";

export default function SearchOrder() {
  const [activeTab, setActiveTab] = useState("All Fields");
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

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

    const customerInfo = `Name: ${name || "N/A"}\nMobile: ${phone || "N/A"}\nAddress: ${address || "N/A"}`;

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

  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    const zeroOneIndex = cleaned.indexOf("01");
    if (zeroOneIndex !== -1) {
      cleaned = cleaned.substring(zeroOneIndex);
    }
    return "88" + cleaned;
  };

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500)
  ).current;

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debounceSearch(value);
    },
    [debounceSearch]
  );

  const clearSearch = () => {
    setInputValue("");
    setSearchText("");
    setPage(1);
    setSelectedOrderIds([]);
  };

  const { data: searchData, isLoading } = useGetCompletedOrdersQuery(
    [
      { name: "page", value: page.toString() },
      { name: "limit", value: limit.toString() },
      searchText && { name: "search", value: searchText },
    ].filter(Boolean),
    {
      skip: !searchText,
    }
  );

  const orders = useMemo(() => searchData?.data || [], [searchData]);
  const meta = useMemo(() => searchData?.meta || { total: 0, page: 1, limit: 10 }, [searchData]);

  const getStatusColor = (status: OrderStatus | undefined) => {
    if (!status) return "gray";
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

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return "N/A";
    const labels: Record<string, string> = {
      PENDING: "Pending",
      HOLD: "Hold",
      CONFIRM: "Confirm",
      NO_RESPONSE: "No Response",
      GOOD_BUT_NO_RESPONSE: "Good But No Response",
      ADVANCE_REQUIRED: "Advance Required",
      CANCELLED: "Cancelled",
      PROCESSING: "Processing",
      DELIVERED: "Delivered",
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string) => {
        return (
          <div className="block">
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
          </div>
        );
      },
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

        const customerName =
          record.customer?.name ||
          record.user?.customerProfile?.name ||
          record.user?.name;
        const customerPhone =
          record.customer?.phone ||
          record.user?.customerProfile?.phone ||
          record.user?.phone;
        const customerAddress = record.address || record.shippingAddress;

        return (
          <div
            className="flex flex-col gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Name Row with Edit & Copy */}
            <div className="flex items-center gap-2">
              <span
                className="font-medium text-gray-900 truncate flex-1 min-w-0"
              >
                {customerName || "N/A"}
              </span>

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
                return dateB - dateA;
              })[0]
            : null;

        const description = latestFollowUp?.description || record.description || record.note || "N/A";

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

            <Tooltip title={description} placement="topLeft">
              <div className="text-xs text-gray-600 line-clamp-2 max-w-[200px] cursor-pointer">
                {description}
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
        const items = record.orderProducts || record.checkoutProducts || record.products || [];
        if (items.length === 0)
          return <span className="text-gray-400">No items</span>;

        const firstItem = items[0];

        const renderItem = (item: any) => {
          const isCombo = !!item.comboProduct;
          const mainProduct = isCombo ? item.comboProduct : item.product;
          const variant = isCombo ? item.comboVariant : item.variant;
          const imgUrl = mainProduct?.thumbnail?.url || item.thumbnail || "";

          return (
            <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {imgUrl ? (
                  <img
                    src={
                      imgUrl.startsWith("http")
                        ? imgUrl
                        : config.image_access_url ? config.image_access_url + imgUrl : imgUrl
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
                  {mainProduct?.name || item.productName || item.name || "Unknown Product"}
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
            <div
              className="flex items-center gap-3 group p-1 rounded-lg transition-colors border border-transparent"
            >
              <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden  transition-colors">
                {(() => {
                  const imgUrl =
                    firstItem.product?.thumbnail?.url ||
                    firstItem.comboProduct?.thumbnail?.url || firstItem.thumbnail;
                  if (!imgUrl)
                    return (
                      <span className="text-xs text-gray-400 font-bold">
                        {(
                          firstItem.product?.name ||
                          firstItem.comboProduct?.name ||
                          firstItem.productName ||
                          firstItem.name ||
                          "P"
                        ).charAt(0)}
                      </span>
                    );
                  return (
                    <img
                      src={
                        imgUrl.startsWith("http")
                          ? imgUrl
                          : config.image_access_url ? config.image_access_url + imgUrl : imgUrl
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 leading-relaxed py-0.5 overflow-hidden">
                  <span className="text-[13px] font-bold text-gray-800 line-clamp-1 transition-colors">
                    {firstItem.product?.name ||
                      firstItem.comboProduct?.name ||
                      firstItem.productName ||
                      firstItem.name ||
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
            </div>
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
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-[#1BA143]/10 text-[#1BA143] px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-[#1BA143]/20">
                {record.deliveryMethod || record.courierTitle || "N/A"}
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
        </div>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 80,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, record: any) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "print_invoice",
                label: "Print Invoice",
                icon: <Printer size={16} />,
                onClick: () => OrderInvoicePrint.printBulk([record]),
              },
              {
                key: "print_sticker",
                label: "Print Sticker",
                icon: <Box size={16} />,
                onClick: () => OrderStickerPrint.print([record]),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="pb-10 search-order-page">
      <style>{`
        .search-order-page .ant-table-tbody > tr.ant-table-row:hover > td {
          cursor: default !important;
        }
        .search-order-page .ant-table-cell-row-hover {
          cursor: default !important;
        }
      `}</style>
      <PageMeta title="Search Orders" description="Search and filter through all orders" />

      {/* Modern Search Header matching the Request */}
      <div className="bg-white border border-gray-200 rounded-lg dark:border-gray-800 pt-4 px-4 pb-4 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Search Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Search by Invoice, Phone Number, Customer Name, or Courier ID</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedOrderIds.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <Button
                  size="small"
                  icon={<Printer size={14} />}
                  onClick={() => OrderInvoicePrint.printBulk(orders.filter((o: any) => selectedOrderIds.includes(o.id)))}
                  type="primary"
                  className="bg-primary hover:bg-primary/90"
                >
                  Invoice ({selectedOrderIds.length})
                </Button>
                <Button
                  size="small"
                  icon={<Box size={14} />}
                  onClick={() => OrderStickerPrint.print(orders.filter((o: any) => selectedOrderIds.includes(o.id)))}
                  className="border-gray-300"
                >
                  Sticker ({selectedOrderIds.length})
                </Button>
                <Button
                  size="small"
                  icon={<X size={14} />}
                  onClick={() => setSelectedOrderIds([])}
                  variant="outlined"
                  danger
                >
                  Clear
                </Button>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors cursor-pointer text-sm font-medium">
              <Info className="w-4 h-4" />
              <span>How to use search?</span>
            </div>
          </div>
        </div>

        {/* Mock Tabs */}
        <div className="flex gap-6 border-b border-gray-100 dark:border-gray-800 mb-6">
          {["All Fields", "Invoice", "Mobile Number"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 -mb-[1px] text-[13px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-primary border-primary"
                  : "text-gray-500 hover:text-gray-700 border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Big Search Input */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <Input
            value={inputValue}
            onChange={handleSearch}
            placeholder="Search by invoice, phone, name, or courier ID..."
            className="w-full h-9.5 !ml-1 !pl-10 pr-10 text-base rounded-md border-gray-300 hover:border-primary focus:border-primary"
          />
          {inputValue && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {searchText ? (
        <div className="">
          <DataTable
            selectRow={true}
            selectedRowKeys={selectedOrderIds}
            setSelectedRows={setSelectedOrderIds}
            loading={isLoading}
            data={orders}
            columns={columns}
            rowKey="id"
            isPaginate={meta?.total > 10}
            currentPage={page}
            setCurrentPage={(p: number) => setPage(p)}
            limit={limit}
            setLimit={(l: number) => setLimit(l)}
            showSizeChanger={meta?.total > 10}
            total={meta?.total || 0}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Begin Searching</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Enter an invoice number, customer phone, name, or courier ID in the search bar above to view relevant orders.
          </p>
        </div>
      )}
    </div>
  );
}
