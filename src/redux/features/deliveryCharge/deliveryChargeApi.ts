import { baseApi } from "../../api/baseApi";

const deliveryChargeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveryChargeList: builder.query({
      query: (query) => ({
        url: "/delivery-options",
        method: "GET",
        params: query,
      }),
      providesTags: ["DeliveryCharge"],
    }),

    getDeliveryChargeById: builder.query({
      query: (id) => ({
        url: `/delivery-options/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DeliveryCharge", id }],
    }),

    createDeliveryCharge: builder.mutation({
      query: (data) => ({
        url: "/delivery-options",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DeliveryCharge"],
    }),

    updateDeliveryCharge: builder.mutation({
      query: ({ id, data }) => ({
        url: `/delivery-options/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "DeliveryCharge",
        { type: "DeliveryCharge", id },
      ],
    }),

    deleteDeliveryCharge: builder.mutation({
      query: (id) => ({
        url: `/delivery-options/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DeliveryCharge"],
    }),
  }),
});

export const {
  useGetDeliveryChargeListQuery,
  useGetDeliveryChargeByIdQuery,
  useCreateDeliveryChargeMutation,
  useUpdateDeliveryChargeMutation,
  useDeleteDeliveryChargeMutation,
} = deliveryChargeApi;
