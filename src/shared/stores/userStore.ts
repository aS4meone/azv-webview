import { create } from "zustand";
import { userApi } from "../api/routes/user";
import { IUser } from "../models/types/user";

interface UserStore {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  refreshUser: () => void;
  clearUser: () => void;
  updateUnreadMessageCount: (count: number) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    const state = get();
    if (state.isLoading) {
      console.log("[userStore] fetchUser: уже загружается, пропускаем");
      return;
    }
    if (state.user) {
      console.log("[userStore] fetchUser: пользователь уже загружен");
      return;
    }

    try {
      set({ isLoading: true, error: null });
      console.log("[userStore] fetchUser: начинаем запрос");
      const response = await userApi.getUser();

      if (!response?.data) {
        throw new Error("No user data received");
      }

      set({ user: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      set({
        user: null,
        error:
          error instanceof Error ? error.message : "Failed to fetch user data",
        isLoading: false,
      });
      throw error;
    }
  },

  refreshUser: async () => {
    const state = get();
    if (state.isLoading) {
      console.log("[userStore] refreshUser: уже загружается, пропускаем");
      return;
    }

    try {
      set({ isLoading: true, error: null });
      console.log("[userStore] refreshUser: начинаем запрос");
      const response = await userApi.getUser();

      if (!response?.data) {
        throw new Error("No user data received");
      }

      set({ user: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      set({
        user: null,
        error:
          error instanceof Error ? error.message : "Failed to fetch user data",
        isLoading: false,
      });
      throw error;
    }
  },
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, error: null }),
  updateUnreadMessageCount: (count: number) => {
    const state = get();
    if (state.user) {
      set({
        user: {
          ...state.user,
          unread_message: count,
        },
      });
    }
  },
}));
