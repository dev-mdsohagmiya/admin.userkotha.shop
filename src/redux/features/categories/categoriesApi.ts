import { baseApi } from "../../api/baseApi";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new category
    createCategory: builder.mutation({
      query: (payload) => ({
        url: "/categories",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["categories"],
    }),

    // ✅ Get all categories (with optional query params)
    categoryList: builder.query({
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
          url: "/categories",
          method: "GET",
          params,
        };
      },
      providesTags: ["categories"],
    }),

    // ✅ Get single category by ID
    getCategoryById: builder.query({
      query: (id: string) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: ["categories"],
    }),

    // ✅ Update a category
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["categories"],
    }),

    // ✅ Delete a category
    deleteCategory: builder.mutation({
      query: (id: string) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["categories"],
    }),
    updateCategoryStatus: builder.mutation({
      query: (id: string) => ({
        url: `/categories/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["categories"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useCategoryListQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryStatusMutation
} = categoryApi;
