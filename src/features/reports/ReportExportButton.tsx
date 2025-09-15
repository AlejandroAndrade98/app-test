import { useState, useMemo } from "react";
import { View, Text, Button } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getDailyReport, getMonthlyReport } from "@/services/reports";
import { exportReportToPdf } from "@/services/exporter";
import type { ReportRow } from "@/types";
import { mapDailyToRows, mapMonthlyToRows } from "@/types";

export default function ReportExportButton() {
  const today = new Date().toISOString().slice(0, 10);
  const month = new Date().toISOString().slice(0, 7);

  const daily = useQuery({
    queryKey: ["report", "daily", today],
    queryFn: () => getDailyReport(today),
  });

  const monthly = useQuery({
    queryKey: ["report", "monthly", month],
    queryFn: () => getMonthlyReport(month),
  });

  const [busy, setBusy] = useState(false);

  const dailyRows: ReportRow[] = useMemo(
    () => (daily.data ? mapDailyToRows(daily.data) : []),
    [daily.data]
  );

  const monthlyRows: ReportRow[] = useMemo(
    () => (monthly.data ? mapMonthlyToRows(monthly.data) : []),
    [monthly.data]
  );

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportReportToPdf({
        title: `Reporte diario ${today}`,
        rows: dailyRows,
        filename: `reporte-diario-${today}.pdf`,
      });
      await exportReportToPdf({
        title: `Reporte mensual ${month}`,
        rows: monthlyRows,
        filename: `reporte-mensual-${month}.pdf`,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ backgroundColor: "#0f172a", borderRadius: 12, padding: 16, gap: 8 }}>
      <Text style={{ color: "#fff", fontWeight: "600" }}>Exportar reportes (PDF)</Text>
      <Button title={busy ? "Generando..." : "Exportar PDF"} onPress={handleExport} disabled={busy} />
    </View>
  );
}
