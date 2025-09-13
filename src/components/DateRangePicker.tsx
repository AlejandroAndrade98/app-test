// components/DateRangePicker.tsx
import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View, StyleSheet } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type Props = {
  valueFrom: string;          // "YYYY-MM-DD"
  valueTo: string;            // "YYYY-MM-DD"
  onChange: (from: string, to: string) => void;
};

function parseYMD(s: string): Date {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date();
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateRangePicker({ valueFrom, valueTo, onChange }: Props) {
  const fromDate = useMemo(() => parseYMD(valueFrom), [valueFrom]);
  const toDate   = useMemo(() => parseYMD(valueTo),   [valueTo]);

  // ------- WEB: inputs nativos del navegador -------
  if (Platform.OS === "web") {
    return (
      <View style={styles.webRow}>
        <View style={styles.webField}>
          <Text style={styles.webLabel}>Desde:</Text>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <input
            type="date"
            value={valueFrom}
            onChange={(e) => {
              const next = (e.target as HTMLInputElement).value || valueFrom;
              onChange(next, valueTo);
            }}
            style={stylesHtmlInput as any}
          />
        </View>

        <View style={styles.webField}>
          <Text style={styles.webLabel}>Hasta:</Text>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <input
            type="date"
            value={valueTo}
            min={valueFrom || undefined}
            onChange={(e) => {
              const next = (e.target as HTMLInputElement).value || valueTo;
              onChange(valueFrom, next);
            }}
            style={stylesHtmlInput as any}
          />
        </View>
      </View>
    );
  }

  // ------- ANDROID / iOS: community datetimepicker -------
  const [open, setOpen] = useState<null | "from" | "to">(null);

  const onPick = (which: "from" | "to") => setOpen(which);

  const onChangeNative = (which: "from" | "to") =>
    (event: DateTimePickerEvent, selected?: Date) => {
      // En Android, cancelar devuelve undefined; cerramos en cualquier caso
      if (Platform.OS === "android") setOpen(null);

      if (selected) {
        if (which === "from") {
          const nextFrom = fmtYMD(selected);
          // garantizamos que from <= to
          const clampedTo = valueTo && nextFrom > valueTo ? nextFrom : valueTo;
          onChange(nextFrom, clampedTo);
        } else {
          const nextTo = fmtYMD(selected);
          // garantizamos que from <= to
          const clampedFrom = valueFrom && nextTo < valueFrom ? nextTo : valueFrom;
          onChange(clampedFrom, nextTo);
        }
      }
    };

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.nativeRow}>
        <Pressable onPress={() => onPick("from")} style={({ pressed }) => [styles.pill, { opacity: pressed ? 0.85 : 1 }]}>
          <Text style={styles.pillText}>Desde: {valueFrom || "—"}</Text>
        </Pressable>

        <Pressable onPress={() => onPick("to")} style={({ pressed }) => [styles.pill, { opacity: pressed ? 0.85 : 1 }]}>
          <Text style={styles.pillText}>Hasta: {valueTo || "—"}</Text>
        </Pressable>
      </View>

      {open === "from" && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={onChangeNative("from")}
          maximumDate={toDate}
        />
      )}
      {open === "to" && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={onChangeNative("to")}
          minimumDate={fromDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Web
  webRow: { flexDirection: "row", gap: 12, alignItems: "center", flexWrap: "wrap" },
  webField: { display: "flex", gap: 6 },
  webLabel: { color: "#9CA3AF", fontSize: 12 },

  // Nativo
  nativeRow: { flexDirection: "row", gap: 12 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#111827",
    borderColor: "#1F2A44",
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: { color: "#E5E7EB", fontWeight: "600" },
});

// Estilo inline para <input> en web
const stylesHtmlInput: React.CSSProperties = {
  appearance: "none",
  outline: "none",
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(31,42,68,0.8)",
  backgroundColor: "#111827",
  color: "#E5E7EB",
  fontWeight: 600,
};
