import { baseApi } from "../../api/baseApi";

/**
 * ⚠️ DEPRECATED MODULE
 *
 * The Employee model has been removed from the backend.
 * All users are now managed through the unified User model with roles:
 * - ADMIN (with optional designation for permissions)
 * - CUSTOMER (with optional customer profile)
 * - SUPPLIER (with optional supplier profile)
 *
 * Please use the User API (/api/user) instead.
 * For user registration, use /api/auth/register (public endpoint).
 *
 * Migration completed: December 31, 2025
 *
 * These endpoints will return HTTP 410 Gone errors.
 */

const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ⚠️ DEPRECATED - Use User API instead
    createEmployee: builder.mutation({
      query: (payload) => ({
        url: "/employees",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["employees"],
    }),

    // ⚠️ DEPRECATED - Use User API with role=ADMIN filter
    employeeList: builder.query({
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
          url: "/employees",
          method: "GET",
          params,
        };
      },
      providesTags: ["employees"],
    }),

    // ⚠️ DEPRECATED - Use User API
    getEmployeeById: builder.query({
      query: (id: string) => ({
        url: `/employees/${id}`,
        method: "GET",
      }),
      providesTags: ["employees"],
    }),

    // ⚠️ DEPRECATED - Use User API
    updateEmployee: builder.mutation({
      query: ({ id, data }) => ({
        url: `/employees/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["employees"],
    }),

    // ⚠️ DEPRECATED - Use User API
    deleteEmployee: builder.mutation({
      query: (id: string) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["employees"],
    }),
  }),
});

export const {
  useCreateEmployeeMutation,
  useEmployeeListQuery,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeesApi;
