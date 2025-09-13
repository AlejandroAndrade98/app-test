import { http, setAccessToken } from "@/services/http";

export type Me = { id: number; email: string; name: string; role: "admin" | "leader" | "collab" | "cashier" };

export async function login(email: string, password: string) {
  const { data } = await http.post("/auth/login", { email, password });
  // ⬇️ usa 'token' (no 'accessToken')
  setAccessToken(data.token);
  return data.user as Me;
}

export async function logout() {
  try { await http.post("/auth/logout"); } catch {}
  setAccessToken(null);
}

export async function fetchMe() {
  const { data } = await http.get("/auth/me");
  return data as Me;
}
