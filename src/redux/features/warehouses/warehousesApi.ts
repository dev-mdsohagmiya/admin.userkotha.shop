import { baseApi } from "../../api/baseApi";

const warehousesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new warehouse
    createWarehouse: builder.mutation({
      query: (payload) => ({
        url: "/warehouses",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["warehouses"],
    }),

    // ✅ Get all warehouses (with optional query params)
    warehouseList: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: "/warehouses",
          method: "GET",
          params,
        };
      },
      providesTags: ["warehouses"],
    }),

    // ✅ Get a single warehouse by ID
    getWarehouseById: builder.query({
      query: (id: string) => ({
        url: `/warehouses/${id}`,
        method: "GET",
      }),
      providesTags: ["warehouses"],
    }),

    // ✅ Update a warehouse
    updateWarehouse: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/warehouses/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["warehouses"],
    }),

    // ✅ Delete a warehouse
    deleteWarehouse: builder.mutation({
      query: (id: string) => ({
        url: `/warehouses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["warehouses"],
    }),

    // ✅ Toggle warehouse status (active/inactive)
    toggleWarehouseStatus: builder.mutation({
      query: (id: string) => ({
        url: `/warehouses/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["warehouses"],
    }),

    // ✅ Get rooms by warehouse ID
    getRoomsByWarehouseId: builder.query({
      query: (warehouseId: string) => ({
        url: `/warehouses/${warehouseId}/rooms`,
        method: "GET",
      }),
      providesTags: ["warehouses"],
    }),

    // ✅ Get racks by room ID
    getRacksByRoomId: builder.query({
      query: (roomId: string) => ({
        url: `/warehouses/rooms/${roomId}/racks`,
        method: "GET",
      }),
      providesTags: ["warehouses"],
    }),
  }),
});

export const {
  useCreateWarehouseMutation,
  useWarehouseListQuery,
  useGetWarehouseByIdQuery,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useToggleWarehouseStatusMutation,
  useGetRoomsByWarehouseIdQuery,
  useGetRacksByRoomIdQuery,
} = warehousesApi;
