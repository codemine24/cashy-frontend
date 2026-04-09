import { ThemeVarsProvider, useTheme } from "@/context/theme-context";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { RootProvider } from "./root-provider";

export const RootNavigator = () => {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View
        style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}
      >
        <StatusBar
          style={isDark ? "light" : "dark"}
          translucent={false}
          backgroundColor={isDark ? "#0f172a" : "#f8fafc"}
        />
        <ThemeVarsProvider>
          <RootProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                headerBackTitle: "Back",
                headerShadowVisible: true,
                headerStyle: {
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                },
                headerTintColor: isDark ? "#f8fafc" : "#111827",
                headerTitleStyle: { fontSize: 17, fontWeight: "600" },
                // Prevent white blink during transitions
                contentStyle: {
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                },
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="login-type"
                options={{
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="auth"
                options={{
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/[id]"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/members"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/select-category"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/manage-categories"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/transaction-detail"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/add-transaction"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/search-wallet"
                options={{
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="wallet/search-transactions"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="loan/[id]"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="loan/create"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="loan/edit"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              {/* <Stack.Screen name="settings" options={{ headerShown: true }} /> */}
              <Stack.Screen
                name="settings/app-settings"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="settings/subscription"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="settings/profile"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="settings/about"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="settings/privacy-policy"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="settings/terms-and-conditions"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="settings/about-us"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
              <Stack.Screen
                name="settings/contact-us"
                options={{
                  headerShown: true,
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                }}
              />
            </Stack>
          </RootProvider>
        </ThemeVarsProvider>
      </View>
    </NavThemeProvider>
  );
};
