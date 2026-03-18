import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useQuery } from "@tanstack/react-query";

const STATISTICS_API_URL = "/statistics";

const keys = {
  all: ["statistics"],
  overview: (params: any) => [...keys.all, "overview", params],
  trend: (params: any) => [...keys.all, "trend", params],
  categoryBreakdown: (params: any) => [
    ...keys.all,
    "categoryBreakdown",
    params,
  ],
  loanSummary: () => [...keys.all, "loanSummary"],
  goalSummary: () => [...keys.all, "goalSummary"],
  walletStats: (params: any) => [...keys.all, "walletStats", params],
};

export const useWalletStats = (
  params: {
    period?: "week" | "month" | "year";
    book_id?: string;
  } = {},
) => {
  return useQuery({
    queryKey: keys.walletStats(params),
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `${STATISTICS_API_URL}/wallet-stats`,
          { params },
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useBookOverview = (
  params: {
    period?: "all" | "day" | "week" | "month" | "year";
    from_date?: string;
    to_date?: string;
    book_id?: string;
  } = {},
) => {
  return useQuery({
    queryKey: keys.overview(params),
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `${STATISTICS_API_URL}/book-overview`,
          { params },
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useTransactionTrend = (
  params: { period?: string; book_id?: string } = {},
) => {
  return useQuery({
    queryKey: keys.trend(params),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${STATISTICS_API_URL}/trend`, {
          params,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useCategoryBreakdown = (
  params: { period?: string; type?: "IN" | "OUT"; book_id?: string } = {},
) => {
  return useQuery({
    queryKey: keys.categoryBreakdown(params),
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `${STATISTICS_API_URL}/category-breakdown`,
          { params },
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useLoanSummary = () => {
  return useQuery({
    queryKey: keys.loanSummary(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `${STATISTICS_API_URL}/loan-summary`,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useGoalSummary = () => {
  return useQuery({
    queryKey: keys.goalSummary(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `${STATISTICS_API_URL}/goal-summary`,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};
