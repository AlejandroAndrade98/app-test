// app/(tabs)/reportes-range.tsx
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Pressable,
  useColorScheme,
  StyleSheet,
} from "react-native";
import DateRangePicker from "@/components/DateRangePicker";
import { getRangeReport } from "@/services/reports";
import { LineChart, BarChart } from "react-native-gifted-charts";

type Day = { day: string; count: number; sumTotal: number; avgTicket: number };
type Payment = { paymentMethod: string; total: number };
type RangeReport = { from: string; to: string; days: Day[]; payments?: Payment[] };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function minusDaysStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function labelDay(s: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(5);
  const d = new Date(s);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CURRENCY = "COP";
const money = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function ReportesRango() {
  const [from, setFrom] = useState(minusDaysStr(6));
  const [to, setTo] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RangeReport | null>(null);

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const r = (await getRangeReport(from, to)) as unknown as RangeReport;
      setData(r);
    } catch (e: any) {
      const msg = e?.message ?? "Error cargando reporte";
      setError(msg);
      Alert.alert("Error", String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const onPull = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // -------- Derivados / KPIs --------
  const kpis = useMemo(() => {
    const days = data?.days ?? [];
    const total = days.reduce((acc, d) => acc + (d?.sumTotal || 0), 0);
    const count = days.reduce((acc, d) => acc + (d?.count || 0), 0);
    const avgTicket = count > 0 ? total / count : 0;
    return { total, count, avgTicket };
  }, [data]);

  // -------- Data para charts --------
  const lineChartData = useMemo(() => {
    const days = data?.days ?? [];
    return days.map((d) => ({
      value: Math.max(0, d.sumTotal),
      label: labelDay(String(d.day)),
      dataPointText: money(d.sumTotal),
    }));
  }, [data]);

  const barPayments = useMemo(() => {
    const p = data?.payments ?? [];
    return p.map((x) => ({
      value: Math.max(0, x.total),
      label: x.paymentMethod.toUpperCase(),
    }));
  }, [data]);

  // -------- UI --------
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPull} tintColor={theme.muted} />}
    >
      <Text style={[styles.title, { color: theme.fg }]}>Reporte por rango</Text>

      {/* Rango + Atajos */}
      <Card theme={theme}>
        <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Rango de fechas</Text>
        <DateRangePicker
          valueFrom={from}
          valueTo={to}
          onChange={(f, t) => {
            setFrom(f);
            setTo(t);
          }}
        />
        <View style={styles.quickRow}>
          <QuickRange label="7d" onPress={() => { setFrom(minusDaysStr(6)); setTo(todayStr()); }} theme={theme} />
          <QuickRange label="14d" onPress={() => { setFrom(minusDaysStr(13)); setTo(todayStr()); }} theme={theme} />
          <QuickRange label="30d" onPress={() => { setFrom(minusDaysStr(29)); setTo(todayStr()); }} theme={theme} />
        </View>
        <Text style={[styles.rangeText, { color: theme.muted }]}>{from} → {to}</Text>
      </Card>

      {loading && (
        <Card theme={theme} style={{ alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: theme.muted }}>Cargando…</Text>
        </Card>
      )}

      {!loading && error && (
        <ErrorBanner message={error} theme={theme} />
      )}

      {/* KPIs */}
      {!loading && !error && (
        <View style={styles.kpiRow}>
          <KpiCard
            label="Total"
            value={money(kpis.total)}
            theme={theme}
          />
          <KpiCard
            label="Transacciones"
            value={String(kpis.count)}
            theme={theme}
          />
          <KpiCard
            label="Ticket promedio"
            value={money(kpis.avgTicket)}
            theme={theme}
          />
        </View>
      )}

      {/* Gráfica de líneas */}
      {!loading && !error && (
        <Card theme={theme}>
          <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Ventas diarias (total)</Text>
          {lineChartData.length === 0 ? (
            <EmptyState text="Sin datos en el rango seleccionado." theme={theme} />
          ) : (
            <LineChart
              data={lineChartData}
              thickness={3}
              hideRules
              xAxisLabelTexts={lineChartData.map((d) => d.label)}
              yAxisTextStyle={{ fontSize: 10, color: theme.muted }}
              xAxisLabelTextStyle={{ fontSize: 10, color: theme.muted }}
              initialSpacing={20}
              spacing={30}
              dataPointsHeight={6}
              dataPointsWidth={6}
              color={theme.primary}
              dataPointsColor={theme.primary}
              yAxisColor={theme.border}
              xAxisColor={theme.border}
              showDataPointOnFocus
              showStripOnFocus
              showTextOnFocus
              yAxisLabelWidth={56}
              noOfSections={4}
              isAnimated
              animationDuration={500}
              textColor={theme.fg}
            />
          )}
        </Card>
      )}

      {/* Resumen por día */}
      {!loading && !error && data && (
        <Card theme={theme}>
          <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Resumen</Text>
          {data.days.length === 0 ? (
            <EmptyState text="Sin datos en el rango." theme={theme} />
          ) : (
            <View style={{ gap: 8 }}>
              {data.days.map((d) => (
                <View key={String(d.day)} style={[styles.rowItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.rowTitle, { color: theme.fg }]}>{String(d.day).slice(0, 10)}</Text>
                  <View style={styles.rowCols}>
                    <RowStat label="Ventas" value={String(d.count)} theme={theme} />
                    <RowStat label="Total" value={money(d.sumTotal)} theme={theme} />
                    <RowStat label="Promedio" value={money(d.avgTicket)} theme={theme} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Barras por método de pago */}
      {!loading && !error && data?.payments?.length ? (
        <Card theme={theme}>
          <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Por método de pago</Text>
          <BarChart
            data={barPayments}
            barWidth={28}
            spacing={24}
            frontColor={theme.primary}
            yAxisLabelWidth={56}
            yAxisTextStyle={{ color: theme.muted }}
            xAxisLabelTextStyle={{ color: theme.muted }}
            yAxisColor={theme.border}
            xAxisColor={theme.border}
            noOfSections={4}
            isAnimated
          />
        </Card>
      ) : null}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* -------------------------- UI helpers -------------------------- */

function Card({
  children,
  style,
  theme,
}: {
  children: React.ReactNode;
  style?: any;
  theme: Theme;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function KpiCard({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
      <Text style={[styles.kpiLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: theme.fg }]}>{value}</Text>
    </View>
  );
}

function RowStat({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.rowStatLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.rowStatValue, { color: theme.fg }]}>{value}</Text>
    </View>
  );
}

function EmptyState({ text, theme }: { text: string; theme: Theme }) {
  return <Text style={{ color: theme.muted }}>{text}</Text>;
}

function ErrorBanner({ message, theme }: { message: string; theme: Theme }) {
  return (
    <View style={[styles.errorBanner, { backgroundColor: theme.errorBg, borderColor: theme.errorBorder }]}>
      <Text style={{ color: theme.errorFg, fontWeight: "600" }}>Error</Text>
      <Text style={{ color: theme.errorFg, marginTop: 2 }}>{message}</Text>
    </View>
  );
}

function QuickRange({ label, onPress, theme }: { label: string; onPress: () => void; theme: Theme }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickBtn,
        {
          backgroundColor: theme.pillBg,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={{ color: theme.fg }}>{label}</Text>
    </Pressable>
  );
}

/* ----------------------------- Theme ---------------------------- */

type Theme = {
  bg: string;
  card: string;
  border: string;
  shadow: string;
  fg: string;
  fgSoft: string;
  muted: string;
  primary: string;
  pillBg: string;
  errorBg: string;
  errorBorder: string;
  errorFg: string;
};

const lightTheme: Theme = {
  bg: "#F6F7F9",
  card: "#FFFFFF",
  border: "#E6E8EC",
  shadow: "#000",
  fg: "#0F172A",
  fgSoft: "#1F2937",
  muted: "#6B7280",
  primary: "#2563EB",
  pillBg: "#F3F4F6",
  errorBg: "#FEE2E2",
  errorBorder: "#FCA5A5",
  errorFg: "#991B1B",
};

const darkTheme: Theme = {
  bg: "#0B1220",
  card: "#121A2A",
  border: "#1F2A44",
  shadow: "#000",
  fg: "#E5E7EB",
  fgSoft: "#F3F4F6",
  muted: "#9CA3AF",
  primary: "#60A5FA",
  pillBg: "#111827",
  errorBg: "#3F1D1D",
  errorBorder: "#7F1D1D",
  errorFg: "#FEE2E2",
};

/* --------------------------- Stylesheet ------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    rowGap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 16,
  },
  rangeText: {
    marginTop: 8,
    fontSize: 12,
  },
  quickRow: {
    flexDirection: "row",
    columnGap: 8,
    marginTop: 10,
  },
  quickBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kpiRow: {
    flexDirection: "row",
    columnGap: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  rowItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  rowCols: {
    flexDirection: "row",
    columnGap: 12,
  },
  rowStatLabel: {
    fontSize: 11,
  },
  rowStatValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
