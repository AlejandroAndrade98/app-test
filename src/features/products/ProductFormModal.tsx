import { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import type { Product, ProductInput } from "@/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: ProductInput, id?: number) => Promise<void>;
  editing?: Product | null;
};

export default function ProductFormModal({ visible, onClose, onSubmit, editing }: Props) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [stock, setStock] = useState<string>("0");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setSku(editing.sku ?? "");
      setPrice(String(editing.price));
      setStock(String(editing.stock));
    } else {
      setName(""); setSku(""); setPrice("0"); setStock("0");
    }
  }, [editing, visible]);

  const handleSubmit = async () => {
  const input: ProductInput = {
    name: name.trim(),
    ...(sku.trim() ? { sku: sku.trim() } : {}),
    price: Number(price || 0),
    ...(!editing ? { stock: Number(stock || 0) } : {}),
  };

  await onSubmit(input, editing ? Number(editing.id) : undefined);
  onClose();
};

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex:1, backgroundColor:"#0008", justifyContent:"center", alignItems:"center" }}>
        <View style={{ backgroundColor:"#0f172a", padding:16, borderRadius:12, width:420 }}>
          <Text style={{ color:"#fff", fontSize:16, fontWeight:"600", marginBottom:8 }}>
            {editing ? "Editar producto" : "Nuevo producto"}
          </Text>

          <Text style={{ color:"#cbd5e1" }}>Nombre</Text>
          <TextInput value={name} onChangeText={setName}
            style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8, marginBottom:8 }} />

          <Text style={{ color:"#cbd5e1" }}>SKU (opcional)</Text>
          <TextInput value={sku} onChangeText={setSku}
            style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8, marginBottom:8 }} />

          <Text style={{ color:"#cbd5e1" }}>Precio</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad"
            style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8, marginBottom:8 }} />

          {!editing && (
            <>
              <Text style={{ color:"#cbd5e1" }}>Stock inicial</Text>
              <TextInput value={stock} onChangeText={setStock} keyboardType="numeric"
                style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8, marginBottom:8 }} />
            </>
          )}

          <View style={{ flexDirection:"row", justifyContent:"flex-end", gap:8 }}>
            <Button title="Cancelar" onPress={onClose} />
            <Button title={editing ? "Guardar" : "Crear"} onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
