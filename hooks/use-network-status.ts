import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";

/**
 * Polls network state every 3 seconds and returns whether the device
 * has an active internet connection. Works in Expo Go.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        // isConnected: false when no network at all
        // isInternetReachable: null = unknown, false = no internet even with network
        const connected = state.isConnected === true;
        const reachable = state.isInternetReachable !== false; // null treated as "maybe"
        setIsOnline(connected && reachable);
      } catch {
        setIsOnline(false);
      }
    };

    // Run immediately on mount
    check();

    // Always poll every 3 s to catch going online/offline after mount
    intervalRef.current = setInterval(check, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isOnline };
}
