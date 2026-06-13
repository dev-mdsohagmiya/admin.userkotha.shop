import { baseApi } from "../../api/baseApi";

const supplierPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create supplier payment
    createSupplierPayment: builder.mutation({
      query: (payload) => ({
        url: "/supplier-payments",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["supplierPayments", "suppliers"],
    }),

    // Get all payments with filters
    getAllSupplierPayments: builder.query({
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
          url: "/supplier-payments",
          method: "GET",
          params,
        };
      },
      providesTags: ["supplierPayments"],
    }),

    // Get payment by ID
    getSupplierPaymentById: builder.query({
      query: (id: string) => ({
        url: `/supplier-payments/${id}`,
        method: "GET",
      }),
      providesTags: ["supplierPayments"],
    }),

    // Get payments by supplier
    getPaymentsBySupplier: builder.query({
      query: ({
        supplierId,
        args,
      }: {
        supplierId: string;
        args?: { name: string; value: string }[];
      }) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: `/supplier-payments/supplier/${supplierId}`,
          method: "GET",
          params,
        };
      },
      providesTags: ["supplierPayments"],
    }),

    // Get payment statistics
    getPaymentStatistics: builder.query({
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
          url: "/supplier-payments/statistics",
          method: "GET",
          params,
        };
      },
      providesTags: ["supplierPayments"],
    }),

    // Delete payment
    deleteSupplierPayment: builder.mutation({
      query: (id: string) => ({
        url: `/supplier-payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["supplierPayments", "suppliers"],
    }),
  }),
});

export const {
  useCreateSupplierPaymentMutation,
  useGetAllSupplierPaymentsQuery,
  useGetSupplierPaymentByIdQuery,
  useGetPaymentsBySupplierQuery,
  useGetPaymentStatisticsQuery,
  useDeleteSupplierPaymentMutation,
} = supplierPaymentApi;
