// File: src/pages/SalesManagement/SalesManagement.tsx
import React, { useState, useEffect } from "react";
import { Row, Col, Tabs } from "antd";
import { ShoppingCart, FileText, } from "lucide-react";
import { POSSystem } from "./POSSystem";
// import { ReturnsManagement } from "./ReturnsManagement";
import { SalesInvoices } from "./SalesInvoices";
// import { SalesReports } from "./SalesReports";
import { FiShoppingCart, FiBarChart2 } from "react-icons/fi";
import PageHeaderCard from "../../components/common/Card/PageHeaderCard";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { Loader } from "../../components/common/Loading";
import { useSalesStatusQuery } from "../../redux/features/sales/salesApi";
import { IoToday } from "react-icons/io5";
import { MdOutlineCalendarMonth } from "react-icons/md";

export const SalesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pos");

  // Listen for tab switch events from child components
  useEffect(() => {
    const handleSwitchToInvoices = () => {
      setActiveTab("invoices");
    };

    window.addEventListener(
      "switchToInvoicesTab" as any,
      handleSwitchToInvoices
    );

    return () => {
      window.removeEventListener(
        "switchToInvoicesTab" as any,
        handleSwitchToInvoices
      );
    };
  }, []);

  const {
    data: stockStatusData,
    isLoading: stockLoading,
    isFetching,
  } = useSalesStatusQuery(undefined);

  const salesStatus = stockStatusData?.data || {};

  if (isFetching || stockLoading) {
    return <Loader />;
  }



  return (
    <div className="space-y-6">
      <PageMeta
        title="Sales Management | Amzad Food ERP"
        description="This is Sales Management page"
      />
      <PageHeader
        title="Sales Management"
        subtitle="Manage POS operations and returns"
        breadcrumbs={[
          { title: "Dashboard", path: "/sales" },
          { title: "Sales Management" },
        ]}
      />

      <div>
        {/* Statistics Cards */}

        <Row gutter={[16, 16]} className="!mt-4">
          {/* Today's Sales */}
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <PageHeaderCard
              icon={<IoToday className="text-white text-2xl" />}
              title="Today's Sales"
              value={`${salesStatus?.todaySales || 0}`}
              color="cyan"
            />
          </Col>

          {/* Total Orders */}
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <PageHeaderCard
              icon={<FiShoppingCart className="text-white text-2xl" />}
              title="Total Sales"
              value={salesStatus?.totalSales || 0}
              color="indigo"
            />
          </Col>

          {/* Returns */}
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <PageHeaderCard
              icon={<MdOutlineCalendarMonth  className="text-white text-2xl" />}
              title="Monthly Sales"
              value={salesStatus?.monthlySales || 0}
              color="purple"
            />
          </Col>

          {/* Conversion Rate */}
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <PageHeaderCard
              icon={<FiBarChart2 className="text-white text-2xl" />}
              title="Total Revenue"
              value={`${salesStatus?.totalRevenue || 0}`}
              color="green"
            />
          </Col>
        </Row>

        {/* Main Content Tabs */}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "pos",
              label: (
                <span className="flex items-center gap-2">
                  <ShoppingCart size={16} />
                  POS System
                </span>
              ),
              children: <POSSystem />,
            },
            {
              key: "invoices",
              label: (
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  Sales Invoices
                </span>
              ),
              children: <SalesInvoices />,
            },
            // {
            //   key: "returns",
            //   label: (
            //     <span className="flex items-center gap-2">
            //       <RotateCcw size={16} />
            //       Returns Management
            //     </span>
            //   ),
            //   children: <ReturnsManagement />,
            // },
            // {
            //   key: "reports",
            //   label: (
            //     <span className="flex items-center gap-2">
            //       <BarChart size={16} />
            //       Sales Reports
            //     </span>
            //   ),
            //   children: <SalesReports />,
            // },
          ]}
        />
      </div>
    </div>
  );
};

export default SalesManagement;
