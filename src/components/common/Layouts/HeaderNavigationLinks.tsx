import { Link, useLocation } from "react-router-dom";
import { DESIGNATION_MODULE_ACTIONS } from "../../../constants/designationModuleActions";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { moduleHasAction } from "../../../utils/permissions";

const HeaderNavigationLinks: React.FC = () => {
  const location = useLocation();

  const { hasCreate: newOrder } = useModulePermissions("New Orders");
  const { hasView: completedOrders } = useModulePermissions("Orders");
  const { hasView: searchOrders } = useModulePermissions("Search Orders");
  const { allActions: deliveryAllActions } =
    useModulePermissions("Delivery Orders");
  const deliveryOrderActions =
    DESIGNATION_MODULE_ACTIONS["Delivery Orders"] ?? [];
  const deliveryOrders = deliveryOrderActions.some((action) =>
    moduleHasAction(deliveryAllActions, action),
  );
  const { hasView: warehouseOrders } = useModulePermissions(
    "Warehouse Orders",
  );

  return (
    <div className="hidden lg:flex items-center gap-1 p-1 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-lg shadow-[0_2px_15px_-6px_rgba(0,0,0,0.05)]">
      {searchOrders && (
        <Link
          to="/orders/search"
          className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            location.pathname === "/orders/search"
              ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-none ring-1 ring-black/[0.04] dark:ring-white/10 scale-[1.02]"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          }`}
        >
          <span className="relative z-10 whitespace-nowrap">Search </span>
          {location.pathname === "/orders/search" && (
            <span className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 opacity-50 rounded-lg -z-0"></span>
          )}
        </Link>
      )}

      {searchOrders && newOrder && (
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
      )}

      {newOrder && (
        <Link
          to="/orders/create"
          className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            location.pathname === "/orders/create"
              ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-none ring-1 ring-black/[0.04] dark:ring-white/10 scale-[1.02]"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          }`}
        >
          <span className="relative z-10 whitespace-nowrap">New Order</span>
          {location.pathname === "/orders/create" && (
            <span className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 opacity-50 rounded-lg -z-0"></span>
          )}
        </Link>
      )}

      {newOrder && completedOrders && (
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
      )}

      {completedOrders && (
        <>
          <Link
            to="/orders/complete"
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              location.pathname === "/orders/complete"
                ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-none ring-1 ring-black/[0.04] dark:ring-white/10 scale-[1.02]"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            }`}
          >
            <span className="relative z-10 whitespace-nowrap">Orders</span>
          </Link>
        </>
      )}

      {completedOrders && warehouseOrders && (
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
      )}

      {warehouseOrders && (
        <Link
          to="/orders/warehouse"
          className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            location.pathname === "/orders/warehouse"
              ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-none ring-1 ring-black/[0.04] dark:ring-white/10 scale-[1.02]"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          }`}
        >
          <span className="relative z-10 whitespace-nowrap">Warehouse</span>
        </Link>
      )}

      {warehouseOrders && deliveryOrders && (
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
      )}

      {deliveryOrders && (
        <Link
          to="/orders/delivery"
          className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            location.pathname === "/orders/delivery"
              ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-none ring-1 ring-black/[0.04] dark:ring-white/10 scale-[1.02]"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          }`}
        >
          <span className="relative z-10 whitespace-nowrap">Delivery</span>
        </Link>
      )}
    </div>
  );
};

export default HeaderNavigationLinks;
