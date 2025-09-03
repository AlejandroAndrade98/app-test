// app/(tabs)/reportes-range.tsx
import { useEffect, useState, useMemo } from "react";
import { View, Text, ActivityIndicator, Alert, ScrollView } from "react-native";
import DateRangePicker from "@/components/DateRangePicker";
import { getRangeReport } from "@/services/reports";
import { LineChart, BarChart } from "react-native-gifted-charts";

type Day = { day: string; count: number; sumTotal: number; avgTicket: number };
type Payment = { paymentMethod: string; total: number };
type RangeReport = { from: string; to: string; days: Day[]; payments?: Payment[] };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function minusDaysStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function money(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function labelDay(s: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(5);
  const d = new Date(s);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ReportesRango() {
  const [from, setFrom] = useState(minusDaysStr(6));
  const [to, setTo] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RangeReport | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const r = (await getRangeReport(from, to)) as unknown as RangeReport;
      setData(r);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando reporte");
      Alert.alert("Error", String(e?.message ?? "Error cargando reporte"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, [from, to]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.days.map(d => ({
      value: d.sumTotal,
      label: labelDay(String(d.day)),
      dataPointText: `$${money(d.sumTotal)}`,
    }));
  }, [data]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Reporte por rango</Text>

      <DateRangePicker valueFrom={from} valueTo={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />

      {loading && (
        <View style={{ paddingTop: 12 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Cargando…</Text>
        </View>
      )}

      {!loading && error && <Text style={{ color: "#ef4444" }}>{error}</Text>}

      {!loading && data && (
        <View style={{ gap: 16 }}>
          <Text style={{ opacity: 0.7 }}>{data.from} → {data.to}</Text>

          {/* Línea: total por día */}
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>Ventas diarias (total)</Text>
            <LineChart
              data={chartData}
              thickness={3}
              hideRules
              xAxisLabelTexts={data.days.map(d => labelDay(String(d.day)))}
              yAxisTextStyle={{ fontSize: 10 }}
              xAxisLabelTextStyle={{ fontSize: 10 }}
              initialSpacing={20}
              spacing={30}
              dataPointsHeight={6}
              dataPointsWidth={6}
              showDataPointOnFocus
              showStripOnFocus
              showTextOnFocus
              yAxisLabelPrefix="$"
              yAxisLabelWidth={48}
              noOfSections={4}
              isAnimated
              animationDuration={500}
            />
          </View>

          {/* Resumen */}
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>Resumen</Text>
            {data.days.length === 0 && <Text>Sin datos en el rango.</Text>}
            {data.days.map(d => (
              <View key={String(d.day)} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                <Text style={{ fontWeight: "600" }}>{String(d.day).slice(0, 10)}</Text>
                <Text>Ventas: {d.count}</Text>
                <Text>Total: ${money(d.sumTotal)}</Text>
                <Text>Ticket Promedio: ${money(d.avgTicket)}</Text>
              </View>
            ))}
          </View>

          {/* Barras por método (si el back lo envía) */}
          {data?.payments && data.payments.length > 0 && (
            <View style={{ backgroundColor: "white", borderRadius: 12, padding: 12 }}>
              <Text style={{ fontWeight: "600", marginBottom: 8 }}>Por método de pago</Text>
              <BarChart
                data={data.payments.map(p => ({ value: p.total, label: p.paymentMethod.toUpperCase() }))}
                barWidth={28}
                spacing={24}
                yAxisLabelPrefix="$"
                yAxisLabelWidth={48}
                noOfSections={4}
                isAnimated
              />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
