import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { useCart } from '../../store/cart';
import { fetchProducts, createSale } from '../../services/api';

export default function Venta() {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const { items, addItem, removeItem, total, clear } = useCart();

  useEffect(() => {
    fetchProducts(q).then(setProducts);
  }, [q]);

  const cobrar = async () => {
    if (items.length === 0) return alert('Agrega productos');
    const payload = {
      userId: 1,
      cashSessionId: null,
      paymentMethod: 'cash',
      items: items.map(i => ({ sku: i.sku, qty: i.qty }))
    };
    try {
      const r = await createSale(payload);
      alert(`Venta OK #${r.saleId}`);
      clear();
    } catch (e: any) {
      alert(`Error al cobrar: ${e.message || e}`);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Venta</Text>
      <TextInput
        placeholder="Buscar producto"
        value={q}
        onChangeText={setQ}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => addItem(item)} style={{ paddingVertical: 8 }}>
            <Text>{item.name} — ${item.price}</Text>
            <Text style={{ opacity: 0.6 }}>SKU: {item.sku} · stock: {item.stock}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={{ fontSize: 18, marginTop: 8 }}>Carrito</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.sku}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text>{item.name} x{item.qty}</Text>
            <TouchableOpacity onPress={() => removeItem(item.sku)}>
              <Text>Quitar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={{ fontSize: 18 }}>Total: ${total()}</Text>
      <Button title="Cobrar (efectivo)" onPress={cobrar} />
    </View>
  );
}
