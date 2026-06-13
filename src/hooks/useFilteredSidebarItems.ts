import { useCallback, useMemo } from "react";
import { DESIGNATION_MODULE_ACTIONS } from "../constants/designationModuleActions";
import { NavItem, SubMenuItem } from "../types/interfaces";
import { usePermissions } from "./usePermissions";

// Define permissions required for each sidebar item
const sidebarPermissions: Record<
  string,
  {
    roles?: string[];
    employeePermissions?: { module: string; action: string };
  }
> = {
  // Dashboard - accessible to all authenticated users
  Dashboard: { employeePermissions: { module: "Dashboard", action: "view" } },
  // "Media Library": {},

  // Parent: show only if at least one child passes permission (same pattern as Order Management)
  "User Management": {},

  Employees: { employeePermissions: { module: "Employees", action: "view" } },
  Designations: {
    employeePermissions: { module: "Designations", action: "view" },
  },

  // -------------------------------Order Management--------------------------------
  "Order Management": {}, // Parent menu - shown if any child is accessible

  "New Order": {
    employeePermissions: { module: "New Orders", action: "create" },
  },
  Orders: {
    employeePermissions: { module: "Orders", action: "view" },
  },
  "Incomplete Orders": {
    employeePermissions: { module: "Orders", action: "view_incomplete" },
  },
  "Warehouse Orders": {
    employeePermissions: { module: "Warehouse Orders", action: "view" },
  },
  "Delivery Orders": {
    employeePermissions: { module: "Delivery Orders", action: "view" },
  },
  "Order Note": {
    employeePermissions: { module: "Orders", action: "view" },
  },
  "Order Source": {
    employeePermissions: { module: "Order Source", action: "view" },
  },
  "Shipping Note": {
    employeePermissions: { module: "Shipping Note", action: "view" },
  },

  // -------------------------------Product Management--------------------------------
  "Product Management": {}, // Parent menu - shown if any child is accessible

  Products: { employeePermissions: { module: "Products", action: "view" } },
  "Combo Products": {
    employeePermissions: { module: "Combo Products", action: "view" },
  },

  Brands: {
    employeePermissions: { module: "Brands", action: "view" },
  },
  Categories: {
    employeePermissions: { module: "Categories", action: "view" },
  },
  "Product Categories": {
    employeePermissions: { module: "Product Categories", action: "view" },
  },
  Units: {
    employeePermissions: { module: "Units", action: "view" },
  },
  Review: {
    employeePermissions: { module: "Review", action: "view" },
  },
  Types: {
    employeePermissions: { module: "Types", action: "view" },
  },
  Addons: {
    employeePermissions: { module: "Addons", action: "view" },
  },
  //--------------------------------Materials-------------------------------------------------------
  // Parent "Materials" — no module gate; visibility follows children (e.g. Categories without full Materials view).
  Materials: {},
  "Material List": {
    employeePermissions: { module: "Materials", action: "view" },
  },

  "Requisition List": {
    employeePermissions: { module: "Requisition List", action: "view" },
  },
  Purchases: {
    employeePermissions: { module: "Purchases", action: "view" },
  },
  "Stock Alert": {
    employeePermissions: { module: "Stock Alert", action: "view" },
  },
  "Purchase Need": {
    employeePermissions: { module: "Purchase Need", action: "view" },
  },
  Returns: {
    employeePermissions: { module: "Returns", action: "view" },
  },
  Suppliers: {
    employeePermissions: { module: "Suppliers", action: "view" },
  },
  "Product Purchase": {
    employeePermissions: { module: "Product Purchase", action: "view" },
  },

  //--------------------------------Sales Management------------------------------------------------

  Sales: { employeePermissions: { module: "Sales", action: "view" } },
  "Customer List": {
    employeePermissions: { module: "Customer List", action: "view" },
  },

  //--------------------------------Production------------------------------------------------

  "Production Stock List": {
    employeePermissions: { module: "Production Stock List", action: "view" },
  },
  "Production List": {
    employeePermissions: { module: "Production List", action: "view" },
  },

  //--------------------------------setup Menu------------------------------------------------

  Profile: { employeePermissions: { module: "Profile", action: "view" } },

  // Profile: { employeePermissions: { module: "Profile", action: "view" }},
  "Media Library": {
    employeePermissions: { module: "Media Library", action: "view" },
  },
  Warehouses: {
    employeePermissions: { module: "Warehouses", action: "view" },
  },
  Vat: {
    employeePermissions: { module: "Vat", action: "view" },
  },
  //--------------------------------Report------------------------------------------------

  "Sales Report": {
    employeePermissions: { module: "Sales Report", action: "view" },
  },
  "Employee Sales Report": {
    employeePermissions: { module: "Employee Sales Report", action: "view" },
  },
  "Order Report": {
    employeePermissions: { module: "Order Report", action: "view" },
  },
  "Product Report": {
    employeePermissions: { module: "Product Report", action: "view" },
  },
  "Purchase Report": {
    employeePermissions: { module: "Purchase Report", action: "view" },
  },
  "Business Report": {
    employeePermissions: { module: "Business Report", action: "view" },
  },
  "Profit & Sales Report": {
    employeePermissions: { module: "Profit & Sales Report", action: "view" },
  },

  //---------------------------------Sitting------------------------------------------------
  "User Settings": {
    employeePermissions: { module: "User Settings", action: "view" },
  },
  "Material Settings": {
    employeePermissions: { module: "Material Settings", action: "view" },
  },
  "Product Settings": {
    employeePermissions: { module: "Product Settings", action: "view" },
  },
  "Purchase Settings": {
    employeePermissions: { module: "Purchase Settings", action: "view" },
  },
  "Sales Settings": {
    employeePermissions: { module: "Sales Settings", action: "view" },
  },
  "Inventory Settings": {
    employeePermissions: { module: "Inventory Settings", action: "view" },
  },

  "Material Damage": {
    employeePermissions: { module: "Raw Materials", action: "update" },
  },
  "Blogs List": {
    employeePermissions: { module: "Blogs List", action: "view" },
  },

  //------------------------------------Content Management-------------------------------------------

  "Content Management": {}, // Parent menu
  "Hot Deals": {
    employeePermissions: { module: "Hot Deals", action: "view" },
  },
  Home: {
    employeePermissions: { module: "Content Management", action: "view" },
  },
  "About Us": {
    employeePermissions: { module: "Content Management", action: "view" },
  },
  "Privacy Policy": {
    employeePermissions: { module: "Content Management", action: "view" },
  },
  "Return Policy": {
    employeePermissions: { module: "Content Management", action: "view" },
  },
  "Terms and Conditions": {
    employeePermissions: { module: "Content Management", action: "view" },
  },
  Blog: {
    employeePermissions: { module: "Content Management", action: "view" },
  },
  Common: {
    employeePermissions: { module: "Content Management", action: "view" },
  },

  "Call Center Follow-ups": {
    employeePermissions: { module: "Call Center Follow-ups", action: "view" },
  },
  "Auto SMS": {
    employeePermissions: { module: "Auto SMS", action: "view" },
  },

  //subscribe & Settings
  Comments: {
    employeePermissions: { module: "Comments", action: "view" },
  },
  "Delivery Charge": {
    employeePermissions: { module: "Delivery Charge", action: "view" },
  },

  Coupons: {
    employeePermissions: { module: "Coupons", action: "view" },
  },

  //------------------------------------Help support-------------------------------------------

  Documentation: {},
  FAQ: {},
  "Contact Us": {},

  // Production
  Productions: {}, // Parent menu

  // Sales
  // "Sales Management": {
  //   employeePermissions: { module: "Sales", action: "view" },
  // },

  // Inventory/Stock
  Stocks: { employeePermissions: { module: "Stocks", action: "view" } },
  "Stock Transactions": {
    employeePermissions: { module: "Stock", action: "view" },
  },

  // Setup
  "Setup Menu": { roles: ["ADMIN"] },

  // Reports
  Reports: {}, // Parent menu

  "Inventory Report": {
    employeePermissions: { module: "Reports", action: "view" },
  },

  // Settings
  Settings: {}, // Parent menu
  // "User Settings": { roles: ["SUPER_ADMIN", "ADMIN"] },
  // "Material Settings": { roles: ["SUPER_ADMIN", "ADMIN"] },
  // "Product Settings": { roles: ["SUPER_ADMIN", "ADMIN"] },
  // "Purchase Settings": { roles: ["SUPER_ADMIN", "ADMIN"] },
  // "Sales Settings": { roles: ["SUPER_ADMIN", "ADMIN"] },
  // "Inventory Settings": { roles: ["SUPER_ADMIN", "ADMIN"] },
  // "VAT Settings": { roles: ["SUPER_ADMIN", "ADMIN"] },

  // Help - accessible to all
  "Help & Support": {},
};

