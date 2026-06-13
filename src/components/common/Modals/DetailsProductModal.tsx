import React from "react";
import { Modal } from "antd";

import {
  Folder,
  Calendar,
  Edit3,
  Scale,
  Building,
  Tag,
  Layers,
  Box,
} from "lucide-react";
import PageMeta from "../Meta/PageMeta";
import { IProductData } from "../../../types/product";
import { DisplayCurrency } from "../../../utils/currency";

// Types
interface DetailsProductModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: IProductData | null;
}

interface InfoItemProps {
  icon: React.ReactElement;
  label: string;
  value: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray" | "indigo";
}

// Constants
const COLOR_CLASSES = {
  blue: {
    bg: "bg-primary-50",
    text: "text-primary-600",
    border: "border-primary-200",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
  gray: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
  },
} as const;

// Helper Components
const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  value,
  color = "gray",
}) => (
  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
    <div
      className={`p-2 rounded-lg ${COLOR_CLASSES[color].bg} border ${COLOR_CLASSES[color].border}`}
    >
      {React.cloneElement(icon, {
        // @ts-expect-error size
        size: 16,
        className: COLOR_CLASSES[color].text,
      })}
    </div>
    <div className="flex-1">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="font-semibold text-gray-900 mt-1">{value || "—"}</div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div
    className={`px-3 py-1 rounded-full text-xs font-medium border ${
      isActive
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-gray-100 text-gray-700 border-gray-200"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </div>
);

// Stock Level Indicator - Compact Version
const StockIndicator: React.FC<{
  current: number;
  min?: number;
  max?: number;
}> = ({ current, min = 0, max = 0 }) => {
  const getStockLevel = () => {
    if (current === 0)
      return { color: "text-red-500", bg: "bg-red-50", label: "Out" };
    if (current <= min)
      return {
        color: "text-orange-500",
        bg: "bg-orange-50",
        label: "Low",
      };
    if (max > 0 && current >= max)
      return { color: "text-primary-500", bg: "bg-primary-50", label: "High" };
    return { color: "text-green-500", bg: "bg-green-50", label: "Good" };
  };

  const stock = getStockLevel();

  return (
    <div
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${stock.bg} ${stock.color}`}
    >
      <div className="w-1 h-1 rounded-full bg-current"></div>
      {stock.label}
    </div>
  );
};

// Main Component
const DetailsProductModal: React.FC<DetailsProductModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  if (!data) return null;

  const variants = Array.isArray(data.variants) ? data.variants : [];

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={900}
      className="modern-product-modal"
      bodyStyle={{ padding: 0 }}
    >
      <PageMeta
        title="Product Details"
        description="View details of the product."
      />

      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 to-primary-50 p-3 rounded-md ">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {data.name}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge isActive={!!data.isActive} />
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Layers size={14} />
                  {variants.length} variant{variants.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {data.description && (
          <div className="max-h-24 overflow-y-auto mt-4">
            <p className="text-gray-600 text-sm leading-relaxed bg-white/50 p-3 rounded-lg border border-gray-200">
              {data.description}
            </p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Product Information */}
        <div className="space-y-4">
          <h3 className="font-semibold flex flex-wrap items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
            <Edit3 size={16} />
            Product Information
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <InfoItem
              icon={<Folder />}
              label="Category"
              value={data.category?.name ?? "—"}
              color="purple"
            />
            <InfoItem
              icon={<Building />}
              label="Brand"
              value={data.brand?.name ?? "—"}
              color="green"
            />
            <InfoItem
              icon={<Scale />}
              label="Base Unit"
              value={data.baseUnit?.name ?? "—"}
              color="orange"
            />
          </div>
        </div>

        {/* Variants List with Grid Layout */}
        {variants.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
              <Layers size={16} />
              Product Variants
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variants.map((variant: any, index: number) => {
                const conversionFactor = variant.conversionFactor ?? 1;
                const sellingPrice = variant.sellingPrice ?? 0;
                const minStock = variant.minStock ?? 0;
                const maxStock = variant.maxStock ?? 0;
                const currentStock = variant.currentStock ?? 0;

                return (
                  <div
                    key={index}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-200 hover:shadow-sm transition-all"
                  >
                    {/* Variant Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center border border-primary-200">
                          <Tag size={14} className="text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            Variant #{index + 1}
                          </div>
                          <div className="text-xs text-gray-500">
                            {conversionFactor}x conversion
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-base font-bold text-green-600">
                          <DisplayCurrency amount={sellingPrice} />
                        </div>
                      </div>
                    </div>

                    {/* Stock Information */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Box size={12} />
                          <span
                            className={
                              currentStock === 0
                                ? "text-red-600 font-semibold"
                                : "font-medium"
                            }
                          >
                            {currentStock}
                          </span>
                        </div>
                        <div className="text-gray-400">•</div>
                        <div>Min: {minStock}</div>
                        <div className="text-gray-400">•</div>
                        <div>Max: {maxStock}</div>
                      </div>

                      <StockIndicator
                        current={currentStock}
                        min={minStock}
                        max={maxStock}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <Calendar size={14} />
              Created:{" "}
              {data.createdAt
                ? new Date(data.createdAt).toLocaleDateString()
                : "—"}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <Calendar size={14} />
              Updated:{" "}
              {data.updatedAt
                ? new Date(data.updatedAt).toLocaleDateString()
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailsProductModal;
