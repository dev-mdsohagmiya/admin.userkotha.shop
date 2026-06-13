import { baseApi } from "../../api/baseApi";
import { IAddon, ICreateAddonResult } from "../../../types/addon";

const addonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAddon: builder.mutation<ICreateAddonResult, Partial<IAddon>>({
      query: (data) => ({
        url: "/product-addons",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product-addons"],
    }),
    getAllAddons: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: { name: string; value: string }) => {
            params.append(item?.name, item?.value);
          });
        }
        return {
          url: "/product-addons",
          method: "GET",
          params,
        };
      },
      providesTags: ["product-addons"],
    }),
    getAddonById: builder.query<IAddon, string>({
      query: (id) => ({
        url: `/product-addons/${id}`,
        method: "GET",
      }),
      providesTags: ["product-addons"],
    }),
    updateAddon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product-addons/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["product-addons"],
    }),
    deleteAddon: builder.mutation<void, string>({
      query: (id) => ({
        url: `/product-addons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product-addons"],
    }),
  }),
});

export const {
  useCreateAddonMutation,
  useGetAllAddonsQuery,
  useGetAddonByIdQuery,
  useUpdateAddonMutation,
  useDeleteAddonMutation,
} = addonApi;
