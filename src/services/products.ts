import { http } from './http';
import { USE_MOCK } from '../config/api';
import { productsMock } from '../mocks/products.mock';
import { Product } from '../types';

/**
 * Obtener lista de productos.
 * Si USE_MOCK=1 usa datos en memoria, de lo contrario consulta el backend.
 */
export async function fetchProducts(q?: string): Promise<Product[]> {
  if (USE_MOCK) {
    return productsMock.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.sku.includes(q)
    );
  }

  const { data } = await http.get('/products', { params: { q } });
  return data;
}
