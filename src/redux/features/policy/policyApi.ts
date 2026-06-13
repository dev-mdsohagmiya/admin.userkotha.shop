import { baseApi } from "../../api/baseApi";

const policyPagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Upsert Privacy Policy
    upsertPrivacyPolicy: builder.mutation({
      query: (payload) => ({
        url: "/content?type=privacy_policy",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["privacy-policy"],
    }),

    // ✅ Upsert Terms & Conditions
    upsertTermsAndConditions: builder.mutation({
      query: (payload) => ({
        url: "/content?type=terms_and_conditions",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["terms-conditions"],
    }),

    // ✅ Upsert Return Policy
    upsertReturnPolicy: builder.mutation({
      query: (payload) => ({
        url: "/content?type=return_policy",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["return-policy"],
    }),
  }),
});

export const {
  useUpsertPrivacyPolicyMutation,
  useUpsertTermsAndConditionsMutation,
  useUpsertReturnPolicyMutation,
} = policyPagesApi;
