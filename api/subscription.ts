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
    queryFn: async () => {
      try {
        const response = await apiClient.get("/subscriptions/my-subscription");
        return response.data?.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};
