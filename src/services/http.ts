import axios from "axios";
import { API_BASE } from "@/config/api";
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "embipos:access_token";

export function getAccessToken() {
  return typeof localStorage !== "undefined"
    ? localStorage.getItem(ACCESS_KEY)
    : null;
}
export function setAccessToken(token: string | null) {
  if (typeof localStorage === "undefined") return;
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
}

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Adjunta Authorization si hay token
http.interceptors.request.use(async (config) => {
  let t = getAccessToken();
  if (!t) {
    // en nativo, usa SecureStore
    try { t = await SecureStore.getItemAsync("auth_token"); } catch {}
  }
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// (opcional) aquí pondrías el interceptor de /auth/refresh si lo usas
