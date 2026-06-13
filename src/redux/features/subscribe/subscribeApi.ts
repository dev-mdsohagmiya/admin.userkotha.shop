import { baseApi } from "../../api/baseApi";

const subscribeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subscribers with pagination and filtering
    getSubscribeList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/subscribe",
          method: "GET",
          params,
        };
      },
      providesTags: ["subscribers"],
    }),

    // Create a new subscriber
    createSubscribe: builder.mutation({
      query: (payload) => ({
        url: "/subscribe",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["subscribers"],
    }),

    // Get a single subscriber by ID
    getSubscribeById: builder.query({
      query: (id: string) => ({
        url: `/subscribe/${id}`,
        method: "GET",
      }),
      providesTags: ["subscribers"],
    }),

    // Delete a subscriber
    deleteSubscribe: builder.mutation({
      query: (id: string) => ({
        url: `/subscribe/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["subscribers"],
    }),
  }),
});

export const {
  useGetSubscribeListQuery,
  useCreateSubscribeMutation,
  useGetSubscribeByIdQuery,
  useDeleteSubscribeMutation,
} = subscribeApi;
