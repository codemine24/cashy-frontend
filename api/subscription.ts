import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery } from "@tanstack/react-query";

export type CreateSubscriptionPayload = {
  plan: "MONTHLY" | "YEARLY";
  price: string;
  product_id: string;
  rc_app_user_id: string;
  expires_at: string;
};

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  price: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  product_id: string;
  rc_app_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: async (payload: CreateSubscriptionPayload) => {
      try {
        const response = await apiClient.post("/subscription", payload);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useCreateTemporary = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      try {
        const response = await apiClient.post("/temp", payload);
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

export const useGetMySubscription = () => {
  return useQuery({
    queryKey: ["my-subscription"],
    queryFn: async (): Promise<Subscription | undefined> => {
      try {
        const response = await apiClient.get("/subscription/my");
        return response.data?.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};
