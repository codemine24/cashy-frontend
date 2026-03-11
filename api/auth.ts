import { setAccessToken, setUserInfo } from "@/utils/auth";
import apiClient from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { throwApiError } from "@/utils/throw-api-error";

export const useSendOtp = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            try {
                const response = await apiClient.post("/auth/get-otp", { email });
                return response.data;
            } catch (error) {
                throwApiError(error);
            }
        },
    });
}

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: async ({ email, otp }: { email: string, otp: string }) => {
            try {
                const response = await apiClient.post("/auth/validate-otp", { email, otp: Number(otp) });
                return response.data;
            } catch (error) {
                throwApiError(error);
            }
        },
        onSuccess: async (data: any) => {
            await setAccessToken(data?.data?.access_token);
            await setUserInfo({
                id: data?.data?.id,
                name: data?.data?.name,
                email: data?.data?.email,
                contact_number: data?.data?.contact_number,
                role: data?.data?.role,
                avatar: data?.data?.avatar,
                status: data?.data?.status,
                theme: data?.data?.theme ?? "SYSTEM",
                language: data?.data?.language ?? "en",
                currency: data?.data?.currency ?? "USD",
                push_notification: data?.data?.push_notification ?? true,
            });
        }
    });
}
