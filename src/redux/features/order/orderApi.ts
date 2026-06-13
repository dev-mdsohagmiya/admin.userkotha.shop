import { baseApi } from "../../api/baseApi";
import {
  IOrderListResponse,
  IOrderResponse,
  IUpdateOrderStatusPayload,
  IUpdateOrderPayload,
  IFollowUpData,
} from "../../../types/order";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new order (Regular)
    createOrder: builder.mutation<any, any>({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    // Create new order (Admin)
    createAdminOrder: builder.mutation<any, any>({
      query: (data) => ({
        url: "/orders/create-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    // Get all uncompleted orders (PENDING, HOLD, PROCESSING, CONFIRM, SHIPPED)
    getUncompletedOrders: builder.query<IOrderListResponse, any>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),

    // Get all completed orders (DELIVERED)
    getCompletedOrders: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/orders/completed-orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),

    /** Warehouse Orders page — server applies designation tab + delivery scope. */
    getWarehouseOrders: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/orders/warehouse-orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),

    // Get single order by ID
    getOrderById: builder.query<IOrderResponse, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      providesTags: ["orders"],
    }),

    // Update order details
    updateOrder: builder.mutation<
      IOrderResponse,
      { orderId: string; data: IUpdateOrderPayload }
    >({
      query: ({ orderId, data }) => ({
        url: `/orders/${orderId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<
      IOrderResponse,
      { orderId: string; data: IUpdateOrderStatusPayload }
    >({
      query: ({ orderId, data }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    // Cancel order
    cancelOrder: builder.mutation<IOrderResponse, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["orders"],
    }),

    //======================================
    // Get follow-ups for an order
    getFollowUps: builder.query<
      { success: boolean; data: IFollowUpData[] },
      string
    >({
      query: (orderId) => ({
        url: `/orders/${orderId}/follow-ups`,
        method: "GET",
      }),
      providesTags: ["orders"],
    }),

    // Add a follow-up
    addFollowUp: builder.mutation<any, { orderId: string; data: any }>({
      query: ({ orderId, data }) => ({
        url: `/orders/${orderId}/follow-up`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    getIncompleteCheckoutOrders: builder.query<
      { success: boolean; data: any[] },
      any
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),
    // Lock order
    lockOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/lock`,
        method: "POST",
      }),
      invalidatesTags: ["orders"],
    }),

    // Refresh lock
    refreshLock: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/lock/refresh`,
        method: "PATCH",
      }),
    }),

    // Unlock order
    unlockOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/lock`,
        method: "DELETE",
      }),
      invalidatesTags: ["orders"],
    }),

    // Get lock status
    getLockStatus: builder.query<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/lock`,
        method: "GET",
      }),
      providesTags: ["orders"],
    }),

    //======================================
    // Order Note Templates
    getOrderNoteTemplates: builder.query<any, any>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/order-note-templates",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),

    createOrderNoteTemplate: builder.mutation<any, any>({
      query: (data) => ({
        url: "/order-note-templates",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    updateOrderNoteTemplate: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/order-note-templates/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    deleteOrderNoteTemplate: builder.mutation<any, string>({
      query: (id) => ({
        url: `/order-note-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orders"],
    }),

    //======================================
    // Order Sources
    getOrderSources: builder.query<any, any>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/order-sources",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),

    createOrderSource: builder.mutation<any, any>({
      query: (data) => ({
        url: "/order-sources",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    updateOrderSource: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/order-sources/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    deleteOrderSource: builder.mutation<any, string>({
      query: (id) => ({
        url: `/order-sources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orders"],
    }),
    sendReminderSMS: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/reminder-sms`,
        method: "POST",
      }),
      invalidatesTags: ["orders"],
    }),
    sendAdvanceSMS: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/advance-payment-sms`,
        method: "POST",
      }),
      invalidatesTags: ["orders"],
    }),

    // getOrderStatusSummary: builder.query<any, void>({
    //   query: () => ({
    //     url: "/orders/status-summary",
    //     method: "GET",
    //   }),
    //   providesTags: ["orders"],
    // }),

    getOrderStatusSummary: builder.query<any, any>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/orders/status-summary",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),

    deleteOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orders"],
    }),

    completeOrder: builder.mutation<any, any>({
      query: (data) => ({
        url: "/orders/complete-order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),

    // my website order specify customer order list
    myWebsiteOrderSpecifyCustomerOrderList: builder.query<any, any>({
      query: (phone: string) => ({
        url: `/orders/customer-order-stats?phone=${phone}`,
        method: "GET",
      }),
      providesTags: ["orders"],
    }),

    // Call center: all orders for a specific customer
    getCustomerOrders: builder.query<any, { customerId?: string; phone?: string }>({
      query: ({ customerId, phone }) => {
        const params = new URLSearchParams();
        if (customerId) params.append("customerId", customerId);
        if (phone) params.append("phone", phone);
        return {
          url: "/orders/call-center/customer-orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),

    // Call center: all orders with customer info + follow-up status
    getCallCenterFollowups: builder.query<any, any>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: "/orders/call-center/followups",
          method: "GET",
          params,
        };
      },
      providesTags: ["orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateAdminOrderMutation,
  useGetUncompletedOrdersQuery,
  useGetCompletedOrdersQuery,
  useGetWarehouseOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetFollowUpsQuery,
  useAddFollowUpMutation,
  useGetIncompleteCheckoutOrdersQuery,
  useLockOrderMutation,
  useRefreshLockMutation,
  useUnlockOrderMutation,
  useGetLockStatusQuery,
  useGetOrderNoteTemplatesQuery,
  useCreateOrderNoteTemplateMutation,
  useUpdateOrderNoteTemplateMutation,
  useDeleteOrderNoteTemplateMutation,
  useGetOrderSourcesQuery,
  useCreateOrderSourceMutation,
  useUpdateOrderSourceMutation,
  useDeleteOrderSourceMutation,
  useSendReminderSMSMutation,
  useSendAdvanceSMSMutation,
  useGetOrderStatusSummaryQuery,
  useCompleteOrderMutation,
  useDeleteOrderMutation,
  // MY WEBSITE CUSTOMER ORDER COUNT
  useMyWebsiteOrderSpecifyCustomerOrderListQuery,
  // CALL CENTER
  useGetCallCenterFollowupsQuery,
  useGetCustomerOrdersQuery,
} = orderApi;
