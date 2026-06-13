import { baseApi } from "../../api/baseApi";

const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new blog
    createBlog: builder.mutation({
      query: (payload) => ({
        url: "/blogs",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["blogs"],
    }),

    // Get all blogs (with optional query params)
    getAllBlogs: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/blogs",
          method: "GET",
          params,
        };
      },
      providesTags: ["blogs"],
    }),

    // Get a single blog by ID
    getBlogById: builder.query({
      query: (id: string) => ({
        url: `/blogs/${id}`,
        method: "GET",
      }),
      providesTags: ["blogs"],
    }),

    // Update a blog (PUT method)
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["blogs"],
    }),

    // Delete a blog
    deleteBlog: builder.mutation({
      query: (id: string) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["blogs"],
    }),

    // Toggle blog status
    toggleBlogStatus: builder.mutation({
      query: (id: string) => ({
        url: `/blogs/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["blogs"],
    }),
  }),
});

export const {
  useCreateBlogMutation,
  useGetAllBlogsQuery,
  useGetBlogByIdQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useToggleBlogStatusMutation,
} = blogApi;
