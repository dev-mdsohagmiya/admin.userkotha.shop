import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SidebarContext } from "./SidebarContext";

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const setSidebarExpanded = useCallback((value: boolean) => {
    setIsExpanded(value);
  }, []);

  const toggleSubmenu = useCallback((item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  }, []);

  // Optimize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isExpanded: isMobile ? false : isExpanded,
      isMobileOpen,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      setSidebarExpanded,
      setActiveItem,
      toggleSubmenu,
    }),
    [
      isMobile,
      isExpanded,
      isMobileOpen,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      setSidebarExpanded,
      toggleSubmenu,
    ],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};
