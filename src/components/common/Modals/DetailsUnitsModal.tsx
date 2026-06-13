import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import PageMeta from "../Meta/PageMeta";
import { IUnit } from "../../../types/units";



interface DetailsBrandModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: IUnit; // unit details
}

const DetailsUnitsModal: React.FC<DetailsBrandModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={700}
    >
      <PageMeta
        title="Unit Details"
        description="View details of the measurement unit."
      />

      <div className="mb-2">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Unit Details
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Below are the details of this measurement unit.
        </p>
      </div>

      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Name">{data?.name}</Descriptions.Item>
        <Descriptions.Item label="Symbol">{data?.symbol}</Descriptions.Item>
        <Descriptions.Item label="Description">
          {data?.description || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {data?.isActive ? (
            <Tag color="green">Active</Tag>
          ) : (
            <Tag color="red">Inactive</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default DetailsUnitsModal;
