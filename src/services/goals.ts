import { http } from "@/services/http";
import { USE_MOCK } from "@/config/api";
import type { Goals } from "@/types";

const DEFAULT_GOALS: Goals = { dailyTarget: 0, monthlyTarget: 0 };

export async function getGoals(): Promise<Goals> {
  if (USE_MOCK) return DEFAULT_GOALS;

  const { data } = await http.get("/settings/goals"); // backend responde el objeto
  const g = data ?? {};
  return {
    dailyTarget: Number(g.dailyTarget ?? 0),
    monthlyTarget: Number(g.monthlyTarget ?? 0),
  };
}

// El backend ya mergea el patch parcial; aquí solo enviamos lo que cambió
export async function updateGoals(patch: Partial<Goals>): Promise<Goals> {
  if (USE_MOCK) {
    // simula guardado y retorna merge
    const current = await getGoals();
    const merged = {
      dailyTarget: Number(patch.dailyTarget ?? current.dailyTarget),
      monthlyTarget: Number(patch.monthlyTarget ?? current.monthlyTarget),
    };
    return merged;
  }
  const { data } = await http.put("/settings/goals", patch);
  return {
    dailyTarget: Number(data?.dailyTarget ?? 0),
    monthlyTarget: Number(data?.monthlyTarget ?? 0),
  };
}
