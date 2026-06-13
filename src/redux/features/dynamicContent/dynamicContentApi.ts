import { baseApi } from "../../api/baseApi";

const dynamicContentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDynamicContent: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/content",
          method: "GET",
          params,
        };
      },
      providesTags: ["group-wise-content","homepage-sections"],
    }),

    getWidthPageAndGroupContent: builder.query({
      query: () => {
        return {
          url: `/content`,
          method: "GET",
        };
      },
      providesTags: ["group-wise-content","homepage-sections"],
    }),

    // ✅ Get single homepage section by ID
    getAllGroupWiseContent: builder.query({
      query: () => ({
        url: `/content/structure`,
        method: "GET",
      }),
      providesTags: ["group-wise-content","homepage-sections"],
    }),

    // ✅ Update homepage section
    updateGroupWiseContent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/content/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["group-wise-content","homepage-sections"],
    }),

    // ✅ Delete homepage section
    deleteGroupWiseContent: builder.mutation({
      query: (id: string) => ({
        url: `/content/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["group-wise-content","homepage-sections"],
    }),
  }),
});

export const {
  useGetDynamicContentQuery,
  useGetAllGroupWiseContentQuery,
  useUpdateGroupWiseContentMutation,
  useDeleteGroupWiseContentMutation,
} = dynamicContentApi;
