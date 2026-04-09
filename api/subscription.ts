import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery } from "@tanstack/react-query";

export type CreateSubscriptionPayload = {
  plan: "LIFETIME";
  price: string;
  purchase_token?: string | null;
  product_id: string;
  package_name: string;
};

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  price: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  purchase_token: string | null;
  package_name: string;
  product_id: string;
  transaction_id: string | null;
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
