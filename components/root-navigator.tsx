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
                  animationTypeForReplace: "push",
                  gestureEnabled: false,
                  gestureDirection: "horizontal",
                  presentation: "card",
                  animation: "none",
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    animation: "none",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    animation: "none",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="auth"
                  options={{
                    animation: "none",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    animation: "none",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/[id]"
                  options={{
                    headerShown: true,
                    animation: "none",
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
                    animation: "none",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/select-category"
                  options={{
                    headerShown: true,
                    animation: "none",
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
                    animation: "none",
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
                    animation: "none",
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
                    animation: "none",
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
                    animation: "none",
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />
                <Stack.Screen
                  name="wallet/search-transactions"
                  options={{
                    headerShown: true,
                    animation: "none",
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
                    animation: "none",
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
                    animation: "none",
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
                    animation: "none",
                    headerStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                    contentStyle: {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    },
                  }}
                />

                <Stack.Screen
                  name="settings/index"
                  options={{
                    headerShown: true,
                    animation: "none",
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
                  "settings/about",
                  "settings/privacy-policy",
                  "settings/terms-and-conditions",
                  "settings/about-us",
                  "settings/contact-us",
                ].map((name) => (
                  <Stack.Screen
                    key={name}
                    name={name as any}
                    options={{
                      headerShown: true,
                      animation: "none",
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
      </View>
    </NavThemeProvider>
  );
};
