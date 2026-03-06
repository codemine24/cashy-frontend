import { themes, type ThemeName } from "@/constants/themes";
import { useColorScheme } from "nativewind";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider (context only – no View wrapper) ──────────────────────
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>("default");
  const { colorScheme, setColorScheme } = useColorScheme();

  const resolvedScheme = colorScheme ?? "light";

  const toggleColorScheme = useCallback(() => {
    setColorScheme(resolvedScheme === "dark" ? "light" : "dark");
  }, [resolvedScheme, setColorScheme]);

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
    }),
    [themeName, resolvedScheme, toggleColorScheme, setColorScheme, themeVars],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Wrapper that applies CSS vars (place INSIDE navigation tree) ───
export function ThemeVarsProvider({ children }: { children: React.ReactNode }) {
  const { themeVars } = useTheme();
  return (
    <View style={themeVars} className="flex-1">
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
