import apiClient from "@/lib/api-client";
import { formatDateToUTC } from "@/utils";
import { throwApiError } from "@/utils/throw-api-error";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const TRANSACTION_API_URL = "/transaction";
const keys = {
  all: ["transactions"],
  list: () => [...keys.all, "list"],
  infinite: (bookId: string) => [...keys.all, "infinite", bookId],
  detail: (id: string) => [...keys.all, "detail", id],
};

interface GetTransactionsParams {
  book_id: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  sort_order?: string;
}

export const useTransactions = (searchParams: GetTransactionsParams) => {
  const params: Record<string, string> = {};

  if (searchParams.search) params.search_term = searchParams.search;
  if (searchParams.page) params.page = searchParams.page.toString();
  if (searchParams.limit) params.limit = searchParams.limit.toString();
  if (searchParams.sort) params.sort = searchParams.sort;
  if (searchParams.sort_order) params.sort_order = searchParams.sort_order;

  return useQuery({
    queryKey: [...keys.list(), searchParams],
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `${TRANSACTION_API_URL}/book/${searchParams.book_id}`,
          { params },
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

interface InfiniteTransactionsParams {
  book_id: string;
  search?: string;
  sort?: string;
  limit?: number;
  sort_order?: string;
  type?: string;
  period?: string;
  from_date?: string;
  to_date?: string;
  date?: string;
  member_id?: string;
  category_ids?: string[];
}

export const useInfiniteTransactions = (params: InfiniteTransactionsParams) => {
  return useInfiniteQuery({
    queryKey: [...keys.infinite(params.book_id), params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const queryParams: Record<string, string> = {
          page: pageParam.toString(),
          limit: params.limit?.toString() || "5",
        };
        if (params.search) queryParams.search_term = params.search;
        if (params.sort) queryParams.sort = params.sort;
        if (params.sort_order) queryParams.sort_order = params.sort_order;
        if (params.type) queryParams.type = params.type;
        if (params.period) queryParams.period = params.period;

        // Convert date parameters to UTC before sending
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

        // Convert single date to UTC date range to handle timezone differences
        if (params.date) {
          const localDate = new Date(params.date);

          // Get the start and end of the local day
          const startOfDay = new Date(localDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(localDate);
          endOfDay.setHours(23, 59, 59, 999);

          // Convert both to UTC
          const utcStart = formatDateToUTC(startOfDay);
          const utcEnd = formatDateToUTC(endOfDay);

          // Use date range instead of single date
          queryParams.from_date = utcStart;
          queryParams.to_date = utcEnd;
          // Remove the single date parameter to avoid conflicts
          delete queryParams.date;
        }

        if (params.member_id) queryParams.member_id = params.member_id;
        if (params.category_ids)
          queryParams.category_ids = params.category_ids.join(",");

        const response = await apiClient.get(
          `${TRANSACTION_API_URL}/book/${params.book_id}`,
          { params: queryParams },
        );

        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const txCount = lastPage?.data?.transactions?.length ?? 0;
      return txCount < (params.limit || 5) ? undefined : allPages.length + 1;
    },
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${TRANSACTION_API_URL}/${id}`);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await apiClient.post(TRANSACTION_API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      try {
        const response = await apiClient.patch(
          `${TRANSACTION_API_URL}/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`${TRANSACTION_API_URL}/${id}`);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
