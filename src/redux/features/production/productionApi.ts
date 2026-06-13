import { baseApi } from "../../api/baseApi";

const productionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all productions (with optional query params)
    getProductions: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        // Always include requisitions and plan details
        params.append("includeRequisitions", "true");
        params.append(
          "populate",
          "product,comboProduct,requisitions,plan.items.variant,plan.items.comboVariant",
        );
        return {
          url: "/production",
          method: "GET",
          params,
        };
      },
      providesTags: ["Production", "requisitions"],
    }),

    // Get a single production by ID
    getProductionById: builder.query({
      query: (id: string) => ({
        url: `/production/${id}`,
        method: "GET",
      }),
      providesTags: ["Production"],
    }),

    // Create production plan (already exists in productApi, but keeping here for completeness)
    createProductionPlan: builder.mutation({
      query: (data: {
        productId: string;
        items: { variantId: string; plannedQty: number }[];
      }) => ({
        url: "/production-plans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Production"],
    }),
    // Update production plan items (completed quantities / wastage)
    updateProductionPlanItems: builder.mutation({
      query: (args: {
        planId: string;
        updates: { planItemId: string; completedQty: number }[];
      }) => ({
        url: `/production-plans/${args.planId}/items`,
        method: "PATCH",
        body: { updates: args.updates },
      }),
      invalidatesTags: ["Production"],
    }),
    // Update production status (e.g., cancel a production)
    updateProductionStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/production/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [
        "Production",
        "materials",
        "products",
        "stock",
        "comboProducts",
        "requisitions",
      ],
    }),

    // Get available completed productions for transfer
    getAvailableProductionTransfers: builder.query({
      query: () => ({
        url: "/production/transfers/available",
        method: "GET",
      }),
      providesTags: ["Production"],
    }),

    // Create production transfers to warehouse
    createProductionTransfers: builder.mutation({
      query: (payload) => ({
        url: "/production/transfers",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "Production",
        "warehouses",
        "stock",
        "products",
        "comboProducts",
        "requisitions",
      ],
    }),
  }),
});

export const {
  useGetProductionsQuery,
  useGetProductionByIdQuery,
  useCreateProductionPlanMutation,
  useUpdateProductionPlanItemsMutation,
  useUpdateProductionStatusMutation,
  useGetAvailableProductionTransfersQuery,
  useCreateProductionTransfersMutation,
} = productionApi;
