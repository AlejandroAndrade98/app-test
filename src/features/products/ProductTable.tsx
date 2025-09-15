import { useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, createProduct, updateProduct, setStock, adjustStock } from "@/services/products";
import type { Product, ProductInput } from "@/types";
import ProductFormModal from "./ProductFormModal";
import StockAdjustModal from "./StockAdjustModal";

export default function ProductTable() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [openStock, setOpenStock] = useState(false);
  const [stockItem, setStockItem] = useState<Product | null>(null);

  const products = useQuery({
  queryKey: ["products", search],
  queryFn: () => fetchProducts(search),
  });

  const mCreate = useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const mUpdate = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<ProductInput> }) => updateProduct(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const mSet = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) => setStock(id, stock),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const mAdjust = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) => adjustStock(id, delta),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const submitForm = async (input: ProductInput, id?: number) => {
    if (id) await mUpdate.mutateAsync({ id, patch: input });
    else await mCreate.mutateAsync(input);
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection:"row", gap:10, alignItems:"center" }}>
        <TextInput
          placeholder="Buscar producto..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          style={{ flex:1, backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8 }}
        />
        <Button title="Nuevo" onPress={() => { setEditing(null); setOpenForm(true); }} />
      </View>

      {/* Tabla simple */}
      <View>
        <View style={{ flexDirection:"row", paddingVertical:8 }}>
          {["Nombre","SKU","Precio","Stock","Acciones"].map((h,i)=>(
            <Text key={i} style={{ flex:[2,1,1,1,2][i], color:"#93c5fd", fontWeight:"600" }}>{h}</Text>
          ))}
        </View>
        <FlatList
          data={products.data ?? []}
          keyExtractor={(p: Product) => String(p.id)}
          renderItem={({ item }) => (
            <View style={{ flexDirection:"row", paddingVertical:8, borderTopWidth:1, borderTopColor:"#1f2937" }}>
              <Text style={{ flex:2, color:"#e5e7eb" }}>{item.name}</Text>
              <Text style={{ flex:1, color:"#e5e7eb" }}>{item.sku ?? "-"}</Text>
              <Text style={{ flex:1, color:"#e5e7eb" }}>${item.price.toFixed(2)}</Text>
              <Text style={{ flex:1, color: item.stock <= 5 ? "#f87171" : "#e5e7eb" }}>{item.stock}</Text>
              <View style={{ flex:2, flexDirection:"row", gap:8 }}>
                <TouchableOpacity onPress={() => { setEditing(item); setOpenForm(true); }}>
                  <Text style={{ color:"#60a5fa" }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setStockItem(item); setOpenStock(true); }}>
                  <Text style={{ color:"#fbbf24" }}>Stock</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      <ProductFormModal
        visible={openForm}
        onClose={() => setOpenForm(false)}
        editing={editing}
        onSubmit={submitForm}
      />

      <StockAdjustModal
        visible={openStock}
        product={stockItem}
        onClose={() => setOpenStock(false)}
        onSet={async (value)=>{ if(!stockItem) return; await mSet.mutateAsync({ id: stockItem.id, stock: value }); setOpenStock(false); }}
        onAdjust={async (delta)=>{ if(!stockItem) return; await mAdjust.mutateAsync({ id: stockItem.id, delta }); setOpenStock(false); }}
      />
    </View>
  );
}
