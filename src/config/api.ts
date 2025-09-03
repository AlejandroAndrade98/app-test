// src/config/api.ts
import { Platform } from "react-native";

function normalize(url: string) {
  const t = url.trim();
  // Valida que tenga esquema y sea absoluta; si no, lanza error claro.
  try { return new URL(t).toString(); }
  catch { throw new Error(`EXPO_PUBLIC_API_URL is invalid: "${url}"`); }
}

// Fallbacks por plataforma cuando NO defines EXPO_PUBLIC_API_URL
const DEFAULT_BASE = Platform.select({
  android: "http://10.0.2.2:4000", // Android emulator
  ios:     "http://127.0.0.1:4000", // iOS simulator
  web:     "http://localhost:4000", // Expo web en tu PC
  default: "http://localhost:4000",
});

// Si existe la env, la usamos; si no, caemos al fallback por plataforma.
export const API_BASE = process.env.EXPO_PUBLIC_API_URL
  ? normalize(process.env.EXPO_PUBLIC_API_URL)
  : (DEFAULT_BASE as string);

export const USE_MOCK = (process.env.EXPO_PUBLIC_USE_MOCK ?? "0") === "1";

// Opcional: log útil en dev
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[API_BASE]", API_BASE);
}
