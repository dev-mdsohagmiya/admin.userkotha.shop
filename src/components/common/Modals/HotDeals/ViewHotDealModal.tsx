import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Badge, Divider, Modal, Tag } from "antd";
import dayjs from "dayjs";
import React from "react";
import { IHotDealData } from "../../../../types/hotDeals";

interface ViewHotDealModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IHotDealData | null;
}

const ViewHotDealModal: React.FC<ViewHotDealModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  if (!data) return null;

  const handleCancel = () => {
    setOpen(false);
  };

  // Calculate if deal is currently active (within time range)
  const now = dayjs();
  const startTime = dayjs(data.startTime);
  const endTime = dayjs(data.endTime);
  const isCurrentlyActive =
    now.isAfter(startTime) && now.isBefore(endTime) && data.isActive;
  const isUpcoming = now.isBefore(startTime);
  const isExpired = now.isAfter(endTime);

  const getStatusBadge = () => {
    if (!data.isActive) {
      return <Badge status="default" text="Inactive" />;
    }
    if (isCurrentlyActive) {
      return <Badge status="success" text="Active & Running" />;
    }
    if (isUpcoming) {
      return <Badge status="processing" text="Upcoming" />;
    }
    if (isExpired) {
      return <Badge status="error" text="Expired" />;
    }
    return <Badge status="default" text="Unknown" />;
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
      centered
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white/90 flex items-center gap-2">
              🔥 Hot Deal Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View complete information about this hot deal
            </p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Title & Subtitle Section */}
        <div className="bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <TagOutlined className="text-orange-600 dark:text-orange-400 text-xl mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {data.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {data.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <ShoppingOutlined className="text-blue-600 dark:text-blue-400 text-xl mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Product Details
              </h3>
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {data.product?.name || "N/A"}
                </p>
                {data.product?.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Category:
                    </span>
                    <Tag color="blue">{data.product.category.name}</Tag>
                  </div>
                )}
                {data.product?.brand && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Brand:
                    </span>
                    <Tag color="green">{data.product.brand.name}</Tag>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-start gap-3">
            <FileTextOutlined className="text-purple-600 dark:text-purple-400 text-xl mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {data.description}
              </p>
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Deal Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CalendarOutlined className="text-green-600 dark:text-green-400 text-lg mt-1" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Start Time
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {dayjs(data.startTime).format("DD MMM YYYY")}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {dayjs(data.startTime).format("hh:mm A")}
              </p>
            </div>
          </div>

          {/* End Time */}
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <ClockCircleOutlined className="text-red-600 dark:text-red-400 text-lg mt-1" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                End Time
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {dayjs(data.endTime).format("DD MMM YYYY")}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {dayjs(data.endTime).format("hh:mm A")}
              </p>
            </div>
          </div>
        </div>

        {/* Duration Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm">
            <ClockCircleOutlined className="text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Duration:</strong>{" "}
              {endTime.diff(startTime, "day") === 0
                ? `${endTime.diff(startTime, "hour")} hours`
                : `${endTime.diff(startTime, "day")} days`}
            </span>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Status & Metadata */}
        <div className="grid grid-cols-2 gap-4">
          {/* Active Status */}
          <div className="flex items-center gap-3">
            {data.isActive ? (
              <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-xl" />
            ) : (
              <CloseCircleOutlined className="text-red-600 dark:text-red-400 text-xl" />
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {data.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-gray-600 dark:text-gray-400 text-xl" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Created On
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {data.createdAt
                  ? dayjs(data.createdAt).format("DD MMM YYYY")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Time Status Alert */}
        {isCurrentlyActive && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium flex items-center gap-2">
              <CheckCircleOutlined />
              This deal is currently live and running! 🔥
            </p>
          </div>
        )}

        {isUpcoming && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              This deal will start on{" "}
              {dayjs(data.startTime).format("DD MMM YYYY")} at{" "}
              {dayjs(data.startTime).format("hh:mm A")}
            </p>
          </div>
        )}

        {isExpired && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
            <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
              This deal has expired on{" "}
              {dayjs(data.endTime).format("DD MMM YYYY")} at{" "}
              {dayjs(data.endTime).format("hh:mm A")}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewHotDealModal;
