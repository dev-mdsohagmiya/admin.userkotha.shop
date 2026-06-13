import { baseApi } from "../../api/baseApi";

const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new supplier
    createSupplier: builder.mutation({
      query: (payload) => ({
        url: "/suppliers",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["suppliers"],
    }),

    // ✅ Get all suppliers (with optional query params)
    supplierList: builder.query({
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
          url: "/suppliers",
          method: "GET",
          params,
        };
      },
      providesTags: ["suppliers"],
    }),
    supplierPurchaseHistoryList: builder.query({
      query: ({id,args}) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            if (item?.value) {
              params.append(item?.name, item?.value);
            }
          });
        }
        return {
          url: `/suppliers/${id}/purchase-history`,
          method: "GET",
          params,
        };
      },
      providesTags: ["suppliers"],
    }),

    // ✅ Get single supplier by ID
    getSupplierById: builder.query({
      query: (id: string) => ({
        url: `/suppliers/${id}`,
        method: "GET",
      }),
      providesTags: ["suppliers"],
    }),

    // ✅ Update a supplier
    updateSupplier: builder.mutation({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["suppliers"],
    }),

    // ✅ Delete a supplier
    deleteSupplier: builder.mutation({
      query: (id: string) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["suppliers"],
    }),

    // ✅ Toggle supplier status
    updateSupplierStatus: builder.mutation({
      query: (id: string) => ({
        url: `/suppliers/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["suppliers"],
    }),
  }),
});

export const {
  useCreateSupplierMutation,
  useSupplierListQuery,
  useGetSupplierByIdQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierStatusMutation,
  useSupplierPurchaseHistoryListQuery
} = supplierApi;
