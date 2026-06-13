import { Button, Card, InputNumber, Modal, Space, Typography } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useGetComboProductByIdQuery } from "../../../../redux/features/comboProduct/comboProductApi";
import { useUpdateProductionPlanItemsMutation } from "../../../../redux/features/production/productionApi";
import { DataTable } from "../../Tables";

const { Text, Title } = Typography;

interface PlanVariant {
  id: string; // plan item id
  variantId?: string | null;
  comboVariantId?: string | null;
  variant?: {
    id: string;
    name: string;
  };
  comboVariant?: {
    id: string;
    name: string;
  };
  plannedQty: number;
  completedQty?: number | null;
}

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  planId: string;
  items: PlanVariant[];
  comboProductId?: string | null;
  onSuccess?: () => void;
}

const ProductionCompleteModal: React.FC<Props> = ({
  open,
  setOpen,
  planId,
  items = [],
  comboProductId,
  onSuccess,
}) => {
  const [localItems, setLocalItems] = useState<PlanVariant[]>([]);
  const [initialItems, setInitialItems] = useState<PlanVariant[]>([]);

  // Fetch combo product data if this is a combo production
  const { data: comboProductData } = useGetComboProductByIdQuery(
    comboProductId || "",
    { skip: !comboProductId },
  );

  useEffect(() => {
    // Map items and populate combo variant names from fetched data
    const mappedItems = items.map((it) => {
      if (it.comboVariantId && comboProductData?.data?.variants) {
        const comboVariant = comboProductData.data.variants.find(
          (v: any) => v.id === it.comboVariantId,
        );
        return {
          ...it,
          completedQty: it.completedQty ?? 0,
          comboVariant: comboVariant
            ? { id: comboVariant.id, name: comboVariant.name }
            : undefined,
        };
      }
      return { ...it, completedQty: it.completedQty ?? 0 };
    });

    setLocalItems(mappedItems);
    setInitialItems(mappedItems);
  }, [items, open, comboProductData]);

  const [updateItems, { isLoading }] = useUpdateProductionPlanItemsMutation();

  const columns = [
    {
      title: "Variant Name",
      dataIndex: "variant",
      key: "variant",
      render: (_: any, record: PlanVariant) => {
        return (
          <div className="flex items-center gap-2">
            <span>
              {record.variant?.name || record.comboVariant?.name || "-"}
            </span>
            {record.comboVariant && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                COMBO
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Planned",
      dataIndex: "plannedQty",
      key: "plannedQty",
      render: (_: any, record: PlanVariant) => <>{record.plannedQty}</>,
    },
    {
      title: "Completed",
      key: "completed",
      render: (_: any, record: PlanVariant) => (
        <InputNumber
          min={0}
          max={Math.max(0, record.plannedQty)}
          value={record.completedQty ?? 0}
          onChange={(val) => {
            let v = Number(val) || 0;
            // Clamp to plannedQty
            if (v > record.plannedQty) {
              v = record.plannedQty;
            }
            setLocalItems((prev) =>
              prev.map((p) =>
                p.id === record.id ? { ...p, completedQty: v } : p,
              ),
            );
          }}
        />
      ),
    },
    {
      title: "Wastage",
      key: "wastage",
      render: (_: any, record: PlanVariant) => (
        <>{Math.max(0, record.plannedQty - (record.completedQty ?? 0))}</>
      ),
    },
  ];

  const totalCompleted = useMemo(
    () => localItems.reduce((s, it) => s + (Number(it.completedQty) || 0), 0),
    [localItems],
  );

  const totalWastage = useMemo(
    () =>
      localItems.reduce(
        (s, it) =>
          s + Math.max(0, it.plannedQty - (Number(it.completedQty) || 0)),
        0,
      ),
    [localItems],
  );

  const handleUpdate = async () => {
    // Prepare updates
    const updates = localItems.map((it) => ({
      planItemId: it.id,
      completedQty: Number(it.completedQty) || 0,
    }));

    // Show confirmation with totals
    Modal.confirm({
      title: "Confirm completion",
      content: (
        <div>
          <div>Total Completed: {totalCompleted}</div>
          <div>Total Wastage: {totalWastage}</div>
        </div>
      ),
      okText: "Confirm",
      okButtonProps: { style: { backgroundColor: "#16a34a" } },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res: any = await updateItems({ planId, updates }).unwrap();
          if (res?.success) {
            toast.success(res.message || "Production plan updated");
            setOpen(false);
            onSuccess?.();
          } else {
            toast.error(res?.message || "Failed to update plan items");
          }
        } catch (err: any) {
          console.error(err);
          toast.error(err?.data?.message || "Something went wrong");
        }
      },
    });
  };

  // whether any completedQty changed compared to initial items
  const hasChanges = useMemo(() => {
    if (initialItems.length !== localItems.length) return true;
    for (let i = 0; i < localItems.length; i++) {
      if (
        (initialItems[i].completedQty || 0) !==
        (localItems[i].completedQty || 0)
      )
        return true;
    }
    return false;
  }, [initialItems, localItems]);

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={800}
      title={
        <div>
          <Title level={4}>Complete Production</Title>
          <Text type="secondary">Finalize produced quantities and wastage</Text>
        </div>
      }
    >
      <div className="space-y-4">
        <Card size="small">
          <DataTable
            data={localItems}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>

        <div className="flex justify-between items-center">
          <div>
            <Text strong>Total Completed:</Text> <Text>{totalCompleted}</Text>
            <br />
            <Text strong> Total Wastage:</Text> <Text>{totalWastage}</Text>
          </div>

          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={isLoading}
              onClick={handleUpdate}
              disabled={!hasChanges || isLoading}
            >
              Update
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ProductionCompleteModal;
