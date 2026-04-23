import apiClient from "@/lib/api-client";
import { formatDateToUTC } from "@/utils";
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
    search_term?: string;
    category_id?: string;
    category_ids?: string[];
    member_id?: string;
    type?: string;
  } = {},
) => {
  return useQuery({
    queryKey: keys.walletStats(params),
    queryFn: async () => {
      try {
        const queryParams: Record<string, any> = { ...params };

        // Handle date formatting if present (matching transaction API logic)
        if (params.from_date) {
          const fromDate = new Date(params.from_date);
          fromDate.setHours(0, 0, 0, 0);
          queryParams.from_date = formatDateToUTC(fromDate);
        }
        if (params.to_date) {
          const toDate = new Date(params.to_date);
          toDate.setHours(23, 59, 59, 999);
          queryParams.to_date = formatDateToUTC(toDate);
        }

        // Handle category plural/singular and array join
        if (Array.isArray(params.category_ids)) {
          queryParams.category_ids = params.category_ids.join(",");
        }

        const response = await apiClient.get(`${STATISTICS_API_URL}/wallet`, {
          params: queryParams,
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
        const queryParams: Record<string, any> = { ...params };

        if (params.from_date) {
          const fromDate = new Date(params.from_date);
          fromDate.setHours(0, 0, 0, 0);
          queryParams.from_date = formatDateToUTC(fromDate);
        }
        if (params.to_date) {
          const toDate = new Date(params.to_date);
          toDate.setHours(23, 59, 59, 999);
          queryParams.to_date = formatDateToUTC(toDate);
        }

        const response = await apiClient.get(`${STATISTICS_API_URL}/loan`, {
          params: queryParams,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};
