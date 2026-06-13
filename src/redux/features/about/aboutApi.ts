import { baseApi } from "../../api/baseApi";

const aboutPageSectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create homepage section

    upsertAboutPageBanner: builder.mutation({
      query: (payload) => ({
        url: "/content?type=about",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["about-page-sections"],
    }),

    // ✅ Get single homepage section by ID
  }),
});

export const { useUpsertAboutPageBannerMutation } = aboutPageSectionsApi;
