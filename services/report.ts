import { DailyReportSchema, type DailyReport } from "../src/schemas/report";

export async function getDailyReport(date?: string): Promise<DailyReport> {
  const base = process.env.EXPO_PUBLIC_API_BASE ?? "";
  const url = new URL("/reports/daily", base);
  if (date) url.searchParams.set("date", date);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  return DailyReportSchema.parse(json); // ⬅️ Valida en el cliente también
}
