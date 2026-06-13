import { baseApi } from "../../api/baseApi";
import { ISmsRule, ISmsRuleRequest } from "../../../types/autoSms";

const autoSmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSmsRules: builder.query<{ data: ISmsRule[] }, void>({
      query: () => ({
        url: "/auto-sms",
        method: "GET",
      }),
      providesTags: ["auto-sms"],
    }),
    getSingleSmsRule: builder.query<{ data: ISmsRule }, string>({
      query: (id) => ({
        url: `/auto-sms/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "auto-sms", id }],
    }),
    createSmsRule: builder.mutation<{ data: ISmsRule }, ISmsRuleRequest>({
      query: (data) => ({
        url: "/auto-sms",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auto-sms"],
    }),
    updateSmsRule: builder.mutation<{ data: ISmsRule }, { id: string; data: Partial<ISmsRuleRequest> }>({
      query: ({ id, data }) => ({
        url: `/auto-sms/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["auto-sms"],
    }),
    deleteSmsRule: builder.mutation<{ data: any }, string>({
      query: (id) => ({
        url: `/auto-sms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["auto-sms"],
    }),
  }),
});

export const {
  useGetSmsRulesQuery,
  useGetSingleSmsRuleQuery,
  useCreateSmsRuleMutation,
  useUpdateSmsRuleMutation,
  useDeleteSmsRuleMutation,
} = autoSmsApi;
