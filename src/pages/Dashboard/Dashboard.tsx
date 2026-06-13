import React from "react";
import {
  ERPDepartmentsChart,
  ERPVisitorAnalyticsChart,
  PurchaseOrdersChart,
  SalesPerformanceChart,
} from "../../components/common/Charts";
import DashboardSkeleton from "../../components/skeleton/Dashboard";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useCustomerListQuery } from "../../redux/features/customers/customersApi";
import { useGetAllUserQuery } from "../../redux/features/user/userApi";

import DashboardStats from "./components/DashboardStats";
import OrderCount from "./components/OrderCount";
import OrderTrackingPanel from "./components/OrderTrackingPanel";

function App() {
  const { data: userData, isLoading } = useGetAllUserQuery([
    { name: "limit", value: "30000" },
    { name: "role", value: "ADMIN" },
  ]);

  const { data: customerData, isLoading: customerLoading } =
    useCustomerListQuery([{ name: "limit", value: "30000" }]);

  const totalAdminUsers = userData?.meta?.total || 0;
  const customerCount = customerData?.meta?.total || 0;

  if (isLoading || customerLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4">
      <PageMeta
        title="Dashboard | UserKotha.Shop ERP"
        description="Welcome to the UserKotha.Shop ERP Dashboard. View inventory, production, sales, and reports all in one place."
      />

      <DashboardStats
        customerCount={customerCount}
        totalAdminUsers={totalAdminUsers}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PurchaseOrdersChart />
        <ERPDepartmentsChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesPerformanceChart />
        <OrderCount />
      </div>

      <OrderTrackingPanel />

      <ERPVisitorAnalyticsChart />
    </div>
  );
}

export default App;
