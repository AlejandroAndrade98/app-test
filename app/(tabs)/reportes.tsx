import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { fetchReportToday } from '../../services/api';

export default function Reportes() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetchReportToday().then(setRows); }, []);
  return (
    <View style={{ padding: 16, gap: 6 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Reportes hoy</Text>
      {rows.length === 0 && <Text>No hay ventas</Text>}
      {rows.map((r, i) => <Text key={i}>{r.method}: ${r.total}</Text>)}
    </View>
  );
}
