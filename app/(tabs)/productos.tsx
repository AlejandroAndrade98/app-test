// app/(tabs)/productos.tsx
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/services/products";
import type { Product } from "@/types";

export default function Productos() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchProducts();
      setData(list);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
        <Pressable
          onPress={refresh}
          style={{ padding: 12, backgroundColor: "#3b82f6", borderRadius: 8 }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>REINTENTAR</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 8 }}>
        Productos
      </Text>

      {data.map((p) => (
        <View key={p.id} style={{ paddingVertical: 6 }}>
          <Text>{p.name} — ${p.price}</Text>
          <Text style={{ opacity: 0.7 }}>
            SKU: {p.sku} · stock: {p.stock}
          </Text>
        </View>
      ))}
    </View>
  );
}
