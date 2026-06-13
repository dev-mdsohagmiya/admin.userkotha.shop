import { baseApi } from "../../api/baseApi";
import { IOrderSource } from "../../../types/orderSource";

const orderSourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrderSource: builder.mutation<IOrderSource, Partial<IOrderSource>>({
      query: (data) => ({
        url: "/order-sources",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orderSources"],
    }),
    getAllOrderSources: builder.query<
      { success: boolean; data: IOrderSource[] },
      void
    >({
      query: () => ({
        url: "/order-sources",
        method: "GET",
      }),
      providesTags: ["orderSources"],
    }),
    updateOrderSource: builder.mutation<
      IOrderSource,
      { id: string; data: Partial<IOrderSource> }
    >({
      query: ({ id, data }) => ({
        url: `/order-sources/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["orderSources"],
    }),
    deleteOrderSource: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/order-sources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orderSources"],
    }),
  }),
});

export const {
  useCreateOrderSourceMutation,
  useGetAllOrderSourcesQuery,
  useUpdateOrderSourceMutation,
  useDeleteOrderSourceMutation,
} = orderSourceApi;
