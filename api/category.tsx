import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";

interface CategoryPayload {
  title: string;
  icon?: string;
  color?: string
}

const CATEGORY_API_URL = "/category";
const keys = {
  all: ["categories"],
  list: () => [...keys.all, "list"],
}

export const useGetCategories = (searchParams: { search?: string, sort?: string, sort_order?: string } = {}) => {

  const params: Record<string, string> = {};
  if (searchParams.search) params.search_term = searchParams.search;
  if (searchParams.sort) params.sort = searchParams.sort;
  if (searchParams.sort_order) params.sort_order = searchParams.sort_order;

  return useQuery({
    queryKey: [...keys.list(), params],
    queryFn: async () => {
      try {
        const response = await apiClient.get(CATEGORY_API_URL, { params });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: CategoryPayload) => {
      try {
        const response = await apiClient.post(CATEGORY_API_URL, category);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.list() }),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, category }: { id: string; category: Partial<CategoryPayload> }) => {
      try {
        const response = await apiClient.patch(`${CATEGORY_API_URL}/${id}`, category);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.list() }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`${CATEGORY_API_URL}`, { data: { ids: [id] } });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.list() }),
  });
};