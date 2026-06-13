import { baseApi } from "../../api/baseApi";

const comboProductApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new combo product
    createComboProduct: builder.mutation({
      query: (payload) => ({
        url: "/combo-products",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "comboProducts",
        "products",
        "stock",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // Get all combo products (with optional query params)
    comboProductList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        // Add populate parameters to get related data
        params.append(
          "populate",
          "category,brand,baseUnit,variants.thumbnail,variants.items.product,variants.items.variant",
        );
        if (args && Array.isArray(args)) {
          args.forEach((item: any) => {
            if (
              item &&
              item.name &&
              item.value !== undefined &&
              item.value !== null
            ) {
              if (Array.isArray(item.value)) {
                item.value.forEach((v: any) => {
                  if (v !== undefined && v !== null && v !== "") {
                    params.append(item.name, v);
                  }
                });
              } else if (item.value !== "") {
                params.append(item.name, item.value);
              }
            }
          });
        }
        return {
          url: "/combo-products",
          method: "GET",
          params,
        };
      },
      providesTags: ["comboProducts"],
    }),

    // Get a single combo product by ID
    getComboProductById: builder.query({
      query: (id: string) => ({
        url: `/combo-products/${id}?populate=category,brand,baseUnit,variants.thumbnail,variants.items.product,variants.items.variant,images,thumbnail`,
        method: "GET",
      }),
      providesTags: ["comboProducts"],
    }),

    // Update a combo product
    updateComboProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/combo-products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "comboProducts",
        "products",
        "stock",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // Delete a combo product
    deleteComboProduct: builder.mutation({
      query: (id: string) => ({
        url: `/combo-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "comboProducts",
        "products",
        "stock",
        "requisitions",
        "Production",
        "materials",
      ],
    }),
    updateComboProductStatus: builder.mutation({
      query: (id: string) => ({
        url: `/combo-products/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: [
        "comboProducts",
        "products",
        "stock",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // ================================
    // Combo Production Plan Endpoints
    // ================================
    createComboProductionPlan: builder.mutation({
      query: (payload) => ({
        url: "/combo-production-plans",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "Production",
        "comboProducts",
        "products",
        "stock",
        "requisitions",
        "materials",
      ],
    }),

    getComboProductionPlans: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: "/combo-production-plans",
          method: "GET",
          params,
        };
      },
      providesTags: ["Production"],
    }),

    getComboProductionPlanById: builder.query({
      query: (planId: string) => ({
        url: `/combo-production-plans/${planId}`,
        method: "GET",
      }),
      providesTags: ["Production"],
    }),

    updateComboProductionPlanItems: builder.mutation({
      query: (args: {
        planId: string;
        updates: { planItemId: string; completedQty: number }[];
      }) => ({
        url: `/combo-production-plans/${args.planId}/items`,
        method: "PATCH",
        body: { updates: args.updates },
      }),
      invalidatesTags: ["Production", "comboProducts"],
    }),

    deleteComboProductionPlan: builder.mutation({
      query: (planId: string) => ({
        url: `/combo-production-plans/${planId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Production"],
    }),

    // ================================
    // Combo Requisition Endpoints
    // ================================
    createComboProductRequisition: builder.mutation({
      query: (payload) => ({
        url: "/requisitions/combo-product",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "requisitions",
        "Production",
        "materials",
        "products",
        "stock",
        "comboProducts",
      ],
    }),

    getComboProductRequisitions: builder.query({
      query: (comboProductId: string, limit?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit.toString());
        return {
          url: `/requisitions/combo-product/${comboProductId}`,
          method: "GET",
          params,
        };
      },
      providesTags: ["requisitions"],
    }),

    // ================================
    // Packaging BOM Endpoints
    // ================================
    createPackagingBOM: builder.mutation({
      query: (payload) => ({
        url: "/combo-products/packaging-bom",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["comboProducts", "packagingBOM"],
    }),

    getPackagingBOM: builder.query({
      query: (comboProductId: string) => ({
        url: `/combo-products/${comboProductId}/packaging-bom`,
        method: "GET",
      }),
      providesTags: ["packagingBOM"],
    }),

    updatePackagingBOM: builder.mutation({
      query: ({ bomId, data }: { bomId: string; data: any }) => ({
        url: `/combo-products/packaging-bom/${bomId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["packagingBOM", "comboProducts"],
    }),

    deletePackagingBOM: builder.mutation({
      query: (bomId: string) => ({
        url: `/combo-products/packaging-bom/${bomId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["packagingBOM", "comboProducts"],
    }),

  }),
});

export const {
  useCreateComboProductMutation,
  useComboProductListQuery,
  useGetComboProductByIdQuery,
  useLazyGetComboProductByIdQuery,
  useUpdateComboProductMutation,
  useDeleteComboProductMutation,
  useUpdateComboProductStatusMutation,
  // Combo Production Plan hooks
  useCreateComboProductionPlanMutation,
  useGetComboProductionPlansQuery,
  useGetComboProductionPlanByIdQuery,
  useUpdateComboProductionPlanItemsMutation,
  useDeleteComboProductionPlanMutation,
  // Combo Requisition hooks
  useCreateComboProductRequisitionMutation,
  useGetComboProductRequisitionsQuery,
  // Packaging BOM hooks
  useCreatePackagingBOMMutation,
  useGetPackagingBOMQuery,
  useUpdatePackagingBOMMutation,
  useDeletePackagingBOMMutation,
} = comboProductApi;
