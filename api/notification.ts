import { NotificationResponse } from "@/interface/notification";
import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useQuery } from "@tanstack/react-query";

const NOTIFICATION_API_URL = "/notification";

const keys = {
  all: ["notifications"],
  list: () => [...keys.all, "list"],
};

export const useGetNotifications = (
  params: { page?: number; limit?: number } = {},
) => {
  return useQuery({
    queryKey: [...keys.list(), params],
    queryFn: async (): Promise<NotificationResponse> => {
      try {
        const response = await apiClient.get(NOTIFICATION_API_URL, { params });
        return response.data;
      } catch (error) {
        throwApiError(error);
        throw error; // Re-throw after handling
      }
    },
  });
};
