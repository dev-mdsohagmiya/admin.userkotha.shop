import { Button, Input, Space, Tabs, Tag, Tooltip } from "antd";
import { RefreshCcw, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { FiEye } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import PageListPrint from "../../components/common/CommonPrintCsvAndPdf/PageListPrint";
import FilterColumn from "../../components/common/FilterColumn/FilterColumn";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import { useModulePermissions } from "../../hooks/usePermissions";
import { Plan } from "../../icons";
import { useStockListQuery } from "../../redux/features/stock/stockApi";
import { DisplayCurrency } from "../../utils/currency";
import { debounce } from "../../utils/debounce";

interface Variant {
  id: string;
  productId: string;
  thumbnailId: string | null;
  sku: string;
  name: string;
  discountedPrice: number | null;
  conversionFactor: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

interface StockAlertItem {
  id: string;
  slug: string;
  name: string;
  thumbnailId: string;
  categoryId: string;
  brandId: string;
  baseUnitId: string;
  currentStock: number;
  category: { id: string; name: string };
  brand: { id: string; name: string };
  baseUnit: { id: string; name: string; symbol: string };
  maxStock: number;
  minStock: number;
  stockStatus: "normal" | "low" | "over";
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
}

const STOCK_MANAGEMENT_TABLE_NAME = "stock_management_table";

const ProductStockManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [productType, setProductType] = useState("regular");
  const isComboTab = productType === "combo";
  const navigate = useNavigate();
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    const normalized = tabParam.toLowerCase();
    const tabMap: Record<string, string> = {
      regular: "regular",
      "regular product": "regular",
      regular_product: "regular",
      combo: "combo",
      "combo product": "combo",
      combo_product: "combo",
    };
    const nextTab = tabMap[normalized];
    if (nextTab && nextTab !== productType) {
      setProductType(nextTab);
    }
  }, [productType, searchParams]);

  const queryParams: { name: string; value: string }[] = [
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    { name: "type", value: "product" },
    { name: "productType", value: productType },
  ];
  if (statusFilter && statusFilter !== "all")
    queryParams.push({ name: "stockStatus", value: statusFilter });

  if (searchText) {
    queryParams.push({ name: "search", value: searchText });
  }

  const { hasUpdate } = useModulePermissions("Stocks");
  const { data, isLoading, isFetching, refetch } =
    useStockListQuery(queryParams);

  const stocks = data?.data || [];
  const meta = data?.meta || [];

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }),
  ).current;

  const columns = useMemo(
    () => [
    {
      title: "SL",
      key: "index",
      render: (_: any, __: StockAlertItem, index: number) => (
        <>#{(page - 1) * limit + index + 1}</>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: StockAlertItem) => (
        <div>
          <Tooltip title={name || "-"}>
            <div
              style={{
                fontWeight: 500,
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              {name || "-"}
            </div>
          </Tooltip>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.brand?.name} • {record.category?.name}
          </div>
        </div>
      ),
    },
    {
      title: "Variants",
      dataIndex: "variants",
      key: "variants",
      render: (variants: Variant[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {variants?.slice(0, 3).map((variant) => (
            <Tag
              key={variant.id}
              style={{
                margin: 0,
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {variant.name}
            </Tag>
          ))}
          {variants?.length > 3 && (
            <Tag style={{ margin: 0, fontSize: "11px", padding: "2px 8px" }}>
              +{variants.length - 3} more
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Total Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      sorter: (a: any, b: any) =>
        Number(a.currentStock) - Number(b.currentStock),
      sortDirections: ["ascend", "descend"],
      render: (stock: number, record: any) => {
        const color = record.stockStatus === "low" ? "red" : "inherit";
        return (
          <div style={{ textAlign: "center" }}>
            <div style={{ color, fontWeight: 600, fontSize: "16px" }}>
              {stock?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: "11px", color: "#999" }}>
              Min: {record.minStock?.toLocaleString()}
            </div>
          </div>
        );
      },
      align: "center" as const,
    },
    {
      title: "Stock Status",
      dataIndex: "stockStatus",
      key: "stockStatus",
      render: (status: string) => {
        let color = "";

        if (status === "over") color = "orange";
        else if (status === "low") color = "red";
        else color = "green";

        return (
          <Tag
            style={{
              color,
            }}
          >
            {status?.toUpperCase() || "-"}
          </Tag>
        );
      },

      filterDropdown: ({ setSelectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Normal", value: "normal" },
            { text: "Low", value: "low" },
            { text: "Over", value: "over" },
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="stockStatus"
                value={item.value}
                checked={statusFilter === item.value}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatusFilter(val);
                  setSelectedKeys([val]);
                  confirm();
                }}
                style={{
                  marginRight: 8,
                  accentColor: "green",
                  cursor: "pointer",
                }}
              />
              {item.text}
            </label>
          ))}
        </div>
      ),
      filtered: statusFilter !== "all",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      },
      sortDirections: ["ascend", "descend"],
      render: (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        return <span className="">{date.toLocaleDateString()}</span>;
      },
    },

    ...(hasUpdate
      ? [
          {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_: any, record: StockAlertItem) => (
              <Space>
                <Tooltip title="View Details">
                  <Link
                    to={`/${isComboTab ? "combo-product" : "product"}/${record.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button icon={<FiEye />} size="middle" />
                  </Link>
                </Tooltip>
                <Tooltip
                  title={record.stockStatus === "low" ? "Make Plan" : ""}
                >
                  <Link
                    to={`/${isComboTab ? "combo-product" : "product"}/${record.id}/planning`}
                  >
                    <Button
                      icon={<Plan className="!text-[18px] -mt-1" />}
                      type="primary"
                      disabled={record.stockStatus !== "low"}
                      className={`transition-all duration-300 ${
                        record.stockStatus === "low"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                      }`}
                    ></Button>
                  </Link>
                </Tooltip>
              </Space>
            ),
          },
        ]
      : []),
    ],
    [page, limit, statusFilter, isComboTab, hasUpdate],
  );

  /** FilterColumn runs once on mount; if profile wasn't ready, `action` was missing from localStorage — add it when `hasUpdate` becomes true. */
  useEffect(() => {
    if (!hasUpdate) return;
    setSelectedColumnKeys((prev) => {
      if (prev.length === 0) return prev;
      if (prev.includes("action")) return prev;
      if (!columns.some((c) => c.key === "action")) return prev;
      const next = [...prev, "action"];
      try {
        localStorage.setItem(
          `table_columns_${STOCK_MANAGEMENT_TABLE_NAME}`,
          JSON.stringify(next),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [hasUpdate, columns, selectedColumnKeys]);

  // Expandable row configuration to show variants
  const expandedRowRender = (record: StockAlertItem) => {
    return (
      <div
        style={{
          padding: "16px 24px",
          background: "#f9fafb",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "12px",
            color: "#374151",
          }}
        >
          Variant Details
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
          }}
        >
          {record.variants?.map((variant: Variant) => {
            const isLow = variant.currentStock < variant.minStock;
            const isOver = variant.currentStock > variant.maxStock;

            return (
              <div
                key={variant.id}
                style={{
                  background: "#fff",
                  border: `2px solid ${
                    isLow ? "#fecaca" : isOver ? "#fed7aa" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  padding: "12px",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {variant.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      SKU: {variant.sku}
                    </div>
                  </div>
                  <Tag
                    color={isLow ? "red" : isOver ? "orange" : "green"}
                    style={{ margin: 0, fontSize: "10px" }}
                  >
                    {isLow ? "LOW" : isOver ? "OVER" : "OK"}
                  </Tag>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "10px", color: "#9ca3af" }}>
                      Current Stock
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: isLow
                          ? "#dc2626"
                          : isOver
                            ? "#ea580c"
                            : "#059669",
                      }}
                    >
                      {variant.currentStock.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#9ca3af" }}>
                      Price
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>
                      <DisplayCurrency amount={variant.sellingPrice} />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "#6b7280",
                  }}
                >
                  <span>Min: {variant.minStock}</span>
                  <span>Max: {variant.maxStock}</span>
                  <span>CF: {variant.conversionFactor}x</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const printableStockData = stocks.flatMap(
    (stock: StockAlertItem, index: number) => {
      const createdAt = stock.createdAt ? new Date(stock.createdAt) : null;

      return stock.variants.map((variant: Variant, variantIndex: number) => ({
        SL: variantIndex === 0 ? index + 1 : "",
        "Product Name": variantIndex === 0 ? stock.name || "-" : "",
        Variant: variant.name || "-",
        SKU: variant.sku || "-",
        Brand: variantIndex === 0 ? stock.brand?.name || "-" : "",
        Category: variantIndex === 0 ? stock.category?.name || "-" : "",
        "Min Stock": variant.minStock?.toLocaleString() || 0,
        "Current Stock": variant.currentStock?.toLocaleString() || 0,
        "Max Stock": variant.maxStock?.toLocaleString() || 0,
        "Selling Price": `TK ${variant.sellingPrice?.toLocaleString() || 0}`,
        "Stock Status":
          variantIndex === 0 ? stock.stockStatus?.toUpperCase() || "-" : "",
        "Created At":
          variantIndex === 0 && createdAt
            ? `${String(createdAt.getDate()).padStart(2, "0")}-${String(
                createdAt.getMonth() + 1,
              ).padStart(2, "0")}-${createdAt.getFullYear()}`
            : "",
      }));
    },
  );

  return (
    <div>
      <PageMeta
        title="Products Stock Management | ERP"
        description="Manage and monitor material stock levels efficiently."
      />
      <PageHeader
        title="Products Stock Management"
        subtitle="Monitor material stock levels and receive alerts"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Products", path: "/products" },
          { title: "Stocks" },
        ]}
        extra={
          <>
            <PageListPrint
              tableData={printableStockData}
              fileName="products-stock-list"
            />
            <CustomActionButton
              disabled={meta?.total === 0 ? true : false}
              onClick={() => {
                refetch();
              }}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />
          </>
        }
      />
      <div className="-mt-4">
        <Tabs
          activeKey={productType}
          onChange={(key) => {
            setProductType(key);
            setPage(1);
            const params = new URLSearchParams(searchParams);
            const tabLabelMap: Record<string, string> = {
              regular: "regular_product",
              combo: "combo_product",
            };
            params.set("tab", (tabLabelMap[key] || key).toLowerCase());
            setSearchParams(params);
          }}
          className="stock-tabs"
          items={[
            {
              key: "regular",
              label: (
                <div className="flex items-center gap-2 px-2">
                  <span className="font-semibold">Regular Product</span>
                </div>
              ),
            },
            {
              key: "combo",
              label: (
                <div className="flex items-center gap-2 px-2">
                  <span className="font-semibold">Combo Product</span>
                </div>
              ),
            },
          ]}
        />
      </div>
      <div className="flex mb-4 justify-between flex-wrap">
        <Input
          placeholder="Search products by name..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          onChange={(e) => debounceSearch(e.target.value)}
          className="max-w-md "
          size="middle"
          allowClear
        />
        <div className="flex gap-5 ">
          <FilterColumn
            tableName={STOCK_MANAGEMENT_TABLE_NAME}
            columns={columns}
            onChangeSelectedKeys={(keys) => setSelectedColumnKeys(keys)}
          />
        </div>
      </div>
      <DataTable
        loading={isLoading || isFetching}
        data={stocks}
        columns={columns.filter((c) => selectedColumnKeys.includes(c.key))}
        rowKey="id"
        isPaginate={meta?.total > 10 && true}
        onRow={(record: StockAlertItem) => ({
          onClick: () =>
            navigate(
              `/${isComboTab ? "combo-product" : "product"}/${record.id}`,
            ),
          style: { cursor: "pointer" },
        })}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        showSizeChanger={true}
        total={meta?.total || 0}
        expandable={{
          expandedRowRender,
          rowExpandable: (record: StockAlertItem) =>
            record.variants && record.variants.length > 0,
        }}
      />
    </div>
  );
};

export default ProductStockManagement;
