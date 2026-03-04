import { useTheme } from "@/context/theme-context";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export const RootNavigator = () => {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: isDark ? "#0f172a" : "#f8fafc" },
          headerTitleStyle: { fontSize: 17, fontWeight: "600" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login-type" options={{ headerShown: true, headerTitle: "" }} />
        <Stack.Screen name="auth" options={{ headerShown: true, headerTitle: "" }} />
      </Stack>
    </NavThemeProvider>
  );
}