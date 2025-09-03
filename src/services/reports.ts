// src/services/reports.ts
import { http } from "../services/http";
import {
  DailyReportSchema,
  RangeReportSchema,
  type DailyReport,
  type RangeReport,
} from "../schemas/reports";

export async function getDailyReport(date?: string): Promise<DailyReport> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug("[reports] GET /reports/daily", date ? { date } : {});
  }
  const { data } = await http.get("/reports/daily", {
    params: date ? { date } : undefined,
  });
  return DailyReportSchema.parse(data);
}

export async function getRangeReport(from: string, to: string): Promise<RangeReport> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug("[reports] GET /reports/range", { from, to });
  }
  const { data } = await http.get("/reports/range", {
    params: { from, to },
  });
  return RangeReportSchema.parse(data);
}
