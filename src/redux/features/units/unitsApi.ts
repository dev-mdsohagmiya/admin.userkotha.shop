import { baseApi } from "../../api/baseApi";

const unitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new unit
    createUnit: builder.mutation({
      query: (payload) => ({
        url: "/units",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["units"],
    }),

    // Get all units (with optional query params)
    unitList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/units",
          method: "GET",
          params,
        };
      },
      providesTags: ["units"],
    }),

    // Get a single unit by ID
    getUnitById: builder.query({
      query: (id: string) => ({
        url: `/units/${id}`,
        method: "GET",
      }),
      providesTags: ["units"],
    }),

    // Update a unit
    updateUnit: builder.mutation({
      query: ({ id, data }) => ({
        url: `/units/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["units"],
    }),

    // Delete a unit
    deleteUnit: builder.mutation({
      query: (id: string) => ({
        url: `/units/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["units"],
    }),

    updateUnitStatus: builder.mutation({
      query: (id: string) => ({
        url: `units/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["units"],
    }),
  }),
});

export const {
  useCreateUnitMutation,
  useUnitListQuery,
  useGetUnitByIdQuery,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useUpdateUnitStatusMutation
} = unitApi;
