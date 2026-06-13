import { Outlet } from "react-router-dom";
import { Backdrop, Header, Sidebar } from "../components/common/Layouts";
import { useSidebar } from "../context/SidebarContext";
import { SidebarProvider } from "../context/SidebarProvider";
import { useRoutePermission } from "../hooks/useRoutePermission";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  // Automatically check permissions on every route change
  useRoutePermission();

  return (
    <div className="min-h-screen lg:flex">
      <div>
        <Sidebar />
        <Backdrop />
      </div>
      <div
        // overflow-x-hidden
        className={`flex-1 transition-all duration-300 ease-in-out flex-col  ${
          isExpanded ? "lg:ml-[260px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <main>
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;
