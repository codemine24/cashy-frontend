import { AuthProvider } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

function ThemedToast() {
  const { isDark } = useTheme();

  const bg = isDark ? "#1e293b" : "#ffffff";
  const text1 = isDark ? "#f8fafc" : "#111827";
  const text2 = isDark ? "#94a3b8" : "#6b7280";
  const border = isDark ? "#334155" : "#e5e7eb";

  const baseStyle = {
    backgroundColor: bg,
    borderLeftColor: border,
    borderLeftWidth: 4,
  };
  const text1Style = { color: text1, fontSize: 14, fontWeight: "600" as const };
  const text2Style = { color: text2, fontSize: 13 };

  const config = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ ...baseStyle, borderLeftColor: "#02929a" }}
        text1Style={text1Style}
        text2Style={text2Style}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ ...baseStyle, borderLeftColor: "#ef4444" }}
        text1Style={text1Style}
        text2Style={text2Style}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{ ...baseStyle, borderLeftColor: "#3b82f6" }}
        text1Style={text1Style}
        text2Style={text2Style}
      />
    ),
  };

  return <Toast visibilityTime={2000} config={config} />;
}

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ThemedToast />
      </AuthProvider>
    </QueryClientProvider>
  );
};
