import axios from "axios";
import { getAccessToken, removeAccessToken } from "@/utils/auth";
import { router } from "expo-router";

// Create Axios instance
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach access token automatically
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRedirecting = false;

// Handle 401 and redirect to login
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      await removeAccessToken();
      router.replace("/login-type");
      // Reset redirecting flag after a short delay
      setTimeout(() => {
        isRedirecting = false;
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export default apiClient;