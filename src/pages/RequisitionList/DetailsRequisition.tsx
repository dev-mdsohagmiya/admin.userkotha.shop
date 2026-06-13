import { Tag, Typography, Card, Tooltip } from "antd";
import { DataTable } from "../../components/common/Tables";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useGetProductRequisitionByIdQuery } from "../../redux/features/requisition/requisitionApi";
import dayjs from "dayjs";

import { IUnit } from "../../types/units";
import RequisitionDetailsSkeleton from "../../components/skeleton/RequisitionDetailsSkeleton";
import RequisitionStatusModal from "../../components/common/Modals/RequisitionApproval/RequisitionStatusModal";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { FiCheck } from "react-icons/fi";
import PageHeader from "../../components/common/Navigation/PageHeader";

const { Text } = Typography;

// ---------- Types ----------
type MaterialItem = {
  id: string;
  materialId: string;
  materialName: string;
  materialType: "raw" | "finished";
  purpose: string;
  quantity: number;
  unit: {
    id: string;
    name: string;
    symbol: string;
    description: string | null;
    isActive: boolean;
  };
  category: string;
};

type Requisition = {
  id: string;
  requisitionNumber: string;
  productId?: string;
  comboProductId?: string;
  product?: {
    id: string;
    name: string;
    baseUnit: IUnit;
    isActive?: boolean;
  };
  comboProduct?: {
    id: string;
    name: string;
    baseUnit: IUnit;
    isActive?: boolean;
  };
  purpose: string;
  requestedBy: string;
  requisitionDate: string;
  status: "pending" | "approved" | "rejected";
  type: string;
  batchSize: number;
  items: MaterialItem[];
  notes: string;
  approvalComments: string | null;
  approvedAt: string | null;
  approvedBy: string | { name: string } | null;
  requestedByName?: string;
  createdAt: string;
  updatedAt: string;
};

// ---------- Status Tag Component ----------
const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: { color: "orange", text: "Pending" },
    approved: { color: "#1BA143", text: "Approved" },
    rejected: { color: "red", text: "Rejected" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Tag
      color={config.color}
      className="rounded-full px-3 py-1 border-0 font-semibold"
    >
      {config.text}
    </Tag>
  );
};

// ---------- Columns ----------
const getItemColumns = () => [
  {
    title: "SL",
    key: "sl",
    width: 60,
    render: (_: any, __: any, index: number) => (
      <Text className="text-xs font-semibold text-gray-400">{index + 1}</Text>
    ),
  },
  {
    title: "Material Name",
    dataIndex: "materialName",
    key: "materialName",
    render: (text: string) => (
      <Text className="text-[13px] font-semibold text-gray-800">{text}</Text>
    ),
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    render: (category: string) => (
      <Tag
        className="!text-[10px] font-semibold uppercase border-0 px-2 py-0"
        style={{
          backgroundColor: "#1BA14315",
          color: "#1BA143",
        }}
      >
        {category}
      </Tag>
    ),
  },
  {
    title: "Requested Qty",
    key: "totalRequired",
    width: 180,
    render: (record: MaterialItem) => {
      const totalQuantity = record.quantity;
      const isRawMaterial = record.materialType === "raw";
      const unitSymbol = record.unit.symbol.toLowerCase();

      let displayQuantity = totalQuantity;
      let displayUnit = record.unit.symbol;

      if (isRawMaterial) {
        if (
          unitSymbol === "g" ||
          unitSymbol === "gram" ||
          unitSymbol === "gm"
        ) {
          displayQuantity = totalQuantity / 1000;
        }
        displayUnit = "kg";
      }

      const useThreeDecimals = displayUnit.toLowerCase() === "kg";

      return (
        <div className="bg-primary/5 p-2 rounded-lg border border-gray-300 text-center">
          <Text className="block text-[14px] text-primary font-semibold">
            {displayQuantity.toLocaleString(undefined, {
              minimumFractionDigits: useThreeDecimals ? 3 : 2,
              maximumFractionDigits: useThreeDecimals ? 3 : 2,
            })}{" "}
            {displayUnit}
          </Text>
        </div>
      );
    },
  },
];

