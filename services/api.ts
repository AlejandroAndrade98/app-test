// src/services/api.ts
import { http } from '../src/services/http';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';

const mock = {
  products: [
    { id: 1, sku: 'TORT-CHOC', name: 'Torta Chocolate', price: 85000, stock: 4 },
    { id: 2, sku: 'CHEESE',    name: 'Cheesecake',      price: 90000, stock: 3 },
    { id: 3, sku: 'TRESL-PCS', name: 'Tres Leches (porción)', price: 12000, stock: 20 },
  ],
};

export async function fetchProducts(q?: string) {
  if (USE_MOCK) {
    return mock.products.filter(p =>
      !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.includes(q));
  }
  const { data } = await http.get('/products', { params: { q } });
  return data;
}

export async function createSale(payload: {
  userId: number; cashSessionId: number | null; paymentMethod: string;
  items: { sku: string; qty: number }[];
}) {
  if (USE_MOCK) {
    return { saleId: Math.floor(Math.random() * 10000) };
  }
  const { data } = await http.post('/sales', payload);
  return data;
}

/** 👇 Corregido: usar /reports/daily y devolver la misma forma que el backend */
export async function fetchReportToday() {
  if (USE_MOCK) {
    return {
      date: new Date().toISOString().slice(0, 10),
      range: { from: new Date().toISOString(), to: new Date().toISOString() },
      sales: { count: 3, sumTotal: 123000, avgTicket: 41000 },
      byPayment: [{ paymentMethod: 'cash', total: 123000 }],
    };
  }
  const { data } = await http.get('/reports/daily');
  return data;
}
