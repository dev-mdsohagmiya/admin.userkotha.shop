import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";

import { Tooltip } from "antd";
import { createPortal } from "react-dom";
import { useAppDispatch } from "../../../redux/features/hooks";
import { useFilteredSidebarItems } from "../../../hooks/useFilteredSidebarItems";
import { ChevronDownIcon } from "../../../icons";
import { logoutUser } from "../../../redux/features/auth/logoutUser";
import { NavItem, SubMenuItem } from "../../../types/interfaces";

// Sidebar items with Font Awesome class names
const SidebarItems: NavItem[] = [
  {
    icon: <i className="fa-solid fa-grip"></i>,
    name: "Dashboard",
    path: "/",
  },
  // {
  //   icon: <i className="fa-solid fa-file-image"></i>,
  //   name: "Media Library",
  //   path: "/media",
  // },
  {
    icon: <i className="fa-solid fa-users"></i>,
    name: "User Management",
    // permissions: ["Employees", "Designations"],
    subItems: [
      {
        name: "Designations",
        path: "/designations",
        // permissions: { module: "Designations", action: "view" },
      },
      {
        name: "Employees",
        path: "/employees",
        // permissions: { module: "Employees", action: "view" },
      },
    ],
  },
  {
    icon: <i className="fa-solid fa-shopping-cart"></i>,
    name: "Order Management",
    subItems: [
      { name: "New Order", path: "/orders/create" },
      { name: "Orders", path: "/orders/complete" },
      { name: "Warehouse Orders", path: "/orders/warehouse" },
      { name: "Delivery Orders", path: "/orders/delivery" },
    ],
  },
  {
    icon: <i className="fa-solid fa-box"></i>,
    name: "Product Management",
    subItems: [
      { name: "Products", path: "/products" },
      { name: "Combo Products", path: "/combo-products" },
      { name: "Product Purchase", path: "/product-purchase" },
      { name: "Stocks", path: "/product-stocks" },
      // { name: "Stock Transactions", path: "/stock-transactions" },
      { name: "Units", path: "/units" },
      { name: "Product Categories", path: "/product-categories" },
      { name: "Brands", path: "/brands" },
      { name: "Types", path: "/product-types" },
      { name: "Addons", path: "/addons" },
      { name: "Recipe Calculator", path: "/product-recipe-calculator" },
      { name: "Review", path: "/review-list" },
    ],
  },

  {
    icon: <i className="fa-solid fa-box-open"></i>,
    name: "Materials",
    subItems: [
      { name: "Material List", path: "/materials" },
      { name: "Requisition List", path: "/requisitions" },
      { name: "Categories", path: "/categories" },
      { name: "Stock Alert", path: "/stock-alert" },
      { name: "Purchase Need", path: "/purchase-need" },
      { name: "Purchases", path: "/purchases" },
      { name: "Returns", path: "/purchase-returns" },
      { name: "Suppliers", path: "/suppliers" },
      // { name: "Supplier Payment", path: "/supplier-payment" },
      // {
      //   name: "Material Damage",
      //   path: "/material-adjustment",
      // },
    ],
  },

  {
    icon: <i className="fa fa-industry" aria-hidden="true"></i>,
    name: "Productions",
    subItems: [
      { name: "Production List", path: "/productions" },
      { name: "Production Stock List", path: "/production-stocks" },
      // { name: "Suppliers", path: "/suppliers" },
    ],
  },
  {
    icon: <i className="fa-solid fa-shopping-bag"></i>,
    name: "Sales Management",
    subItems: [
      { name: "Sales", path: "/sales" },
      { name: "Customer List", path: "/customer" },
      // { name: "Suppliers", path: "/suppliers" },
    ],
  },
  // {
  //   icon: <i className="fa-solid fa-warehouse"></i>,
  //   name: "Inventory Management",
  //   path: "/inventory",
  // },
  // {
  //   icon: <i className="fa-solid fa-shopping-bag"></i>,
  //   name: "Sales Management",
  //   path: "/sales",
  // },
  // {
  //   icon: <i className="fa-solid fa-warehouse"></i>,
  //   name: "Inventory Management",
  //   path: "/inventory",
  // },
  {
    name: "Setup Menu",
    icon: <i className="fa-solid fa-layer-group"></i>,
    subItems: [
      { name: "Profile", path: "/profile" },
      { name: "Media Library", path: "/media" },
      { name: "Warehouses", path: "/warehouses" },
      { name: "Vat", path: "/vat-settings" },
    ],
  },
  {
    name: "Content Management",
    icon: <i className="fa-solid fa-layer-group"></i>,
    subItems: [
      { name: "Hot Deals", path: "/hot-deals" },
      { name: "Home", path: "/home" },
      { name: "About Us", path: "/about-us" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Return Policy", path: "/return-policy" },
      { name: "Terms and Conditions", path: "/terms-and-conditions" },
      { name: "Blog", path: "/blog" },
      { name: "Common", path: "/common" },
    ],
  },
  {
    icon: <i className="fa-solid fa-newspaper"></i>,
    name: "Blogs List",
    path: "/blogs",
  },
  // {
  //   icon: <i className="fa-solid fa-shopping-bag"></i>,
  //   name: "Product Purchase",
  //   path: "/product-purchase",
  // },
  {
    icon: <i className="fa-solid fa-truck"></i>,
    name: "Marketing",
    subItems: [
      { name: "Auto SMS", path: "/marketing/auto-sms" },
      { name: "Call Center Follow-ups", path: "/marketing/call-center" },
    ],
  },

  {
    icon: <i className="fa-solid fa-chart-simple"></i>,
    name: "Reports",
    subItems: [
      { name: "Profit & Sales Report", path: "/reports/profit-and-sales" },
      { name: "Employee Sales Report", path: "/reports/employee-sales" },
      { name: "Order Report", path: "/reports/order" },
      { name: "Product Report", path: "/reports/product" },
      { name: "Business Report", path: "/reports/business" },
      { name: "Sales Report", path: "/reports/sales" },
      { name: "Purchase Report", path: "/reports/purchase" },
      // { name: "Inventory Report", path: "/reports/inventory" },
    ],
  },
  {
    icon: <i className="fa-solid fa-gear"></i>,
    name: "Settings",
    subItems: [
      { name: "Comments", path: "/comments" },
      { name: "Delivery Charge", path: "/delivery-charge" },
      { name: "Coupons", path: "/coupons" },
      { name: "Order Source", path: "/order-source" },
      { name: "Shipping Note", path: "/shipping-note" },
      // { name: "Purchase Report", path: "/reports/purchase" },
      // { name: "Inventory Report", path: "/reports/inventory" },
    ],
  },
];

const othersSidebarItems: NavItem[] = [
  {
    icon: <i className="fa-solid fa-sign-out-alt"></i>,
    name: "Logout",
    action: "logout", // <-- path এর পরিবর্তে action ব্যবহার
  },
];
const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  // Get filtered sidebar items based on user permissions
  const filteredSidebarItems = useFilteredSidebarItems(SidebarItems);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return location.pathname === "/";

      // Mapping for plural paths to singular detail paths or other related paths
      const pathMappings: Record<string, string[]> = {
        "/products": ["/product/"],
        "/combo-products": ["/combo-product/"],
        "/materials": ["/material/"],
        "/purchase-returns": ["/purchase-return/"],
        "/requisitions": ["/requisition/"],
      };

      if (pathMappings[path]) {
        if (
          pathMappings[path].some((prefix) =>
            location.pathname.startsWith(prefix),
          )
        ) {
          return true;
        }
      }

      return (
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );
    },
    [location.pathname],
  );

  // Helper function to check if any nested item is active
  const isAnyNestedItemActive = useCallback(
    (items: SubMenuItem[]): boolean => {
      const checkRecursive = (currentItems: SubMenuItem[]): boolean => {
        return currentItems.some((item) => {
          if (item.path && isActive(item.path)) {
            return true;
          }
          if (item.subItems) {
            return checkRecursive(item.subItems);
          }
          return false;
        });
      };
      return checkRecursive(items);
    },
    [isActive],
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items =
        menuType === "main" ? filteredSidebarItems : othersSidebarItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          // Check if any nested item (including deeply nested) is active
          if (isAnyNestedItemActive(nav.subItems)) {
            setOpenSubmenu({
              type: menuType as "main" | "others",
              index,
            });
            submenuMatched = true;
          }
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredSidebarItems, isAnyNestedItemActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Recursive function to render nested menu items
  const renderNestedMenuItems = (items: SubMenuItem[], level: number = 0) => (
    <ul className={`space-y-1 ${level > 0 ? "ml-4" : ""}`}>
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          {item.subItems ? (
            <div>
              <button
                className={`menu-dropdown-item w-full text-left ${
                  isAnyNestedItemActive(item.subItems)
                    ? "menu-dropdown-item-active"
                    : "menu-dropdown-item-inactive"
                }`}
              >
                {item.name}
                <ChevronDownIcon className="ml-auto w-4 h-4" />
              </button>
              <div className="ml-4 mt-1">
                {renderNestedMenuItems(item.subItems, level + 1)}
              </div>
            </div>
          ) : (
            <Link
              to={item.path || "#"}
              className={`menu-dropdown-item ${
                item.path && isActive(item.path)
                  ? "menu-dropdown-item-active"
                  : "menu-dropdown-item-inactive"
              }`}
            >
              {item.name}
              {item.new && (
                <span className="ml-auto menu-dropdown-badge">new</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  // change code
  //   const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuItemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [hoveredSubmenu, setHoveredSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4 relative">
      {items.map((nav, index) => {
        const isHovered =
          !isExpanded &&
          hoveredSubmenu?.type === menuType &&
          hoveredSubmenu?.index === index;

        // Skip logout button in the main rendering
        if (nav.action === "logout") {
          return null;
        }

        // Main menu item
        return (
          <li
            key={nav.name}
            className="relative overflow-y-auto"
            ref={(el) => {
              menuItemRefs.current[`${menuType}-${index}`] = el;
            }}
            onMouseEnter={() => {
              if (!isExpanded && nav.subItems) {
                setHoveredSubmenu({ type: menuType, index });
              }
            }}
            onMouseLeave={() => {
              if (!isExpanded) setHoveredSubmenu(null);
            }}
          >
            {nav.subItems ? (
              // Item with submenu
              <button
                onClick={() => {
                  if (isExpanded) handleSubmenuToggle(index, menuType);
                }}
                className={`menu-item group cursor-pointer ${
                  isExpanded
                    ? openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                    : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size  menu-item-icon-inactive">
                  <span
                    className={`menu-item-icon-size ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "text-primary-500"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                </span>
                {/* {(isExpanded || isMobileOpen) && (
                  <span className="menu-item-text text-left truncate max-w-[150px]">
                    {nav.name.length > 15
                      ? nav.name.substring(0, 15) + "..."
                      : nav.name}
                  </span>
                )} */}

                {(isExpanded || isMobileOpen) &&
                  (nav.name.length > 15 ? (
                    <Tooltip title={nav.name} placement="right">
                      <span className="menu-item-text text-left truncate max-w-[150px]">
                        {nav.name.substring(0, 15) + "..."}
                      </span>
                    </Tooltip>
                  ) : (
                    <span className="menu-item-text text-left">{nav.name}</span>
                  ))}

                {isExpanded && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-primary-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : nav.path ? (
              // Clickable main menu item without submenu
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {!isExpanded ? (
                      <Tooltip title={nav.name} placement="right">
                        <span>{nav.icon}</span>
                      </Tooltip>
                    ) : (
                      nav.icon
                    )}
                  </span>
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span className="menu-item-text text-left">{nav.name}</span>
                )}
              </Link>
            ) : null}

            {/* Hover submenu for collapsed sidebar */}
            {!isExpanded &&
              nav.subItems &&
              isHovered &&
              (() => {
                const rect =
                  menuItemRefs.current[
                    `${menuType}-${index}`
                  ]?.getBoundingClientRect();
                if (!rect) return null;
                const scrollTop =
                  window.scrollY || document.documentElement.scrollTop;
                const scrollLeft =
                  window.scrollX || document.documentElement.scrollLeft;
                const top = rect.top + scrollTop;
                const left = rect.right + scrollLeft;

                return createPortal(
                  <div
                    className="absolute bg-white dark:bg-gray-900 shadow-lg rounded z-[9999] min-w-[200px]"
                    style={{ top: `${top}px`, left: `${left}px` }}
                  >
                    {renderNestedMenuItems(nav.subItems)}
                  </div>,
                  document.body,
                );
              })()}

            {/* Normal submenu for expanded sidebar */}
            {isExpanded && nav.subItems && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden mt-1 transition-all duration-300 ml-9"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                {renderNestedMenuItems(nav.subItems)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0  left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[260px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`pt-2.5 pb-3 px-5 lg:flex hidden border-b ${
          !isExpanded ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isMobileOpen ? (
            <img
              src="/images/logo/logo.png"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          ) : (
            <img
              src="/images/logo/logo.png"
              alt="Logo"
              className="h-9 w-auto max-w-[52px] object-contain"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 px-5 py-5 overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-4">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {/* {isExpanded || isMobileOpen ? (
                    "Menu"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )} */}
                </h2>
                {renderMenuItems(filteredSidebarItems, "main")}
              </div>
            </div>
          </nav>
        </div>

        {/* Sticky Logout Button */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={handleLogout}
            className="menu-item group w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-white/5 dark:hover:text-red-400"
          >
            <span
              className={`menu-item-icon-size ${
                !isExpanded
                  ? "text-red-600 group-hover:text-red-700 dark:text-red-500 dark:group-hover:text-red-400"
                  : "text-red-600 group-hover:text-red-700 dark:text-red-500 dark:group-hover:text-red-400"
              }`}
            >
              {!isExpanded ? (
                <Tooltip title="Logout" placement="right">
                  <span>
                    <i className="fa-solid fa-sign-out-alt"></i>
                  </span>
                </Tooltip>
              ) : (
                <i className="fa-solid fa-sign-out-alt"></i>
              )}
            </span>
            {(isExpanded || isMobileOpen) && (
              <span className="menu-item-text text-left">Logout</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
