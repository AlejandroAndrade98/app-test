import { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import type { Product } from "@/types";

type Props = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSet: (stock: number) => Promise<void>;
  onAdjust: (delta: number) => Promise<void>;
};

export default function StockAdjustModal({ visible, product, onClose, onSet, onAdjust }: Props) {
  const [setValue, setSetValue] = useState<string>("0");
  const [deltaValue, setDeltaValue] = useState<string>("0");

  useEffect(() => {
    if (product) setSetValue(String(product.stock));
  }, [product]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex:1, backgroundColor:"#0008", justifyContent:"center", alignItems:"center" }}>
        <View style={{ backgroundColor:"#0f172a", padding:16, borderRadius:12, width:420 }}>
          <Text style={{ color:"#fff", fontSize:16, fontWeight:"600", marginBottom:12 }}>
            Stock de {product?.name}
          </Text>

          <Text style={{ color:"#cbd5e1" }}>Establecer stock exacto</Text>
          <TextInput value={setValue} onChangeText={setSetValue} keyboardType="numeric"
            style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8, marginBottom:8 }} />
          <Button title="Establecer" onPress={() => onSet(Number(setValue))} />

          <View style={{ height:12 }} />
          <Text style={{ color:"#cbd5e1" }}>Ajustar (+/-)</Text>
          <TextInput value={deltaValue} onChangeText={setDeltaValue} keyboardType="numeric"
            style={{ backgroundColor:"#111827", color:"#fff", padding:10, borderRadius:8, marginBottom:8 }} />
          <Button title="Aplicar ajuste" onPress={() => onAdjust(Number(deltaValue))} />

          <View style={{ height:8 }} />
          <Button title="Cerrar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
