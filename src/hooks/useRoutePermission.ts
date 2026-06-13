import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePermissions } from "./usePermissions";

/**
 * Complete Frontend Route to Permission Mapping
 * Based on your actual backend routes
 */
const routePermissions: Record<string, { module: string; action: string }> = {
  // Dashboard
  "/": { module: "Dashboard", action: "view" },

  // ==================== PRODUCTS ====================
  "/products": { module: "Products", action: "view" },
  "/product/:id": { module: "Products", action: "view" },
  "/product/update-product/:id": { module: "Products", action: "update" },
  "/create-product": { module: "Products", action: "create" },
  "/products/variants/for-sales": { module: "Products", action: "view" },

  // ==================== COMBO PRODUCTS ====================
  "/combo-products": { module: "Combo Products", action: "view" },
  "/combo-product/:id": { module: "Combo Products", action: "view" },
  "/combo-product/update-combo-product/:id": {
    module: "Combo Products",
    action: "update",
  },
  "/create-combo-product": { module: "Combo Products", action: "create" },

  // ==================== MATERIALS ====================
  "/materials": { module: "Materials", action: "view" },
  "/material/:id": { module: "Materials", action: "view" },
  "/material/update-material/:id": { module: "Materials", action: "update" },
  "/create-material": { module: "Materials", action: "create" },
  "/material-adjustment": { module: "Materials", action: "update" },

  // ==================== PURCHASES ====================
  "/purchases": { module: "Purchases", action: "view" },
  "/purchases/:id": { module: "Purchases", action: "view" },
  "/create-purchase": { module: "Purchases", action: "create" },
  "/purchase/update-purchase/:id": { module: "Purchases", action: "update" },
  "/purchases/stats/overview": { module: "Purchases", action: "view" },

  // Purchase Returns
  "/purchase-returns": { module: "Returns", action: "view" },
  "/purchase-return/:id": { module: "Returns", action: "view" },
  "/create-purchase-return": { module: "Returns", action: "create" },

  // Supplier Payments
  "/supplier-payment": { module: "Purchases", action: "view" },
  "/supplier-payments": { module: "Purchases", action: "view" },

  // ==================== SALES ====================
  "/sales": { module: "Sales", action: "view" },
  "/sales/:id": { module: "Sales", action: "view" },
  "/create-sale": { module: "Sales", action: "create" },
  "/sale/update-sale/:id": { module: "Sales", action: "update" },
  "/sales/stats/overview": { module: "Sales", action: "view" },
  "/sales/dues/list": { module: "Sales", action: "view" },

  // ==================== CUSTOMERS ====================
  "/customers": { module: "Customer List", action: "view" },
  "/customer/:id": { module: "Customer List", action: "view" },
  "/create-customer": { module: "Customer List", action: "create" },
  "/customer/update-customer/:id": {
    module: "Customer List",
    action: "update",
  },

  // ==================== SUPPLIERS ====================
  "/suppliers": { module: "Suppliers", action: "view" },
  "/supplier/:id": { module: "Suppliers", action: "view" },
  "/create-supplier": { module: "Suppliers", action: "create" },
  "/supplier/update-supplier/:id": { module: "Suppliers", action: "update" },

  // ==================== STOCKS ====================
  "/product-stocks": { module: "Stocks", action: "view" },
  "/stock-transactions": { module: "Stocks", action: "view" },
  "/stocks/low-stock": { module: "Stock Alert", action: "view" },
  "/stock-alert": { module: "Stock Alert", action: "view" },
  "/stocks/stats/overview": { module: "Stocks", action: "view" },

  // ==================== REQUISITIONS ====================
  "/requisitions": { module: "Requisition List", action: "view" },
  "/requisition/:id": { module: "Requisition List", action: "view" },
  "/create-requisition": { module: "Requisition List", action: "create" },
  "/requisition/update-requisition/:id": {
    module: "Requisition List",
    action: "update",
  },
  "/requisition/:id/approve": { module: "Requisition List", action: "update" },
  "/requisition/:id/reject": { module: "Requisition List", action: "update" },
  "/requisitions/stats/overview": {
    module: "Requisition List",
    action: "view",
  },

  // ==================== PRODUCTION ====================
  "/productions": { module: "Production List", action: "view" },
  "/production/:id": { module: "Production List", action: "view" },
  "/production-stocks": { module: "Production Stock List", action: "view" },

  // Production Plans
  "/production-plans": { module: "Production List", action: "view" },
  "/production-plan/:id": { module: "Production List", action: "view" },
  "/create-production-plan": { module: "Production List", action: "create" },
  "/production-plan/update/:id": {
    module: "Production List",
    action: "update",
  },

  // Combo Production Plans
  "/combo-production-plans": { module: "Production List", action: "view" },
  "/combo-production-plan/:id": { module: "Production List", action: "view" },
  "/create-combo-production-plan": {
    module: "Production List",
    action: "create",
  },
  "/combo-production-plan/update/:id": {
    module: "Production List",
    action: "update",
  },

  // ==================== EMPLOYEES & DESIGNATIONS ====================
  "/employees": { module: "Employees", action: "view" },
  "/employee/:id": { module: "Employees", action: "view" },
  "/create-employee": { module: "Employees", action: "create" },
  "/employee/update/:id": { module: "Employees", action: "update" },

  "/designations": { module: "Designations", action: "view" },
  "/designation/:id": { module: "Designations", action: "view" },
  "/create-designation": { module: "Designations", action: "create" },
  "/designation/update/:id": { module: "Designations", action: "update" },

  // ==================== WAREHOUSES ====================
  "/warehouses": { module: "Warehouses", action: "view" },
  "/warehouse/:id": { module: "Warehouses", action: "view" },
  "/create-warehouse": { module: "Warehouses", action: "create" },
  "/warehouse/update/:id": { module: "Warehouses", action: "update" },
  "/warehouse/:warehouseId/rooms": { module: "Warehouses", action: "view" },
  "/warehouse/room/:id": { module: "Warehouses", action: "view" },

  // ==================== SETTINGS ====================
  "/profile": { module: "Profile", action: "view" },
  "/media": { module: "Media Library", action: "view" },

  // Categories
  "/categories": { module: "Categories", action: "view" },
  "/category/:id": { module: "Categories", action: "view" },
  "/create-category": { module: "Categories", action: "create" },
  "/category/update/:id": { module: "Categories", action: "update" },

  // Product Categories
  "/product-categories": { module: "Product Categories", action: "view" },
  "/product-category/:id": { module: "Product Categories", action: "view" },
  "/create-product-category": {
    module: "Product Categories",
    action: "create",
  },
  "/product-category/update/:id": {
    module: "Product Categories",
    action: "update",
  },

  // Units
  "/units": { module: "Units", action: "view" },
  "/unit/:id": { module: "Units", action: "view" },
  "/create-unit": { module: "Units", action: "create" },
  "/unit/update/:id": { module: "Units", action: "update" },

  // Brands
  "/brands": { module: "Brands", action: "view" },
  "/brand/:id": { module: "Brands", action: "view" },
  "/create-brand": { module: "Brands", action: "create" },
  "/brand/update/:id": { module: "Brands", action: "update" },

  // VAT Settings
  "/vat-settings": { module: "Vat", action: "view" },
  "/vat/:id": { module: "Vat", action: "view" },
  "/create-vat": { module: "Vat", action: "create" },
  "/vat/update/:id": { module: "Vat", action: "update" },

  // ==================== REPORTS ====================
  "/reports/sales": { module: "Sales Report", action: "view" },
  "/reports/sales/summary": { module: "Sales Report", action: "view" },
  "/reports/sales/trends": { module: "Sales Report", action: "view" },
  "/reports/sales/top-customers": { module: "Sales Report", action: "view" },
  "/reports/sales/top-products": { module: "Sales Report", action: "view" },
  "/reports/sales/payment-methods": { module: "Sales Report", action: "view" },
  "/reports/sales/category-performance": {
    module: "Sales Report",
    action: "view",
  },

  "/reports/employee-sales": {
    module: "Employee Sales Report",
    action: "view",
  },

  // ======================Dynamic Content======================

  "/reports/home": { module: "Home Section Report", action: "view" },

  "/reports/purchase": { module: "Purchase Report", action: "view" },
  "/reports/purchase/summary": { module: "Purchase Report", action: "view" },
  "/reports/purchase/trends": { module: "Purchase Report", action: "view" },
  "/reports/purchase/top-suppliers": {
    module: "Purchase Report",
    action: "view",
  },
  "/reports/purchase/top-materials": {
    module: "Purchase Report",
    action: "view",
  },

  // ==================== CONTENT MANAGEMENT ====================
  "/home": { module: "Content Management", action: "view" },
  "/common": { module: "Content Management", action: "view" },
  "/home/image-sections": { module: "Content Management", action: "view" },
  "/home/counter-sections": { module: "Content Management", action: "view" },
  "/home/promise-sections": { module: "Content Management", action: "view" },
  "/hot-deals": { module: "Content Management", action: "view" },
  "/about-us": { module: "Content Management", action: "view" },
  "/blog": { module: "Content Management", action: "view" },
  "/privacy-policy": { module: "Content Management", action: "view" },
  "/terms-and-conditions": { module: "Content Management", action: "view" },
  "/return-policy": { module: "Content Management", action: "view" },
};

