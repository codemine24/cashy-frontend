import { AuthProvider } from "@/context/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Toast from 'react-native-toast-message';
import { RealtimeEffect } from "./realtime-effect";

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
        <RealtimeEffect />
        {children}
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  )
}