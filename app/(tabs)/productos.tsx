import { View, Text, ActivityIndicator, Button } from 'react-native';
import { useDailyReport } from '../../src/hooks/useDailyReport';
import { money, datetimeLocal } from '../../src/utils/format';

export default function Reportes() {
  const { data, error, loading, refresh } = useDailyReport();

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;
  if (error) return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ color: 'red' }}>{error}</Text>
      <Button title="Reintentar" onPress={refresh} />
    </View>
  );
  if (!data) return <Text style={{ padding: 16 }}>Sin datos</Text>;

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>
        Reporte de hoy — {data.date}
      </Text>
      <Text>Rango: {datetimeLocal(data.range.from)} → {datetimeLocal(data.range.to)}</Text>

      <View>
        <Text style={{ fontWeight: '600' }}>Totales</Text>
        <Text>Ventas: {data.sales.count}</Text>
        <Text>Total: {money(data.sales.sumTotal)}</Text>
        <Text>Promedio ticket: {money(data.sales.avgTicket)}</Text>
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginTop: 8 }}>Por método de pago</Text>
        {data.byPayment.length === 0 && <Text>No hay ventas</Text>}
        {data.byPayment.map((p) => (
          <Text key={p.paymentMethod}>
            {p.paymentMethod}: {money(p.total)}
          </Text>
        ))}
      </View>

      <Button title="Actualizar" onPress={refresh} />
    </View>
  );
}

