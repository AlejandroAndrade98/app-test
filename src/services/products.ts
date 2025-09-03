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
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.debug("[products] usando MOCK");
    }
    const term = q?.toLowerCase();
    return productsMock.filter(
      (p) => !term || p.name.toLowerCase().includes(term) || p.sku.includes(q!)
    );
  }

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug("[products] GET /products", q ? { q } : {});
  }
  const { data } = await http.get<Product[]>("/products", {
    params: q ? { q } : undefined,
  });
  return data;
}
