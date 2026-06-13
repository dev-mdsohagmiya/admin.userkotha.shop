import { baseApi } from "../../api/baseApi";

export const productPurchaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProductPurchase: builder.mutation({
      query: (data) => ({
        url: "/product-purchase",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product-purchases", "products", "stock"],
    }),

    getAllProductPurchases: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item.name, item.value);
            }
          });
        }
        return {
          url: "/product-purchase",
          method: "GET",
          params,
        };
      },
      providesTags: ["product-purchases"],
    }),

    getProductPurchase: builder.query({
      query: (id) => ({
        url: `/product-purchase/${id}`,
        method: "GET",
      }),
      providesTags: ["product-purchases"],
    }),

    updateProductPurchase: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product-purchase/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["product-purchases", "products", "stock"],
    }),

    deleteProductPurchase: builder.mutation({
      query: (id) => ({
        url: `/product-purchase/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product-purchases", "products", "stock"],
    }),

    getProductPurchaseStats: builder.query({
      query: (params) => ({
        url: "/product-purchase/stats",
        method: "GET",
        params: params,
      }),
      providesTags: ["product-purchases"],
    }),
  }),
});

export const {
  useCreateProductPurchaseMutation,
  useGetAllProductPurchasesQuery,
  useGetProductPurchaseQuery,
  useUpdateProductPurchaseMutation,
  useDeleteProductPurchaseMutation,
  useGetProductPurchaseStatsQuery,
} = productPurchaseApi;
