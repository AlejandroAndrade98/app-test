// src/services/http.ts
import axios from "axios";
import { API_BASE } from "@/config/api";
import * as SecureStore from "expo-secure-store";




const ACCESS_KEY = "embipos:access_token"; // <-- misma key en todos lados

let memToken: string | null = null;

export function getAccessToken(): string | null {
  if (memToken) return memToken;
  try {
    if (typeof localStorage !== "undefined") {
      const t = localStorage.getItem(ACCESS_KEY);
      if (t) memToken = t;
      return t;
    }
  } catch {}
  return null;
}

export async function getAccessTokenAsync(): Promise<string | null> {
  // Web primero (sin await), luego nativo
  const t = getAccessToken();
  if (t) return t;
  try {
    const n = await SecureStore.getItemAsync(ACCESS_KEY);
    if (n) memToken = n;
    return n ?? null;
  } catch {
    return null;
  }
}

export async function setAccessToken(token: string | null) {
  memToken = token ?? null;
  try {
    if (typeof localStorage !== "undefined") {
      if (token) localStorage.setItem(ACCESS_KEY, token);
      else localStorage.removeItem(ACCESS_KEY);
    }
  } catch {}
  try {
    if (token) await SecureStore.setItemAsync(ACCESS_KEY, token);
    else await SecureStore.deleteItemAsync(ACCESS_KEY);
  } catch {}
}

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Adjunta Authorization si hay token
http.interceptors.request.use(async (config) => {
  const t = await getAccessTokenAsync();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

// (Opcional) refresco automático si implementas /auth/refresh en el backend
// http.interceptors.response.use(undefined, async (error) => { ... });


export default http;
