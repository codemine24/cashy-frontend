import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useQuery } from "@tanstack/react-query";

export const useGetLatestAppVersion = () => {
  return useQuery({
    queryKey: ["app-version"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/app-version");
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};
