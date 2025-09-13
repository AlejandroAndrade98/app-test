// src/services/reports.ts
import { http } from "../services/http";
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
  if (__DEV__) console.debug("[reports] GET /api|/reports/daily", date ? { date } : {});
  const raw = await getWithFallback<any>(
    ["/api/reports/daily", "/reports/daily"],
    date ? { date } : undefined
  );
  return DailyReportSchema.parse(raw);
}

export async function getRangeReport(from: string, to: string): Promise<RangeReport> {
  if (__DEV__) console.debug("[reports] GET /api|/reports/range", { from, to });
  const raw = await getWithFallback<any>(
    ["/api/reports/range", "/reports/range"],
    { from, to }
  );
  return RangeReportSchema.parse(raw);
}
