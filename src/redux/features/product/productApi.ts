import { baseApi } from "../../api/baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new product
    createProduct: builder.mutation({
      query: (payload) => ({
        url: "/products",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // Get all products (with optional query params)
    productList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
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
          url: "/products",
          method: "GET",
          params,
        };
      },
      providesTags: ["products", "ProductBOM"],
    }),

    // Get a single product by ID
    getProductById: builder.query({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: ["products"],
    }),

    // Update a product
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // Delete a product
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    updateProductStatus: builder.mutation({
      query: (id: string) => ({
        url: `/products/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: [
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // bom endpoints can be added here as well
    getProductRawMaterialBOM: builder.query({
      query: (productId: string) => `/products/${productId}/bom?type=raw`,
      providesTags: ["ProductBOM"],
    }),
    getProductPackagingMaterialBOM: builder.query({
      query: ({
        productId,
        selectedVariantId,
      }: {
        productId: string;
        selectedVariantId?: string;
      }) =>
        selectedVariantId
          ? `/products/${productId}/bom?type=packaging&variantId=${selectedVariantId}`
          : `/products/${productId}/bom?type=packaging`,
      providesTags: ["ProductBOM"],
    }),

    createBOM: builder.mutation({
      query: (data: { productId: string; items: any[] }) => ({
        url: `/products/${data.productId}/bom`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "ProductBOM",
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    updateRawMaterialBOM: builder.mutation({
      query: ({ productId, data }: { productId: string; data: any }) => ({
        url: `/products/${productId}/bom?type=raw`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        "ProductBOM",
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),
    updatePackagingMaterialBOM: builder.mutation({
      query: ({
        productId,
        variantId,
        data,
      }: {
        productId: string;
        variantId: string;
        data: any;
      }) => ({
        url: `/products/${productId}/bom?type=packaging&variantId=${variantId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        "ProductBOM",
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // Create production plan
    createProductionPlan: builder.mutation({
      query: (data: {
        productId: string;
        items: { variantId: string; plannedQty: number }[];
        startDate?: string;
      }) => ({
        url: "/production-plans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "products",
        "stock",
        "comboProducts",
        "requisitions",
        "Production",
        "materials",
      ],
    }),

    // Get production plans
    getProductionPlans: builder.query({
      query: () => ({
        url: "/production-plans",
        method: "GET",
      }),
      providesTags: ["Production"],
    }),

    // Get production plans by id
    getProductionPlanById: builder.query({
      query: (id: string) => ({
        url: `/production-plans/${id}`,
        method: "GET",
      }),
      providesTags: ["Production"],
    }),
    // details chart and report sales -----------

    salesProductVariantReport: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/sales/product-variant-performance",
          method: "GET",
          params,
        };
      },
      providesTags: ["products", "sales"],
    }),
    salesReportProductComparison: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reports/sales/variant-comparison",
          method: "GET",
          params,
        };
      },
      providesTags: ["products", "sales"],
    }),

    // ecommerce
    getEcommerceProductList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/products/ecommerce-products",
          method: "GET",
          params,
        };
      },
      providesTags: ["products", "ProductBOM"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useProductListQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateBOMMutation,
  useUpdateRawMaterialBOMMutation,
  useUpdateProductStatusMutation,
  useUpdatePackagingMaterialBOMMutation,
  useGetProductRawMaterialBOMQuery,
  useGetProductPackagingMaterialBOMQuery,
  useLazyGetProductPackagingMaterialBOMQuery,
  useCreateProductionPlanMutation,
  //report........................
  useSalesProductVariantReportQuery,
  useSalesReportProductComparisonQuery,
  // ecommerce
  useGetEcommerceProductListQuery,
} = productApi;
