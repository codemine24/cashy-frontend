import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const GOAL_API_URL = "/goal";
const keys = {
  all: ["goals"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
};

export const useGoals = () => {
  return useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(GOAL_API_URL);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useGoal = (id: string) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${GOAL_API_URL}/${id}`);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    enabled: !!id,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      target_amount,
    }: {
      name: string;
      target_amount: number;
    }) => {
      try {
        const response = await apiClient.post(GOAL_API_URL, {
          name,
          target_amount,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      try {
        const response = await apiClient.put(`${GOAL_API_URL}/${id}`, { name });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`${GOAL_API_URL}`, {
          data: { ids: [id] },
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};
