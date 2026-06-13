import { baseApi } from "../../api/baseApi";

const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Web Order Channel
    getWebOrderChannel: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/web-order/channel",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // product performance
    getProductPerformance: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/web-order/product-performance",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // overview
    getOrderOverview: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/web-order/overview",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // =============================<combined order>=====================
    getCombinedOrderOverview: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/overview",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // combined order
    getCombinedOrderList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/list",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    //======================< main order list >========================>
    getOrderDashboard: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/dashboard",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getOrderMainList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/main-list",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getOrderList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/product-list",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    getOrderAdvanceList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/advance-list",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order tag report  15/3/2026
    getOrderTagReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/tag",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order cross sale report
    getOrderCrossSaleReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/cross-sale",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order return report
    getOrderReturnReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/return",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order cancellation report
    getOrderCancellationReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/cancellation",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order return report
    getOrderCancellationList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/cancellation-list",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order status transition
    getProductStatusTransitionReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/status-transition",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // =================================<product report>==================================
    getProductSearchReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/product/search",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProductDetailReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/product/detail",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProductListReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/product/list",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProductCustomerPurchaseHistoryReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/product/customer-purchase-history",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProductInventoryListReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/product/inventory",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProductInventoryCategoryWiseReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/product/inventory/category-wise",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProductAZListReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/product/a-z",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    //========================= business report============================
    //monthly sales summary
    getMonthlySalesReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/monthly-sales",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // product wise sales
    getProductWiseSalesReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/product-wise-sales",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // customer wise order
    getCustomerWiseOrderReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/customer-wise-order",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // profit and sales
    getProfitAndSalesReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/profit-and-sales",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order financials
    getBusinessOrderFinancialsReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/order-financials",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order source performance
    getBusinessOrderSourcePerformanceReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/order-source-performance",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // order source area performance
    getBusinessOrderSourceAreaPerformanceReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/order-source-area-performance",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // daily slip operational
    getBusinessDailySlipOperationalReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/daily-slip-operational",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    //==========>Logistic report<============
    // cancelled orders
    getBusinessCancelledOrdersReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/cancelled-orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // courier wise delivery
    getBusinessCourierWiseDeliveryReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/courier-wise-delivery",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // courier return delivery
    getBusinessCourierReturnDeliveryReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/courier-return-delivery",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // pending delivery
    getBusinessPendingDeliveryReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/pending-delivery",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // return rto
    getBusinessReturnRTOReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/return-rto",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // area wise delivery report
    getBusinessAreaWiseDeliveryReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "reports/business/area-wise-delivery",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // daily collection
    getBusinessDailyCollectionReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/daily-collection",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // Daily cash vs bank cod
    getBusinessDailyCashVsBankCodReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/daily-cash-vs-bank-cod",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // current stock
    getBusinessCurrentStockReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/current-stock",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // delayed delivery
    getBusinessDelayedDeliveryReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/delayed-delivery",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // courier payment reconciliation
    getBusinessCourierPaymentReconciliationReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/courier-payment-reconciliation",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // ==============================percentage of collection report==============================

    // percentage of collection
    getBusinessParcelFastSlowMovingProductsReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/fast-slow-moving-products",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // low stock alert
    getBusinessParcelLowStockAlertReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/low-stock-alert",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // fast slow moving products
    getBusinessParcelCurrentStockReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/current-stock",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // stock in vs out
    getBusinessParcelStockInVsOutReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/business/stock-in-out",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    //=============== employee report=====================
    // employee order status report
    getEmployeeOrderStatusReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-status",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee order sources report
    getEmployeeOrderSourcesReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-sources",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee product report
    getEmployeeProductReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "reports/employee/product-report",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee all report
    getEmployeeAllReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/all",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee other report
    getEmployeeOtherReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/other",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee orders report
    getEmployeeOrdersReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee performance report
    getEmployeePerformanceReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/performance",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee web order updates report
    getEmployeeWebOrderUpdatesReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/web-order-updates",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee order cancellations report
    getEmployeeOrderCancellationsReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-cancellations",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee order cancellations details report
    getEmployeeOrderCancellationsDetailsReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-cancellations/details",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee order cancellations list (paginated cancellation rows)
    getEmployeeOrderCancellationsListReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-cancellations/list",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getEmployeeOrderCancellationsListDetailsReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-cancellations/list/details",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    getEmployeeOrderCancellationsListDetailsByOrderIdReport: builder.query({
      query: (orderId: string) => ({
        url: `/reports/employee/order-cancellations/list/details/${encodeURIComponent(orderId)}`,
        method: "GET",
      }),
      providesTags: ["reports"],
    }),
    getEmployeeOrderCancellationsByEmployeeReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-cancellations/by-employee",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee work log report
    getEmployeeWorkLogReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/work-log",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee work log report details
    getEmployeeWorkLogReportDetails: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/work-log/details",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee order completions report
    getEmployeeOrderCompletionsReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-completions",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // employee order completions details report
    getEmployeeOrderCompletionsDetailsReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/employee/order-completions/details",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // ===========================district map report===========================

    // getDistrictMapReport
    getDistrictMapReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/district-map",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // getDivisionMapReport
    getDivisionMapReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/division-map",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    // getDivisionMapReport
    getCourierMapReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/order/courier-map",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // =======================sales and profit report===========================
    getSalesAndProfitFinancialSummaryReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/profit-and-sales/financial-summary",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProfitAndSalesSalesReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/profit-and-sales/sales",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProfitAndSalesDeliveredOrdersReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/profit-and-sales/delivered-orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProfitAndSalesExpensesReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/profit-and-sales/expenses",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getProfitAndSalesChartReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/profit-and-sales/chart",
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),

    // =========================dashboard======================
    getDashboardOrdersReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/dashboard",
          method: "GET",
          params,
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const list = queryArgs as { name: string; value: string }[] | undefined;
        if (!list?.length) return "all";
        return list
          .map((item) => `${item.name}=${item.value}`)
          .sort()
          .join("&");
      },
      providesTags: ["reports"],
    }),

    getDashboardWebOrderTracking: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/dashboard/web-order-tracking",
          method: "GET",
          params,
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const list = queryArgs as { name: string; value: string }[] | undefined;
        if (!list?.length) return "web-tracking-all";
        return `web-tracking-${list
          .map((item) => `${item.name}=${item.value}`)
          .sort()
          .join("&")}`;
      },
      providesTags: ["reports"],
    }),

    getDashboardIncompleteOrderTracking: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: "/reports/dashboard/incomplete-order-tracking",
          method: "GET",
          params,
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const list = queryArgs as { name: string; value: string }[] | undefined;
        if (!list?.length) return "incomplete-tracking-all";
        return `incomplete-tracking-${list
          .map((item) => `${item.name}=${item.value}`)
          .sort()
          .join("&")}`;
      },
      providesTags: ["reports"],
    }),
  }),
});

