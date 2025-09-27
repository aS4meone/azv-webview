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

const AUTH_ROUTES = [
  ROUTES.ROOT,
  ROUTES.AUTH,
  ROUTES.ONBOARDING,
  ROUTES.DELETE_TUTORIAL,
  ROUTES.CONTACT,
  "/privacy-policy",
] as const;

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
      await callFlutterLogout();
      console.log("FCM token cleared successfully");
    } catch (error) {
      console.error("Error clearing FCM token:", error);
    }

    clearTokens();

    router.push(ROUTES.ROOT);
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      if (initializationRef.current) {
        console.log("[AuthContext] checkAuth: уже инициализирован, пропускаем");
        return;
      }
      initializationRef.current = true;

      console.log("[AuthContext] checkAuth: начинаем проверку авторизации");
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        console.log("[AuthContext] checkAuth: refresh token отсутствует");
        if (!isAuthRoute(pathname)) {
          router.push(ROUTES.ROOT);
        }
        return;
      }

      try {
        console.log("[AuthContext] checkAuth: вызываем fetchUser");
        await fetchUser();
      } catch (error) {
        console.log("[AuthContext] checkAuth: ошибка при fetchUser:", error);
        if (error?.response?.status !== 403) {
          logout().catch(console.error);
        }
      }
    };

    checkAuth();
  }, [fetchUser, logout, pathname, router]);

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
