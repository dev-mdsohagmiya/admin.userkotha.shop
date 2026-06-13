import { baseApi } from "../../api/baseApi";

const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new purchase
    createPurchase: builder.mutation({
      query: (payload) => ({
        url: "/purchases",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "purchases",
        "materials",
        "purchase-stats",
        "suppliers",
      ],
    }),

    // Get all purchases (with optional query params)
    purchaseList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/purchases",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchases"],
    }),

    // Get purchase stats
    getPurchaseStats: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/purchases/stats/overview",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-stats"],
    }),

    // Get a single purchase by ID
    getPurchaseById: builder.query({
      query: (id: string) => ({
        url: `/purchases/${id}`,
        method: "GET",
      }),
      providesTags: ["purchases"],
    }),

    // Update a purchase
    updatePurchase: builder.mutation({
      query: ({ id, data }) => ({
        url: `/purchases/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "purchases",
        "materials",
        "purchase-stats",
        "suppliers",
      ],
    }),

    // Delete a purchase
    deletePurchase: builder.mutation({
      query: (id: string) => ({
        url: `/purchases/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "purchases",
        "materials",
        "purchase-stats",
        "suppliers",
      ],
    }),

    // Update purchase status
    updatePurchaseStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/purchases/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["purchases", "purchase-stats"],
    }),

    // Purchase Returns
    createPurchaseReturn: builder.mutation({
      query: (payload) => ({
        url: "/purchases/returns",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "purchase-returns",
        "purchases",
        "materials",
        "purchase-stats",
        "suppliers",
      ],
    }),

    getAllPurchaseReturns: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/purchases/returns",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-returns"],
    }),

    getPurchaseReturnById: builder.query({
      query: (id: string) => ({
        url: `/purchases/returns/${id}`,
        method: "GET",
      }),
      providesTags: ["purchase-returns"],
    }),

    getReturnsByPurchaseId: builder.query({
      query: (purchaseId: string) => ({
        url: `/purchases/${purchaseId}/returns`,
        method: "GET",
      }),
      providesTags: ["purchase-returns"],
    }),

    // Purchase Payments
    createPurchasePayment: builder.mutation({
      query: ({ purchaseId, ...payload }) => ({
        url: `/purchases/${purchaseId}/payments`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "purchase-payments",
        "purchases",
        "purchase-stats",
        "suppliers",
      ],
    }),

    getPurchasePayments: builder.query({
      query: (purchaseId: string) => ({
        url: `/purchases/${purchaseId}/payments`,
        method: "GET",
      }),
      providesTags: ["purchase-payments"],
    }),

    getAllPurchasePayments: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/purchases/payments",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-payments"],
    }),

    getPurchasePaymentById: builder.query({
      query: (id: string) => ({
        url: `/purchases/payments/${id}`,
        method: "GET",
      }),
      providesTags: ["purchase-payments"],
    }),

    purchaseStatus: builder.query({
      query: () => ({
        url: `/purchases/stats/overview`,
        method: "GET",
      }),
      providesTags: ["purchase-payments"],
    }),

    // Purchase Needs
    createPurchaseNeed: builder.mutation({
      query: (payload) => ({
        url: "/purchases/needs",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["purchase-needs"],
    }),

    getAllPurchaseNeeds: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/purchases/needs",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseNeedById: builder.query({
      query: (id: string) => ({
        url: `/purchases/needs/${id}`,
        method: "GET",
      }),
      providesTags: ["purchase-needs"],
    }),

    updatePurchaseNeedStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/purchases/needs/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["purchase-needs"],
    }),

    generatePurchaseNeedsFromLowStock: builder.mutation({
      query: () => ({
        url: "/purchases/needs/generate-from-low-stock",
        method: "POST",
      }),
      invalidatesTags: ["purchase-needs"],
    }),

    createPurchaseFromNeed: builder.mutation({
      query: ({ needId, data }) => ({
        url: `/purchases/needs/${needId}/create-purchase`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "purchase-needs",
        "purchases",
        "materials",
        "purchase-stats",
        "suppliers",
      ],
    }),

    //--------------------------------------------Report--------------------------------------
    getPurchaseSummery: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/summary",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseTrends: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/trends",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseTopSupplier: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/top-suppliers",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchasePaymentStatusDistributions: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/payment-status-distribution",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseStatusDistributions: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/purchase-status-distribution",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseTopMaterials: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/top-materials",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseMonthlyComparison: builder.query({
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
          url: "/reports/purchases/monthly-comparison",
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
      providesTags: ["purchase-needs"],
    }),

    getPurchaseSupplierPerformance: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/supplier-performance",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseVsPayment: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/purchase-vs-payment",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),

    getPurchaseDiscountAndVatAnalysis: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/purchases/discount-vat-analysis",
          method: "GET",
          params,
        };
      },
      providesTags: ["purchase-needs"],
    }),
  }),
});

export const {
  useCreatePurchaseMutation,
  usePurchaseListQuery,
  useGetPurchaseStatsQuery,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useUpdatePurchaseStatusMutation,
  usePurchaseStatusQuery,
  // Returns-----------------------------
  useCreatePurchaseReturnMutation,
  useGetAllPurchaseReturnsQuery,
  useGetPurchaseReturnByIdQuery,
  useGetReturnsByPurchaseIdQuery,
  // Payments------------------------------
  useCreatePurchasePaymentMutation,
  useGetPurchasePaymentsQuery,
  useGetAllPurchasePaymentsQuery,
  useGetPurchasePaymentByIdQuery,
  // Needs----------------------------------
  useCreatePurchaseNeedMutation,
  useGetAllPurchaseNeedsQuery,
  useGetPurchaseNeedByIdQuery,
  useUpdatePurchaseNeedStatusMutation,
  useGeneratePurchaseNeedsFromLowStockMutation,
  useCreatePurchaseFromNeedMutation,
  //Purchase summery------------------------
  useGetPurchaseSummeryQuery,
  useGetPurchaseTrendsQuery,
  useGetPurchaseTopSupplierQuery,
  useGetPurchasePaymentStatusDistributionsQuery,
  useGetPurchaseStatusDistributionsQuery,
  useGetPurchaseTopMaterialsQuery,
  useGetPurchaseMonthlyComparisonQuery,
  useGetPurchaseSupplierPerformanceQuery,
  useGetPurchaseVsPaymentQuery,
  useGetPurchaseDiscountAndVatAnalysisQuery,
} = purchasesApi;
