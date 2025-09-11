// app/(tabs)/index.tsx
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";

// ---- Configurable (puedes mover esto a un store/endpoint luego) ----
const BUSINESS_NAME = "Delirios Pastelería";
const LOGO_URI = ""; // pon aquí una URL, o usa require('...') abajo
const CURRENCY = "COP";

// Simula si el día está “pilotado” (por ejemplo, aprobado/planificado)
type PilotDay = { label: string; dateISO: string; planned: boolean };
function startOfWeek(d = new Date()) {
  const day = d.getDay(); // 0=Dom
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio
  const ans = new Date(d);
  ans.setDate(diff);
  ans.setHours(0, 0, 0, 0);
  return ans;
}
function formatISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

// ---- Utilidades ----
const money = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

/** Puedes reemplazar estos fetch por tus endpoints reales */
async function fetchTodaySales(): Promise<number> {
  // TODO: integra a /reports/daily para traer sumTotal
  // return (await getDailyReport()).sales.sumTotal;
  await new Promise((r) => setTimeout(r, 300)); // simula latencia
  return Math.floor(Math.random() * 500000); // simulado
}
async function fetchDailyGoal(): Promise<number> {
  // TODO: integra a tu endpoint de settings
  await new Promise((r) => setTimeout(r, 150));
  return 800000; // meta simulada
}
async function fetchWeeklyPilot(): Promise<PilotDay[]> {
  const start = startOfWeek(new Date());
  const labels = ["L", "M", "X", "J", "V", "S", "D"];
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      label: labels[i],
      dateISO: formatISO(d),
      planned: Math.random() > 0.35, // simulado
    };
  });
}

