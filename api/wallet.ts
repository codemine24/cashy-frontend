import { Wallet } from "@/interface/wallet";
import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BOOK_API_URL = "/wallet";
const keys = {
  all: ["wallets"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
};

export const useWallets = (
  searchParams: { search?: string; sort?: string; sort_order?: string } = {},
) => {
  // Filter out empty/undefined params
  const params: Record<string, string> = {};
  if (searchParams.search) params.search_term = searchParams.search;
  if (searchParams.sort) params.sort_by = searchParams.sort;
  if (searchParams.sort_order) params.sort_order = searchParams.sort_order;

  return useQuery({
    queryKey: [...keys.list(), params],
    queryFn: async (): Promise<{ data: Wallet[] } | undefined> => {
      try {
        const response = await apiClient.get(BOOK_API_URL, { params });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useWallet = (id: string) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async (): Promise<{ data: Wallet } | undefined> => {
      try {
        const response = await apiClient.get(`${BOOK_API_URL}/${id}`);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    enabled: !!id,
  });
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      try {
        const response = await apiClient.post(BOOK_API_URL, { name });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      try {
        const response = await apiClient.patch(`${BOOK_API_URL}/${id}`, {
          name,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(BOOK_API_URL, {
          data: { ids: [id] },
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useShareWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wallet_id,
      email,
      role,
    }: {
      wallet_id: string;
      email: string;
      role: string;
    }) => {
      try {
        const response = await apiClient.post(`${BOOK_API_URL}/share`, {
          wallet_id,
          email,
          role,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wallet_id,
      user_id,
    }: {
      wallet_id: string;
      user_id: string;
    }) => {
      try {
        const response = await apiClient.delete(
          `${BOOK_API_URL}/remove-member`,
          { data: { wallet_id, user_id } },
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
};
export const useLeaveWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.post(`${BOOK_API_URL}/${id}/leave`);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};
