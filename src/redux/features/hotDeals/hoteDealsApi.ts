import { baseApi } from "../../api/baseApi";

const hotDealsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create hot deal
    createHotDeal: builder.mutation({
      query: (payload) => ({
        url: "/hot-deals",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["hot-deals"],
    }),

    // ✅ Get all hot deals (with optional query params)
    hotDealsList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item.name, item.value);
          });
        }

        return {
          url: "/hot-deals",
          method: "GET",
          params,
        };
      },
      providesTags: ["hot-deals"],
    }),

    // ✅ Get single hot deal by ID
    getHotDealById: builder.query({
      query: (id: string) => ({
        url: `/hot-deals/${id}`,
        method: "GET",
      }),
      providesTags: ["hot-deals"],
    }),

    // ✅ Update hot deal
    updateHotDeal: builder.mutation({
      query: ({ id, data }) => ({
        url: `/hot-deals/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["hot-deals"],
    }),

    // ✅ Delete hot deal
    deleteHotDeal: builder.mutation({
      query: (id: string) => ({
        url: `/hot-deals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hot-deals"],
    }),

    // ✅ Toggle hot deal status
    updateHotDealStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: boolean }) => ({
        url: `/hot-deals/${id}/${status}`,
        method: "PATCH",
      }),
      invalidatesTags: ["hot-deals"],
    }),
  }),
});

export const {
  useCreateHotDealMutation,
  useHotDealsListQuery,
  useGetHotDealByIdQuery,
  useUpdateHotDealMutation,
  useDeleteHotDealMutation,
  useUpdateHotDealStatusMutation,
} = hotDealsApi;
