import { config } from "../../config";

interface ImageProps {
  src: string;
  alt?: string;
  accessurl?: boolean;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
}
export default function AppImage({
  src,
  alt = "image",
  className,
  title,
  style,
  accessurl = false,
}: ImageProps) {
  return (
    <img
      src={`${accessurl ? config.image_access_url + "/" + src : src}`}
      alt={alt}
      title={title}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}
