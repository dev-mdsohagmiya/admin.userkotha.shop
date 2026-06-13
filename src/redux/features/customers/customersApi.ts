import { baseApi } from "../../api/baseApi";

const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new customer
    createCustomer: builder.mutation({
      query: (payload) => ({
        url: "/customers",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["customers"],
    }),

    // Get all customers (with optional query params)
    customerList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/customers",
          method: "GET",
          params,
        };
      },
      providesTags: ["customers"],
    }),

    // Get a single customer by ID
    getCustomerById: builder.query({
      query: (id: string) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
      providesTags: ["customers"],
    }),

    // Update a customer
    updateCustomer: builder.mutation({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["customers"],
    }),

    // Delete a customer
    deleteCustomer: builder.mutation({
      query: (id: string) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["customers"],
    }),

    // Toggle customer status
    updateCustomerStatus: builder.mutation({
      query: (id: string) => ({
        url: `/customers/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["customers"],
    }),

    // Check customer by phone number
    checkCustomerByPhone: builder.query({
      query: (phone: string) => ({
        url: `/customers/check-phone/${phone}`,
        method: "GET",
      }),
      providesTags: ["customers"],
    }),
  }),
});

export const {
  useCreateCustomerMutation,
  useCustomerListQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useUpdateCustomerStatusMutation,
  useCheckCustomerByPhoneQuery,
} = customerApi;
