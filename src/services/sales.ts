import { http } from './http';
import { USE_MOCK } from '../config/api';
import { createSaleMock } from '../mocks/sales.mock';
import { SaleCreateInput } from '../types';

/**
 * Crear una venta nueva.
 */
export async function createSale(payload: SaleCreateInput) {
  if (USE_MOCK) return createSaleMock();

  const { data } = await http.post('/sales', payload);
  return data;
}