import { DESIGNATION_MODULE_ACTIONS } from "../constants/designationModuleActions";

export type RoutePermissionEntry =
  | { module: string; action: string }
  | { module: string; actions: string[] };

/**
 * Single source of truth for ADMIN route ↔ designation module mapping.
 * Order is preserved: used to pick the first static path the user may open.
 */
export const routePermissions: Record<string, RoutePermissionEntry> = {
  "/": { module: "Dashboard", action: "view" },
  "/media": { module: "Media Library", action: "view" },
  "/units": { module: "Units", action: "view" },
  "/brands": { module: "Brands", action: "view" },
  "/materials": { module: "Materials", action: "view" },
  "/material/:id": { module: "Materials", action: "view" },
  "/material-adjustment": { module: "Materials", action: "update" },
  "/products": { module: "Products", action: "view" },
  "/addons": { module: "Addons", action: "view" },
  /** Product detail + in-app navigation from list: requires `update`. */
  "/product/:id": { module: "Products", action: "update" },
  "/product/:id/planning": {
    module: "Products",
    actions: ["planning", "update"],
  },
  "/product/update-product/:id": { module: "Products", action: "update" },
  "/create-product": { module: "Products", action: "create" },
  "/quick-view/:type/:id": { module: "Products", actions: ["view", "update"] },
  "/product/:id/addons": { module: "Products", actions: ["addons", "update"] },
  "/combo-products": { module: "Combo Products", action: "view" },
  "/combo-product/:id": { module: "Combo Products", action: "view" },
  "/combo-product/:id/planning": { module: "Combo Products", action: "view" },
  "/combo-product/:id/packaging-bom": {
    module: "Combo Products",
    action: "view",
  },
  "/combo-product/update-combo-product/:id": {
    module: "Combo Products",
    action: "update",
  },
  "/marketing/auto-sms": { module: "Auto SMS", action: "view" },
  "/marketing/call-center": {
    module: "Call Center Follow-ups",
    action: "view",
  },
  "/marketing/call-center/:id": {
    module: "Call Center Follow-ups",
    action: "view",
  },
  "/create-combo-product": { module: "Combo Products", action: "create" },
  "/categories": { module: "Categories", action: "view" },
  "/purchases": { module: "Purchases", action: "view" },
  "/purchases/:id": { module: "Purchases", action: "view" },
  "/purchase-returns": { module: "Returns", action: "view" },
  "/purchase-return/:id": { module: "Returns", action: "view" },
  "/purchase-need": { module: "Purchase Need", action: "view" },
  "/purchase-need/:id": { module: "Purchase Need", action: "view" },
  "/stock-alert": { module: "Stock Alert", action: "view" },
  "/supplier-payment": { module: "Purchases", action: "view" },
  "/review-list": { module: "Review", action: "view" },
  //materials
  "/purchase-orders": { module: "Purchases", action: "view" },
  "/product-stocks": { module: "Stocks", action: "view" },
  "/stock-transactions": { module: "Stock", action: "view" },
  "/requisitions": { module: "Requisition List", action: "view" },
  "/requisition/:id": { module: "Requisition List", action: "view" },
  "/sales": { module: "Sales", action: "view" },
  "/sales/:id": { module: "Sales", action: "view" },
  "/customer": { module: "Customer List", action: "view" },
  "/employees": { module: "Employees", action: "view" },
  "/designations": { module: "Designations", action: "view" },
  "/suppliers": { module: "Suppliers", action: "view" },
  "/suppliers/:id": { module: "Suppliers", action: "view" },
  "/productions": { module: "Production List", action: "view" },
  "/product-categories": { module: "Product Categories", action: "view" },
  "/production-stocks": { module: "Production Stock List", action: "view" },
  "/reports/sales": { module: "Sales Report", action: "view" },
  "/reports/employee-sales": {
    module: "Employee Sales Report",
    action: "view",
  },
  "/reports/order": { module: "Order Report", action: "view" },
  "/reports/product": { module: "Product Report", action: "view" },
  "/reports/business": { module: "Business Report", action: "view" },
  "/reports/purchase": { module: "Purchase Report", action: "view" },
  "/reports/profit-and-sales": {
    module: "Profit & Sales Report",
    action: "view",
  },
  "/suppliers-payment": { module: "Purchases", action: "view" },
  "/warehouses": { module: "Warehouses", action: "view" },
  "/warehouses/:id": { module: "Warehouses", action: "view" },
  "/vat-settings": { module: "Vat", action: "view" },
  "/delivery-charge": { module: "Delivery Charge", action: "view" },

  // ==================== ORDER MANAGEMENT ====================
  "/orders": { module: "Orders", action: "view" },
  "/orders/complete": { module: "Orders", action: "view" },
  "/orders/incomplete": { module: "Orders", action: "view" },
  "/orders/:id": { module: "Orders", action: "view" },
  "/orders/:id/follow-up": { module: "Orders", action: "update" },
  "/orders/incomplete/:id": { module: "Orders", action: "view" },
  "/orders/create": { module: "New Orders", action: "create" },

  // ==================== CONTENT MANAGEMENT ====================
  "/home": { module: "Content Management", action: "view" },
  "/common": { module: "Content Management", action: "view" },
  "/home/image-sections": { module: "Content Management", action: "view" },
  "/home/counter-sections": { module: "Content Management", action: "view" },
  "/home/promise-sections": { module: "Content Management", action: "view" },
  "/hot-deals": { module: "Hot Deals", action: "view" },
  "/about-us": { module: "Content Management", action: "view" },
  "/blog": { module: "Content Management", action: "view" },
  "/privacy-policy": { module: "Content Management", action: "view" },
  "/terms-and-conditions": { module: "Content Management", action: "view" },
  "/return-policy": { module: "Content Management", action: "view" },

  // ==================== ADDITIONAL MODULES ====================
  "/coupons": { module: "Coupons", action: "view" },
  "/blogs": { module: "Blogs List", action: "view" },
  "/product-types": { module: "Types", action: "view" },
  "/comments": { module: "Comments", action: "view" },
  "/shipping-note": { module: "Shipping Note", action: "view" },
  "/order-source": { module: "Order Source", action: "view" },
  "/orders/warehouse": { module: "Warehouse Orders", action: "view" },
  "/orders/search": { module: "Search Orders", action: "view" },
  "/orders/delivery": {
    module: "Delivery Orders",
    actions: DESIGNATION_MODULE_ACTIONS["Delivery Orders"] ?? [],
  },
  "/product-purchase/:id": { module: "Product Purchase", action: "view" },
  "/product-recipe-calculator": { module: "Products", action: "view" },
  "/product-recipe-calculator/create": { module: "Products", action: "create" },
  "/product-recipe-calculator/update/:id": {
    module: "Products",
    action: "update",
  },
};
