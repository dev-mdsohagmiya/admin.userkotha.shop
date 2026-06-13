import { baseApi } from "../../api/baseApi";

const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBrand: builder.mutation({
      query: (payload) => ({
        url: "/brands",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["brands"],
    }),

    getAllBrands: builder.query({
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
          url: "/brands",
          method: "GET",
          params,
        };
      },
      providesTags: ["brands"],
    }),

    updateBrand: builder.mutation({
      query: ({ id, data }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["brands"],
    }),


    deleteBrand: builder.mutation({
      query: (id: string) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["brands"],
    }),

    updateBrandStatus: builder.mutation({
      query: (id: string) => ({
        url: `/brands/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["brands"],
    }),
  }),
});

export const {
  useCreateBrandMutation,
  useGetAllBrandsQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useUpdateBrandStatusMutation
} = brandApi;
