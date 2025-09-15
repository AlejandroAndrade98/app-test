// src/services/sales.ts
import { http } from "@/services/http";
import { USE_MOCK } from "@/config/api";
import type { SaleCreateInput } from "@/types";

export type CreateSaleResponse = { saleId: number } | unknown;

/** Crear una venta */
export async function createSale(payload: SaleCreateInput): Promise<CreateSaleResponse> {
  if (USE_MOCK) {
    return { saleId: Math.floor(Math.random() * 10000) };
  }
  const { data } = await http.post("/sales", payload);
  return data;
}
