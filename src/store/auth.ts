// src/store/auth.ts  (ejemplo con Zustand)
import { create } from "zustand";
import { getAccessTokenAsync, setAccessToken } from "@/services/http";
import { fetchMe, login as apiLogin, logout as apiLogout, type Me } from "@/services/auth";

type AuthState = {
  user: Me | null;
  loading: boolean;
  init: () => Promise<void>;
  setUser: (u: Me | null) => void;
  login: (email: string, password: string) => Promise<Me>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (u) => set({ user: u }),

  init: async () => {
    try {
      const t = await getAccessTokenAsync();
      if (!t) return set({ loading: false, user: null });
      const me = await fetchMe();
      set({ user: me, loading: false });
    } catch {
      set({ loading: false, user: null });
    }
  },

  login: async (email, password) => {
    const { token, user } = await apiLogin(email, password); // tu login devuelve {token, user}
    await setAccessToken(token);
    set({ user });
    return user;
  },

  logout: async () => {
    try { await apiLogout(); } finally {
      await setAccessToken(null);
      set({ user: null });
    }
  },
}));
