import {
    CreateLoanPayload,
    CreateLoanPaymentPayload,
    UpdateLoanPayload,
    UpdateLoanPaymentPayload,
} from "@/interface/loan";
import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const LOAN_API_URL = "/loan";
const keys = {
  all: ["loans"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
};

interface GetLoansParams {
  search?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export const useGetAllLoans = (searchParams: GetLoansParams = {}) => {
  const params: Record<string, string> = {};
  if (searchParams.search) params.search_term = searchParams.search;
  if (searchParams.sort_by) params.sort_by = searchParams.sort_by;
  if (searchParams.sort_order) params.sort_order = searchParams.sort_order;
  if (searchParams.page) params.page = searchParams.page.toString();
  if (searchParams.limit) params.limit = searchParams.limit.toString();
  if (searchParams.type) params.type = searchParams.type;
  if (searchParams.status) params.status = searchParams.status;

  return useQuery({
    queryKey: [...keys.list(), params],
    queryFn: async () => {
      try {
        const response = await apiClient.get(LOAN_API_URL, { params });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    enabled: !!searchParams,
  });
};

export const useGetLoanDetail = (id: string) => {
  return useQuery({
    queryKey: [...keys.detail(id)],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${LOAN_API_URL}/${id}`);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLoanPayload) => {
      try {
        const response = await apiClient.post(LOAN_API_URL, data);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...keys.list()] }),
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateLoanPayload;
    }) => {
      try {
        const response = await apiClient.patch(
          `${LOAN_API_URL}/${id}`,
          payload,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...keys.list()] }),
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`${LOAN_API_URL}`, {
          data: { ids: [id] },
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...keys.list()] }),
  });
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLoanPaymentPayload) => {
      try {
        const response = await apiClient.post(
          `${LOAN_API_URL}/payment`,
          payload,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...keys.all] }),
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateLoanPaymentPayload) => {
      try {
        const response = await apiClient.patch(
          `${LOAN_API_URL}/payment`,
          payload,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...keys.all] }),
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`${LOAN_API_URL}/payment`, {
          data: { ids: [id] },
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...keys.all] }),
  });
};
