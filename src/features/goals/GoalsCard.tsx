import { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoals, updateGoals } from "@/services/goals";
import type { Goals } from "@/types";

const DEFAULT_GOALS: Goals = { dailyTarget: 0, monthlyTarget: 0 };

export default function GoalsCard() {
  const qc = useQueryClient();

  const goals = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
    initialData: DEFAULT_GOALS,     // ✅ evita undefined en primer render
  });

  const mUpdate = useMutation({
    mutationFn: (patch: Partial<Goals>) => updateGoals(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const [daily, setDaily] = useState("");
  const [monthly, setMonthly] = useState("");

  if (goals.isLoading) return <ActivityIndicator />;
  if (goals.isError) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "tomato" }}>No se pudieron cargar las metas.</Text>
      </View>
    );
  }

  const g = goals.data ?? DEFAULT_GOALS;     // ✅ respaldo
  const dailyValue    = daily   !== "" ? daily   : String(g.dailyTarget ?? 0);
  const monthlyValue  = monthly !== "" ? monthly : String(g.monthlyTarget ?? 0);

  return (
    <View style={{ backgroundColor:"#0f172a", borderRadius:12, padding:16, gap:10 }}>
      <Text style={{ color:"#fff", fontSize:16, fontWeight:"600" }}>Metas</Text>

      <Text style={{ color:"#cbd5e1" }}>Meta diaria</Text>
      <TextInput
        value={dailyValue}
        onChangeText={setDaily}
        keyboardType="decimal-pad"
        style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8 }}
      />

      <Text style={{ color:"#cbd5e1" }}>Meta mensual</Text>
      <TextInput
        value={monthlyValue}
        onChangeText={setMonthly}
        keyboardType="decimal-pad"
        style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8 }}
      />

      <Button
        title={mUpdate.isPending ? "Guardando..." : "Guardar"}
        onPress={() =>
          mUpdate.mutate({
            dailyTarget:   Number(daily   === "" ? g.dailyTarget   : daily),
            monthlyTarget: Number(monthly === "" ? g.monthlyTarget : monthly),
          })
        }
      />
    </View>
  );
}
