import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ForgetPassword from "../pages/Auth/ForgetPassword";
import Login from "../pages/Auth/Login";
import ResetPassword from "../pages/Auth/ResetPassword";
import BrandsList from "../pages/Brands/BrandsList";
import Dashboard from "../pages/Dashboard/Dashboard";
import AllMediaList from "../pages/Media/Media";
import NotFound from "../pages/OtherPage/NotFound";
import PermissionDebug from "../pages/OtherPage/PermissionDebug";
import UnderDevelopment from "../pages/OtherPage/UnderDevelopment";
import ProductsList from "../pages/Product/ProductList";
import UnitsList from "../pages/Units/UnitsList";
import ProtectedRoute from "./ProtectedRoute";
import { routePermissions } from "./routePermissionsConfig";

import ChangePassword from "../pages/Auth/ChangePassword";
import BlogsList from "../pages/Blogs/BlogsList.tsx";
import CategoriesList from "../pages/Category/CategoryList";
import ComboPlanning from "../pages/ComboProduct/ComboPlanning.tsx";
import ComboProductList from "../pages/ComboProduct/ComboProductList.tsx";
import CreateComboProductPage from "../pages/ComboProduct/CreateComboProduct.tsx";
import DetailsComboProduct from "../pages/ComboProduct/DetailsComboProduct.tsx";
import PackagingBOM from "../pages/ComboProduct/PackagingBOM.tsx";
import UpdateComboProduct from "../pages/ComboProduct/UpdateComboProduct.tsx";
import CustomersList from "../pages/Customers/CustomersList.tsx";
import DesignationsList from "../pages/Designation/DesignationList.tsx";
import HotDealsList from "../pages/DynamicSectionAndContent/Home/HotDeals/HotDealsList.tsx";
import EmployeesList from "../pages/Employees/EmployeesList.tsx";
import DetailsRowMalarial from "../pages/Materials/DetailsRowMaterial.tsx";
import MaterialsList from "../pages/Materials/MaterialsList.tsx";
import MaterialDamageList from "../pages/Materials/RawMaterialDamageList.tsx";
import CreateProductPage from "../pages/Product/CreateProduct.tsx";
import DetailsProduct from "../pages/Product/DetailsProduct.tsx";
import Planning from "../pages/Product/Planning.tsx";
import QuickViewPage from "../pages/Product/QuickView.tsx";
import UpdateProduct from "../pages/Product/UpdateProduct.tsx";
import ProductCategoryList from "../pages/ProductCategory/ProductCategoryList.tsx";
import ProductStockManagement from "../pages/ProductStockManagement/ProductStockManagement.tsx";
import ProductTypeList from "../pages/ProductType/ProductTypeList.tsx";
import ProductionList from "../pages/Production/Production/ProductionList.tsx";
import ProductionStockList from "../pages/Production/ProductionStock/ProductionStockList.tsx";
import Profile from "../pages/Profille/Profile.tsx";
import PurchasesList from "../pages/PurchaseManagement/PurchaseList";
import PurchaseNeedDetails from "../pages/PurchaseManagement/PurchaseNeedDetails";
import PurchaseNeedList from "../pages/PurchaseManagement/PurchaseNeedList";
import PurchaseOrdersList from "../pages/PurchaseManagement/PurchaseOrderList.tsx";
import PurchaseReturnList from "../pages/PurchaseManagement/PurchaseReturnList";
import PurchaseReturnView from "../pages/PurchaseManagement/PurchaseReturnView";
import PurchaseView from "../pages/PurchaseManagement/PurchaseView";
import StockAlert from "../pages/PurchaseManagement/StockAlert";
import SupplierPaymentList from "../pages/PurchaseManagement/SupplierPaymentList";
import BusinessReport from "../pages/Reports/BusinessReport/BusinessReport.tsx";
import EmployeeSalesReport from "../pages/Reports/EmployeeSalesReport/EmployeeSalesReport.tsx";
import OrderReport from "../pages/Reports/OrderReport/OrderReport.tsx";
import ProductReport from "../pages/Reports/ProductReport/ProductReport.tsx";
import ProfitAndSalesReport from "../pages/Reports/ProfitAndSalesReport/ProfitAndSalesReport.tsx";
import PurchaseReport from "../pages/Reports/PurchaseReport/PurchaseReport.tsx";
import BigSalesReport from "../pages/Reports/SalesReport/SalesReport.tsx";
import DetailsRequisition from "../pages/RequisitionList/DetailsRequisition.tsx";
import RequisitionsList from "../pages/RequisitionList/RequisitionList.tsx";
import SalesDetails from "../pages/SalesManagement/SalesDetails.tsx";
import SalesManagement from "../pages/SalesManagement/SalesManagement";
import VatSettings from "../pages/Settings/VatSettings.tsx";
import StockTransactions from "../pages/StockTransaction/StockTransactions.tsx";
import SupplierDetails from "../pages/Supplier/SupplierDetails.tsx";
import SuppliersList from "../pages/Supplier/SupplierList.tsx";
import WarehouseDetails from "../pages/warehouse/WarehouseDetails.tsx";
import WarehousesList from "../pages/warehouse/WarehousesList.tsx";

