import { useState } from "react";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllUserQuery,
  useUpdateUserMutation,
} from "../redux/features/user/userApi";
import { IEmployee } from "../types/interfaces";

export const useEmployees = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  // Fetch ADMIN users (repurposed from employees)
  const {
    data: userData,
    isLoading: loading,
    isFetching,
    refetch,
  } = useGetAllUserQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    { name: "search", value: search },
    { name: "role", value: "ADMIN" }, // Filter for ADMIN role users
  ]);

  const [createUserMutation, { isLoading: createEmployeesLoading }] =
    useCreateUserMutation();
  const [updateUserMutation, { isLoading: updateEmployeesLoading }] =
    useUpdateUserMutation();
  const [deleteUserMutation] = useDeleteUserMutation();

  const employees = userData?.data || [];
  const total = userData?.meta?.total || 0;

  const createEmployee = async (
    data: Omit<IEmployee, "id" | "createdAt" | "updatedAt" | "designation">
  ) => {
    try {
      // Create user with ADMIN role
      const result = await createUserMutation({
        ...data,
        role: "ADMIN",
      }).unwrap();
      refetch();
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to create user";
      return { success: false, error: errorMessage };
    }
  };

  const updateEmployee = async (id: string, data: Partial<IEmployee>) => {
    try {
      await updateUserMutation({ id, data }).unwrap();
      refetch();
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to update user";
      return { success: false, error: errorMessage };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await deleteUserMutation(id).unwrap();
      refetch();
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to delete user";
      return { success: false, error: errorMessage };
    }
  };

  return {
    employees,
    loading,
    total,
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch,
    isFetching,
    createEmployeesLoading,
    updateEmployeesLoading,
  };
};
