import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // DEPRECATED: Use /auth/register instead
    createUser: builder.mutation({
      query: (userInfo) => {
        return {
          url: "user/create-user",
          method: "POST",
          body: userInfo,
        };
      },
    }),

    // Get current user profile (works for all roles: ADMIN, CUSTOMER, SUPPLIER)
    myProfile: builder.query({
      query: () => {
        return {
          url: "user/me",
          method: "GET",
        };
      },
      providesTags: ["user_profile"],
    }),

    // Get all users (ADMIN only)
    getAllUser: builder.query({
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
          url: `user`,
          method: "GET",
          params,
        };
      },
      providesTags: ["users"],
    }),
    updateUserRole: builder.mutation({
      query: (user) => {
        return {
          url: `user/update-role/${user.userId}`,
          method: "PUT",
          body: { role: user.role },
        };
      },
      invalidatesTags: ["users"],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `user/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["users"],
    }),

    deleteUser: builder.mutation({
      query: (id: string) => {
        return {
          url: `user/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["users"],
    }),

    toggleUserStatus: builder.mutation({
      query: (user) => {
        return {
          url: `user/update-status/${user.userId}`,
          method: "PUT",
          body: { isSuspended: user.isSuspended },
        };
      },
      invalidatesTags: ["users"],
    }),
    updateProfile: builder.mutation({
      query: (user) => {
        return {
          url: `user/update-profile`,
          method: "PUT",
          body: user,
        };
      },
      invalidatesTags: ["user_profile"],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useMyProfileQuery,
  useUpdateUserRoleMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAllUserQuery,
  useToggleUserStatusMutation,
  useUpdateProfileMutation,
} = authApi;