// ---- Home ----
export default function Home() {
  const [refreshing, setRefreshing] = useState(false);
  const [salesToday, setSalesToday] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [pilot, setPilot] = useState<PilotDay[]>([]);

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();

  const progress = useMemo(() => clamp(dailyGoal ? salesToday / dailyGoal : 0), [salesToday, dailyGoal]);
  const todayISO = formatISO(new Date());

  async function load() {
    const [s, g, p] = await Promise.all([fetchTodaySales(), fetchDailyGoal(), fetchWeeklyPilot()]);
    setSalesToday(s);
    setDailyGoal(g);
    setPilot(p);
  }

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.muted} />}
    >
      {/* Header: logo + negocio + fecha */}
      <View style={styles.headerRow}>
        <View style={styles.logoWrap}>
          {LOGO_URI ? (
            <Image source={{ uri: LOGO_URI }} style={styles.logo} resizeMode="contain" />
          ) : (
            // Alternativa local:
            // <Image source={require("@/assets/logo.png")} style={styles.logo} resizeMode="contain" />
            <View style={[styles.logoFallback, { backgroundColor: theme.pillBg }]}>
              <Text style={{ color: theme.muted, fontWeight: "700" }}>LOGO</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brand, { color: theme.fg }]} numberOfLines={1}>
            {BUSINESS_NAME}
          </Text>
          <Text style={[styles.subtle, { color: theme.muted }]}>{new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</Text>
        </View>
      </View>

      {/* Meta diaria (KPI + progress) */}
      <Card theme={theme}>
        <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Meta diaria</Text>

        <View style={styles.kpiRow}>
          <KpiCard label="Progreso" value={`${Math.round(progress * 100)}%`} theme={theme} />
          <KpiCard label="Vendido hoy" value={money(salesToday)} theme={theme} />
          <KpiCard label="Meta" value={money(dailyGoal)} theme={theme} />
        </View>

        <View style={[styles.progressTrack, { backgroundColor: theme.trackBg }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: progress >= 1 ? theme.positive : theme.primary,
              },
            ]}
          />
        </View>

        <View style={styles.goalActions}>
          <PillButton
            label="Ver reportes"
            onPress={() => router.push("/reportes")}
            theme={theme}
            accessibilityLabel="Ir a reportes"
          />
          <PillButton
            label="Actualizar meta"
            onPress={() => router.push("/settings")} // o abre modal en el futuro
            theme={theme}
            appearance="outline"
            accessibilityLabel="Actualizar meta diaria"
          />
        </View>
      </Card>

      {/* Acciones rápidas */}
      <View style={styles.quickRow}>
        <QuickAction
          title="Productos"
          subtitle="Explorar catálogo"
          onPress={() => router.push("/productos")}
          theme={theme}
        />
        <QuickAction
          title="Ventas"
          subtitle="Carrito & cobro"
          onPress={() => router.push("/ventas")}
          theme={theme}
        />
        <QuickAction
          title="Reportes"
          subtitle="Diario y rangos"
          onPress={() => router.push("/reportes-range")}
          theme={theme}
        />
      </View>

      {/* Pilotaje semanal */}
      <Card theme={theme}>
        <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Pilotaje semanal</Text>
        <View style={styles.pilotRow}>
          {pilot.map((d) => {
            const isToday = d.dateISO === todayISO;
            return (
              <View
                key={d.dateISO}
                style={[
                  styles.pilotPill,
                  {
                    borderColor: isToday ? theme.primary : theme.border,
                    backgroundColor: d.planned ? theme.pillOkBg : theme.pillBg,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isToday ? theme.primary : theme.fg,
                    fontWeight: "700",
                    marginBottom: 2,
                  }}
                >
                  {d.label}
                </Text>
                <Text style={{ color: theme.muted, fontSize: 11 }}>{d.dateISO.slice(5)}</Text>
                <Text
                  style={{
                    color: d.planned ? theme.ok : theme.muted,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {d.planned ? "Pilotado" : "Pendiente"}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", columnGap: 8, marginTop: 10 }}>
          <PillButton
            label="Editar pilotaje"
            onPress={() => router.push("/pilotaje")}
            theme={theme}
            appearance="outline"
          />
          <PillButton
            label="Ver agenda"
            onPress={() => router.push("/agenda")}
            theme={theme}
          />
        </View>
      </Card>

      {/* Actividad reciente (placeholder, listo para conectar) */}
      <Card theme={theme}>
        <Text style={[styles.cardTitle, { color: theme.fgSoft }]}>Actividad reciente</Text>
        <Text style={{ color: theme.muted, marginTop: 2 }}>
          Aquí verás ventas y eventos recientes (conéctalo luego a tu endpoint).
        </Text>
      </Card>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

/* --------------------------- UI atoms --------------------------- */

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

function PillButton({
  label,
  onPress,
  theme,
  appearance = "solid",
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  theme: Theme;
  appearance?: "solid" | "outline";
  accessibilityLabel?: string;
}) {
  const base = [
    styles.pillBtn,
    appearance === "solid"
      ? { backgroundColor: theme.primary }
      : { backgroundColor: "transparent", borderColor: theme.primary, borderWidth: StyleSheet.hairlineWidth },
  ];
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={{ color: appearance === "solid" ? "#fff" : theme.primary, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

function QuickAction({
  title,
  subtitle,
  onPress,
  theme,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text style={[styles.quickTitle, { color: theme.fg }]}>{title}</Text>
      <Text style={[styles.quickSub, { color: theme.muted }]}>{subtitle}</Text>
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

  trackBg: string;
  ok: string;
  positive: string;

  pillBg: string;
  pillOkBg: string;
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

  trackBg: "#E5E7EB",
  ok: "#059669",
  positive: "#16A34A",

  pillBg: "#F3F4F6",
  pillOkBg: "#DCFCE7",
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

  trackBg: "#1F2A44",
  ok: "#34D399",
  positive: "#22C55E",

  pillBg: "#111827",
  pillOkBg: "#052e16",
};

/* --------------------------- Stylesheet ------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    rowGap: 12,
  },
  headerRow: {
    flexDirection: "row",
    columnGap: 12,
    alignItems: "center",
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtle: {
    fontSize: 12,
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
    marginBottom: 12,
    fontSize: 16,
  },
  kpiRow: {
    flexDirection: "row",
    columnGap: 12,
    marginBottom: 12,
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
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  goalActions: {
    flexDirection: "row",
    columnGap: 10,
    marginTop: 12,
  },
  pillBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  quickRow: {
    flexDirection: "row",
    columnGap: 12,
  },
  quickCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  quickSub: {
    fontSize: 12,
  },
  pilotRow: {
    flexDirection: "row",
    columnGap: 8,
    flexWrap: "wrap",
    rowGap: 8,
  },
  pilotPill: {
    width: 72,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