import AddonList from "../pages/AddonList/AddonList.tsx";
import CommentsList from "../pages/Comments/CommentsList.tsx";
import CouponList from "../pages/Coupons/CouponList.tsx";
import AboutContent from "../pages/DynamicSectionAndContent/About/AboutContent/AboutContent.tsx";
import BlogBanner from "../pages/DynamicSectionAndContent/Blog/BlogBanner/BlogBanner.tsx";
import DeliveryChargeList from "../pages/DynamicSectionAndContent/DeliveryCharge/DeliveryChargeList.tsx";
import CommonContent from "../pages/DynamicSectionAndContent/Home/Common/CommonContent.tsx";
import CounterSectionList from "../pages/DynamicSectionAndContent/Home/CounterSection/CounterSectionList.tsx";
import HomeContent from "../pages/DynamicSectionAndContent/Home/HomeContent/HomeContent.tsx";
import ImageSectionList from "../pages/DynamicSectionAndContent/Home/WhyChooseUs/WhyChooseUs.tsx";
import PrivacyPolicy from "../pages/DynamicSectionAndContent/PrivacyPolicy/PrivacyPolicy.tsx";
import ReturnPolicy from "../pages/DynamicSectionAndContent/ReturnPolicy/ReturnPolicy.tsx";
import TermsAndConditions from "../pages/DynamicSectionAndContent/TermsAndConditions/TermsAndConditions.tsx";
import ReviewList from "../pages/Reviews/ReviewList.tsx";

import CompletedOrderList from "../pages/OrderManagement/CompleteOrder/CompletedOrderList.tsx";
import OrderDetails from "../pages/OrderManagement/CompleteOrder/OrderDetails.tsx";
import OrderFollowUp from "../pages/OrderManagement/CompleteOrder/OrderFollowUp.tsx";
import DeliveryOrderList from "../pages/OrderManagement/Delivery/DeliveryOrderList.tsx";
import IncompleteOrderDetails from "../pages/OrderManagement/IncompleteOrder/IncompleteOrderDetails.tsx";
import IncompleteOrderList from "../pages/OrderManagement/IncompleteOrder/IncompleteOrderList.tsx";
import NewOrder from "../pages/OrderManagement/NewOrder/NewOrder.tsx";
import OrderSource from "../pages/OrderManagement/OrderSource/OrderSourceList.tsx";
import ShippingNoteList from "../pages/OrderManagement/ShippingNote/ShippingNoteList.tsx";
import WarehouseOrderControl from "../pages/OrderManagement/Warehouse/WarehouseOrderControl.tsx";
import SearchOrder from "../pages/OrderManagement/searchOrder/SearchOrder.tsx";

import ComboProductAddonsList from "../pages/AddonList/ComboProductAddonsList";
import ProductReferenceAddonsList from "../pages/AddonList/ProductReferenceAddonsList";
import AutoSmsList from "../pages/Marketing/AutoSms/AutoSmsList.tsx";
import CallCenterFollowups from "../pages/Marketing/CallCenter/CallCenterFollowups.tsx";
import CallCenterOrderDetail from "../pages/Marketing/CallCenter/CallCenterOrderDetail.tsx";
import ProductPurchaseDetails from "../pages/ProductPurchase/ProductPurchaseDetails.tsx";
import ProductPurchaseList from "../pages/ProductPurchase/ProductPurchaseList.tsx";

