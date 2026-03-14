import "@/i18n"; // ensure i18n is initialized
import { User } from "@/interface/user";
import { getAccessToken, getUserInfo } from "@/utils/auth";
import i18n, { changeLanguage } from "i18next";
import { createContext, useContext, useEffect, useState } from "react";

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
}

export type AuthContextType = {
  authState: AuthState;
  setAuthState: (authState: AuthState) => void;
  authReady: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  // This state is used to prevent the app from flashing the splash screen
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const getAuthUser = async () => {
      const token = await getAccessToken();
      const user = await getUserInfo();

      if (token && user) {
        setAuthState({
          isAuthenticated: true,
          user: user,
        });

        // Apply stored language
        if (user.language && user.language !== i18n.language) {
          changeLanguage(user.language);
        }
      }
      setAuthReady(true);
    }
    getAuthUser();
  }, []);

  // Whenever authState changes (login, settings update), keep i18n in sync
  useEffect(() => {
    const lang = authState.user?.language;
    if (lang && lang !== i18n.language) {
      changeLanguage(lang);
    }
  }, [authState.user?.language]);

  const value = {
    authState,
    setAuthState,
    authReady,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
