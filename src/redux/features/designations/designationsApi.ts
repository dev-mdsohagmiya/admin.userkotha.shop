import { baseApi } from "../../api/baseApi";

const designationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new designation
    createDesignation: builder.mutation({
      query: (payload) => ({
        url: "/designations",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["designations"],
    }),

    // ✅ Get all designations (with optional query params)
    designationList: builder.query({
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
          url: "/designations",
          method: "GET",
          params,
        };
      },
      providesTags: ["designations"],
    }),

    // ✅ Get single designation by ID
    getDesignationById: builder.query({
      query: (id: string) => ({
        url: `/designations/${id}`,
        method: "GET",
      }),
      providesTags: ["designations"],
    }),

    // ✅ Update a designation
    updateDesignation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/designations/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["designations"],
    }),

    // ✅ Delete a designation
    deleteDesignation: builder.mutation({
      query: (id: string) => ({
        url: `/designations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["designations"],
    }),
    updateDesignationStatus: builder.mutation({
      query: (id: string) => ({
        url: `designations/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["designations"],
    }),
  }),
});

export const {
  useCreateDesignationMutation,
  useDesignationListQuery,
  useGetDesignationByIdQuery,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useUpdateDesignationStatusMutation,
} = designationsApi;
