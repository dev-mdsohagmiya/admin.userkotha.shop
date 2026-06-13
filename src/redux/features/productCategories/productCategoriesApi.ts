import { baseApi } from "../../api/baseApi";

const productCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new product category
    createProductCategory: builder.mutation({
      query: (payload) => ({
        url: "/product-categories",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["productCategories"],
    }),

    // ✅ Get all product categories (with optional query params)
    productCategoryList: builder.query({
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
          url: "/product-categories",
          method: "GET",
          params,
        };
      },
      providesTags: ["productCategories"],
    }),

    // ✅ Get single product category by ID
    getProductCategoryById: builder.query({
      query: (id: string) => ({
        url: `/product-categories/${id}`,
        method: "GET",
      }),
      providesTags: ["productCategories"],
    }),

    // ✅ Update a product category
    updateProductCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product-categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["productCategories"],
    }),

    // ✅ Delete a product category
    deleteProductCategory: builder.mutation({
      query: (id: string) => ({
        url: `/product-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productCategories"],
    }),

    // ✅ Toggle category status (active/inactive)
    updateProductCategoryStatus: builder.mutation({
      query: (id: string) => ({
        url: `/product-categories/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["productCategories"],
    }),
  }),
});

export const {
  useCreateProductCategoryMutation,
  useProductCategoryListQuery,
  useGetProductCategoryByIdQuery,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
  useUpdateProductCategoryStatusMutation,
} = productCategoriesApi;
