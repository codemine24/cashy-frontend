import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from "@/constants/auth";
import { User } from "@/interface/user";

export async function getAccessToken(): Promise<string | null> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token retrieval");
      return null;
    }

    // Use SecureStore for native
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("[Auth] Failed to get session token:", error);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token retrieval");
      return null;
    }

    // Use SecureStore for native
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("[Auth] Failed to get refresh token:", error);
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token storage");
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error("[Auth] Failed to set session token:", error);
    throw error;
  }
}

export async function removeAccessToken(): Promise<void> {
  try {
    // Web platform uses cookie-based auth, logout is handled by server clearing cookie
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token removal");
      return;
    }

    // Use SecureStore for native
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("[Auth] Failed to remove session token:", error);
  }
}

export async function getUserInfo(): Promise<User | null> {
  try {
    let info: string | null = null;
    if (Platform.OS === "web") {
      // Use localStorage for web
      info = window.localStorage.getItem(USER_INFO_KEY);
    } else {
      // Use SecureStore for native
      info = await SecureStore.getItemAsync(USER_INFO_KEY);
    }

    if (!info) {
      return null;
    }
    const user = JSON.parse(info);
    return user;
  } catch (error) {
    console.error("[Auth] Failed to get user info:", error);
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
      return;
    }
    
    // Use SecureStore for native
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("[Auth] Failed to set user info:", error);
  }
}

export async function clearUserInfo(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      window.localStorage.removeItem(USER_INFO_KEY);
      return;
    }

    // Use SecureStore for native
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch (error) {
    console.error("[Auth] Failed to clear user info:", error);
  }
}
