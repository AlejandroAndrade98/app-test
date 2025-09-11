// app/(tabs)/venta.tsx  (o la ruta donde tengas la pantalla de Venta)
import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useCart } from "../../store/cart";
import { fetchProducts, createSale } from "../../services/api";

type Product = {
  id: string | number;
  sku: string;
  name: string;
  price: number;
  stock?: number;
  image_url?: string;
  imageUrl?: string;
  image?: string;
};

const CURRENCY = "COP";
const money = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function Venta() {
  const [q, setQ] = useState("");
  const [internalQ, setInternalQ] = useState(""); // input controlado (debounced -> q)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { items, addItem, removeItem, total, clear } = useCart();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  // --- Debounce del buscador (sin libs)
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeQuery = (text: string) => {
    setInternalQ(text);
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setQ(text.trim()), 300);
  };

  // --- Cargar productos
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProducts(q);
      setProducts(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onPull = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  // --- Handlers
  const agregar = (p: Product) => {
    addItem(p); // tu store ya suma qty si existe
  };
  const quitar = (sku: string) => {
    removeItem(sku); // tu store elimina la línea completa
  };

  const cobrar = async () => {
    if (items.length === 0) {
      alert("Agrega productos");
      return;
    }
    const payload = {
      userId: 1,
      cashSessionId: null,
      paymentMethod: "cash",
      items: items.map((i) => ({ sku: i.sku, qty: i.qty })),
    };
    try {
      const r = await createSale(payload);
      alert(`Venta OK #${r.saleId}`);
      clear();
    } catch (e: any) {
      alert(`Error al cobrar: ${e?.message || e}`);
    }
  };

  // --- Derivados
  const itemsCount = useMemo(() => items.reduce((acc, i) => acc + (i.qty || 0), 0), [items]);
  const totalStr = money(total());

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.fg }]}>Venta</Text>
        <Text style={{ color: theme.muted, marginTop: 2 }}>
          {itemsCount} ítem{itemsCount === 1 ? "" : "s"} en carrito · {totalStr}
        </Text>

        {/* Buscador */}
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
          ]}
        >
          <TextInput
            placeholder="Buscar producto por nombre o SKU"
            placeholderTextColor={theme.muted}
            value={internalQ}
            onChangeText={onChangeQuery}
            style={[styles.input, { color: theme.fg }]}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        columnWrapperStyle={{ columnGap: 12 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, rowGap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPull} tintColor={theme.muted} />}
        ListEmptyComponent={
          loading ? null : (
            <Text style={{ color: theme.muted, textAlign: "center", marginTop: 24 }}>
              {error ? "No se pudieron cargar productos." : "Sin resultados para tu búsqueda."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAdd={() => agregar(item)}
            theme={theme}
          />
        )}
      />

      {/* Barra fija de carrito/pago */}
      <View style={[styles.paybar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.muted, fontSize: 12 }}>Total</Text>
          <Text style={{ color: theme.fg, fontSize: 18, fontWeight: "800" }}>{totalStr}</Text>
        </View>
        <Pressable
          onPress={cobrar}
          style={({ pressed }) => [
            styles.payBtn,
            { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityLabel="Cobrar en efectivo"
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            Cobrar ({itemsCount})
          </Text>
        </Pressable>
      </View>

      {/* Estados */}
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

/* ----------------------------- Card ----------------------------- */

function ProductCard({
  product,
  onAdd,
  theme,
}: {
  product: Product;
  onAdd: () => void;
  theme: Theme;
}) {
  const uri = product.image_url || product.imageUrl || product.image;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
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
            <Text style={{ color: theme.fg, fontSize: 11, fontWeight: "700" }}>Stock: {product.stock}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.cardName, { color: theme.fg }]} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={[styles.cardSku, { color: theme.muted }]}>SKU: {product.sku}</Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.cardPrice, { color: theme.fg }]}>{money(product.price)}</Text>
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          accessibilityLabel={`Agregar ${product.name} al carrito`}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Agregar</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ----------------------------- Tema ----------------------------- */

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
};

/* ---------------------------- Estilos --------------------------- */

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  searchWrap: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  input: {
    fontSize: 14,
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
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  cardPrice: { fontSize: 16, fontWeight: "800" },
  addBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  paybar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  payBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