import CreateRecipe from "../pages/ProductRecipeCalculator/CreateRecipe.tsx";
import ProductRecipeCalculator from "../pages/ProductRecipeCalculator/ProductRecipeCalculator.tsx";
import UpdateRecipe from "../pages/ProductRecipeCalculator/UpdateRecipe.tsx";

// Helper to wrap element with protection if needed
const protectRoute = (path: string, element: React.ReactElement) => {
  const permission = routePermissions[path];
  if (!permission) {
    return element;
  }
  if ("actions" in permission && Array.isArray(permission.actions)) {
    return (
      <ProtectedRoute
        roles={["ADMIN"]}
        employeeModuleAnyOfActions={{
          module: permission.module,
          actions: permission.actions,
        }}
      >
        {element}
      </ProtectedRoute>
    );
  }
  if ("action" in permission) {
    return (
      <ProtectedRoute
        roles={["ADMIN"]}
        employeePermissions={{
          module: permission.module,
          action: permission.action,
        }}
      >
        {element}
      </ProtectedRoute>
    );
  }
  return element;
};

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { path: "/", element: protectRoute("/", <Dashboard />) },
      { path: "/media", element: protectRoute("/media", <AllMediaList />) },
      { path: "/units", element: protectRoute("/units", <UnitsList />) },
      { path: "/brands", element: protectRoute("/brands", <BrandsList />) },
      {
        path: "/materials",
        element: protectRoute("/materials", <MaterialsList />),
      },
      {
        path: "/material/:id",
        element: protectRoute("/material/:id", <DetailsRowMalarial />),
      },
      {
        path: "/material-adjustment",
        element: protectRoute("/material-adjustment", <MaterialDamageList />),
      },
      {
        path: "/products",
        element: protectRoute("/products", <ProductsList />),
      },
      {
        path: "/product/:id/planning",
        element: protectRoute("/product/:id/planning", <Planning />),
      },
      {
        path: "/product/:id/addons",
        element: protectRoute(
          "/product/:id/addons",
          <ProductReferenceAddonsList />,
        ),
      },
      {
        path: "/product/update-product/:id",
        element: protectRoute("/product/update-product/:id", <UpdateProduct />),
      },
      {
        path: "/product/:id",
        element: protectRoute("/product/:id", <DetailsProduct />),
      },
      {
        path: "/create-product",
        element: protectRoute("/create-product", <CreateProductPage />),
      },
      {
        path: "/addons",
        element: protectRoute("/addons", <AddonList />),
      },
      {
        path: "/combo-products",
        element: protectRoute("/combo-products", <ComboProductList />),
      },
      {
        path: "/combo-product/:id/addons",
        element: protectRoute("/combo-products", <ComboProductAddonsList />),
      },
      {
        path: "/combo-product/:id",
        element: protectRoute("/combo-product/:id", <DetailsComboProduct />),
      },
      {
        path: "/review-list",
        element: protectRoute("/review-list", <ReviewList />),
      },
      {
        path: "/comments",
        element: protectRoute("/comments", <CommentsList />),
      },
      {
        path: "/combo-product/:id/planning",
        element: protectRoute("/combo-product/:id/planning", <ComboPlanning />),
      },
      {
        path: "/combo-product/:id/packaging-bom",
        element: protectRoute(
          "/combo-product/:id/packaging-bom",
          <PackagingBOM />,
        ),
      },
      {
        path: "/combo-product/update-combo-product/:id",
        element: protectRoute(
          "/combo-product/update-combo-product/:id",
          <UpdateComboProduct />,
        ),
      },
      {
        path: "/create-combo-product",
        element: protectRoute(
          "/create-combo-product",
          <CreateComboProductPage />,
        ),
      },
      { path: "/profile", element: <Profile /> },
      { path: "/change-password", element: <ChangePassword /> },
      {
        path: "/categories",
        element: protectRoute("/categories", <CategoriesList />),
      },
      {
        path: "/purchases",
        element: protectRoute("/purchases", <PurchasesList />),
      },
      {
        path: "/purchases/:id",
        element: protectRoute("/purchases/:id", <PurchaseView />),
      },
      {
        path: "/purchase-returns",
        element: protectRoute("/purchase-returns", <PurchaseReturnList />),
      },
      {
        path: "/purchase-return/:id",
        element: protectRoute("/purchase-return/:id", <PurchaseReturnView />),
      },
      {
        path: "/purchase-need",
        element: protectRoute("/purchase-need", <PurchaseNeedList />),
      },
      {
        path: "/purchase-need/:id",
        element: protectRoute("/purchase-need/:id", <PurchaseNeedDetails />),
      },
      {
        path: "/stock-alert",
        element: protectRoute("/stock-alert", <StockAlert />),
      },
      {
        path: "/supplier-payment",
        element: protectRoute("/supplier-payment", <SupplierPaymentList />),
      },
      {
        path: "/purchase-orders",
        element: protectRoute("/purchase-orders", <PurchaseOrdersList />),
      },
      {
        path: "/product-stocks",
        element: protectRoute("/product-stocks", <ProductStockManagement />),
      },
      // {
      //   path: "/stock-alert",
      //   element: protectRoute("/stock-alert", <StockAlertList />),
      // },
      {
        path: "/stock-transactions",
        element: protectRoute("/stock-transactions", <StockTransactions />),
      },
      {
        path: "/requisitions",
        element: protectRoute("/requisitions", <RequisitionsList />),
      },
      {
        path: "/requisition/:id",
        element: protectRoute("/requisition/:id", <DetailsRequisition />),
      },
      { path: "/sales", element: protectRoute("/sales", <SalesManagement />) },
      {
        path: "/sales/:id",
        element: protectRoute("/sales/:id", <SalesDetails />),
      },
      {
        path: "/customer",
        element: protectRoute("/customer", <CustomersList />),
      },
      {
        path: "/employees",
        element: protectRoute("/employees", <EmployeesList />),
      },
      {
        path: "/designations",
        element: protectRoute("/designations", <DesignationsList />),
      },
      {
        path: "/suppliers",
        element: protectRoute("/suppliers", <SuppliersList />),
      },
      {
        path: "/suppliers/:id",
        element: protectRoute("/suppliers/:id", <SupplierDetails />),
      },
      {
        path: "/productions",
        element: protectRoute("/productions", <ProductionList />),
      },
      {
        path: "/product-categories",
        element: protectRoute("/product-categories", <ProductCategoryList />),
      },
      {
        path: "/production-stocks",
        element: protectRoute("/production-stocks", <ProductionStockList />),
      },
      {
        path: "/reports/sales",
        element: protectRoute("/reports/sales", <BigSalesReport />),
      },
      {
        path: "/reports/employee-sales",
        element: protectRoute(
          "/reports/employee-sales",
          <EmployeeSalesReport />,
        ),
      },
      {
        path: "/reports/order",
        element: protectRoute("/reports/order", <OrderReport />),
      },
      {
        path: "/reports/product",
        element: protectRoute("/reports/product", <ProductReport />),
      },
      {
        path: "/reports/business",
        element: protectRoute("/reports/business", <BusinessReport />),
      },
      {
        path: "/reports/purchase",
        element: protectRoute("/reports/purchase", <PurchaseReport />),
      },
      {
        path: "/reports/profit-and-sales",
        element: protectRoute(
          "/reports/profit-and-sales",
          <ProfitAndSalesReport />,
        ),
      },
      {
        path: "/suppliers-payment",
        element: protectRoute("/suppliers-payment", <SupplierPaymentList />),
      },
      {
        path: "/warehouses",
        element: protectRoute("/warehouses", <WarehousesList />),
      },
      {
        path: "/warehouses/:id",
        element: protectRoute("/warehouses/:id", <WarehouseDetails />),
      },
      {
        path: "/vat-settings",
        element: protectRoute("/vat-settings", <VatSettings />),
      },
      {
        path: "/delivery-charge",
        element: protectRoute("/delivery-charge", <DeliveryChargeList />),
      },
      { path: "/blogs", element: protectRoute("/blogs", <BlogsList />) },
      {
        path: "/product-types",
        element: protectRoute("/product-types", <ProductTypeList />),
      },
      {
        path: "/coupons",
        element: protectRoute("/coupons", <CouponList />),
      },
      {
        path: "/marketing/auto-sms",
        element: protectRoute("/marketing/auto-sms", <AutoSmsList />),
      },
      {
        path: "/marketing/call-center",
        element: <CallCenterFollowups />,
      },
      {
        path: "/marketing/call-center/:id",
        element: <CallCenterOrderDetail />,
      },

      {
        path: "/orders/search",
        element: protectRoute("/orders/search", <SearchOrder />),
      },
      {
        path: "/orders/complete",
        element: protectRoute("/orders/complete", <CompletedOrderList />),
      },
      {
        path: "/orders/incomplete",
        element: protectRoute("/orders/incomplete", <IncompleteOrderList />),
      },
      {
        path: "/orders/:id/follow-up",
        element: protectRoute("/orders/:id/follow-up", <OrderFollowUp />),
      },
      {
        path: "/orders/:id",
        element: protectRoute("/orders/:id", <OrderDetails />),
      },
      {
        path: "/orders/incomplete/:id",
        element: protectRoute(
          "/orders/incomplete/:id",
          <IncompleteOrderDetails />,
        ),
      },
      {
        path: "/orders/create",
        element: protectRoute("/orders/create", <NewOrder />),
      },
      {
        path: "/shipping-note",
        element: protectRoute("/shipping-note", <ShippingNoteList />),
      },
      {
        path: "/order-source",
        element: protectRoute("/order-source", <OrderSource />),
      },
      {
        path: "/orders/delivery",
        element: protectRoute("/orders/delivery", <DeliveryOrderList />),
      },
      {
        path: "/orders/warehouse",
        element: protectRoute("/orders/warehouse", <WarehouseOrderControl />),
      },
      {
        path: "/product-purchase",
        element: protectRoute("/product-purchase", <ProductPurchaseList />),
      },
      {
        path: "/product-purchase/:id",
        element: protectRoute(
          "/product-purchase/:id",
          <ProductPurchaseDetails />,
        ),
      },
      {
        path: "/product-recipe-calculator",
        element: protectRoute(
          "/product-recipe-calculator",
          <ProductRecipeCalculator />,
        ),
      },
      {
        path: "/product-recipe-calculator/create",
        element: protectRoute(
          "/product-recipe-calculator/create",
          <CreateRecipe />,
        ),
      },
      {
        path: "/product-recipe-calculator/update/:id",
        element: protectRoute(
          "/product-recipe-calculator/update/:id",
          <UpdateRecipe />,
        ),
      },
      { path: "/permission-debug", element: <PermissionDebug /> },
      { path: "/product-variant", element: null },
      { path: "*", element: <UnderDevelopment /> },
      // contact

      // Dynamic Content
      { path: "/home", element: protectRoute("/home", <HomeContent />) },
      { path: "/common", element: protectRoute("/common", <CommonContent />) },
      {
        path: "/home/image-sections",
        element: protectRoute("/home/image-sections", <ImageSectionList />),
      },
      {
        path: "/home/counter-sections",
        element: protectRoute("/home/counter-sections", <CounterSectionList />),
      },
      {
        path: "/home/promise-sections",
        element: protectRoute("/home/promise-sections", <HomeContent />),
      },
      {
        path: "/hot-deals",
        element: protectRoute("/hot-deals", <HotDealsList />),
      },

      // about
      {
        path: "/about-us",
        element: protectRoute("/about-us", <AboutContent />),
      },

      // blog
      { path: "/blog", element: protectRoute("/blog", <BlogBanner />) },

      // policies
      {
        path: "/privacy-policy",
        element: protectRoute("/privacy-policy", <PrivacyPolicy />),
      },
      {
        path: "/terms-and-conditions",
        element: protectRoute("/terms-and-conditions", <TermsAndConditions />),
      },
      {
        path: "/return-policy",
        element: protectRoute("/return-policy", <ReturnPolicy />),
      },
    ],
  },

  {
    path: "/quick-view/:type/:id",
    element: <QuickViewPage />,
  },
  { path: "/404", element: <NotFound /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgetPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
];

const router = createBrowserRouter(routes);

export default router;
