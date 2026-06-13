import { baseApi } from "../../api/baseApi";

const materialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new material
    createMaterial: builder.mutation({
      query: (payload) => ({
        url: "/materials",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "materials",
        "products",
        "comboProducts",
        "stock",
        "requisitions",
        "Production",
      ],
    }),

    // ✅ Get all materials (with optional query params)
    getMaterials: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && Array.isArray(args)) {
          args.forEach((item: any) => {
            if (
              item &&
              item.name &&
              item.value !== undefined &&
              item.value !== null
            ) {
              if (Array.isArray(item.value)) {
                item.value.forEach((v:any) => {
                  if (v !== undefined && v !== null && v !== "") {
                    params.append(item.name, v);
                  }
                });
              } else if (item.value !== "") {
                params.append(item.name, item.value);
              }
            }
          });
        }
        // Add populate parameters to get related data
        params.append("populate", "category,unit");
        return {
          url: "/materials",
          method: "GET",
          params,
        };
      },
      providesTags: ["materials"],
    }),

    // ✅ Get a single material by ID
    getMaterialById: builder.query({
      query: (id) => ({
        url: `/materials/${id}?populate=category,unit,supplier`,
        method: "GET",
      }),
      providesTags: ["materials"],
    }),

    // ✅ Update a material by ID
    updateMaterial: builder.mutation({
      query: ({ id, data }) => ({
        url: `/materials/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "materials",
        "products",
        "comboProducts",
        "stock",
        "requisitions",
        "Production",
      ],
    }),

    // ✅ Update material stock
    updateMaterialStock: builder.mutation({
      query: ({ id, data }) => ({
        url: `/materials/${id}/update-stock`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "materials",
        "products",
        "comboProducts",
        "stock",
        "requisitions",
        "Production",
      ],
    }),

    // ✅ Toggle material status
    toggleMaterialStatus: builder.mutation({
      query: (id) => ({
        url: `/materials/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: [
        "materials",
        "products",
        "comboProducts",
        "stock",
        "requisitions",
        "Production",
      ],
    }),

    // ✅ Delete a material by ID
    deleteMaterial: builder.mutation({
      query: (id) => ({
        url: `/materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "materials",
        "products",
        "comboProducts",
        "stock",
        "requisitions",
        "Production",
      ],
    }),
  }),
});

export const {
  useCreateMaterialMutation,
  useGetMaterialsQuery,
  useGetMaterialByIdQuery,
  useUpdateMaterialMutation,
  useUpdateMaterialStockMutation,
  useToggleMaterialStatusMutation,
  useDeleteMaterialMutation,
} = materialApi;

export default materialApi;
