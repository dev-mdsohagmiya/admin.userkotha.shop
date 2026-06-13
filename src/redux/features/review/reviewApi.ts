import { baseApi } from "../../api/baseApi";

const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create  Review Image
    createReview: builder.mutation({
      query: (payload) => ({
        url: "/reviews/images/bulk",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["reviews"],
    }),

    // create review Image
    reviewList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reviews/images/public",
          method: "GET",
          params,
        };
      },
      providesTags: ["reviews"],
    }),

    // Get a single unit by ID
    getReviewById: builder.query({
      query: (id: string) => ({
        url: `/reviews/images/${id}`,
        method: "GET",
      }),
      providesTags: ["reviews"],
    }),

    // Update a unit
    updateReview: builder.mutation({
      query: ({ id, data }) => ({
        url: `/reviews/images/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["reviews"],
    }),

    // Delete a unit
    deleteReview: builder.mutation({
      query: (id: string) => ({
        url: `/reviews/images/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["reviews"],
    }),

    updateReviewStatus: builder.mutation({
      query: (id: string) => ({
        url: `reviews/images/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["reviews"],
    }),

    // ============================review api  customer review ============================
    getAllReviews: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/reviews",
          method: "GET",
          params,
        };
      },
      providesTags: ["reviews"],
    }),

    deleteReviewData: builder.mutation({
      query: (id: string) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["reviews"],
    }),

    confirmReview: builder.mutation({
      query: (id: string) => ({
        url: `/reviews/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: ["reviews"],
    }),

    unconfirmReview: builder.mutation({
      query: (id: string) => ({
        url: `/reviews/${id}/unconfirm`,
        method: "PATCH",
      }),
      invalidatesTags: ["reviews"],
    }),

    updateReviewData: builder.mutation({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["reviews"],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useReviewListQuery,
  useGetReviewByIdQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewStatusMutation,
  useGetAllReviewsQuery,
  useDeleteReviewDataMutation,
  useConfirmReviewMutation,
  useUnconfirmReviewMutation,
  useUpdateReviewDataMutation,
} = reviewApi;
