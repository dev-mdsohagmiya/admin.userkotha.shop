import { BsCart, BsPeople, BsPersonBadge } from "react-icons/bs";
import { TbCoinTaka } from "react-icons/tb";
import PageHeaderCard from "../../../components/common/Card/PageHeaderCard";
import { useGetSalesSummaryQuery } from "../../../redux/features/sales/salesApi";
import { useGetPurchaseSummeryQuery } from "../../../redux/features/purchases-management/purchasesManagementApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface DashboardStatsProps {
  customerCount: number;
  totalAdminUsers: number;
  initialSalesAmount?: number;
  initialPurchaseAmount?: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  customerCount,
  totalAdminUsers,
  initialSalesAmount,
  initialPurchaseAmount,
}) => {
 



  const { data: salesData, isLoading: salesLoading } =
    useGetSalesSummaryQuery(undefined);
  const { data: purchaseData, isLoading: purchaseLoading } =
    useGetPurchaseSummeryQuery(undefined);

  const salesAmount =
    initialSalesAmount ?? salesData?.data?.totalFinalAmount ?? 0;
  const purchaseAmount =
    initialPurchaseAmount ?? purchaseData?.data?.totalAmount ?? 0;

  return (
    <div className="space-y-4 mb-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4">
        <PageHeaderCard
          icon={<BsPeople />}
          color="primary"
          title="Total Customers"
          value={`${customerCount || 0}`}
          count={true}
        />
        <PageHeaderCard
          icon={<BsPersonBadge />}
          color="purple"
          title="Total Admin Users"
          value={totalAdminUsers || 0}
          count={true}
        />

        <PageHeaderCard
          icon={<TbCoinTaka className="text-2xl" />}
          color="blue"
          title="Sales Amount"
          value={
            salesLoading && !initialSalesAmount ? (
              <Skeleton width={100} height={24} />
            ) : (
              salesAmount || 0
            )
          }
          count={!salesLoading || !!initialSalesAmount}
        />

        <PageHeaderCard
          icon={<BsCart />}
          color="yellow"
          title="Purchase Amount"
          value={
            purchaseLoading && !initialPurchaseAmount ? (
              <Skeleton width={100} height={24} />
            ) : (
              purchaseAmount || 0
            )
          }
          count={!purchaseLoading || !!initialPurchaseAmount}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
