import { NotificationResponse } from "@/interface/notification";
import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery } from "@tanstack/react-query";

const NOTIFICATION_API_URL = "/notification";

const keys = {
  all: ["notifications"],
  list: () => [...keys.all, "list"],
  unreadCount: () => [...keys.all, "unread-count"],
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

export const useMarkNotificationsAsRead = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await apiClient.patch(
          `${NOTIFICATION_API_URL}/mark-as-read`,
        );
        return response.data;
      } catch (error) {
        throwApiError(error);
        throw error;
      }
    },
  });
};

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: keys.unreadCount(),
    queryFn: async (): Promise<number> => {
      try {
        const response = await apiClient.get<NotificationResponse>(
          NOTIFICATION_API_URL,
          { params: { page: 1, limit: 100 } },
        );
        const notifications = response.data?.data ?? [];
        return notifications.filter((n) => !n.is_read).length;
      } catch (error) {
        throwApiError(error);
        throw error;
      }
    },
  });
};
