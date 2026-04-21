import { themes, type ThemeName } from "@/constants/themes";
import { getUserInfo } from "@/utils/auth";
import { useColorScheme } from "nativewind";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { StyleProp, View, ViewStyle } from "react-native";

// ─── Context type ────────────────────────────────────────────────────
interface ThemeContextValue {
  /** The active theme name (e.g. "default") */
  themeName: ThemeName;
  /** Switch to a different named theme */
  setThemeName: (name: ThemeName) => void;
  /** Current color scheme: "light" | "dark" */
  colorScheme: "light" | "dark";
  /** Toggle between light and dark */
  toggleColorScheme: () => void;
  /** Explicitly set color scheme */
  setColorScheme: (scheme: "light" | "dark") => void;
  /** Whether the current color scheme is dark */
  isDark: boolean;
  /** CSS variable style object – apply on a root View inside the navigation tree */
  themeVars: StyleProp<ViewStyle>;
  /** Apply a user theme preference (LIGHT | DARK | SYSTEM) */
  applyUserTheme: (theme: "LIGHT" | "DARK") => void;
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
  const { colorScheme, setColorScheme } = useColorScheme();

  const resolvedScheme = colorScheme ?? "light";

  // On mount, read the stored user preference and apply it
  useEffect(() => {
    const loadStoredTheme = async () => {
      const user = await getUserInfo();
      if (user?.theme) {
        const scheme = resolveUserTheme(user.theme);
        setColorScheme(scheme);
      }
    };
    loadStoredTheme();
  }, [setColorScheme]);

  const toggleColorScheme = useCallback(() => {
    setColorScheme(resolvedScheme === "dark" ? "light" : "dark");
  }, [resolvedScheme, setColorScheme]);

  const applyUserTheme = useCallback(
    (pref: "LIGHT" | "DARK") => {
      const scheme = resolveUserTheme(pref);
      setColorScheme(scheme);
    },
    [setColorScheme],
  );

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
    }),
    [
      themeName,
      resolvedScheme,
      toggleColorScheme,
      setColorScheme,
      themeVars,
      applyUserTheme,
    ],
  );

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
