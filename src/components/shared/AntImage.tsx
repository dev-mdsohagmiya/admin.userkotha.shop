import { Image } from "antd";
import { getImageUrl } from "../../utils/getImageUrl";

interface AntImageProps {
  src: string;
  alt?: string;
  accessurl?: boolean;
  className?: string;
  height?: number | string;
  width?: number | string;
  title?: string;
  style?: React.CSSProperties;
  preview?: boolean;
  fallback?: string;
}

export default function AntImage({
  src,
  alt = "image",
  accessurl = false,
  className,
  height,
  width,
  title,
  style,
  preview = true,
  fallback = "/fallback.png",
}: AntImageProps) {
  // When accessurl is set, resolve via the image base URL — but a full
  // http/https src is returned as-is (no base prepend).
  const finalSrc = accessurl ? getImageUrl(src, fallback) : src;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      title={title}
      className={className}
      style={{
        ...style,
        height,
        width,
        objectFit: "cover",
        borderRadius: "0px",
      }}
      loading="lazy"
      preview={preview}
      fallback={fallback}
    />
  );
}
