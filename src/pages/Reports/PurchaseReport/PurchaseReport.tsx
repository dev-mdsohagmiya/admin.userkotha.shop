import { Banknote, CheckCheck, RefreshCw } from "lucide-react";

import { Button } from "antd";
import {
  addDays,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import { useState } from "react";
import { BiSolidPurchaseTag } from "react-icons/bi";
import PageHeaderCard from "../../../components/common/Card/PageHeaderCard";
import TopPurchaseMaterialChart from "../../../components/common/Charts/PurchaseReport/TopPurchaseMaterialChart";
import TopSupplierChart from "../../../components/common/Charts/PurchaseReport/TopSupplierChart";
import VatAnalysisChart from "../../../components/common/Charts/PurchaseReport/VatAnalysisChart";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import PurchaseReportSkeleton from "../../../components/skeleton/PurchaseReportSkeleton";
import { useModulePermissions } from "../../../hooks/usePermissions";
import {
  useGetPurchaseDiscountAndVatAnalysisQuery,
  useGetPurchaseSummeryQuery,
  useGetPurchaseTopMaterialsQuery,
  useGetPurchaseTopSupplierQuery,
  useGetPurchaseTrendsQuery,
} from "../../../redux/features/purchases-management/purchasesManagementApi";

import { MdOutlineUnpublished } from "react-icons/md";
import PaymentDistributionChart from "../../../components/common/Charts/PurchaseReport/PaymentDistributionChart";
import { DisplayCurrency } from "../../../utils/currency";
import FinancialOverviewCards from "./FinancialOverviewCards";
const PurchaseReport: React.FC = () => {
  //date filtering

  // purchase state
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { allActions, isSuperAdmin } =
    useModulePermissions("Purchase Report");

  // work -----------------------------------------------
  // summery card
  const { data: purchaseSummery, isLoading: summeryLoading } =
    useGetPurchaseSummeryQuery(undefined);
  const summery = purchaseSummery?.data || {};

  const totalPurchases = summery?.totalPurchases;
  const totalAmount = summery?.totalAmount;
  const totalPaid = summery?.totalPaid;
  const totalDue = summery?.totalDue;

  // Trends Purchase-----------------------------------------

  const today = new Date();

  let startDate: string | undefined;
  let endDate: string | undefined;

  if (selectedFilter !== "all") {
    switch (selectedFilter) {
      case "day":
        startDate = format(today, "yyyy-MM-dd");
        endDate = format(addDays(today, 1), "yyyy-MM-dd"); // next day
        break;

      case "week": {
        // getDay() → 0=Sunday, 1=Monday, ... 6=Saturday
        const day = today.getDay();

        // Find previous Saturday (week start)
        // If today is Saturday → no subtraction
        // Else → subtract (day + 1) days from today
        const daysSinceSaturday = (day + 1) % 7;
        const startOfWeekDate = subDays(today, daysSinceSaturday);

        // Friday is 6 days after Saturday
        const endOfWeekDate = addDays(startOfWeekDate, 6);

        startDate = format(startOfWeekDate, "yyyy-MM-dd"); // Saturday
        endDate = format(addDays(endOfWeekDate, 1), "yyyy-MM-dd"); // next day after Friday
        break;
      }

      case "month":
        startDate = format(startOfMonth(today), "yyyy-MM-dd");
        endDate = format(addDays(endOfMonth(today), 1), "yyyy-MM-dd");
        break;

      case "year":
        startDate = format(startOfYear(today), "yyyy-MM-dd");
        endDate = format(addDays(endOfYear(today), 1), "yyyy-MM-dd");
        break;

      default:
        startDate = undefined;
        endDate = undefined;
        break;
    }
  }

  // Then pass to your query:
  const {
    data: purchaseTrends,
    isLoading: trendsLoading,
    isFetching: trandFetching,
    refetch: purchaseTrendRefetch,
  } = useGetPurchaseTrendsQuery(
    selectedFilter === "all"
      ? []
      : [
          { name: "startDate", value: startDate },
          { name: "endDate", value: endDate },
        ],
  );

  const trends = purchaseTrends?.data || {};

  // top suppliers------------------------------

  const {
    data: purchaseTopSuppliers,
    isLoading: topSupplierLoading,
    refetch: topSupplierReface,
    isFetching: topSupplierFace,
  } = useGetPurchaseTopSupplierQuery(undefined);
  const topSuppliers = purchaseTopSuppliers?.data || {};

  //useGetPurchaseDiscountAndVatAnalysisQuery--------------------------------
  const {
    data: discountAndVatData,
    isLoading: discountAndVatLoading,
    refetch: discountVatReface,
    isFetching: discountVatFace,
  } = useGetPurchaseDiscountAndVatAnalysisQuery(undefined);
  const disCountAndVatData = discountAndVatData?.data || {};

  //useGetPurchaseTopMaterialsQuery--------------------------------
  const {
    data: topMaterialData,
    isLoading: topMaterialLoading,
    refetch: topMaterialReface,
    isFetching: topMaterialFace,
  } = useGetPurchaseTopMaterialsQuery(undefined);
  const topMaterials = topMaterialData?.data || {};

  const columns = [
    {
      title: "Date",
      dataIndex: "period",
      key: "period",
      sorter: (
        a: { period: string | number | Date },
        b: { period: string | number | Date },
      ) => new Date(a.period).getTime() - new Date(b.period).getTime(),
      render: (text: string) =>
        new Date(text).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      title: "Total Purchases",
      dataIndex: "totalPurchases",
      key: "totalPurchases",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (totalAmount: number) => <DisplayCurrency amount={totalAmount} />,
    },
    {
      title: "Total Paid",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (totalPaid: number) => <DisplayCurrency amount={totalPaid} />,
    },
    {
      title: "Total Due",
      dataIndex: "totalDue",
      key: "totalDue",
      render: (totalDue: number) => (
        <span className="font-semibold text-red-700">
          <DisplayCurrency amount={totalDue} />
        </span>
      ),
    },
  ];

  if (
    summeryLoading ||
    trendsLoading ||
    topSupplierLoading ||
    discountAndVatLoading ||
    topMaterialLoading ||
    topSupplierFace ||
    discountVatFace ||
    topMaterialFace
  )
    return <PurchaseReportSkeleton />;

  return (
    <div className="">
      <PageHeader
        title="Purchase Report"
        subtitle="Track and analyze your purchase orders and supplier transactions"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Reports", path: "/reports" },
          { title: "Purchase Report", path: "/reports/purchase" },
        ]}
        extra={[
          // <Button
          //   key="export"
          //   className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          // >
          //   <Download className="w-4 h-4" /> Export
          // </Button>,

          // <Button
          //   key="print"
          //   className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          //   onClick={() => window.print()}
          // >
          //   <Printer className="w-4 h-4" /> Print
          // </Button>,

          <Button
            key="refresh"
            onClick={() => {
              purchaseTrendRefetch();
              topSupplierReface();
              discountVatReface();
              topMaterialReface();
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>,
        ]}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <PageHeaderCard
          icon={<BiSolidPurchaseTag />}
          color="orange"
          title="Total Purchase"
          value={`${totalPurchases?.toLocaleString() || 0}`}
        />
        <PageHeaderCard
          icon={<Banknote />}
          color="purple"
          title="Total Amount"
          value={<DisplayCurrency amount={totalAmount} />}
        />
        <PageHeaderCard
          icon={<CheckCheck />}
          color="green"
          title="Total Paid"
          value={<DisplayCurrency amount={totalPaid} />}
        />
        <PageHeaderCard
          icon={<MdOutlineUnpublished />}
          color="red"
          title="Total Due"
          value={<DisplayCurrency amount={totalDue} />}
        />
      </div>

      <div>
        {/* <TimeRangePurchaseChart /> */}
        <div className="my-4">
          <TopPurchaseMaterialChart materialsData={topMaterials} />
        </div>
      </div>
      <div className={`mx-auto flex justify-center items-center my-4  `}>
        <TopSupplierChart data={topSuppliers?.slice(0, 5) || []} />
      </div>
      <div className={`${"grid-cols-1 md:grid-cols-2"} grid gap-4`}>
        <div className="bg-white rounded-md pl-2 pr-4 py-4 border border-gray-200">
          <PaymentDistributionChart />
        </div>
        <div>
          <VatAnalysisChart disCountAndVatData={disCountAndVatData} />
        </div>
      </div>

      {/* PURCHASE TRANSACTIONS TABLE */}
      <div className=" my-4">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-[16px] text-gray-800">
            Date-Wise Purchase Report
          </h3>
        </div>
        <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2">
            {(isSuperAdmin || allActions.includes("view_all")) && (
              <Button
                size="middle"
                type={selectedFilter === "all" ? "primary" : "default"}
                onClick={() => setSelectedFilter("all")}
              >
                All
              </Button>
            )}
            {(isSuperAdmin || allActions.includes("view_today")) && (
              <Button
                size="middle"
                type={selectedFilter === "day" ? "primary" : "default"}
                onClick={() => setSelectedFilter("day")}
              >
                Today
              </Button>
            )}
            {(isSuperAdmin || allActions.includes("view_weekly")) && (
              <Button
                size="middle"
                type={selectedFilter === "week" ? "primary" : "default"}
                onClick={() => setSelectedFilter("week")}
              >
                This Weak
              </Button>
            )}
            {(isSuperAdmin || allActions.includes("view_monthly")) && (
              <Button
                size="middle"
                type={selectedFilter === "month" ? "primary" : "default"}
                onClick={() => setSelectedFilter("month")}
              >
                This Month
              </Button>
            )}
            {(isSuperAdmin || allActions.includes("view_yearly")) && (
              <Button
                size="middle"
                type={selectedFilter === "year" ? "primary" : "default"}
                onClick={() => setSelectedFilter("year")}
              >
                This Year
              </Button>
            )}
          </div>
        </div>

        <div className=" max-h-[1000px] shadow-none overflow-y-auto">
          <DataTable
            columns={columns}
            loading={trendsLoading || trandFetching}
            data={trends}
            pagination={{ pageSize: 5, showSizeChanger: true }}
            bordered
            scroll={{ x: true }}
            className="rounded-lg"
          />
        </div>
      </div>
      <FinancialOverviewCards />
      {/* QUICK STATS */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
  
        <div className="bg-white p-4 rounded-lg border  transition-all duration-200">
          <h3 className="font-semibold mb-3 text-gray-800 border-b pb-2 text-sm">
            Recent Purchases
          </h3>
          <ul className="space-y-2">
            {purchaseData.slice(0, 5).map((purchase, i) => (
              <li
                key={i}
                className="p-2 border border-gray-100 rounded-md flex justify-between items-center bg-gray-50/30 hover:bg-primary/5 transition-all duration-150"
              >
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm font-medium">
                    {purchase.productName}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {purchase.supplier}
                  </span>
                </div>
                <span className="text-primary font-semibold text-sm">
                  TK ${purchase.totalCost.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border transition-all duration-200">
          <h3 className="font-semibold mb-3 text-gray-800 border-b pb-2 text-sm">
            Pending Orders
          </h3>
          <ul className="space-y-2">
            {purchaseData
              .filter((p) => p.status === "pending")
              .map((purchase, i) => (
                <li
                  key={i}
                  className="p-2 border border-gray-100 rounded-md flex justify-between items-center bg-gray-50/30 hover:bg-primary/5 transition-all duration-150"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm font-medium">
                      {purchase.productName}
                    </span>
                    <span className="text-gray-400 text-xs">
                      Qty: {purchase.quantity}
                    </span>
                  </div>
                  <span className="text-orange-600 font-semibold text-sm">
                    Pending
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div> */}
    </div>
  );
};

export default PurchaseReport;
