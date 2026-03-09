import { ThemeVarsProvider, useTheme } from "@/context/theme-context";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { RootProvider } from "./root-provider";

export const RootNavigator = () => {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ThemeVarsProvider>
        <RootProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              headerBackTitle: "Back",
              headerShadowVisible: false,
              headerStyle: { backgroundColor: isDark ? "#0f172a" : "#f8fafc" },
              headerTintColor: isDark ? "#f8fafc" : "#111827",
              headerTitleStyle: { fontSize: 17, fontWeight: "600" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login-type" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="goal/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="book/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="book/members" options={{ headerShown: true }} />
            <Stack.Screen name="book/select-category" options={{ headerShown: true }} />
            <Stack.Screen name="book/manage-categories" options={{ headerShown: true }} />
            <Stack.Screen name="book/transaction-detail" options={{ headerShown: true }} />
            <Stack.Screen name="book/add-transaction" options={{ headerShown: true }} />
            <Stack.Screen name="book/search-wallet" />
            <Stack.Screen name="settings/app-settings" options={{ headerShown: true }} />
            <Stack.Screen name="settings/subscription" options={{ headerShown: true }} />
            <Stack.Screen name="settings/profile" options={{ headerShown: true }} />
          </Stack>
        </RootProvider>
      </ThemeVarsProvider>
    </NavThemeProvider>
  );
}