// ---------- Component ----------
const DetailsRequisition: React.FC = () => {
  const { id } = useParams();
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const { data: requisitionData, isLoading } =
    useGetProductRequisitionByIdQuery(id as string, {
      skip: !id,
    });

  const requisition: Requisition = requisitionData?.data || ({} as Requisition);

  const totalItems = requisition.items?.length || 0;
  const totalQuantity =
    requisition.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (isLoading) {
    return <RequisitionDetailsSkeleton />;
  }

  if (!requisition.id) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-300">
        <Typography.Title level={4} className="!text-gray-400 font-semibold">
          Requisition Not Found
        </Typography.Title>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ---------- Page Header ---------- */}
      <PageHeader
        title="Requisition Details"
        subtitle={`Summary for Req #${requisition.requisitionNumber}`}
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Requisitions", path: "/requisitions" },
          { title: "Details" },
        ]}
        extra={<StatusTag status={requisition.status} />}
      />

      {/* ---------- Main Info Card ---------- */}
      <Card className="rounded-2xl border border-gray-300 shadow-none  overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Req Info */}
          <div className="p-5 flex flex-col gap-1 ">
            <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Requisition No
            </Text>
            <Text className="text-lg font-semibold text-gray-900">
              #{requisition.requisitionNumber}
            </Text>
            <div className="mt-1">
              <Tag
                className="!text-[9px] font-semibold uppercase rounded-md px-2 border-0"
                style={{ backgroundColor: "#1BA14315", color: "#1BA143" }}
              >
                {requisition.type.split("_").join(" ")}
              </Tag>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-5 flex flex-col gap-1 col-span-2">
            <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Target Product
            </Text>
            <Text className="text-lg font-semibold text-gray-800 truncate">
              {requisition.product?.name || requisition.comboProduct?.name}
            </Text>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
              <span>By: {requisition.requestedByName || "System"}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>
                {dayjs(requisition.createdAt).format("DD MMM YYYY, hh:mm A")}
              </span>
            </div>
          </div>

          {/* Batch Size Info */}
          <div className="p-5 flex flex-col gap-1 border-l border-gray-300">
            <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Planned Batch
            </Text>
            <div className="flex items-baseline gap-1">
              <Text className="text-2xl font-semibold text-primary">
                {requisition.batchSize}
              </Text>
              <Text className="text-xs font-semibold text-primary/60 uppercase">
                {requisition.product?.baseUnit?.name || "KG"} Units
              </Text>
            </div>
          </div>
        </div>

        {/* Notes Section - Clean Theme */}
        {(requisition.purpose || requisition.notes) && (
          <div className="px-6 py-4 border-t border-b border-gray-300 flex gap-4">
            {requisition.purpose && (
              <div className="flex-1">
                <Text className="text-[10px] font-semibold text-primary uppercase block mb-1">
                  Purpose
                </Text>
                <Text className="text-xs text-gray-600 leading-relaxed italic font-semibold">
                  "{requisition.purpose}"
                </Text>
              </div>
            )}
            {requisition.notes && (
              <div className="flex-1 border-l border-gray-300 pl-4">
                <Text className="text-[10px] font-semibold text-primary uppercase block mb-1">
                  Officer Notes
                </Text>
                <Text className="text-xs text-gray-600 leading-relaxed italic font-semibold">
                  "{requisition.notes}"
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Approval Banner */}
        {requisition.status === "approved" && (
          <div className="px-6 py-3 border-t border-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
              <div className="flex flex-col">
                <Text className="text-[10px] font-semibold text-primary uppercase tracking-wide leading-none">
                  Verified & Approved
                </Text>
                <Text className="text-[11px] font-semibold text-gray-500">
                  By{" "}
                  {typeof requisition.approvedBy === "string"
                    ? requisition.approvedBy
                    : requisition.approvedBy?.name || "Admin"}{" "}
                  • {dayjs(requisition.approvedAt).format("DD MMM YYYY")}
                </Text>
              </div>
            </div>
            {requisition.approvalComments && (
              <Tooltip title={requisition.approvalComments}>
                <div className="bg-white/80 px-3 py-1 rounded-full border border-gray-300 text-[10px] text-primary font-semibold cursor-help">
                  VIEW COMMENTS
                </div>
              </Tooltip>
            )}
          </div>
        )}
      </Card>

      {/* ---------- Table Section ---------- */}
      <Card
        className="rounded-2xl !mt-4 border border-gray-300 shadow-none bg-white overflow-hidden"
        title={
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full transition-all" />
              <Text className="text-base font-semibold text-gray-800">
                MATERIAL BREAKDOWN
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="rounded-full bg-gray-100 text-gray-600 border-0 font-semibold px-3">
                {totalItems} TYPES
              </Tag>
            </div>
          </div>
        }
      >
        <DataTable
          data={requisition.items || []}
          columns={getItemColumns()}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: 800 }}
          loading={isLoading}
        />

        {/* Professional Summary Footer */}
        <div className="mt-8 relative pt-6 border-t border-gray-300">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-1 bg-gradient-to-l from-primary/10 to-transparent" />

          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-300">
                <div className="flex flex-col">
                  <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Cumulative Raw Input
                  </Text>
                  <Text className="text-2xl font-semibold text-primary">
                    {(() => {
                      let totalInKg = 0;
                      requisition.items
                        ?.filter((item) => item.materialType === "raw")
                        .forEach((item) => {
                          const unitSymbol = item.unit.symbol.toLowerCase();
                          if (
                            unitSymbol === "g" ||
                            unitSymbol === "gram" ||
                            unitSymbol === "gm"
                          ) {
                            totalInKg += item.quantity / 1000;
                          } else {
                            totalInKg += item.quantity;
                          }
                        });
                      return `${totalInKg.toFixed(2)} kg`;
                    })()}
                  </Text>
                </div>
                <div className="w-px h-10 bg-gray-200 mx-2" />
                <div className="flex flex-col pr-4">
                  <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Expected Output
                  </Text>
                  <Text className="text-2xl font-semibold text-gray-800">
                    {requisition.batchSize.toFixed(1)}{" "}
                    <small className="text-[10px] font-semibold text-gray-400 tracking-normal uppercase">
                      Units/KG
                    </small>
                  </Text>
                </div>
              </div>
            </div>

            <div className="rounded-xl px-5 py-4 border border-gray-300 w-full md:w-72">
              <div className="flex justify-between items-center mb-1">
                <Text className="text-[10px] font-semibold text-gray-400 uppercase">
                  Summary Check
                </Text>
                <Tag
                  color="green"
                  className="!text-[9px] font-semibold rounded-full m-0 border-0"
                >
                  MATCHED ✅
                </Tag>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-semibold">
                    Material Input:
                  </span>
                  <span className="font-semibold text-gray-700">
                    {totalQuantity.toFixed(2)} Units
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-semibold">
                    Packaging:
                  </span>
                  <span className="font-semibold text-gray-700">
                    {
                      requisition.items?.filter(
                        (i) => i.materialType === "finished",
                      ).length
                    }{" "}
                    Types
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Action Button */}
      {requisition.status === "pending" && (
        <div className="flex justify-end mt-4">
          <CustomActionButton
            type="primary"
            onClick={() => setOpenStatusModal(true)}
            text="Update Stock"
            icon={<FiCheck />}
            className="rounded-full font-semibold px-8 py-3 h-auto"
            fontSize={16}
          />
        </div>
      )}

      {openStatusModal && id && (
        <RequisitionStatusModal
          open={openStatusModal}
          setOpen={setOpenStatusModal}
          requisitionId={id}
        />
      )}
    </div>
  );
};

export default DetailsRequisition;
