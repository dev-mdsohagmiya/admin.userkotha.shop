import { baseApi } from "../../api/baseApi";

const blogPageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Upsert blog page content
    upsertBlogPage: builder.mutation({
      query: (payload) => ({
        url: "/content?type=blog",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["blog-page"],
    }),
  }),
});

export const { useUpsertBlogPageMutation } = blogPageApi;
