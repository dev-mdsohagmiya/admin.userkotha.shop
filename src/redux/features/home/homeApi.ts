import { baseApi } from "../../api/baseApi";

const homepageSectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create homepage section
    createHomepageSection: builder.mutation({
      query: (payload) => ({
        url: "/homepage-sections",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["homepage-sections"],
    }),
    upsertHomepage: builder.mutation({
      query: (payload) => ({
        url: "/content?type=home",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["homepage-sections"],
    }),

    // ✅ Get all homepage sections (with optional query params)
    homepageSectionList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item.name, item.value);
          });
        }

        return {
          url: "/homepage-sections",
          method: "GET",
          params,
        };
      },
      providesTags: ["homepage-sections"],
    }),

    // ✅ Get single homepage section by ID
    getHomepageSectionById: builder.query({
      query: (id: string) => ({
        url: `/homepage-sections/${id}`,
        method: "GET",
      }),
      providesTags: ["homepage-sections"],
    }),

    // ✅ Update homepage section
    updateHomepageSection: builder.mutation({
      query: ({ id, data }) => ({
        url: `/homepage-sections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["homepage-sections"],
    }),

    // ✅ Delete homepage section
    deleteHomepageSection: builder.mutation({
      query: (id: string) => ({
        url: `/homepage-sections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["homepage-sections"],
    }),

    // ✅ Toggle homepage section status
    updateHomepageSectionStatus: builder.mutation({
      query: (id: string) => ({
        url: `/homepage-sections/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["homepage-sections"],
    }),
  }),
});

export const {
  useCreateHomepageSectionMutation,
  useHomepageSectionListQuery,
  useGetHomepageSectionByIdQuery,
  useUpdateHomepageSectionMutation,
  useDeleteHomepageSectionMutation,
  useUpdateHomepageSectionStatusMutation,
  useUpsertHomepageMutation,
} = homepageSectionsApi;
