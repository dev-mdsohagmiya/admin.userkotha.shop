import { baseApi } from "../../api/baseApi";

const vatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new VAT
    createVat: builder.mutation({
      query: (payload) => ({
        url: "/vat",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["vat"],
    }),

    // Get all VATs (with optional query params)
    vatList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/vat",
          method: "GET",
          params,
        };
      },
      providesTags: ["vat"],
    }),

    // Get a single VAT by ID
    getVatById: builder.query({
      query: (id: string) => ({
        url: `/vat/${id}`,
        method: "GET",
      }),
      providesTags: ["vat"],
    }),

    // Update a VAT
    updateVat: builder.mutation({
      query: ({ id, data }) => ({
        url: `/vat/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["vat"],
    }),

    // Delete a VAT
    deleteVat: builder.mutation({
      query: (id: string) => ({
        url: `/vat/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["vat"],
    }),

    updateVatStatus: builder.mutation({
      query: (id: string) => ({
        url: `vat/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["vat"],
    }),
  }),
});

export const {
  useCreateVatMutation,
  useVatListQuery,
  useGetVatByIdQuery,
  useUpdateVatMutation,
  useDeleteVatMutation,
  useUpdateVatStatusMutation
} = vatApi;
