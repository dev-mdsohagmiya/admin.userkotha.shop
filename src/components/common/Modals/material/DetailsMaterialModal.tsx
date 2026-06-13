import { Modal } from "antd";
import React from "react";
import {
  Activity,
  Box,
  Calendar,
  Folder,
  Layers,
  Scale,
  Zap,
} from "lucide-react";
import { TbCoinTaka } from "react-icons/tb";
import { IMaterial } from "../../../../types/material";
import { DisplayCurrency } from "../../../../utils/currency";

// NOTE: IRawMaterial type is assumed to be defined in a separate file (../types/rawMaterial)
// For this single-file component, we'll define a mock type to ensure it's self-contained and runnable

// --- TYPES ---
interface DetailsRawMaterialModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IMaterial | null;
}

interface InfoItemProps {
  icon: React.ReactElement;
  label: string;
  value: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray" | "indigo";
}

interface StatusBadgeProps {
  isActive: boolean;
  type?: "material";
}

// --- CONSTANTS ---
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

// --- HELPER COMPONENTS ---

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  value,
  color = "gray",
}) => (
  // Updated InfoItem for a cleaner card/metric display
  <div className="flex gap-2 items-center p-4 bg-white rounded-xl  border border-gray-200 transition-all duration-200">
    <div className={`p-2 w-fit rounded-lg mb-3 ${COLOR_CLASSES[color].bg}`}>
      {React.cloneElement(icon, {
        // @ts-expect-error size
        size: 18, // Slightly larger icon
        className: COLOR_CLASSES[color].text,
      })}
    </div>
    <div className="flex-1">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-[16px] font-medium text-gray-900 wrap-break-word">
        {value || "—"}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive }) => (
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

// --- MAIN COMPONENT ---
const DetailsRawMaterialModal: React.FC<DetailsRawMaterialModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  if (!data) return null;

  const stockStatus = (data: IMaterial) => {
    if (data.currentStock === 0) return "red";
    return "green";
  };

  const currentStockStatusColor = stockStatus(data);

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={900}
      className="modern-raw-material-modal"
    >
      {/* Header Section - Clean, professional look */}
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
                  Row Material
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
      <div className="py-6 space-y-8">
        {/* Material Core Information */}
        <div className="space-y-4">
          <h3 className="font-bold flex flex-wrap items-center gap-2 text-sm uppercase tracking-wider text-gray-600 border-b pb-2 border-gray-100">
            <Folder size={18} className="text-purple-500" />
            Core Material Metrics
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <InfoItem
              icon={<Layers />}
              label="Category"
              value={data.category?.name ?? "—"}
              color="purple"
            />
            <InfoItem
              icon={<Scale />}
              label="Unit of Measure"
              value={`${data.unit?.name ?? "—"} (${data.unit?.symbol ?? "—"})`}
              color="green"
            />
            <InfoItem
              icon={<Box />}
              label="Current Stock"
              value={`${data.currentStock} ${data.unit?.symbol ?? ""}`}
              color={currentStockStatusColor}
            />
            <InfoItem
              icon={<TbCoinTaka />}
              label="Average Cost (Per Unit)"
              value={<DisplayCurrency amount={data.averageCost} />}
              color="orange"
            />
            <InfoItem
              icon={<Zap />}
              label="Minimum Stock Level"
              value={`${data.minStock} ${data.unit?.symbol ?? ""}`}
              color="red"
            />
            <InfoItem
              icon={<Activity />}
              label="Maximum Stock Level"
              value={`${data.maxStock} ${data.unit?.symbol ?? ""}`}
              color="blue"
            />
          </div>
        </div>

        {/* Metadata - Simple, clear footer style */}
        <div className="4 mt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              <span className="font-medium">Created:</span>
              {data.createdAt
                ? new Date(data.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              <span className="font-medium">Last Updated:</span>
              {data.updatedAt
                ? new Date(data.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailsRawMaterialModal;
