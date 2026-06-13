// hooks/useCheckPath.ts
import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface SidebarItem {
  path?: string;
  name: string;
  roles?: string[];
  employeePermissions?: { module: string; action: string };
  subItems?: SidebarItem[];
}

export interface User {
  role: string;
  designation?: {
    id: string;
    name: string;
    permissions: any[];
  };
}

const useCheckPath = (items: SidebarItem[], user?: User) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Recursive function to find item by path

  const findItemByPath = useCallback(
    (currentItems: SidebarItem[]): SidebarItem | null => {
      for (const item of currentItems) {
        if (item.path === location.pathname) {
          return item;
        }
        // Recursively search in subItems
        if (item.subItems && item.subItems.length > 0) {
          const foundInSubItems = findItemByPath(item.subItems);
          if (foundInSubItems) {
            return foundInSubItems;
          }
        }
      }
      return null;
    },
    [location.pathname],
  );

  useEffect(() => {
    // Only apply this logic if user role is EMPLOYEE
    if (user?.role === "EMPLOYEE") {
      // Recursively find the item matching the current path
      const currentItem = findItemByPath(items);

      if (currentItem) {
        console.log(
          "Access granted to:",
          currentItem.path,
          "-",
          currentItem.name,
        );
      } else {
        console.log(
          "Path not allowed for EMPLOYEE, redirecting to login:",
          location.pathname,
        );
        navigate("/login");
      }
    }
  }, [location.pathname, navigate, items, user, findItemByPath]);
};

export default useCheckPath;
