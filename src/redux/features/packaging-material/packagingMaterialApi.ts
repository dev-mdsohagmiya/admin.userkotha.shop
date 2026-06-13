import { baseApi } from "../../api/baseApi";
import {
  IPackagingMaterial,
  IPackagingMaterialResponse,
  IUpdateStockRequest,
  IUpdateStockResponse,
} from "../../../types/packagingMaterial";

const packagingMaterialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new packaging material
    createPackagingMaterial: builder.mutation<
      IPackagingMaterialResponse,
      Omit<IPackagingMaterial, "id" | "createdAt" | "updatedAt">
    >({
      query: (payload) => ({
        url: "/packaging-materials",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["packaging-materials"],
    }),

    // Get all packaging materials (with optional query params)
    getPackagingMaterials: builder.query({
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
          url: "/packaging-materials",
          method: "GET",
          params,
        };
      },
      providesTags: ["packaging-materials"],
    }),

    // Get a single packaging material by ID
    getPackagingMaterialById: builder.query<IPackagingMaterialResponse, string>(
      {
        query: (id: string) => ({
          url: `/packaging-materials/${id}`,
          method: "GET",
        }),
        providesTags: ["packaging-materials"],
      }
    ),

    // Update a packaging material by ID
    updatePackagingMaterial: builder.mutation<
      IPackagingMaterialResponse,
      { id: string; data: Partial<IPackagingMaterial> }
    >({
      query: ({ id, data }) => ({
        url: `/packaging-materials/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["packaging-materials"],
    }),

    // Update packaging material stock
    updatePackagingMaterialStock: builder.mutation<
      IUpdateStockResponse,
      { id: string; data: IUpdateStockRequest }
    >({
      query: ({ id, data }) => ({
        url: `/packaging-materials/${id}/update-stock`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["packaging-materials"],
    }),

    // Toggle packaging material status
    togglePackagingMaterialStatus: builder.mutation<
      IPackagingMaterialResponse,
      string
    >({
      query: (id: string) => ({
        url: `/packaging-materials/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["packaging-materials"],
    }),

    // Delete a packaging material
    deletePackagingMaterial: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id: string) => ({
        url: `/packaging-materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["packaging-materials"],
    }),
  }),
});

export const {
  useCreatePackagingMaterialMutation,
  useGetPackagingMaterialsQuery,
  useGetPackagingMaterialByIdQuery,
  useUpdatePackagingMaterialMutation,
  useUpdatePackagingMaterialStockMutation,
  useTogglePackagingMaterialStatusMutation,
  useDeletePackagingMaterialMutation,
} = packagingMaterialApi;
