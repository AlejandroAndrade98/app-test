import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { fetchReportToday } from '../../services/api'; // ajusta si tu path real es distinto

type PaymentRow = { paymentMethod: string; total: number };
type Report = {
  sales: { count: number; sumTotal: number; avgTicket: number };
  byPayment: PaymentRow[];
};

const EMPTY: Report = {
  sales: { count: 0, sumTotal: 0, avgTicket: 0 },
  byPayment: [],
};

function normalizeReport(raw: any): Report {
  // Si tu backend devuelve { data: {...} }, esto lo cubre.
  const data = raw?.data ?? raw ?? {};

  const sales = data?.sales ?? {};
  const byPayment = Array.isArray(data?.byPayment) ? data.byPayment : [];

  return {
    sales: {
      count: Number(sales?.count ?? 0),
      sumTotal: Number(sales?.sumTotal ?? 0),
      avgTicket: Number(sales?.avgTicket ?? 0),
    },
    byPayment,
  };
}

export default function Reportes() {
  const [report, setReport] = useState<Report>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await fetchReportToday();
        // Útil para ver EXACTAMENTE qué llega del backend:
        console.log('[report raw]', JSON.stringify(raw));
        setReport(normalizeReport(raw));
      } catch (e: any) {
        console.log('[report error]', e);
        setError(e?.message ?? 'Error cargando el reporte');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Cargando reporte...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  // Blindaje extra por si algo raro pasó:
  const sales = report?.sales ?? { count: 0, sumTotal: 0, avgTicket: 0 };
  const byPayment = Array.isArray(report?.byPayment) ? report.byPayment : [];

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Reporte de hoy</Text>
      <Text>Ventas: {sales.count}</Text>
      <Text>Total: {sales.sumTotal}</Text>
      <Text>Promedio ticket: {sales.avgTicket}</Text>

      <Text style={{ marginTop: 12, fontWeight: '600' }}>Por método de pago:</Text>
      {byPayment.length === 0 ? (
        <Text>No hay ventas</Text>
      ) : (
        byPayment.map((r, i) => (
          <Text key={i}>
            {r?.paymentMethod ?? 'Desconocido'}: {Number(r?.total ?? 0)}
          </Text>
        ))
      )}
    </View>
  );
}
