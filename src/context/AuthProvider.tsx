// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { login as apiLogin, type Me as User } from "@/services/auth"; // <- usa el tipo Me
import { setAccessToken } from "@/services/http"; // opcional, si quieres setear aquí también

export type AuthState = { user: User | null; token: string | null; loading: boolean };

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  // 👇 ahora devuelve User
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  refreshFromStorage: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => { refreshFromStorage(); }, []);

  const persist = async (token: string, user: User) => {
    if (Platform.OS === "web") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync("auth_token", token);
      await SecureStore.setItemAsync("auth_user", JSON.stringify(user));
    }
  };

  const readPersisted = async (): Promise<{ token: string | null; user: User | null }> => {
    if (Platform.OS === "web") {
      return {
        token: localStorage.getItem("auth_token"),
        user: (() => {
          const s = localStorage.getItem("auth_user");
          return s ? (JSON.parse(s) as User) : null;
        })(),
      };
    } else {
      const [t, u] = await Promise.all([
        SecureStore.getItemAsync("auth_token"),
        SecureStore.getItemAsync("auth_user"),
      ]);
      return { token: t ?? null, user: u ? (JSON.parse(u) as User) : null };
    }
  };

  const refreshFromStorage = async () => {
    try {
      const { token, user } = await readPersisted();
      setState({ token, user, loading: false });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  };

  // 👇 devuelve el usuario
  const signIn = async (email: string, password: string): Promise<User> => {
    const { token, user } = await apiLogin(email, password); // services/auth ya hace el POST
    await setAccessToken(token); // opcional si quieres sincronizar aquí también
    await persist(token, user);
    setState({ token, user, loading: false });
    return user;
  };

  const signOut = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    } else {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("auth_user");
    }
    setState({ token: null, user: null, loading: false });
  };

  const value = useMemo(
    () => ({ user: state.user, token: state.token, loading: state.loading, signIn, signOut, refreshFromStorage }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
