// import { http } from './http';
// import { USE_MOCK } from '../config/api';
// import { dailyReportMock } from '../mocks/reports.mock';
// // import { DailyReport } from '../types';
import { DailyReportSchema, type DailyReport } from "../schemas/report";
import { RangeReportSchema, type RangeReport } from "../schemas/report";

/**
 * Obtener reporte diario (ventas, totales y por método de pago).
 */
export async function getDailyReport(date?: string): Promise<DailyReport> {
  const base = process.env.EXPO_PUBLIC_API_BASE ?? "";
  const url = new URL("/reports/daily", base);
  if (date) url.searchParams.set("date", date);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  return DailyReportSchema.parse(json);
}

export async function getRangeReport(from: string, to: string): Promise<RangeReport> {
  const base = process.env.EXPO_PUBLIC_API_BASE ?? "";
  const url = new URL("/reports/range", base);
  url.searchParams.set("from", from); // 'YYYY-MM-DD'
  url.searchParams.set("to", to);     // 'YYYY-MM-DD'

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  return RangeReportSchema.parse(json);
}