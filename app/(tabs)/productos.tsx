// app/(tabs)/productos.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { fetchProducts } from "@/services/products";
import type { Product } from "@/types";
import { useRouter } from "expo-router";

const CURRENCY = "COP";
const money = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function Productos() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();

  const refresh = async () => {
    setError(null);
    try {
      const list = await fetchProducts();
      setData(list);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator />
        <Text style={{ color: theme.muted, marginTop: 8 }}>Cargando productos…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.error, marginBottom: 8 }}>{error}</Text>
        <Pressable
          onPress={refresh}
          style={[styles.retryBtn, { backgroundColor: theme.primary }]}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.bg }}             // 👈
      contentContainerStyle={{ backgroundColor: theme.bg, padding: 16, rowGap: 12 }}
      data={data}
      keyExtractor={(p) => String(p.id)}
      numColumns={2}
      columnWrapperStyle={{ columnGap: 12 }}
      // contentContainerStyle={{ padding: 16, rowGap: 12, backgroundColor: theme.bg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.muted} />
      }
      ListEmptyComponent={
        <Text style={{ color: theme.muted, textAlign: "center", marginTop: 24 }}>
          No hay productos aún.
        </Text>
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => router.push(`/productos/${item.id}`)}
          theme={theme}
        />
      )}
    />
  );
}

/* --------------------------- Card --------------------------- */

function ProductCard({
  product,
  onPress,
  theme,
}: {
  product: Product;
  onPress: () => void;
  theme: Theme;
}) {
  const uri = product.image_url || product.imageUrl || product.image;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.imageBox}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: theme.pillBg }]}>
            <Text style={{ color: theme.muted, fontWeight: "700" }}>IMG</Text>
          </View>
        )}
        {!!product.stock && (
          <View style={[styles.badge, { backgroundColor: theme.badgeBg, borderColor: theme.border }]}>
            <Text style={{ color: theme.fg, fontSize: 11, fontWeight: "700" }}>
              Stock: {product.stock}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.cardName, { color: theme.fg }]} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={[styles.cardSku, { color: theme.muted }]}>SKU: {product.sku}</Text>

      <Text style={[styles.cardPrice, { color: theme.fg }]}>{money(product.price)}</Text>
      <Text style={[styles.detailBtn, { color: theme.primary }]}>Ver detalle</Text>
    </Pressable>
  );
}

/* --------------------------- Theme --------------------------- */

type Theme = {
  bg: string;
  card: string;
  border: string;
  shadow: string;
  fg: string;
  muted: string;
  primary: string;
  pillBg: string;
  badgeBg: string;
  error: string;
};

const lightTheme: Theme = {
  bg: "#F6F7F9",
  card: "#FFFFFF",
  border: "#E6E8EC",
  shadow: "#000",
  fg: "#0F172A",
  muted: "#6B7280",
  primary: "#2563EB",
  pillBg: "#F3F4F6",
  badgeBg: "#E0E7FF",
  error: "#B91C1C",
};

const darkTheme: Theme = {
  bg: "#0B1220",
  card: "#121A2A",
  border: "#1F2A44",
  shadow: "#000",
  fg: "#E5E7EB",
  muted: "#9CA3AF",
  primary: "#60A5FA",
  pillBg: "#111827",
  badgeBg: "#1E293B",
  error: "#FCA5A5",
};

/* --------------------------- Styles --------------------------- */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageBox: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  image: { width: "100%", height: "100%" },
  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
    minHeight: 36,
  },
  cardSku: { fontSize: 11, marginBottom: 6 },
  cardPrice: { fontSize: 15, fontWeight: "700" },
  detailBtn: { marginTop: 6, fontSize: 12, fontWeight: "700" },
});
