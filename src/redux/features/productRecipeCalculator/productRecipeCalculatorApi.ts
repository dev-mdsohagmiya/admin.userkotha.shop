import { baseApi } from "../../api/baseApi";

const productRecipeCalculatorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRecipe: builder.mutation({
      query: (payload) => ({
        url: "/product-recipe-calculator",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["productRecipe"],
    }),

    getAllRecipes: builder.query({
      query: () => ({
        url: "/product-recipe-calculator",
        method: "GET",
      }),
      providesTags: ["productRecipe"],
    }),

    getSingleRecipe: builder.query({
      query: (id: string) => ({
        url: `/product-recipe-calculator/${id}`,
        method: "GET",
      }),
      providesTags: ["productRecipe"],
    }),

    updateRecipe: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product-recipe-calculator/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["productRecipe"],
    }),

    deleteRecipe: builder.mutation({
      query: (id: string) => ({
        url: `/product-recipe-calculator/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productRecipe"],
    }),
  }),
});

export const {
  useCreateRecipeMutation,
  useGetAllRecipesQuery,
  useGetSingleRecipeQuery,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = productRecipeCalculatorApi;
