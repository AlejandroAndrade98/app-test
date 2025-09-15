// src/services/auth.ts
import http, { setAccessToken } from "@/services/http";

export type Me = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "leader" | "collab" | "cashier";
};

type LoginResp = {
  token: string;            // tu backend devuelve 'token'
  refreshToken?: string;    // si lo usas
  user: Me;
};

export async function login(email: string, password: string): Promise<LoginResp> {
  const { data } = await http.post<LoginResp>("/auth/login", { email, password });
  await setAccessToken(data.token);               // ⬅️ mejor con await
  return data;                                    // si prefieres, puedes return data.user
}

export async function logout() {
  try { await http.post("/auth/logout"); } catch {}
  await setAccessToken(null);                     // ⬅️ también con await
}

export async function fetchMe(): Promise<Me> {
  const { data } = await http.get<Me>("/auth/me");
  return data;
}
