// import { Table } from "antd";
// import { useEffect, useState } from "react";
// import { useSidebar } from "../../../context/SidebarContext";
// import "./AntTable.css";

// export default function DataTable(props: any) {
//   const { isExpanded } = useSidebar();
//   const {
//     data,
//     columns,
//     rowKey,
//     currentPage,
//     setLimit,
//     setCurrentPage,
//     selectRow = false,
//     isPaginate,
//     showHeader,
//     total,
//     limit,
//     loading = false,
//     onSelectRowsChange,
//     showSizeChanger = false,
//     // add this sujon
//     clearSelectionTrigger = false,
//     expandable,
//     ...rest // click details page jabe
//   } = props;
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);

//   // change this clear select  sujon
//   useEffect(() => {
//     if (clearSelectionTrigger) {
//       setSelectedRowKeys([]);
//     }
//   }, [clearSelectionTrigger]);

//   // Handle row selection change
//   const handleRowSelectionChange = (
//     selectedRowKeys: any,
//     selectedRows: any,
//   ) => {
//     setSelectedRowKeys(selectedRowKeys);
//     if (onSelectRowsChange) {
//       onSelectRowsChange(selectedRows);
//     }
//   };

//   // rowSelection object for row selection features
//   const rowSelection = {
//     selectedRowKeys,
//     onChange: handleRowSelectionChange,
//     getCheckboxProps: (record: any) => {
//       return { disabled: record.name === "Disabled User", name: record.name };
//     },
//   };

//   return (
//     <Table
//       {...rest}
//       loading={loading}
//       className={`border rounded-lg ${
//         isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
//       }`}
//       rowKey={rowKey ? rowKey : "_id"}
//       rowSelection={selectRow ? rowSelection : undefined}
//       dataSource={data || []}
//       columns={columns}
//       tableLayout="fixed"
//       scroll={{ x: true }}
//       expandable={expandable}
//       pagination={
//         isPaginate
//           ? {
//               pageSize: limit || 20,
//               total: total || data?.count || data?.length || 0,
//               current: currentPage,
//               // onChange: handlePageChange,
//               onChange: (page) => {
//                 // handlePageChange(page);
//                 setCurrentPage(page);
//               },
//               showSizeChanger: showSizeChanger,
//               pageSizeOptions: ["10", "25", "50", "100", "200", "500", "1000"],
//               onShowSizeChange: (_current, newSize) => {
//                 setLimit(newSize);
//                 setCurrentPage(1);
//               },
//               showQuickJumper: true,
//             }
//           : false
//       }
//       showHeader={showHeader}
//     />
//   );
// }

// left to right side a onclick mouse norale tabel scorll  hobe

import { Table } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { useSidebar } from "../../../context/SidebarContext";
import "./AntTable.css";

export default function DataTable(props: any) {
  const { isExpanded } = useSidebar();
  const {
    data,
    columns,
    rowKey,
    currentPage,
    setLimit,
    setCurrentPage,
    selectRow = false,
    isPaginate,
    showHeader,
    total,
    limit,
    loading = false,
    onSelectRowsChange,
    showSizeChanger = false,
    // add this sujon
    clearSelectionTrigger = false,
    expandable,
    ...rest // click details page jabe
  } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // change this clear select  sujon
  useEffect(() => {
    if (clearSelectionTrigger) {
      setSelectedRowKeys([]);
    }
  }, [clearSelectionTrigger]);

  // Handle row selection change
  const handleRowSelectionChange = (
    selectedRowKeys: any,
    selectedRows: any,
  ) => {
    setSelectedRowKeys(selectedRowKeys);
    if (onSelectRowsChange) {
      onSelectRowsChange(selectedRows);
    }
  };

  // rowSelection object for row selection features
  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelectionChange,
    getCheckboxProps: (record: any) => {
      return { disabled: record.name === "Disabled User", name: record.name };
    },
  };

  /* Drag to Scroll Logic */
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    // Function to find the scrollable element
    const findScrollable = () => {
      // Priority: .ant-table-content (standard horizontal scroll) -> .ant-table-body (fixed header scroll) -> .ant-table-scroll -> wrapper
      // Also checking if the element actually has overflow hidden/auto/scroll style could be robust,
      // but targeting Ant classes is more reliable for this specific UI.
      return (wrapper.querySelector(".ant-table-content") ||
        wrapper.querySelector(".ant-table-body") ||
        (wrapper.firstChild as HTMLElement)) as HTMLElement; // basic fallback to the Table root
    };

    const slider = findScrollable();
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      isDraggingRef.current = false; // Reset drag state
      // slider.style.cursor = "grabbing";
      slider.style.userSelect = "none"; // Disable text selection while dragging
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      // slider.style.cursor = "grab";
      slider.style.removeProperty("user-select");
    };

    const onMouseUp = () => {
      isDown = false;
      // slider.style.cursor = "grab";
      slider.style.removeProperty("user-select");

      // Reset drag state after a short delay to allow click events to process safely
      // if they haven't already. BUT strictly speaking, we want to block the IMMEDIATE click.
      // We'll let the click handler read the ref, so we don't reset immediately here
      // if we want to blocking in capture phase or bubbling phase.
      // However, usually React onClick fires after onMouseUp.
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      // Multiplier can adjust speed. 1 is 1:1 movement.
      const walk = (x - startX) * 1;

      // Determine if it was a drag (move > 5px)
      if (Math.abs(walk) > 5) {
        isDraggingRef.current = true;
      }

      slider.scrollLeft = scrollLeft - walk;
    };

    // Initialize cursor
    // slider.style.cursor = "grab";

    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);

    return () => {
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
      // slider.style.cursor = "";
      slider.style.removeProperty("user-select");
    };
  }, [data, loading, columns]); // Re-run when table structure might change

  // Intercept onRow to prevent click if dragging
  const handleOnRow = (record: any, rowIndex: number) => {
    // Get the original props from rest (if passed)
    const originalOnRowProps = rest.onRow ? rest.onRow(record, rowIndex) : {};

    return {
      ...originalOnRowProps,
      onClick: (e: any) => {
        if (isDraggingRef.current) {
          // If we were dragging, do NOT fire the click handler
          return;
        }
        if (originalOnRowProps.onClick) {
          originalOnRowProps.onClick(e);
        }
      },
    };
  };

  return (
    <div ref={tableWrapperRef} className="w-full">
      <Table
        {...rest}
        onRow={handleOnRow}
        loading={loading}
        className={`border border-gray-200 !rounded-lg !shadow-none ${
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
        rowKey={rowKey ? rowKey : "_id"}
        rowSelection={selectRow ? rowSelection : undefined}
        dataSource={data || []}
        columns={columns}
        tableLayout="fixed"
        scroll={{ x: true }}
        expandable={expandable}
        pagination={
          isPaginate
            ? {
                pageSize: limit || 20,
                total: total || data?.count || data?.length || 0,
                current: currentPage,
                // onChange: handlePageChange,
                onChange: (page) => {
                  // handlePageChange(page);
                  setCurrentPage(page);
                },
                showSizeChanger: showSizeChanger,
                pageSizeOptions: [
                  "10",
                  "25",
                  "50",
                  "100",
                  "200",
                  "500",
                  "1000",
                ],
                onShowSizeChange: (_current, newSize) => {
                  setLimit(newSize);
                  setCurrentPage(1);
                },
                showQuickJumper: true,
              }
            : false
        }
        showHeader={showHeader}
      />
    </div>
  );
}
