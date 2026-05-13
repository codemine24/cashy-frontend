import type { User } from "@/interface/user";

/**
 * After login (or on app relaunch with an existing session),
 * decide where the user should land:
 *
 * 1. PIN enabled + PIN exists  → `/pin-verify`  (must verify before using app)
 * 2. PIN enabled + no PIN      → `/pin-setup`   (must set up or skip)
 * 3. PIN not enabled           → `/(tabs)`      (straight to the app)
 */
export function getPinGateRoute(user: User | null): string {
  if (!user) return "/(tabs)";

  if (user.is_pin_enabled) {
    return user.pin ? "/pin-verify" : "/pin-setup";
  }

  return "/(tabs)";
}
