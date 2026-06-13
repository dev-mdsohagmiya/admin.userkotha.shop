import { baseApi } from "../../api/baseApi";

export const courierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendToCourier: builder.mutation<
      any,
      {
        orderId: string;
        courier: string;
        note?: string;
        item_description?: string;
      }
    >({
      query: ({ orderId, ...data }) => ({
        url: `/orders/${orderId}/courier/send`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),
    
    getCourierDashboardStats: builder.query<any, Record<string, any>>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, value.toString());
            }
          });
        }
        return {
          url: "/orders/courier/dashboard-stats",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),
    getCourierOrders: builder.query<any, Record<string, any>>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, value.toString());
            }
          });
        }
        return {
          url: "/orders/courier/orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),
    checkFraud: builder.query<any, string>({
      query: (phone) => ({
        url: `/orders/courier/check-fraud/${phone}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSendToCourierMutation,
  useGetCourierDashboardStatsQuery,
  useGetCourierOrdersQuery,
  useCheckFraudQuery,
} = courierApi;
