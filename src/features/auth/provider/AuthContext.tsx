"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { getRefreshToken, clearTokens } from "@/shared/utils/tokenStorage";
import { callFlutterLogout } from "@/shared/utils/flutterLogout";
import { useUserStore } from "@/shared/stores/userStore";
import { IUser } from "@/shared/models/types/user";

type AuthContextType = {
  user: IUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

const AUTH_ROUTES = [ROUTES.ROOT, ROUTES.AUTH, ROUTES.ONBOARDING] as const;

const isAuthRoute = (path: string): path is (typeof AUTH_ROUTES)[number] => {
  return AUTH_ROUTES.includes(path as (typeof AUTH_ROUTES)[number]);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, fetchUser, isLoading } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const initializationRef = useRef(false);

  const logout = useCallback(async () => {
    try {
      // Clear FCM token first
      await callFlutterLogout();
      console.log("FCM token cleared successfully");
    } catch (error) {
      console.error("Error clearing FCM token:", error);
    }

    // Clear local tokens
    clearTokens();

    // Navigate to root
    router.push(ROUTES.ROOT);
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      // Пропускаем повторную инициализацию
      if (initializationRef.current) return;
      initializationRef.current = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        if (!isAuthRoute(pathname)) {
          router.push(ROUTES.ROOT);
        }
        return;
      }

      // Если есть токены - за  гружаем пользователя
      try {
        await fetchUser();
      } catch (error) {
        if (error?.response?.status !== 403) {
          logout().catch(console.error);
        }
      }
    };

    checkAuth();
  }, [fetchUser, logout, pathname, router]);

  // Отдельный эффект для редиректа с auth страниц
  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (user && refreshToken && isAuthRoute(pathname)) {
      router.push(ROUTES.MAIN);
    }
  }, [user, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
