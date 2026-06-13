import { useState } from "react";
import {
  useCreateDesignationMutation,
  useDeleteDesignationMutation,
  useDesignationListQuery,
  useUpdateDesignationMutation,
} from "../redux/features/designations/designationsApi";
import { IDesignation } from "../types/interfaces";

export const useDesignations = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const {
    data: designationData,
    isLoading: loading,
    refetch,
    isFetching,
  } = useDesignationListQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    { name: "search", value: search },
  ]);

  const [createDesignationMutation, { isLoading: createDesignationLoading }] =
    useCreateDesignationMutation();
  const [updateDesignationMutation, { isLoading: updateDesignationLoading }] =
    useUpdateDesignationMutation();
  const [deleteDesignationMutation] = useDeleteDesignationMutation();

  const designations = designationData?.data || [];
  const total = designationData?.meta?.total || 0;

  const createDesignation = async (
    data: Omit<IDesignation, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const result = await createDesignationMutation(data).unwrap();
      refetch();
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to create designation";
      return { success: false, error: errorMessage };
    }
  };

  const updateDesignation = async (id: string, data: Partial<IDesignation>) => {
    try {
      await updateDesignationMutation({ id, data }).unwrap();
      refetch();
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to update designation";
      return { success: false, error: errorMessage };
    }
  };

  const deleteDesignation = async (id: string) => {
    try {
      await deleteDesignationMutation(id).unwrap();
      refetch();
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to delete designation";
      return { success: false, error: errorMessage };
    }
  };

  return {
    designations,
    loading,
    total,
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    createDesignation,
    updateDesignation,
    deleteDesignation,
    refetch,
    isFetching,
    createDesignationLoading,
    updateDesignationLoading,
  };
};
