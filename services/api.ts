import axios from 'axios';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL });

/** Mock simple en memoria */
const mock = {
  products: [
    { id: 1, sku: 'TORT-CHOC', name: 'Torta Chocolate', price: 85000, stock: 4 },
    { id: 2, sku: 'CHEESE',    name: 'Cheesecake',      price: 90000, stock: 3 },
    { id: 3, sku: 'TRESL-PCS', name: 'Tres Leches (porción)', price: 12000, stock: 20 },
  ],
};

export async function fetchProducts(q?: string) {
  if (USE_MOCK) {
    const data = mock.products.filter(p =>
      !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.includes(q));
    return data;
  }
  const r = await api.get('/products', { params: { q } });
  return r.data;
}

export async function createSale(payload: {
  userId: number; cashSessionId: number | null; paymentMethod: string;
  items: { sku: string; qty: number }[];
}) {
  if (USE_MOCK) {
    // Simula “éxito”
    return { saleId: Math.floor(Math.random() * 10000) };
  }
  const r = await api.post('/sales', payload);
  return r.data;
}

export async function fetchReportToday() {
  if (USE_MOCK) return [{ method: 'cash', total: 123000 }];
  const r = await api.get('/reports/today');
  return r.data;
}
