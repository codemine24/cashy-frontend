import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as Updates from "expo-updates";
import { Platform } from "react-native";

// version.config.ts (you update this manually per release)
export const LATEST_STORE_VERSION = {
  version: "1.1.0",
  versionCode: 2,
  isForceUpdate: true,
  releaseNotes: "Bug fixes and performance improvements",
};

export interface VersionInfo {
  version: string;
  versionCode: number;
  isForceUpdate: boolean;
  releaseNotes?: string;
  type: "OTA" | "STORE";
}

export interface UpdateCheckResult {
  hasOTAUpdate: boolean;
  hasStoreUpdate: boolean;
  versionInfo?: VersionInfo;
  currentVersion: string;
  currentVersionCode: number;
}

// CURRENT APP VERSION (from build)
export function getCurrentVersion() {
  const config = Constants.expoConfig;

  return {
    version: config?.version || "1.0.0",
    versionCode: config?.android?.versionCode || 1,
  };
}

export async function checkOTAUpdate() {
  if (!Updates.isEnabled) {
    return false;
  }

  const result = await Updates.checkForUpdateAsync();
  return result.isAvailable;
}

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    const current = getCurrentVersion();

    // OTA update check (Expo)
    const otaAvailable = await checkOTAUpdate();

    // STORE update check (manual version file)
    const storeUpdateAvailable =
      LATEST_STORE_VERSION.versionCode > current.versionCode;

    return {
      hasOTAUpdate: otaAvailable,
      hasStoreUpdate: storeUpdateAvailable,
      versionInfo: storeUpdateAvailable
        ? {
            version: LATEST_STORE_VERSION.version,
            versionCode: LATEST_STORE_VERSION.versionCode,
            isForceUpdate: LATEST_STORE_VERSION.isForceUpdate,
            releaseNotes: LATEST_STORE_VERSION.releaseNotes,
            type: "STORE",
          }
        : otaAvailable
        ? {
            version: current.version,
            versionCode: current.versionCode,
            isForceUpdate: false,
            type: "OTA",
            releaseNotes: "Improved performance and bug fixes",
          }
        : undefined,

      currentVersion: current.version,
      currentVersionCode: current.versionCode,
    };
  } catch (error) {
    console.error("Update check failed:", error);

    const current = getCurrentVersion();
    return {
      hasOTAUpdate: false,
      hasStoreUpdate: false,
      currentVersion: current.version,
      currentVersionCode: current.versionCode,
    };
  }
}

export async function applyOTAUpdate() {
  try {
    const result = await Updates.fetchUpdateAsync();

    if (result.isNew) {
      await Updates.reloadAsync();
      return true;
    }

    return false;
  } catch (error) {
    console.error("OTA update failed:", error);
    return false;
  }
}

export async function openStore() {
  const packageName = Constants.expoConfig?.android?.package;

  if (Platform.OS === "android" && packageName) {
    const market = `market://details?id=${packageName}`;
    const web = `https://play.google.com/store/apps/details?id=${packageName}`;

    try {
      await Linking.openURL(market);
    } catch {
      await Linking.openURL(web);
    }
  }
}