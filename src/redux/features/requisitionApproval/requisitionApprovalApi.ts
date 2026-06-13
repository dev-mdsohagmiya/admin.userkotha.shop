import { baseApi } from "../../api/baseApi";


export const requisitionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create Requisition
    createRequisition: builder.mutation({
      query: (payload) => ({
        url: "/requisitions",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["requisitions-approval"],
    }),

    // ✅ Get All Requisitions (optional filters)
    requisitionList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/requisitions",
          method: "GET",
          params,
        };
      },
      providesTags: ["requisitions-approval"],
    }),

    // ✅ Get Requisition by ID
    getRequisitionById: builder.query({
      query: (id: string) => ({
        url: `/requisitions/${id}`,
        method: "GET",
      }),
      providesTags: ["requisitions-approval"],
    }),

    // ✅ Update Requisition
    updateRequisition: builder.mutation({
      query: ({ id, data }) => ({
        url: `/requisitions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["requisitions-approval"],
    }),

    // ✅ Approve Requisition
    approveRequisition: builder.mutation({
      query: (id: string) => ({
        url: `/requisitions/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["requisitions-approval"],
    }),

    // ✅ Reject Requisition
    rejectRequisition: builder.mutation({
      query: (id: string) => ({
        url: `/requisitions/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["requisitions-approval"],
    }),

    // ✅ Delete Requisition
    deleteRequisition: builder.mutation({
      query: (id: string) => ({
        url: `/requisitions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["requisitions-approval"],
    }),

    // ✅ Get Requisition Statistics
    requisitionStats: builder.query({
      query: () => ({
        url: "/requisitions/stats/overview",
        method: "GET",
      }),
      providesTags: ["requisitions-approval"],
    }),
  }),
});

export const {
  useCreateRequisitionMutation,
  useRequisitionListQuery,
  useGetRequisitionByIdQuery,
  useUpdateRequisitionMutation,
  useApproveRequisitionMutation,
  useRejectRequisitionMutation,
  useDeleteRequisitionMutation,
  useRequisitionStatsQuery,
} = requisitionApi;
