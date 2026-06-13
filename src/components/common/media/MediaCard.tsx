import React from "react";
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { MediaImage } from "../../../types/media";
import { formatFileSize } from "../../../utils/mediaHelpers";
import AntImage from "../../shared/AntImage";

interface MediaCardProps {
  image: MediaImage;
  onCopy?: (url: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (image: MediaImage) => void;
  showActions?: boolean;
  size?: "small" | "default";
  disabled?: boolean;
  preview?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({
  image,
  onCopy,
  onDelete,
  onEdit,
  showActions = true,
  size = "default",
  disabled = false,
}) => {
  const isSmall = size === "small";

  return (
    <div
      className={`group relative bg-white rounded-[6px] border border-gray-200 overflow-hidden transition-all duration-300 hover:border-primary-500 hover:shadow-md ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Image Container with fixed aspect ratio */}
      <div className="relative w-full aspect-square bg-gray-50/50 overflow-hidden cursor-pointer">
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <AntImage
            accessurl
            preview={false}
            alt={image.altText || image.name}
            src={image.url}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
            className=""
          />
        </div>

        {/* Hover Actions Overlay */}
        {/* Hover Actions Overlay */}
        {showActions && !disabled && (
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-start justify-end p-2 gap-2">
            {onCopy && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(image.url);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-primary-600 transition-colors shadow-sm cursor-pointer"
                title="Copy URL"
              >
                <CopyOutlined className="text-sm" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(image);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-blue-600 transition-colors shadow-sm cursor-pointer"
                title="Rename"
              >
                <EditOutlined className="text-sm" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(image.id);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-red-500 transition-colors shadow-sm cursor-pointer"
                title="Delete"
              >
                <DeleteOutlined className="text-sm" />
              </button>
            )}
          </div>
        )}

        {/* Badge for image type */}
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/50 shadow-sm">
          {image.type.split("/")[1] || image.type}
        </div>
      </div>

      {/* Image Info */}
      <div
        className={`p-2.5 border-t border-gray-100 bg-white ${isSmall ? "p-2" : ""}`}
      >
        <h4
          className="font-semibold text-gray-700 truncate text-xs group-hover:text-primary-600 transition-colors text-center"
          title={image.name}
        >
          {image.name}
        </h4>

        <div className="flex items-center justify-center">
          <span className="text-[10px] text-gray-400 font-medium">
            {formatFileSize(image.size)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
