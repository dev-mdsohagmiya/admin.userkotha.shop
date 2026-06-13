import { baseApi } from "../../api/baseApi";

const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    stockList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/stock",
          method: "GET",
          params,
        };
      },
      providesTags: ["stock"],
    }),
    stockStatus: builder.query({
      query: () => ({
        url: `/stock/stats/overview`,
        method: "GET",
      }),
      providesTags: ["stock"],
    }),

    updateStock: builder.mutation({
      query: ({ id, data }) => ({
        url: `/stock/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["stock"],
    }),
  }),
});

export const {
  useStockListQuery,
  useStockStatusQuery,
  useUpdateStockMutation,
} = brandApi;
