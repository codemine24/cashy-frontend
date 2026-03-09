import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const GOAL_TRANSACTION_API_URL = "/goal-transaction";
const keys = {
  all: ["goal-transactions"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
};

interface goalTransactionRequest {
  goal_id?: string;
  type: string;
  amount: number;
  remark?: string;
  date?: string;
  time?: string;
}

export const useGoalTransactions = () => {
  return useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(GOAL_TRANSACTION_API_URL);
        return response.data;
      } catch (error) {
       throwApiError(error);
      }
    },
  });
};

export const useGoalTransaction = (id: string) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `${GOAL_TRANSACTION_API_URL}/${id}`,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    enabled: !!id,
  });
};

export const useCreateGoalTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: goalTransactionRequest) => {
      try {
        const response = await apiClient.post(
          GOAL_TRANSACTION_API_URL,
          transaction,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useUpdateGoalTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      transaction,
    }: {
      id: string;
      transaction: Omit<goalTransactionRequest, "goal_id">;
    }) => {
      try {
        const response = await apiClient.patch(
          `${GOAL_TRANSACTION_API_URL}/${id}`,
          transaction,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useDeleteGoalTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        const response = await apiClient.delete(GOAL_TRANSACTION_API_URL, {
          data: { ids },
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};
