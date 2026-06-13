import { baseApi } from "../../api/baseApi";

const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new sale
    createSale: builder.mutation({
      query: (payload) => ({
        url: "/sales",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["sales", "products", "stock", "customers"],
    }),

    // ✅ Get all sales (with optional query params)
    saleList: builder.query({
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
          url: "/sales",
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    // ✅ Get single sale by ID
    getSaleById: builder.query({
      query: (id: string) => ({
        url: `/sales/${id}`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    // ✅ Update a sale
    updateSale: builder.mutation({
      query: ({ id, data }) => ({
        url: `/sales/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["sales", "products", "sales-stats", "stock"],
    }),

    updatePaymentAmount: builder.mutation({
      query: ({ id, data }) => ({
        url: `/sales/${id}/payment`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["sales", "sales-stats"],
    }),

    // ✅ Delete a sale
    deleteSale: builder.mutation({
      query: (id: string) => ({
        url: `/sales/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sales", "products", "sales-stats", "stock"],
    }),

    // ✅ Toggle sale status (optional)
    updateSaleStatus: builder.mutation({
      query: (id: string) => ({
        url: `/sales/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["sales", "sales-stats"],
    }),

    updateSaleStatusForCompleted: builder.mutation<
      void,
      { id: string; data: string }
    >({
      query: ({ id, data }) => ({
        url: `/sales/${id}/status`,
        method: "PATCH",
        body: { status: data }, // assuming your API expects { status: "Completed" }
      }),
      invalidatesTags: ["sales", "products", "sales-stats", "stock"],
    }),

    salesStatus: builder.query({
      query: () => ({
        url: `/sales/stats/overview`,
        method: "GET",
      }),
      providesTags: ["stock"],
    }),

    //sales product
    productsVariantsForSales: builder.query({
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
          url: `/products/variants/for-sales`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    //Report generation can be added here in the future
    // -------------------- Sales Reports --------------------
    getSalesSummary: builder.query({
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
          url: `/reports/sales/summary`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    // getSalesTrends: builder.query({
    //   query: () => ({
    //     url: `/reports/sales/trends`,
    //     method: "GET",
    //   }),
    //   providesTags: ["sales"],
    // }),

    getSalesTrends: builder.query({
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
          url: `/reports/sales/trends`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    getSalesTopCustomers: builder.query({
      query: () => ({
        url: `/reports/sales/top-customers`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    getSalesTopProducts: builder.query({
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
          url: `/reports/sales/top-products`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    getSalesCustomerLoyalty: builder.query({
      query: () => ({
        url: `/reports/sales/customer-loyalty`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    getSalesPaymentMethods: builder.query({
      query: () => ({
        url: `/reports/sales/payment-methods`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    getSalesDiscountAnalysis: builder.query({
      query: () => ({
        url: `/reports/sales/discount-analysis`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    getSalesRevenueBreakdown: builder.query({
      query: () => ({
        url: `/reports/sales/revenue-breakdown`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    getSalesCategoryPerformance: builder.query({
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
          url: `/reports/sales/category-performance`,
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
      providesTags: ["sales"],
    }),

    getSalesUserPerformance: builder.query({
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
          url: `/reports/sales/user-performance`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    getSalesHourlyPattern: builder.query({
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
          url: `/reports/sales/hourly-pattern`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    getSalesDayPattern: builder.query({
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
          url: `/reports/sales/day-pattern`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    getSalesMonthlyComparison: builder.query({
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
          url: `/reports/sales/monthly-comparison`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    getSalesStatusDistribution: builder.query({
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
          url: `/reports/sales/status-distribution`,
          method: "GET",
          params,
        };
      },
      providesTags: ["sales"],
    }),

    getSalesVsTarget: builder.query({
      query: () => ({
        url: `/reports/sales/vs-target`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),
  }),
});

export const {
  useCreateSaleMutation,
  useSaleListQuery,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useUpdateSaleStatusMutation,
  useSalesStatusQuery,
  useUpdateSaleStatusForCompletedMutation,
  useUpdatePaymentAmountMutation,

  // sales
  useProductsVariantsForSalesQuery,

  // Report hooks
  useGetSalesSummaryQuery,
  useGetSalesTrendsQuery,
  useGetSalesTopCustomersQuery,
  useGetSalesTopProductsQuery,
  useGetSalesCustomerLoyaltyQuery,
  useGetSalesPaymentMethodsQuery,
  useGetSalesDiscountAnalysisQuery,
  useGetSalesRevenueBreakdownQuery,
  useGetSalesCategoryPerformanceQuery,
  useGetSalesUserPerformanceQuery,
  useGetSalesHourlyPatternQuery,
  useGetSalesDayPatternQuery,
  useGetSalesMonthlyComparisonQuery,
  useGetSalesStatusDistributionQuery,
  useGetSalesVsTargetQuery,
} = salesApi;
