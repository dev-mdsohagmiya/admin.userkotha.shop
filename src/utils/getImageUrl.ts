import { config } from "../config";

/**
 * Build an image URL.
 *
 * - If `src` is already a full URL (http/https) it is returned as-is
 *   (http is upgraded to https for non-localhost hosts).
 * - Otherwise the configured image base URL is prepended:
 *   `image_access_url + "/" + path`.
 *
 * Accepts a string path/url, a `{ url }` object, or null/undefined.
 */
export function getImageUrl(
  src?: string | { url?: string } | null,
  fallback = "/fallback.png",
): string {
  if (!src) return fallback;

  const path = typeof src === "string" ? src : src.url || "";
  if (!path.trim()) return fallback;

  // Already a full URL → use it directly (no base prepend)
  if (/^https?:\/\//i.test(path)) {
    if (path.startsWith("http://") && !path.includes("localhost")) {
      return path.replace("http://", "https://");
    }
    return path;
  }

  // Relative path → base url + path
  const base = (config.image_access_url || "").replace(/\/+$/, "");
  if (!base) return path.startsWith("/") ? path : `/${path}`;

  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}