export const {
  useGetWebOrderChannelQuery,
  useGetProductPerformanceQuery,
  useGetOrderOverviewQuery,
  // -----------------------<order>----------------------------------
  useGetCombinedOrderListQuery,
  useGetCombinedOrderOverviewQuery,
  // -----------------------<main order>----------------------------------
  useGetOrderDashboardQuery,
  useGetOrderMainListQuery,
  useGetOrderListQuery,
  useGetOrderAdvanceListQuery,
  useGetOrderTagReportQuery,
  useGetOrderCrossSaleReportQuery,
  useGetOrderReturnReportQuery,
  useGetOrderCancellationReportQuery,
  useGetOrderCancellationListQuery,
  useGetProductStatusTransitionReportQuery,
  useGetProductSearchReportQuery,
  useGetProductDetailReportQuery,
  useGetProductListReportQuery,
  useGetProductCustomerPurchaseHistoryReportQuery,
  useGetProductInventoryListReportQuery,
  useGetProductInventoryCategoryWiseReportQuery,
  useGetProductAZListReportQuery,
  //---------------- business report>-----------------------------
  useGetMonthlySalesReportQuery,
  useGetProductWiseSalesReportQuery,
  useGetCustomerWiseOrderReportQuery,
  useGetProfitAndSalesReportQuery,
  useGetBusinessOrderFinancialsReportQuery,
  useGetBusinessOrderSourcePerformanceReportQuery,
  useGetBusinessOrderSourceAreaPerformanceReportQuery,
  useGetBusinessDailySlipOperationalReportQuery,

  //================>Logistic report<============
  useGetBusinessCancelledOrdersReportQuery,
  useGetBusinessCourierWiseDeliveryReportQuery,
  useGetBusinessCourierReturnDeliveryReportQuery,
  useGetBusinessPendingDeliveryReportQuery,
  useGetBusinessReturnRTOReportQuery,
  useGetBusinessAreaWiseDeliveryReportQuery,
  useGetBusinessDailyCollectionReportQuery,
  useGetBusinessDailyCashVsBankCodReportQuery,
  useGetBusinessCurrentStockReportQuery,
  useGetBusinessDelayedDeliveryReportQuery,
  useGetBusinessCourierPaymentReconciliationReportQuery,
  //============<percentage of collection report>==============================
  useGetBusinessParcelFastSlowMovingProductsReportQuery,
  useGetBusinessParcelLowStockAlertReportQuery,
  useGetBusinessParcelCurrentStockReportQuery,
  useGetBusinessParcelStockInVsOutReportQuery,
  //================>Employee report<============
  useGetEmployeeOrderStatusReportQuery,
  useGetEmployeeOrderSourcesReportQuery,
  useGetEmployeeProductReportQuery,
  useGetEmployeeAllReportQuery,
  useGetEmployeeOtherReportQuery,
  useGetEmployeeOrdersReportQuery,
  useGetEmployeePerformanceReportQuery,
  useGetEmployeeWebOrderUpdatesReportQuery,
  useGetEmployeeOrderCancellationsReportQuery,
  useGetEmployeeOrderCancellationsDetailsReportQuery,
  useGetEmployeeOrderCancellationsListReportQuery,
  // id query params
  useGetEmployeeOrderCancellationsListDetailsByOrderIdReportQuery,
  useGetEmployeeOrderCancellationsListDetailsReportQuery,
  useGetEmployeeOrderCancellationsByEmployeeReportQuery,
  useGetEmployeeWorkLogReportQuery,
  useGetEmployeeWorkLogReportDetailsQuery,
  useGetEmployeeOrderCompletionsReportQuery,
  useGetEmployeeOrderCompletionsDetailsReportQuery,

  // ===========================district map report===========================
  useGetDistrictMapReportQuery,
  useGetDivisionMapReportQuery,
  useGetCourierMapReportQuery,
  // =======================sales and profit report===========================
  useGetSalesAndProfitFinancialSummaryReportQuery,
  useGetProfitAndSalesSalesReportQuery,
  useGetProfitAndSalesDeliveredOrdersReportQuery,
  useGetProfitAndSalesExpensesReportQuery,
  useGetProfitAndSalesChartReportQuery,

  // dashboard =======================================
  useGetDashboardOrdersReportQuery,
  useGetDashboardWebOrderTrackingQuery,
  useGetDashboardIncompleteOrderTrackingQuery,
} = reportApi;
