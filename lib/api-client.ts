import axios from "axios";
import { getAccessToken, getRefreshToken, removeAccessToken, setAccessToken } from "@/utils/auth";

// Create Axios instance
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Refresh token control
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Attach access token automatically
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => {
    // If response.data is a string, it might be due to incorrect Content-Type from server
    // We try to parse it as JSON if it's a string
    // if (typeof response.data === "string") {
    //   try {
    //     return JSON.parse(response.data);
    //   } catch {
    //     return response.data;
    //   }
    // }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshToken = await getRefreshToken();
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          await setAccessToken(accessToken);

          isRefreshing = false;
          onRefreshed(accessToken);
        } catch (err) {
          isRefreshing = false;
          await removeAccessToken();
          return Promise.reject(err);
        }
      }

      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;