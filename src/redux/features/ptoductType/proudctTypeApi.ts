import { baseApi } from "../../api/baseApi";

const productTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new product type
    createProductType: builder.mutation({
      query: (payload) => ({
        url: "/product-types",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["productTypes"],
    }),

    // ✅ Get all product types (with optional query params)
    getAllProductType: builder.query({
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
          url: "/product-types",
          method: "GET",
          params,
        };
      },
      providesTags: ["productTypes"],
    }),

    // ✅ Get a single product type by ID
    getProductTypeById: builder.query({
      query: (id: string) => ({
        url: `/product-types/${id}`,
        method: "GET",
      }),
      providesTags: ["productTypes"],
    }),

    // ✅ Update a product type (PUT method)
    updateProductType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product-types/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["productTypes"],
    }),

    // ✅ Delete a product type
    deleteProductType: builder.mutation({
      query: (id: string) => ({
        url: `/product-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productTypes"],
    }),
  }),
});

export const {
  useCreateProductTypeMutation,
  useGetAllProductTypeQuery,
  useGetProductTypeByIdQuery,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
} = productTypeApi;
