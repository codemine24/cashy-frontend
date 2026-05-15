import { ThemeVarsProvider, useTheme } from "@/context/theme-context";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { OfflineBanner } from "./offline-banner";
import { RootProvider } from "./root-provider";

export const RootNavigator = () => {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View
        className={`flex-1 bg-background${isDark ? " dark" : ""}`}
        style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}
      >
        <StatusBar
          style={isDark ? "light" : "dark"}
          translucent={false}
          backgroundColor="transparent"
        />
        <ThemeVarsProvider>
          <RootProvider>
            <ErrorBoundary>
              <Stack
                screenOptions={{
                  headerShown: false,
                  headerBackTitle: "Back",
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                  headerTintColor: isDark ? "#f8fafc" : "#111827",
                  headerTitleStyle: { fontSize: 17, fontWeight: "600" },
                  contentStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  },
                  animation: "simple_push",
                  animationTypeForReplace: "push",
                  gestureEnabled: true,
                  gestureDirection: "horizontal",
                  presentation: "card",
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    animation: "simple_push",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    animation: "simple_push",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="auth"
                  options={{
                    animation: "simple_push",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="pin-verify"
                  options={{
                    animation: "simple_push",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="pin-setup"
                  options={{
                    animation: "simple_push",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="pin-forgot"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    animation: "simple_push",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/[id]"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/members"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                {[
                  "wallet/wallet-form",
                  "wallet/member-form",
                  "wallet/category-form",
                ].map((name) => (
                  <Stack.Screen
                    key={name}
                    name={name as any}
                    options={{
                      headerShown: true,
                      animation: "simple_push",
                      headerStyle: {
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      },
                      contentStyle: {
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      },
                    }}
                  />
                ))}
                <Stack.Screen
                  name="wallet/select-category"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/manage-categories"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/transaction-detail"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/add-transaction"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/search-wallet"
                  options={{
                    animation: "simple_push",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/search-transactions"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/transfer-fund"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="loan/[id]"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="loan/create-borrowed"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="loan/create-lent"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="loan/receive-payment"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="loan/given-payment"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />

                <Stack.Screen
                  name="settings"
                  options={{
                    headerShown: true,
                    animation: "simple_push",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                {[
                  "settings/app-settings",
                  "settings/subscription",
                  "settings/profile",
                  "settings/about-cashy",
                  "settings/security",
                  "settings/setup-pin",
                  "settings/verify-pin",
                  "settings/change-pin",
                  "privacy-policy",
                  "terms-and-conditions",
                  "settings/about-us",
                  "settings/contact-us",
                ].map((name) => (
                  <Stack.Screen
                    key={name}
                    name={name as any}
                    options={{
                      headerShown: true,
                      animation: "simple_push",
                      headerStyle: {
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      },
                      contentStyle: {
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      },
                    }}
                  />
                ))}
              </Stack>
            </ErrorBoundary>
          </RootProvider>
        </ThemeVarsProvider>
        <OfflineBanner />
      </View>
    </NavThemeProvider>
  );
};
