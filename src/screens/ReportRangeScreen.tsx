// src/screens/ReportRangeScreen.tsx (FRONT)
import React, { useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import DateRangePicker from "../components/DateRangePicker";
import { useRangeReport } from "../hooks/useDailyReport";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function minusDaysStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReportRangeScreen() {
  const [from, setFrom] = useState(minusDaysStr(6)); // últimos 7 días
  const [to, setTo] = useState(todayStr());

  const { data, isLoading, isError, refetch } = useRangeReport(from, to);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Reporte por rango</Text>

      <DateRangePicker
        valueFrom={from}
        valueTo={to}
        onChange={(f, t) => {
          setFrom(f);
          setTo(t);
          refetch(); // vuelve a cargar
        }}
      />

      {isLoading && (
        <View style={{ paddingTop: 12 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Cargando…</Text>
        </View>
      )}

      {isError && (
        <Text style={{ color: "#ef4444" }}>
          No pudimos cargar el reporte. Intenta cambiar el rango o vuelve a intentar.
        </Text>
      )}

      {data && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ opacity: 0.7, marginBottom: 8 }}>
            {data.from} → {data.to}
          </Text>

          <FlatList
            data={data.days}
            keyExtractor={(it) => it.day}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: "#374151" }} />
            )}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ fontWeight: "600" }}>{item.day}</Text>
                <Text>Ventas: {item.count}</Text>
                <Text>Total: {item.sumTotal.toLocaleString()}</Text>
                <Text>Ticket Promedio: {item.avgTicket.toLocaleString()}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ opacity: 0.7 }}>Sin datos en el rango.</Text>
            }
          />
        </View>
      )}
    </View>
  );
}
