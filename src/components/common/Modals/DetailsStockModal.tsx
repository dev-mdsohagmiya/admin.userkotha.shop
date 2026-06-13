import { Modal, Tag } from "antd";
import React from "react";

import {
  AlertTriangle,
  Box,
  Building,
  Calendar,
  CheckCircle,
  Folder,
  Hash,
  Layers,
  Package,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { IStock } from "../../../types/stock";
import PageMeta from "../Meta/PageMeta";
import { DisplayCurrency } from "../../../utils/currency";

interface DetailsStockModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: IStock;
}

const DetailsStockModal: React.FC<DetailsStockModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  // Stock status configuration
  const getStockConfig = () => {
    const status = data?.stockStatus?.toLowerCase();
    switch (status) {
      case "normal":
      case "in_stock":
        return {
          color: "#10b981",
          bgColor: "#ecfdf5",
          borderColor: "#d1fae5",
          icon: <CheckCircle size={16} />,
          label: "IN STOCK",
        };
      case "low":
        return {
          color: "#f59e0b",
          bgColor: "#fffbeb",
          borderColor: "#fef3c7",

          icon: <AlertTriangle size={16} />,
          label: "LOW STOCK",
        };
      case "over":
        return {
          color: "#3b82f6",
          bgColor: "#eff6ff",
          borderColor: "#dbeafe",
          icon: <TrendingUp size={16} />,
          label: "OVERSTOCK",
        };
      case "out_of_stock":
        return {
          color: "#ef4444",
          bgColor: "#fef2f2",
          borderColor: "#fecaca",
          icon: <XCircle size={16} />,
          label: "OUT OF STOCK",
        };
      default:
        return {
          color: "#6b7280",
          bgColor: "#f9fafb",
          borderColor: "#e5e7eb",
          icon: <Box size={16} />,
          label: "UNKNOWN",
        };
    }
  };

  const stockConfig = getStockConfig();

  // Get stock values - handle both simple items and products with variants
  const getStockValues = () => {
    if (data?.variants && data.variants.length > 0) {
      // Product with variants - use product level stock
      return {
        currentStock: data.currentStock || 0,
        minStock: data.minStock || 0,
        maxStock: data.maxStock || 0,
        cost: data.averageCost || data.costPerUnit || 0,
        hasVariants: true,
      };
    } else {
      // Simple item (raw/packaging)
      return {
        currentStock: data?.currentStock || 0,
        minStock: data?.minStock || 0,
        maxStock: data?.maxStock || 0,
        cost: data?.averageCost || data?.costPerUnit || 0,
        hasVariants: false,
      };
    }
  };

  const { currentStock, minStock, maxStock, cost, hasVariants } =
    getStockValues();

  const InfoCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    color?: "blue" | "green" | "red" | "orange" | "purple" | "gray" | "indigo";
  }> = ({ icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-primary-50 border-primary-200 text-primary-600",
      green: "bg-green-50 border-green-200 text-green-600",
      red: "bg-red-50 border-red-200 text-red-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      gray: "bg-gray-50 border-gray-200 text-gray-600",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
    };

    return (
      <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </div>
          <div className="font-semibold text-gray-900 text-lg mb-1">
            {value || "—"}
          </div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
    );
  };

  const DetailItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color?: "blue" | "green" | "red" | "orange" | "purple" | "gray";
  }> = ({ icon, label, value, color = "gray" }) => {
    const colorClasses = {
      blue: "text-primary-600",
      green: "text-green-600",
      red: "text-red-600",
      orange: "text-orange-600",
      purple: "text-purple-600",
      gray: "text-gray-600",
    };

    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
        <div className={colorClasses[color]}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="!text-[16px] text-gray-500">{label}</div>
          <div className="text-sm font-semibold text-gray-900">
            {value || "—"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1000}
      className="modern-stock-modal"
      styles={{
        body: { padding: 0 },
      }}
    >
      <PageMeta
        title="Stock Details | ERP"
        description="View detailed product and stock information."
      />

      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 to-primary-50 p-2">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {data?.name || "Unnamed Product"}
            </h1>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{
                  backgroundColor: stockConfig.bgColor,
                  borderColor: stockConfig.borderColor,
                  color: stockConfig.color,
                }}
              >
                {stockConfig.icon}
                {stockConfig.label}
              </div>

              {/* Active Status */}
              {data?.isActive !== undefined && (
                <Tag color={data.isActive ? "green" : "red"}>
                  {data.isActive ? "ACTIVE" : "INACTIVE"}
                </Tag>
              )}

              {/* Type Badge */}
              {data?.type && (
                <Tag
                  color={
                    data.type === "product"
                      ? "blue"
                      : data.type === "raw"
                        ? "orange"
                        : "purple"
                  }
                >
                  {data.type.toUpperCase()}
                </Tag>
              )}

              {/* Variants Count */}
              {hasVariants && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Layers size={14} />
                  {data?.variants?.length || 0} variants
                </div>
              )}
            </div>
            {data?.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {data.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stock Overview */}
        <div className="grid grid-cols-3 gap-4">
          <InfoCard
            icon={<Box size={20} />}
            title="Current Stock"
            value={currentStock}
            color={
              currentStock === 0
                ? "red"
                : currentStock <= minStock
                  ? "orange"
                  : "green"
            }
          />
          <InfoCard
            icon={<DisplayCurrency amount={null} />}
            title="Cost"
            value={<DisplayCurrency amount={cost} />}
            color="blue"
          />
          <InfoCard
            icon={<Hash size={20} />}
            title="Stock Type"
            value={data?.type ? data.type.toUpperCase() : "—"}
            color="purple"
          />
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold  flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
              <Folder size={16} />
              Product Information
            </h3>

            <div className="space-y-3  gap-3">
              <DetailItem
                icon={<Folder size={14} />}
                label="Category"
                value={data?.category?.name || "—"}
                color="purple"
              />
              {data?.brand && (
                <DetailItem
                  icon={<Building size={14} />}
                  label="Brand"
                  value={data?.brand?.name || "—"}
                  color="green"
                />
              )}
              <DetailItem
                icon={<Package size={14} />}
                label="Base Unit"
                value={data?.baseUnit?.name || data?.unit?.name || "—"}
                color="orange"
              />
              {data?.unit?.symbol && (
                <DetailItem
                  icon={<Hash size={14} />}
                  label="Unit Symbol"
                  value={data.unit.symbol}
                  color="blue"
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold  flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
              <Calendar size={16} />
              Timeline
            </h3>

            <div className="space-y-4">
              <DetailItem
                icon={<Calendar size={14} />}
                label="Created"
                value={
                  data?.createdAt
                    ? new Date(data.createdAt).toLocaleDateString()
                    : "—"
                }
                color="blue"
              />
              <DetailItem
                icon={<Calendar size={14} />}
                label="Updated"
                value={
                  data?.updatedAt
                    ? new Date(data.updatedAt).toLocaleDateString()
                    : "—"
                }
                color="gray"
              />
              <div className="text-sm">
                <DetailItem
                  icon={<TrendingUp size={14} />}
                  label="Stock Status"
                  value={stockConfig.label}
                  color={
                    data?.stockStatus === "normal"
                      ? "green"
                      : data?.stockStatus === "low"
                        ? "orange"
                        : data?.stockStatus === "over"
                          ? "blue"
                          : "red"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        {hasVariants && data?.variants && data.variants.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
              <Layers size={16} />
              Product Variants ({data.variants.length})
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {data.variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-50 rounded flex items-center justify-center border border-primary-200">
                        <Hash size={12} className="text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Variant #{index + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {variant.conversionFactor}x conversion
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-base font-bold text-green-600">
                        <DisplayCurrency amount={variant.sellingPrice} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Box size={10} />
                        <span
                          className={
                            variant.currentStock === 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {variant.currentStock}
                        </span>
                      </div>
                      <div>Min:{variant.minStock}</div>
                      <div>Max:{variant.maxStock}</div>
                      <div>Unit: {variant.unit?.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Range Summary */}
        <div className="bg-linear-to-r from-gray-50 to-primary-50 p-4 rounded-xl border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{minStock}</div>
              <div className="text-xs text-gray-600 mt-1">MINIMUM STOCK</div>
              <div className="text-xs text-gray-400">Alert threshold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {currentStock}
              </div>
              <div className="text-xs text-gray-600 mt-1">CURRENT STOCK</div>
              <div className="text-xs text-gray-400">Available now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {maxStock}
              </div>
              <div className="text-xs text-gray-600 mt-1">MAXIMUM STOCK</div>
              <div className="text-xs text-gray-400">Storage capacity</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailsStockModal;
