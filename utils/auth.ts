import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_INFO_KEY,
} from "@/constants/auth";
import { User } from "@/interface/user";
import * as SecureStore from "expo-secure-store";

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function removeAccessToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch {}
}

export async function getUserInfo(): Promise<User | null> {
  try {
    const info = await SecureStore.getItemAsync(USER_INFO_KEY);
    if (!info) return null;
    return JSON.parse(info);
  } catch {
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
  } catch {}
}

export async function clearUserInfo(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch {}
}
