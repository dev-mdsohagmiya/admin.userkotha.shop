import { baseApi } from "../../api/baseApi";

export const requisitionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProductRequisition: builder.mutation({
      query: (payload) => {
        return {
          url: "/requisitions/production",
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: [
        "requisitions",
        "Production",
        "materials",
        "products",
        "stock",
        "comboProducts",
      ],
    }),

    // Create Packaging Requisition
    createPackagingRequisition: builder.mutation({
      query: (payload) => {
        return {
          url: "/requisitions/packaging",
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: [
        "requisitions",
        "Production",
        "materials",
        "products",
        "stock",
        "comboProducts",
      ],
    }),

    // ✅ Get All Product Requisitions
    productRequisitionList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: "/requisitions",
          method: "GET",
          params,
        };
      },
      providesTags: ["requisitions"],
    }),

    // ✅ Get Product Requisition by ID
    getProductRequisitionById: builder.query({
      query: (id: string) => ({
        url: `/requisitions/${id}`,
        method: "GET",
      }),
      providesTags: ["requisitions"],
    }),

    getRequisitionStatus: builder.query({
      query: () => ({
        url: `/requisitions/stats/overview`,
        method: "GET",
      }),
      providesTags: ["requisitions"],
    }),

    // ✅ Update Product Requisition
    updateProductRequisition: builder.mutation({
      query: ({ id, data }) => ({
        url: `/requisitions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "requisitions",
        "Production",
        "materials",
        "products",
        "stock",
        "comboProducts",
      ],
    }),
    approveRequisition: builder.mutation({
      query: ({ id, comments }: { id: string; comments: string }) => ({
        url: `/requisitions/${id}/approve`,
        method: "PATCH",
        body: { comments },
      }),

      invalidatesTags: [
        "requisitions",
        "Production",
        "materials",
        "products",
        "stock",
        "comboProducts",
      ],
    }),

    // Reject Requisition
    rejectRequisition: builder.mutation({
      query: ({ id, comments }: { id: string; comments: string }) => ({
        url: `/requisitions/${id}/reject`,
        method: "PATCH",
        body: { comments },
      }),
      invalidatesTags: [
        "requisitions",
        "Production",
        "materials",
        "products",
        "stock",
        "comboProducts",
      ],
    }),
  }),
});

export const {
  useCreateProductRequisitionMutation,
  useCreatePackagingRequisitionMutation,
  useProductRequisitionListQuery,
  useGetProductRequisitionByIdQuery,
  useUpdateProductRequisitionMutation,
  useGetRequisitionStatusQuery,
  useApproveRequisitionMutation,
  useRejectRequisitionMutation,
} = requisitionApi;
