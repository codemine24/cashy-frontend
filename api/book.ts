import apiClient from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book } from "@/interface/book";
import { throwApiError } from "@/utils/throw-api-error";

const BOOK_API_URL = "/book";
const keys = {
  all: ["books"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
};

export const useBooks = (
  searchParams: { search?: string; sort?: string; sort_order?: string } = {},
) => {
  // Filter out empty/undefined params
  const params: Record<string, string> = {};
  if (searchParams.search) params.search_term = searchParams.search;
  if (searchParams.sort) params.sort = searchParams.sort;
  if (searchParams.sort_order) params.sort_order = searchParams.sort_order;

  return useQuery({
    queryKey: [...keys.list(), params],
    queryFn: async (): Promise<{ data: Book[] } | undefined> => {
      try {
        const response = await apiClient.get(BOOK_API_URL, { params });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async (): Promise<{ data: Book } | undefined> => {
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

export const useCreateBook = () => {
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useUpdateBook = () => {
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(BOOK_API_URL, { data:{ ids: [id]} });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useShareBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      book_id,
      email,
      role,
    }: {
      book_id: string;
      email: string;
      role: string;
    }) => {
      try {
        const response = await apiClient.post(`${BOOK_API_URL}/share`, {
          book_id,
          email,
          role,
        });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ book_id, user_id }: { book_id: string; user_id: string }) => {
      try {
        const response = await apiClient.delete(`${BOOK_API_URL}/remove-member`, { data:{ book_id, user_id } });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};