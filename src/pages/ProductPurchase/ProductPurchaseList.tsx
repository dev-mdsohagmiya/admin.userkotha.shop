import { Button, Input, Modal, Popover, Space, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { RefreshCcw, Search } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { FiEdit, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import CustomDatePicker from "../../components/common/Date/CustomDatePicker";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateProductPurchaseModal from "../../components/common/Modals/ProductPurchase/CreateProductPurchaseModal";
import UpdateProductPurchaseModal from "../../components/common/Modals/ProductPurchase/UpdateProductPurchaseModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import {
  useDeleteProductPurchaseMutation,
  useGetAllProductPurchasesQuery,
} from "../../redux/features/product-purchase/productPurchaseApi";
import { DisplayCurrency, formatCurrencyLocale } from "../../utils/currency";
import { debounce } from "../../utils/debounce";

const { confirm } = Modal;

type PurchaseProduct = {
  id: string;
  name: string;
  sku?: string | null;
};

type PurchaseItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: PurchaseProduct;
};

type PurchaseSupplier = {
  name: string;
  phone1?: string | null;
  supplierCode?: string | null;
};

type ProductPurchaseRecord = {
  id: string;
  purchaseId?: string | null;
  purchaseDate: string;
  createdAt: string;
  totalAmount: number;
  discount: number;
  tax: number;
  finalAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  items?: PurchaseItem[];
  supplier?: PurchaseSupplier;
};

const PAYMENT_STATUS_MAP: Record<string, { color: string; label: string }> = {
  PAID: { color: "green", label: "Paid" },
  PARTIAL: { color: "orange", label: "Partial" },
  DUE: { color: "red", label: "Due" },
  UNPAID: { color: "red", label: "Unpaid" },
};

const formatPurchaseRef = (record: ProductPurchaseRecord) =>
  record.purchaseId?.trim() || `PP-${record.id.slice(-8).toUpperCase()}`;

const getTotalQuantity = (items: PurchaseItem[] = []) =>
  items.reduce((sum, item) => sum + (item.quantity || 0), 0);

const formatPaymentMethod = (method?: string | null) =>
  method
    ? method
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";

const ProductItemsCell = ({ items = [] }: { items: PurchaseItem[] }) => {
  if (!items.length) {
    return <span className="text-gray-400 text-sm">No products</span>;
  }

  const first = items[0];
  const more = items.length - 1;

  const popoverContent = (
    <div className="w-[min(420px,90vw)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Line items ({items.length})
      </p>
      <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="text-left text-gray-500">
              <th className="py-2 px-2 font-semibold">Product</th>
              <th className="py-2 px-2 font-semibold">SKU</th>
              <th className="py-2 px-2 font-semibold text-right">Qty</th>
              <th className="py-2 px-2 font-semibold text-right">Rate</th>
              <th className="py-2 px-2 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50/80"}
              >
                <td className="py-2 px-2 max-w-[180px]">
                  <span className="line-clamp-2 font-medium text-gray-800">
                    {item.product?.name || "—"}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-500 whitespace-nowrap">
                  {item.product?.sku || "—"}
                </td>
                <td className="py-2 px-2 text-right font-medium">
                  {item.quantity}
                </td>
                <td className="py-2 px-2 text-right whitespace-nowrap">
                  <DisplayCurrency amount={item.unitPrice} size={11} />
                </td>
                <td className="py-2 px-2 text-right font-semibold whitespace-nowrap">
                  <DisplayCurrency amount={item.totalPrice} size={11} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="hover" placement="leftTop">
      <div className="cursor-help max-w-[240px]">
        <p
          className="font-medium text-gray-800 line-clamp-2 leading-snug"
          title={first.product?.name}
        >
          {first.product?.name || "—"}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {first.product?.sku && (
            <Tag className="m-0 text-[10px] border-gray-200 bg-gray-50 text-gray-600">
              {first.product.sku}
            </Tag>
          )}
          <Tag color="blue" className="m-0 text-[10px]">
            Qty {first.quantity}
          </Tag>
          {more > 0 && (
            <Tag color="processing" className="m-0 text-[10px]">
              +{more} more
            </Tag>
          )}
        </div>
      </div>
    </Popover>
  );
};

const ProductPurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<ProductPurchaseRecord | null>(null);

  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "sl",
    "purchaseId",
    "purchaseDate",
    "supplier",
    "products",
    "totalQty",
    "totalAmount",
    "discount",
    "tax",
    "finalAmount",
    "payment",
    "action",
  ]);
  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const {
    data: purchasesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllProductPurchasesQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    ...(searchText ? [{ name: "search", value: searchText }] : []),
    { name: "dateFrom", value: dateRange[0] },
    { name: "dateTo", value: dateRange[1] },
  ]);

  const [deletePurchase, { isLoading: isDeleting }] =
    useDeleteProductPurchaseMutation();

  const search = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }),
  ).current;

  const purchases = (purchasesData?.data || []) as ProductPurchaseRecord[];
  const meta = purchasesData?.meta;

  const { hasCreate, hasUpdate, hasDelete } =
    useModulePermissions("Product Purchase");

  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Purchase",
      content:
        "Are you sure you want to delete this purchase? This will affect stock levels.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await deletePurchase(id).unwrap();
          if (res?.success) {
            toast.success("Purchase deleted successfully");
          } else {
            toast.error(res?.message || "Failed to delete");
          }
        } catch (err: unknown) {
          const message =
            err &&
            typeof err === "object" &&
            "data" in err &&
            err.data &&
            typeof err.data === "object" &&
            "message" in err.data
              ? String((err.data as { message?: string }).message)
              : "Something went wrong";
          toast.error(message);
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: "SL",
        key: "sl",
        width: 56,
        align: "center" as const,
        render: (_: unknown, __: unknown, index: number) => (
          <span className="text-gray-500 text-sm">
            {(page - 1) * limit + index + 1}
          </span>
        ),
      },
      {
        title: "Purchase ID",
        key: "purchaseId",
        width: 120,
        render: (_: unknown, record: ProductPurchaseRecord) => (
          <Tooltip title={record.id}>
            <span className="font-semibold text-primary whitespace-nowrap">
              {formatPurchaseRef(record)}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Date",
        key: "purchaseDate",
        width: 118,
        render: (_: unknown, record: ProductPurchaseRecord) => (
          <Tooltip
            title={`Created ${dayjs(record.createdAt).format("DD MMM YYYY, hh:mm A")}`}
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 whitespace-nowrap">
                {dayjs(record.purchaseDate).format("DD MMM YYYY")}
              </span>
              <span className="text-[11px] text-gray-400">
                {dayjs(record.purchaseDate).format("dddd")}
              </span>
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Supplier",
        key: "supplier",
        width: 200,
        render: (_: unknown, record: ProductPurchaseRecord) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-800 truncate">
              {record.supplier?.name || "—"}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {record.supplier?.supplierCode && (
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {record.supplier.supplierCode}
                </span>
              )}
              {record.supplier?.phone1 && (
                <span className="text-[11px] text-gray-500">
                  {record.supplier.phone1}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        title: "Products",
        key: "products",
        width: 260,
        render: (_: unknown, record: ProductPurchaseRecord) => (
          <ProductItemsCell items={record.items || []} />
        ),
      },
      {
        title: "Total Qty",
        key: "totalQty",
        width: 88,
        align: "center" as const,
        render: (_: unknown, record: ProductPurchaseRecord) => {
          const qty = getTotalQuantity(record.items);
          const lines = record.items?.length || 0;
          return (
            <Tooltip title={`${lines} product line${lines === 1 ? "" : "s"}`}>
              <div className="inline-flex flex-col items-center">
                <span className="font-bold text-gray-900">{qty}</span>
                <span className="text-[10px] text-gray-400">
                  {lines} line{lines === 1 ? "" : "s"}
                </span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: "Subtotal",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 120,
        align: "right" as const,
        render: (amount: number) => (
          <DisplayCurrency amount={amount} className="justify-end" />
        ),
      },
      {
        title: "Discount",
        dataIndex: "discount",
        key: "discount",
        width: 110,
        align: "right" as const,
        render: (amount: number) =>
          amount > 0 ? (
            <DisplayCurrency
              amount={amount}
              className="justify-end text-amber-600"
            />
          ) : (
            <span className="text-gray-300">—</span>
          ),
      },
      {
        title: "Tax",
        dataIndex: "tax",
        key: "tax",
        width: 110,
        align: "right" as const,
        render: (amount: number) =>
          amount > 0 ? (
            <DisplayCurrency
              amount={amount}
              className="justify-end text-emerald-600"
            />
          ) : (
            <span className="text-gray-300">—</span>
          ),
      },
      {
        title: "Final Total",
        dataIndex: "finalAmount",
        key: "finalAmount",
        width: 130,
        align: "right" as const,
        render: (amount: number, record: ProductPurchaseRecord) => (
          <Tooltip
            title={
              <div className="text-xs space-y-1">
                <div>
                  Subtotal: ৳ {formatCurrencyLocale(record.totalAmount)}
                </div>
                {(record.discount || 0) > 0 && (
                  <div>
                    Discount: −৳ {formatCurrencyLocale(record.discount)}
                  </div>
                )}
                {(record.tax || 0) > 0 && (
                  <div>Tax: +৳ {formatCurrencyLocale(record.tax)}</div>
                )}
              </div>
            }
          >
            <span className="font-bold text-gray-900 inline-flex justify-end w-full">
              <DisplayCurrency amount={amount} size={14} />
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Payment",
        key: "payment",
        width: 130,
        render: (_: unknown, record: ProductPurchaseRecord) => {
          const status = PAYMENT_STATUS_MAP[record.paymentStatus] || {
            color: "default",
            label: record.paymentStatus,
          };
          return (
            <div className="flex flex-col gap-1">
              <Tag color={status.color} className="m-0 w-fit text-[11px]">
                {formatPaymentMethod(record.paymentMethod)} (
                {record.paymentStatus})
              </Tag>
            </div>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        width: 130,
        fixed: "right" as const,
        render: (_: unknown, record: ProductPurchaseRecord) => (
          <Space onClick={(e) => e.stopPropagation()} size="small">
            <Tooltip title="View details">
              <Button
                size="small"
                icon={<FiEye />}
                onClick={() => navigate(`/product-purchase/${record.id}`)}
              />
            </Tooltip>
            {hasUpdate && (
              <Tooltip title="Edit">
                <Button
                  size="small"
                  icon={<FiEdit />}
                  onClick={() => {
                    setSelectedPurchase(record);
                    setOpenUpdateModal(true);
                  }}
                />
              </Tooltip>
            )}
            {hasDelete && (
              <Tooltip title="Delete">
                <Button
                  size="small"
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => handleDelete(record.id)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ],
    [page, limit, hasUpdate, hasDelete, navigate],
  );

  return (
    <div>
      <PageMeta
        title="Product Purchases | ERP"
        description="Product Purchase Management"
      />

      <PageHeader
        title="Product Purchases"
        subtitle="Manage purchases of finished products"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Product Purchases" },
        ]}
        extra={
          <Space>
            <CustomActionButton
              text="Refresh"
              icon={<RefreshCcw />}
              onClick={() => refetch()}
            />
            {hasCreate && (
              <CustomActionButton
                text="Add New"
                type="primary"
                icon={<FiPlus />}
                onClick={() => setOpenModal(true)}
              />
            )}
          </Space>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-4">
        <Input
          placeholder="Search by ID, supplier..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          className="max-w-md"
          onChange={(e) => search(e.target.value)}
          allowClear
        />
        <Space wrap>
          <CustomDatePicker
            selectedData={dateRange}
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
          />
          <PageListPrint
            tableData={purchases}
            fileName="product-purchase-list"
          />
          <FilterColumn
            tableName="product_purchase_table"
            columns={columns}
            onChangeSelectedKeys={setSelectedColumnKeys}
          />
        </Space>
      </div>

      <DataTable
        loading={isLoading || isFetching || isDeleting}
        data={purchases}
        columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
        rowKey="id"
        total={meta?.total || 0}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger
        onRow={(record: ProductPurchaseRecord) => ({
          onClick: () => navigate(`/product-purchase/${record.id}`),
          className: "cursor-pointer hover:bg-gray-50/80",
        })}
      />

      {openModal && (
        <CreateProductPurchaseModal open={openModal} setOpen={setOpenModal} />
      )}

      {openUpdateModal && selectedPurchase && (
        <UpdateProductPurchaseModal
          open={openUpdateModal}
          setOpen={setOpenUpdateModal}
          purchase={selectedPurchase}
        />
      )}
    </div>
  );
};

export default ProductPurchaseList;
