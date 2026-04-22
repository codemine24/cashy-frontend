import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useQuery } from "@tanstack/react-query";

const STATISTICS_API_URL = "/statistics";

const keys = {
  all: ["statistics"],
  loanStats: (params: any) => [...keys.all, "loanStats", params],
  walletStats: (params: any) => [...keys.all, "walletStats", params],
};

export const useWalletStats = (
  params: {
    period?: "all_time" | "today" | "last_7_days" | "last_30_days" | "custom";
    book_id?: string;
    from_date?: string;
    to_date?: string;
  } = {},
) => {
  return useQuery({
    queryKey: keys.walletStats(params),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${STATISTICS_API_URL}/wallet`, {
          params,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useLoanStats = (
  params: {
    period?: "all_time" | "today" | "last_7_days" | "last_30_days" | "custom";
    from_date?: string;
    to_date?: string;
  } = {},
) => {
  return useQuery({
    queryKey: keys.loanStats(params),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${STATISTICS_API_URL}/loan`, {
          params,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};
