import { ThemeLoadingSkeleton } from "@/components/theme-loading-skeleton";
import { themes, type ThemeName } from "@/constants/themes";
import { getUserInfo, setUserInfo } from "@/utils/auth";
import { useColorScheme } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, StyleProp, View, ViewStyle } from "react-native";

// ─── Context type ────────────────────────────────────────────────────
interface ThemeContextValue {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  colorScheme: "light" | "dark";
  toggleColorScheme: () => Promise<void>;
  setColorScheme: (scheme: "light" | "dark") => void;
  isDark: boolean;
  themeVars: StyleProp<ViewStyle>;
  applyUserTheme: (theme: "LIGHT" | "DARK") => Promise<void>;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Resolve user preference to actual scheme ────────────────────────
function resolveUserTheme(pref: "LIGHT" | "DARK"): any {
  if (pref === "LIGHT") return "light";
  if (pref === "DARK") return "dark";
}

// ─── Provider (context only – no View wrapper) ──────────────────────
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>("default");
  const [userTheme, setUserTheme] = useState<"light" | "dark" | null>(null);
  const { setColorScheme } = useColorScheme();

  const resolvedScheme = userTheme ?? "light";

  const toggleColorScheme = useCallback(async () => {
    const newScheme = resolvedScheme === "dark" ? "light" : "dark";
    setColorScheme(newScheme);
    setUserTheme(newScheme);

    // Persist the user's theme preference
    try {
      const user = await getUserInfo();
      if (user) {
        const pref = newScheme === "dark" ? "DARK" : "LIGHT";
        await setUserInfo({ ...user, theme: pref });
      }
    } catch (error) {
      console.warn("Failed to persist theme preference:", error);
    }
  }, [resolvedScheme, setColorScheme]);

  const applyUserTheme = useCallback(
    async (pref: "LIGHT" | "DARK") => {
      const scheme = resolveUserTheme(pref);
      setColorScheme(scheme);
      setUserTheme(scheme);

      // Persist the user's theme preference
      try {
        const user = await getUserInfo();
        if (user) {
          await setUserInfo({ ...user, theme: pref });
        }
      } catch (error) {
        console.warn("Failed to persist theme preference:", error);
      }
    },
    [setColorScheme],
  );

  const resetTheme = useCallback(() => {
    setUserTheme("light");
    setColorScheme("light");
  }, [setColorScheme]);

  const themeVars = useMemo(
    () => themes[themeName][resolvedScheme],
    [themeName, resolvedScheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      setThemeName,
      colorScheme: resolvedScheme,
      toggleColorScheme,
      setColorScheme,
      isDark: resolvedScheme === "dark",
      themeVars,
      applyUserTheme,
      resetTheme,
    }),
    [
      themeName,
      resolvedScheme,
      toggleColorScheme,
      setColorScheme,
      themeVars,
      applyUserTheme,
      resetTheme,
    ],
  );

  // On mount, read the stored user preference and apply it
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const user = await getUserInfo();
        if (user?.theme) {
          const scheme = resolveUserTheme(user.theme);
          setUserTheme(scheme);
          setColorScheme(scheme);
        } else {
          // Default to light if no user preference
          const defaultScheme = "light";
          setUserTheme(defaultScheme);
          setColorScheme(defaultScheme);
        }
      } catch (error) {
        console.warn("Failed to load user theme:", error);
        // Default to light on error
        const defaultScheme = "light";
        setUserTheme(defaultScheme);
        setColorScheme(defaultScheme);
      }
    };
    loadStoredTheme();
  }, [setColorScheme]);

  // Prevent system theme changes - always use user preference
  useEffect(() => {
    if (!userTheme) return;

    // Re-apply user theme when app comes to foreground or system tries to override
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setColorScheme(userTheme);
      }
    });

    return () => subscription?.remove();
  }, [userTheme, setColorScheme]);

  // Don't render anything until user theme is loaded
  if (!userTheme) {
    return <ThemeLoadingSkeleton />;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// ─── Wrapper that applies CSS vars (place INSIDE navigation tree) ───
export function ThemeVarsProvider({ children }: { children: React.ReactNode }) {
  const { themeVars, isDark } = useTheme();
  return (
    <View
      style={[themeVars, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}
      className="flex-1"
    >
      {children}
    </View>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider />");
  }
  return ctx;
}
