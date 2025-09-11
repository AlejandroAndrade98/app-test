// app/(tabs)/reportes.tsx
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { fetchReportToday } from "../../services/api"; // ajusta si tu path real es distinto

type PaymentRow = { paymentMethod: string; total: number };
type Report = {
  sales: { count: number; sumTotal: number; avgTicket: number };
  byPayment: PaymentRow[];
};

const EMPTY: Report = {
  sales: { count: 0, sumTotal: 0, avgTicket: 0 },
  byPayment: [],
};

function normalizeReport(raw: any): Report {
  const data = raw?.data ?? raw ?? {};
  const sales = data?.sales ?? {};
  const byPayment = Array.isArray(data?.byPayment) ? data.byPayment : [];
  return {
    sales: {
      count: Number(sales?.count ?? 0),
      sumTotal: Number(sales?.sumTotal ?? 0),
      avgTicket: Number(sales?.avgTicket ?? 0),
    },
    byPayment,
  };
}

const CURRENCY = "COP";
const money = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function Reportes() {
  const [report, setReport] = useState<Report>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  const load = async () => {
    try {
      setError(null);
      const raw = await fetchReportToday();
      // console.log("[report raw]", JSON.stringify(raw));
      setReport(normalizeReport(raw));
    } catch (e: any) {
      setError(e?.message ?? "Error cargando el reporte");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const sales = report?.sales ?? EMPTY.sales;
  const payments = Array.isArray(report?.byPayment) ? report.byPayment : [];

  const barPayments = useMemo(
    () =>
      payments.map((p) => ({
        value: Math.max(0, Number(p.total || 0)),
        label: String(p.paymentMethod || "").toUpperCase(),
      })),
    [payments]
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator />
        <Text style={{ color: theme.muted, marginTop: 8 }}>Cargando reporte…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.muted} />}
    >
      <Text style={[styles.title, { color: theme.fg }]}>Reporte de hoy</Text>
      <Text style={{ color: theme.muted, marginTop: -4 }}>
        {new Date().toLocaleDateString("es-CO", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>

      {error && <ErrorBanner message={error} theme={theme} />}

      {/* KPIs */}
      <View style={styles.kpiRow}>
        <KpiCard label="Total" value={money(sales.sumTotal)} theme={theme} />
        <KpiCard label="Transacciones" value={String(sales.count)} theme={theme} />
        <KpiCard label="Ticket promedio" value={money(sales.avgTicket)} theme={theme} />
      </View>

      {/* Por método de pago */}
      <Card theme={theme}>
        <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Por método de pago</Text>
        {barPayments.length === 0 ? (
          <Text style={{ color: theme.muted }}>No hay ventas registradas hoy.</Text>
        ) : (
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
        )}
      </Card>

      {/* Resumen textual (opcional) */}
      <Card theme={theme}>
        <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Resumen</Text>
        <Row label="Ventas" value={`${sales.count}`} theme={theme} />
        <Row label="Total" value={money(sales.sumTotal)} theme={theme} />
        <Row label="Ticket promedio" value={money(sales.avgTicket)} theme={theme} />
      </Card>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

/* --------------------------- UI helpers --------------------------- */

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
    <View
      style={[
        styles.kpiCard,
        { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
      ]}
    >
      <Text style={[styles.kpiLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: theme.fg }]}>{value}</Text>
    </View>
  );
}

function Row({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.muted }}>{label}</Text>
      <Text style={{ color: theme.fg, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

function ErrorBanner({ message, theme }: { message: string; theme: Theme }) {
  return (
    <View
      style={[
        styles.errorBanner,
        { backgroundColor: theme.errorBg, borderColor: theme.errorBorder },
      ]}
    >
      <Text style={{ color: theme.errorFg, fontWeight: "700" }}>Error</Text>
      <Text style={{ color: theme.errorFg, marginTop: 2 }}>{message}</Text>
    </View>
  );
}

/* ----------------------------- Theme ----------------------------- */

type Theme = {
  bg: string;
  card: string;
  border: string;
  shadow: string;
  fg: string;
  fgSoft: string;
  muted: string;
  primary: string;

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

  errorBg: "#3F1D1D",
  errorBorder: "#7F1D1D",
  errorFg: "#FEE2E2",
};

/* ----------------------------- Styles ---------------------------- */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    padding: 16,
    rowGap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
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
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 16,
  },
  kpiRow: {
    flexDirection: "row",
    columnGap: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  kpiLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
