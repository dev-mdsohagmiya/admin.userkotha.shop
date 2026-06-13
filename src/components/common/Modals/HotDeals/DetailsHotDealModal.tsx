import { Badge, Descriptions, Modal, Tag } from "antd";
import dayjs from "dayjs";
import React from "react";
import { IHotDealData } from "../../../../types/hotDeals";

interface DetailsHotDealModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IHotDealData | null;
}

const DetailsHotDealModal: React.FC<DetailsHotDealModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  if (!data) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-800">
            Hot Deal Details 🔥
          </span>
          <Badge
            status={data.isActive ? "success" : "error"}
            text={data.isActive ? "Active" : "Inactive"}
          />
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={700}
      centered
    >
      <div className="py-4">
        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: "bold", width: "150px" }}
        >
          <Descriptions.Item label="Title">
            <span className="text-gray-900 font-medium">{data.title}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Subtitle">
            <span className="text-gray-700">{data.subtitle}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Description">
            <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {data.description}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Product">
            <Tag color="blue" className="text-sm px-2 py-0.5">
              {data.product?.name || "N/A"}
            </Tag>
            {data.product?.category && (
              <Tag color="purple" className="text-sm px-2 py-0.5 ml-2">
                {data.product.category.name}
              </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Start Time">
            <span className="text-gray-700">
              {dayjs(data.startTime).format("DD MMM YYYY, hh:mm A")}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="End Time">
            <span className="text-gray-700">
              {dayjs(data.endTime).format("DD MMM YYYY, hh:mm A")}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Remaining Time">
            {dayjs().isAfter(dayjs(data.endTime)) ? (
              <Tag color="red">Expired</Tag>
            ) : dayjs().isBefore(dayjs(data.startTime)) ? (
              <Tag color="orange">Upcoming</Tag>
            ) : (
              <Tag color="green">Running</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Created At">
            <span className="text-gray-500 text-xs">
              {dayjs(data.createdAt).format("DD MMM YYYY, hh:mm A")}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default DetailsHotDealModal;
