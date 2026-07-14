import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/lib/config";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.login(username, password);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
          }
          set({ user: res.user, token: res.token, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
          throw e;
        }
      },

      register: async (username, password, email) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.register(username, password, email);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
          }
          set({ user: res.user, token: res.token, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
          throw e;
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token,
      isAdmin: () => !!get().user?.roles?.includes("ROLE_ADMIN"),
    }),
    { name: USER_STORAGE_KEY },
  ),
);
