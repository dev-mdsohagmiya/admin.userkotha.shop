import React from "react";
import { Modal, Descriptions, Tag, Divider, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import PageMeta from "../Meta/PageMeta";
import { IPackagingMaterial } from "../../../types/packagingMaterial";


interface DetailsPackagingMaterialModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IPackagingMaterial | null;
}

const DetailsPackagingMaterialModal: React.FC<DetailsPackagingMaterialModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  if (!data) return null;

  const getStockStatus = () => {
    if (data.currentStock <= data.minStock) {
      return { status: "Low Stock", color: "red", icon: <CloseCircleOutlined /> };
    } else if (data.currentStock >= data.maxStock) {
      return { status: "Overstock", color: "orange", icon: <InfoCircleOutlined /> };
    } else {
      return { status: "Optimal", color: "green", icon: <CheckCircleOutlined /> };
    }
  };

  const stockStatus = getStockStatus();

  const unitLabel =
    data.unitId === "kg"
      ? "Kilogram"
      : data.unitId === "g"
      ? "Gram"
      : data.unitId === "l"
      ? "Litre"
      : data.unitId === "piece"
      ? "Piece"
      : data.unitId;

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={900}
      title={`Packaging Material Details - ${data.name}`}
    >
      <PageMeta
        title={`Packaging Material Details - ${data.name}`}
        description={`View detailed information about ${data.name}.`}
      />

      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Name">
          <Typography.Text strong>{data.name}</Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Type">
          <Tag color={data.type === "primary" ? "blue" : "purple"}>
            {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={data.isActive ? "green" : "red"}>
            {data.isActive ? "Active" : "Inactive"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Stock Status">
          <Tag color={stockStatus.color} icon={stockStatus.icon}>
            {stockStatus.status}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Unit">{unitLabel}</Descriptions.Item>
        <Descriptions.Item label="Cost Per Unit">{data.costPerUnit}</Descriptions.Item>
        <Descriptions.Item label="Description">{data.description || "-"}</Descriptions.Item>

        <Divider />

        <Descriptions.Item label="Current Stock">
          <Typography.Text
            strong
            style={{
              color:
                data.currentStock <= data.minStock
                  ? "#cf1322"
                  : data.currentStock >= data.maxStock
                  ? "#faad14"
                  : "#52c41a",
            }}
          >
            {data.currentStock}
          </Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Minimum Stock">{data.minStock}</Descriptions.Item>
        <Descriptions.Item label="Maximum Stock">{data.maxStock}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default DetailsPackagingMaterialModal;
