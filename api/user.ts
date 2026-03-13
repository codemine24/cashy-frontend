import apiClient from "@/lib/api-client";
import { throwApiError } from "@/utils/throw-api-error";
import { useMutation, useQuery } from "@tanstack/react-query";

const USER_API_URL = "/user";

const keys = {
  all: ["users"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
};

type UpdateProfilePayload = {
  name?: string;
  contact_number?: string;
  theme?: "LIGHT" | "DARK";
  language?: string;
  currency?: string;
  push_notification?: boolean;
  avatar?: {
    uri: string;
    name: string;
    type: string;
  };
};

export const useGetAllUsers = (searchParams: { search?: string, sort?: string, sort_order?: string, limit?: number } = {}) => {
  // Filter out empty/undefined params
  const params: Record<string, string> = {};
  if (searchParams.search) params.search_term = searchParams.search;
  if (searchParams.sort) params.sort = searchParams.sort;
  if (searchParams.sort_order) params.sort_order = searchParams.sort_order;
  if (searchParams.limit) params.limit = String(searchParams.limit);

  return useQuery({
    queryKey: [...keys.list(), params],
    queryFn: async () => {
      try {
        const response = await apiClient.get(USER_API_URL, { params });
        return response.data;
      } catch (error) {
        throwApiError(error);
      }
    },
  });
};

const updateProfile = async (payload: UpdateProfilePayload) => {
  const { avatar, ...data } = payload;

  const formData = new FormData();

  // wrapped in a "data" key as a JSON string
  formData.append("data", JSON.stringify(data));

  if (avatar) {
    // React Native FormData accepts { uri, name, type } directly
    formData.append("avatar", avatar as unknown as Blob);
  }

  const response = await apiClient.patch(
    `${USER_API_URL}/update-profile`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
  });
};
