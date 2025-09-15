// src/services/reports.ts
import { http } from "./http";
import {
  DailyReportSchema,
  RangeReportSchema,
  type DailyReport,
  type RangeReport,
} from "../schemas/reports";

async function getWithFallback<T>(paths: string[], params?: Record<string, any>): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      const { data } = await http.get(p, { params });
      return data as T;
    } catch (err: any) {
      // si es 404, prueba el siguiente path; si es otro error, lo propagamos
      if (err?.response?.status === 404) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error("All endpoints failed");
}

export async function getDailyReport(date?: string): Promise<DailyReport> {
  const raw = await getWithFallback<any>(
    ["/reports/daily"],                      // ✅ este existe
    date ? { date } : undefined
  );
  return DailyReportSchema.parse(raw);
}

export async function getRangeReport(from: string, to: string): Promise<RangeReport> {
  const raw = await getWithFallback<any>(
    ["/reports/range"],                      // ✅ este existe
    { from, to }
  );
  return RangeReportSchema.parse(raw);
}

export async function getMonthlyReport(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  const from = `${y}-${m}-01`;
  const last = new Date(Number(y), Number(m), 0).getDate();
  const to = `${y}-${m}-${String(last).padStart(2, "0")}`;
  return getRangeReport(from, to);
}

export async function fetchReportToday() {
  const today = new Date().toISOString().slice(0, 10);
  return getDailyReport(today);
}