/**
 * Match dynamic route patterns like /product/:id with actual paths like /product/123
 */
const matchRoute = (pathname: string, routePattern: string): boolean => {
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = routePattern.split("/").filter(Boolean);

  if (pathParts.length !== patternParts.length) return false;

  return patternParts.every((part, i) => {
    // Match dynamic segments (:id, :productId, etc.) or exact matches
    return part.startsWith(":") || part === pathParts[i];
  });
};

/**
 * Get permission requirement for a given route path
 */
const getRoutePermission = (
  pathname: string,
): { module: string; action: string } | null => {
  // Remove trailing slash for consistency
  const normalizedPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  // Try exact match first
  if (routePermissions[normalizedPath]) {
    return routePermissions[normalizedPath];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, permission] of Object.entries(routePermissions)) {
    if (matchRoute(normalizedPath, pattern)) {
      return permission;
    }
  }

  return null;
};

/**
 * Hook to automatically check route permissions
 * Add this to your MainLayout component
 */
export const useRoutePermission = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, user, isProfileLoading } = usePermissions();

  useEffect(() => {
    // Public/debug routes that don't require permission checks
    const publicRoutes = [
      "/login",
      "/403",
      "/404",
      "/permission-debug",
      "/forgot-password",
      "/reset-password",
    ];
    if (publicRoutes.includes(location.pathname)) {
      return;
    }

    // Wait for GET /user/me (or skip) so checks use same permissions as ProtectedRoute
    if (isProfileLoading) {
      return;
    }

    // Skip check if user is not loaded yet
    if (!user) {
      return;
    }

    const requirement = getRoutePermission(location.pathname);

    // If no requirement found, allow access (public routes or routes not in mapping)
    if (!requirement) {
      return;
    }

    // Super Admin and Admin bypass all checks
    if (user.type === "user" && ["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return;
    }

    // Check if user has required permission
    const hasAccess = hasPermission(requirement.module, requirement.action);

    if (!hasAccess) {
      console.warn(
        `🚫 Access denied to ${location.pathname}: Missing "${requirement.action}" permission for "${requirement.module}"`,
      );
      // navigate('/', { replace: true });
      navigate(-1);
    } else {
      console.log(`✅ Access granted to ${location.pathname}`);
    }
  }, [location.pathname, hasPermission, user, navigate, isProfileLoading]);

  return {
    /**
     * Manually check if a route is accessible
     * Useful for conditionally rendering navigation links
     */
    checkRouteAccess: (path: string): boolean => {
      const requirement = getRoutePermission(path);
      if (!requirement) return true;

      if (
        user?.type === "user" &&
        ["SUPER_ADMIN", "ADMIN"].includes(user.role)
      ) {
        return true;
      }

      return hasPermission(requirement.module, requirement.action);
    },

    /**
     * Get the permission requirement for a route
     */
    getRoutePermission,
  };
};
