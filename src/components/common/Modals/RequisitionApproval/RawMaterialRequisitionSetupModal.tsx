import {
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetProductRawMaterialBOMQuery,
  useProductListQuery,
} from "../../../../redux/features/product/productApi";
import { useCreateProductRequisitionMutation } from "../../../../redux/features/requisition/requisitionApi";
import {
  RawMaterialRequirement,
  RequisitionSetupModalProps,
} from "../../../../types/requisition";
import { DataTable } from "../../Tables";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RawMaterialRequisitionSetupModal: React.FC<
  RequisitionSetupModalProps
> = ({
  open,
  setOpen,
  product = {},
  createDropdownProduct,
  productId,
  initialBatchSize,
  readOnlyBatchSize = false,
  onSuccess,
  productionId,
  productionNumber,
  planItems, // Add planItems prop to calculate correct batch size
}) => {
  const { data: productData } = useProductListQuery(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string>();

  // Calculate batch size in kg based on plan items with conversion factors
  const calculateBatchSizeInKg = () => {
    if (planItems && planItems.length > 0) {
      return planItems.reduce((sum: number, item: any) => {
        const variant = item.variant;
        const conversionFactor = variant?.conversionFactor || 1;
        const plannedQty = item.plannedQty || 0;
        // Convert: (plannedQty * conversionFactor in grams) / 1000 = kg
        return sum + (plannedQty * conversionFactor) / 1000;
      }, 0);
    }
    return initialBatchSize || 0;
  };

  const [batchSize, setBatchSize] = useState<number | null>(
    calculateBatchSizeInKg(),
  );
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const navigation = useNavigate();
  const { data: bomData, isLoading: isBomLoading } =
    useGetProductRawMaterialBOMQuery(
      product?.id || selectedProductId || productId,
    );
  const productByBom = bomData?.data || [];

  const [createProductRequisition, { isLoading: creating }] =
    useCreateProductRequisitionMutation();

  const products = productData?.data || [];

  // Calculate quantity to request based on batch size and percentage
  const calculateQuantityToRequest = (item: RawMaterialRequirement) => {
    return batchSize ? (Number(batchSize) * item.percentage) / 100 : 0;
  };

  React.useEffect(() => {
    if (productionId) {
      setPurpose(`Raw materials for production ${productionNumber || ""}`);
    }
  }, [productionId, productionNumber]);

  // Total requested quantity
  const totalRequested = productByBom.reduce(
    (sum: number, item: RawMaterialRequirement) =>
      sum + calculateQuantityToRequest(item),
    0,
  );

  // Number of items to request
  const itemsToRequest = productByBom.filter(
    (item: RawMaterialRequirement) => calculateQuantityToRequest(item) > 0,
  ).length;

  const handleCreateRequisition = async () => {
    if (!batchSize) {
      message.error("Please enter batch size");
      return;
    }
    if (!purpose.trim()) {
      message.error("Please enter purpose");
      return;
    }

    const data = {
      productId: product?.id || selectedProductId || productId,
      batchSize,
      purpose,
      notes,
      productionId,
    };

    try {
      const res = await createProductRequisition(data).unwrap();

      if (res?.success) {
        toast.success(res.message || "Requisition created successfully!");
        setOpen(false);
        navigation("/productions");
        onSuccess?.();
      } else {
        toast.error(res?.message || "Failed to create requisition");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const columns = [
    {
      title: "Raw Material",
      dataIndex: "materialName",
      key: "materialName",
      render: (_: any, record: RawMaterialRequirement) => (
        <>{record.materialName}</>
      ),
    },
    {
      title: "Required Qty (%)",
      dataIndex: "percentage",
      key: "percentage",
      render: (_: any, record: RawMaterialRequirement) => (
        <span>{record.percentage} %</span>
      ),
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock: number, record: RawMaterialRequirement) => (
        <Tag
          style={{
            backgroundColor:
              stock < calculateQuantityToRequest(record) ? "red" : "green",
            color: "#fff",
          }}
        >
          {stock.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Quantity to Request",
      key: "quantityToRequest",
      render: (_: any, record: RawMaterialRequirement) => (
        <span>
          {calculateQuantityToRequest(record).toFixed(2)} {record.unit}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={1000}
      title={
        <div>
          <Title level={4}>Setup Requisition - {product?.name}</Title>
          <Text type="secondary">
            Create Raw Material requisition for production
          </Text>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Production Details */}
        <Card title="Production Details" size="small">
          <div className="space-y-4">
            <div className="flex gap-10 mt-5">
              {createDropdownProduct && (
                <Select
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  className="w-80"
                  placeholder="Select product"
                >
                  {products.map((p: any) => (
                    <Option key={p.id} value={p.id}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
              )}

              <div>
                <Text strong>Batch Size:</Text>
                <InputNumber
                  min={1}
                  max={10000}
                  value={batchSize}
                  onChange={(value: number | null) => setBatchSize(value)}
                  placeholder="Enter batch size"
                  style={{ width: "150px", marginLeft: "8px" }}
                  disabled={readOnlyBatchSize}
                />
                <Text type="secondary" style={{ marginLeft: "8px" }}>
                  kg
                </Text>
              </div>
            </div>

            <div>
              <Text strong>Purpose:</Text>
              <TextArea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter the purpose..."
                rows={3}
                style={{ marginTop: "8px" }}
              />
            </div>
          </div>
        </Card>

        {/* Material Requirements */}
        <Card
          className="mt-5!"
          title="Raw Material Requirements"
          extra={
            <Space>
              <Text>Items: {itemsToRequest}</Text>
              <Tag color="blue">Total: {totalRequested.toFixed(2)}</Tag>
            </Space>
          }
        >
          <DataTable
            data={productByBom}
            loading={isBomLoading}
            columns={columns}
            rowKey="materialId"
            pagination={false}
          />
        </Card>

        {/* Notes + Buttons */}
        <div className="mt-4">
          <Text strong>Notes (optional):</Text>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            rows={4}
            style={{ marginTop: "8px" }}
          />
        </div>

        <div className="flex justify-end items-center mt-8!">
          {/* <Text type="secondary">
            {itemsToRequest} items selected • Total: {totalRequested.toFixed(2)}
          </Text> */}
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={creating}
              onClick={handleCreateRequisition}
              disabled={!batchSize}
            >
              Create Requisition
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default RawMaterialRequisitionSetupModal;
