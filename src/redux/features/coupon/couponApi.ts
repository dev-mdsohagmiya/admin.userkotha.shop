import { baseApi } from "../../api/baseApi";
import { ICoupon, ICouponResponse } from "../../../types/coupon";

const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCoupon: builder.mutation<ICoupon, Partial<ICoupon>>({
      query: (data) => ({
        url: "/coupons",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Coupon"],
    }),
    getAllCoupons: builder.query<ICouponResponse, Record<string, any>>({
      query: (params) => ({
        url: "/coupons",
        method: "GET",
        params,
      }),
      providesTags: ["Coupon"],
    }),
    getCouponById: builder.query<ICoupon, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "GET",
      }),
      providesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation<
      ICoupon,
      { id: string; data: Partial<ICoupon> }
    >({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation<void, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useCreateCouponMutation,
  useGetAllCouponsQuery,
  useGetCouponByIdQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
