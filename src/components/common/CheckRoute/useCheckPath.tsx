import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface SidebarItem {
  path?: string;
  name: string;
  subItems?: SidebarItem[];
}

const useCheckPath = (items: SidebarItem[], user: any, fallback = "/") => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "EMPLOYEE") {
      const userPermissions = user.designation?.permissions || [];

      // Get list of modules the user has access to
      const permittedModules = userPermissions.map(
        (perm: { module: any }) => perm.module
      );

      // Flatten all subitems
      const allSubItems = items.flatMap((i) => i.subItems || []);

      // Filter allowed subitems
      const allowedItems = allSubItems.filter((item) =>
        permittedModules.includes(item.name)
      );

      // List of allowed paths
      const permittedPaths = allowedItems.map((a) => a.path).filter(Boolean);

      // Excluded paths that everyone can access
      const alwaysAllowed: (string | RegExp)[] = [
        // Help routes
        "/",
        "/help/faq",
        "/help/documentation",

        // Product routes
        /^\/products\/[^/]+$/, // /products/:id
        /^\/product\/update-product\/[^/]+$/, // /product/update-product/:id
        /^\/product\/[^/]+\/planning$/, // /product/:id/planning

        // Combo product routes
        "/create-combo-product", // static route
        /^\/combo-product\/update-combo-product\/[^/]+$/, // /combo-product/update-combo-product/:id
        /^\/combo-product\/[^/]+\/planning$/, // /combo-product/:id/planning
        /^\/combo-product\/[^/]+\/packaging-bom$/, // /combo-product/:id/packaging-bom

        // Create product route
        "/create-product", // static route
        // Requisition route
        /^\/requisition\/[^/]+$/, // /products/:id
        /^\/purchases\/[^/]+$/, // /purchases/:id
        /^\/purchase-return\/[^/]+$/, // /purchase-return/:id
        /^\/suppliers\/[^/]+$/, // /suppliers/:id
        /^\/warehouses\/[^/]+$/, // /suppliers/:id
      ];

      // Check if current path is allowed
      const isAlwaysAllowed = alwaysAllowed.some((item) =>
        typeof item === "string"
          ? item === location.pathname
          : item.test(location.pathname)
      );

      if (!isAlwaysAllowed && !permittedPaths.includes(location.pathname)) {
        if (window.history.length > 1) {
          navigate(-1); // Go back if possible
        } else {
          navigate(fallback, { replace: true }); // Fallback route
        }
      }
    }
  }, [items, user, location.pathname, navigate, fallback]);
};

export default useCheckPath;