export const useFilteredSidebarItems = (items: NavItem[]): NavItem[] => {
  const { hasPermission, hasRole, canAccessModule, isProfileLoading, user } =
    usePermissions();

  // DISABLED: This old check is replaced by useRoutePermission hook in MainLayout
  // useCheckPath(items, user);

  const filterSubMenuItem = useCallback(
    (item: SubMenuItem): SubMenuItem | null => {
      if (item.name === "Delivery Orders") {
        const actions = DESIGNATION_MODULE_ACTIONS["Delivery Orders"] ?? [];
        if (!actions.some((a) => hasPermission("Delivery Orders", a))) {
          return null;
        }
        if (item.subItems) {
          const filteredSubItems = item.subItems
            .map(filterSubMenuItem)
            .filter((subItem): subItem is SubMenuItem => subItem !== null);
          if (filteredSubItems.length === 0) {
            return null;
          }
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      }

      // Check sub-item permissions
      const itemPermissions = sidebarPermissions[item.name];
      if (itemPermissions) {
        // Orders sidebar item is visible when user has any action in Orders module
        if (item.name === "Orders" && !canAccessModule("Orders")) {
          return null;
        }

        // Check roles
        if (itemPermissions.roles && !hasRole(itemPermissions.roles)) {
          return null;
        }

        // Check employee permissions
        if (itemPermissions.employeePermissions) {
          const { module, action } = itemPermissions.employeePermissions;
          if (!hasPermission(module, action)) {
            return null;
          }
        }
      }

      // If item has subItems, filter them recursively
      if (item.subItems) {
        const filteredSubItems = item.subItems
          .map(filterSubMenuItem)
          .filter((subItem): subItem is SubMenuItem => subItem !== null);

        // If no subItems remain after filtering, hide the parent item
        if (filteredSubItems.length === 0) {
          return null;
        }

        // Return item with filtered subItems
        return {
          ...item,
          subItems: filteredSubItems,
        };
      }

      // Item has no subItems or passed all checks
      return item;
    },
    [canAccessModule, hasRole, hasPermission],
  );

  const filterItem = useCallback(
    (item: NavItem): NavItem | null => {
      // Check main item permissions
      const itemPermissions = sidebarPermissions[item.name];
      if (itemPermissions) {
        // Check roles
        if (itemPermissions.roles && !hasRole(itemPermissions.roles)) {
          return null;
        }

        // Check employee permissions
        if (itemPermissions.employeePermissions) {
          const { module, action } = itemPermissions.employeePermissions;
          if (!hasPermission(module, action)) {
            return null;
          }
        }
      }

      // If item has subItems, filter them recursively
      if (item.subItems) {
        const filteredSubItems = item.subItems
          .map(filterSubMenuItem)
          .filter((subItem): subItem is SubMenuItem => subItem !== null);

        // If no subItems remain after filtering, hide the parent item
        if (filteredSubItems.length === 0) {
          return null;
        }

        // Return item with filtered subItems
        return {
          ...item,
          subItems: filteredSubItems,
        };
      }

      // Item has no subItems or passed all checks
      return item;
    },
    [hasRole, hasPermission, filterSubMenuItem],
  );

  const filterItems = useMemo(() => {
    if (isProfileLoading && !user) {
      return items;
    }
    return items
      .map(filterItem)
      .filter((item): item is NavItem => item !== null);
  }, [items, filterItem, isProfileLoading, user]);

  return filterItems;
};
