// src/hooks/useDailyReport.ts
import { useEffect, useState } from "react";
import { DailyReportSchema, type DailyReport } from "../schemas/report";
import { getDailyReport } from "../services/reports";

import { useQuery } from "@tanstack/react-query";
import { getRangeReport } from "../services/reports";

export function useDailyReport() {
  const [data, setData] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const raw = await getDailyReport();
      const parsed = DailyReportSchema.parse(raw);
      setData(parsed);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando reporte");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  return { data, error, loading, refresh };
}

export function useRangeReport(from: string | undefined, to: string | undefined) {
  const enabled = Boolean(from && to);
  return useQuery({
    queryKey: ["rangeReport", from, to],
    queryFn: () => getRangeReport(from!, to!),
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}
