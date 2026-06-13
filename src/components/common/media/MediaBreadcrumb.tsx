import React from "react";
import { Breadcrumb } from "antd";
import { getBreadcrumbItems } from "../../../utils/mediaHelpers";

interface MediaBreadcrumbProps {
  currentFolder: string;
  onFolderSelect: (path: string) => void;
  showItemCount?: boolean;
  itemCount?: number;
}

const MediaBreadcrumb: React.FC<MediaBreadcrumbProps> = ({
  currentFolder,
  onFolderSelect,
}) => {
  const breadcrumbItems = getBreadcrumbItems(currentFolder);

  return (
    <Breadcrumb>
      {breadcrumbItems.map((item, index) => (
        <Breadcrumb.Item
          key={item.path}
          onClick={() => onFolderSelect(item.path)}
          className={`cursor-pointer ${
            index === breadcrumbItems.length - 1
              ? "text-gray-900 font-semibold"
              : "text-gray-500 hover:text-primary-600"
          }`}
        >
          {item.title === "Root" ? "All Media" : item.title}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default MediaBreadcrumb;
