import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export interface VersionInfo {
  version: string;
  versionCode: number;
  isForceUpdate: boolean;
  releaseNotes?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  versionInfo?: VersionInfo;
  currentVersion: string;
  currentVersionCode: number;
}

// Get current app version from app.json
export function getCurrentVersion(): { version: string; versionCode: number } {
  const config = Constants.expoConfig;
  return {
    version: config?.version || '1.0.0',
    versionCode: config?.android?.versionCode || 1,
  };
}

// Compare semantic versions
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
}

// Check for updates (replace with your API endpoint)
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    const currentVersion = getCurrentVersion();
    
    // For demo purposes, simulate API call
    // Replace this with your actual API call
    const mockApiResponse: VersionInfo = {
      version: '1.2.0',
      versionCode: 2026042202,
      isForceUpdate: false,
      releaseNotes: 'Bug fixes and performance improvements',
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const hasUpdate = compareVersions(mockApiResponse.version, currentVersion.version) > 0;
    
    return {
      hasUpdate,
      versionInfo: hasUpdate ? mockApiResponse : undefined,
      currentVersion: currentVersion.version,
      currentVersionCode: currentVersion.versionCode,
    };
    
  } catch (error) {
    console.error('Error checking for updates:', error);
    // Return current version info on error
    const currentVersion = getCurrentVersion();
    return {
      hasUpdate: false,
      currentVersion: currentVersion.version,
      currentVersionCode: currentVersion.versionCode,
    };
  }
}

// Open Google Play Store
export async function openPlayStore(): Promise<void> {
  const packageName = Constants.expoConfig?.android?.package;
  
  if (Platform.OS === 'android' && packageName) {
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
    await Linking.openURL(playStoreUrl);
  } else {
    console.warn('Play Store is only available on Android');
  }
}