import { useState } from "react";
import { Input, Button, Tooltip, Popover, Tag, Progress } from "antd";

import { Search, RefreshCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiCopy } from "react-icons/fi";
import { FaPhone } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";

import { useGetIncompleteCheckoutOrdersQuery } from "../../../redux/features/order/orderApi";
import { IUncompletedOrder } from "../../../types/uncompletedOrder";
import { DataTable } from "../../../components/common/Tables";
import PageListPrint from "../../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { CurrencyIcon } from "../../../utils/currency";
import CustomDatePicker from "../../../components/common/Date/CustomDatePicker";
import { getDefaultDateRange } from "../../../utils/dateRange";

const IncompleteOrderList = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>(
    getDefaultDateRange(),
  );
  const navigate = useNavigate();

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

  const handleCopyCustomerInfo = (
    e: React.MouseEvent,
    record: IUncompletedOrder,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const info = `Name: ${record.customerName || "N/A"}\nPhone: ${record.customerPhone || "N/A"}\nAddress: ${record.customerAddress || "N/A"}`;
    navigator.clipboard.writeText(info).then(() => {
      setCopiedOrderId(record.id);
      setTimeout(() => setCopiedOrderId(null), 2000);
    });
  };

  const {
    data: incompleteOrdersData,
    isLoading,
    refetch,
    isFetching,
  } = useGetIncompleteCheckoutOrdersQuery(
    [
      dateRange[0] && { name: "startDate", value: dateRange[0] },
      dateRange[1] && { name: "endDate", value: dateRange[1] },
    ].filter(Boolean),
  );

  const handleRefresh = async () => {
    await refetch();
  };

  const incompleteOrders: IUncompletedOrder[] =
    incompleteOrdersData?.data || [];

  const filteredOrders = incompleteOrders.filter((order) => {
    const searchLow = searchText.toLowerCase();
    return (
      order.customerPhone?.toLowerCase().includes(searchLow) ||
      order.customerName?.toLowerCase().includes(searchLow) ||
      (order.customerAddress &&
        order.customerAddress.toLowerCase().includes(searchLow))
    );
  });

  const printableData = filteredOrders.map((order, index) => ({
    SL: index + 1,
    Customer: order.customerName || "N/A",
    Phone: order.customerPhone || "N/A",
    Address: order.customerAddress || "N/A",
    Total: (
      order.checkoutProducts?.reduce(
        (sum, item) => sum + (item.sellingPrice || 0) * (item.quantity || 1),
        0,
      ) || 0
    ).toLocaleString(),
    Date: new Date(order.createdAt).toLocaleDateString(),
  }));

  const paginatedData = filteredOrders.slice((page - 1) * limit, page * limit);

  const columns: ColumnsType<IUncompletedOrder> = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string, record: any) => (
        <Link
          to={`/orders/incomplete/${record.id}`}
          className="block hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
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
      ),
    },
    {
      title: "Customer Info",
      key: "customerInfo",
      width: 250,
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_, record) => (
        <div
          className="flex items-start gap-2 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to={`/orders/incomplete/${record.id}`}
            className="flex-1 min-w-0 hover:opacity-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {record.customerName || "N/A"}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{record.customerPhone || "N/A"}</span>
                {record.customerPhone && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <Tooltip title="Call">
                      <a
                        href={`tel:${record.customerPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#007bff] hover:text-[#0056b3] transition-colors"
                      >
                        <FaPhone className="w-3.5 h-3.5" />
                      </a>
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsApp(record.customerPhone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#25D366] hover:text-[#128C7E] transition-colors ml-1"
                      >
                        <IoLogoWhatsapp className="w-5 h-5" />
                      </a>
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-0.5">
                <svg
                  className="w-3 h-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="line-clamp-1 truncate max-w-[200px]">
                  {record.customerAddress || "N/A"}
                </span>
              </div>
            </div>
          </Link>
          <Tooltip
            title={
              copiedOrderId === record.id ? "Copied!" : "Copy customer info"
            }
          >
            <Button
              size="small"
              type={copiedOrderId === record.id ? "primary" : "text"}
              icon={
                copiedOrderId === record.id ? null : (
                  <FiCopy className="text-gray-500" />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCustomerInfo(e, record);
              }}
              className={`flex-shrink-0 ${copiedOrderId === record.id ? "bg-green-500 hover:bg-green-600 border-green-500" : "hover:bg-gray-100"}`}
            >
              {copiedOrderId === record.id && (
                <span className="text-[10px] font-semibold text-white">
                  Copied
                </span>
              )}
            </Button>
          </Tooltip>
        </div>
      ),
    },

    {
      title: "Products",
      key: "products",
      width: 220,
      render: (_: any, record: IUncompletedOrder) => {
        const items = record.checkoutProducts || [];
        if (items.length === 0)
          return <span className="text-gray-400">No items</span>;

        const firstItem = items[0];

        const renderItem = (item: any) => {
          return (
            <div className="py-2 border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {item.productName || "Unknown Product"}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] font-medium text-gray-500">
                    Qty: {item.quantity}
                  </span>
                  <div className="flex flex-col items-end">
                    {item.discountPrice &&
                    item.discountPrice < item.sellingPrice ? (
                      <>
                        <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                          <CurrencyIcon size={12} className="text-green-600" />
                          {item.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-gray-400 line-through flex items-center gap-1">
                          <CurrencyIcon size={10} className="text-gray-400" />
                          {item.sellingPrice.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                        <CurrencyIcon size={12} className="text-green-600" />
                        {(item.sellingPrice || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        };

        const popoverContent = (
          <div className="w-72 max-h-80 overflow-y-auto custom-scrollbar pr-1 px-1">
            {items.map((item: any, idx: number) => (
              <div key={idx}>{renderItem(item)}</div>
            ))}
          </div>
        );

        return (
          <Popover
            content={popoverContent}
            title={
              <span className="font-semibold text-gray-800">
                Checkout Items ({items.length})
              </span>
            }
            trigger="hover"
            placement="left"
          >
            <div className="cursor-pointer group p-1 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">
                  {firstItem.productName || "Product"}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-semibold text-green-600 flex items-center gap-1">
                    <CurrencyIcon size={13} className="text-green-600" />
                    {(
                      firstItem.discountPrice ||
                      firstItem.sellingPrice ||
                      0
                    ).toLocaleString()}
                  </span>
                  {items.length > 1 && (
                    <Tag className="m-0 text-[10px] border-primary/20 bg-primary/5 text-primary font-semibold px-1.5 leading-4">
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
      render: (_: any, record: IUncompletedOrder) => {
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
      width: 150,
      render: (_, record) => {
        const total =
          record.checkoutProducts?.reduce((sum, item) => {
            const effectivePrice =
              item.discountPrice || item.offerPrice || item.sellingPrice || 0;
            return sum + effectivePrice * (item.quantity || 1);
          }, 0) || 0;

        return (
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-1 text-green-600 font-semibold text-base">
              <CurrencyIcon size={18} className="text-green-600" />
              <span>{total.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5 px-0.5">
              Total Payable
            </div>
          </div>
        );
      },
    },

    {
      title: "Actions",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_, record) => (
        <div
          className="flex justify-center items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="View Details">
            <Link
              to={`/orders/incomplete/${record.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="middle"
                icon={<FiEye />}
                className="hover:text-primary hover:border-primary border-gray-200"
              />
            </Link>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Incomplete Orders | UserKotha.Shop"
        description="List of incomplete orders"
      />
      <PageHeader
        title="Incomplete Orders"
        subtitle="List of incomplete orders"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Orders" },
          { title: "Incomplete" },
        ]}
        extra={
          <div className="flex items-center gap-2">
            <PageListPrint
              tableData={printableData}
              fileName="Uncompleted Orders"
            />
            <Button
              type="default"
              icon={<RefreshCcw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
        }
      />
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input
            placeholder="Search by name, phone..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            onChange={(e) => setSearchText(e.target.value)}
            size="middle"
            allowClear
            className="max-w-md min-w-[200px]"
          />
          <div>
            <CustomDatePicker
              selectedData={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <DataTable
        selectRow={true}
        loading={isLoading || isFetching}
        data={paginatedData}
        columns={columns}
        rowKey="id"
        isPaginate={filteredOrders.length > limit}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={filteredOrders.length > limit}
        total={filteredOrders.length}
        onRow={(record: any) => ({
          onClick: (e: React.MouseEvent) => {
            const url = `/orders/incomplete/${record.id}`;
            if (e.ctrlKey || e.metaKey) {
              window.open(url, "_blank");
            } else {
              navigate(url);
            }
          },
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
};

export default IncompleteOrderList;