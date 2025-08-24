import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchProducts } from '../../services/api';

export default function Productos() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { fetchProducts().then(setData); }, []);
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Productos</Text>
      <FlatList
        data={data}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{item.name} — ${item.price} — stock: {item.stock}</Text>
          </View>
        )}
      />
    </View>
  );
}
