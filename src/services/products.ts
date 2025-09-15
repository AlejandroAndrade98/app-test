import { http } from "@/services/http";               // o './http' si no usas alias
import { USE_MOCK } from "@/config/api";
import { productsMock } from "@/mocks/products.mock";
import type { Product, ProductInput } from "@/types";


function normalize(p: any): Product {
  return {
    id: Number(p.id),
    name: String(p.name),
    sku: p.sku ?? null,
    price: Number(p.price),          // <- clave
    stock: Number(p.stock ?? 0),     // <- clave
    active: p.active ?? true,
    imageUrl: p.imageUrl ?? null,
  };
}
/**
 * Lista de productos (ya la tenías) — respeta `USE_MOCK`
 */
export async function fetchProducts(q?: string): Promise<Product[]> {
  if (USE_MOCK) {
    if (__DEV__) console.debug("[products] usando MOCK");
    const term = q?.toLowerCase();
    return productsMock.filter(p => {
      if (!term) return true;
      const nameOk = p.name.toLowerCase().includes(term);
      const skuOk  = (p.sku ?? "").toLowerCase().includes(term);
      return nameOk || skuOk;
    });
  }

  if (__DEV__) console.debug("[products] GET /products", q ? { q } : {});
  const { data } = await http.get<Product[]>("/products", { params: q ? { q } : undefined });
  // Normaliza por si stock no viene
  return data.map((p) => ({ ...p, stock: p.stock ?? 0 }));
}

/**
 * Crear producto
 */
// Crear producto
export async function createProduct(input: ProductInput): Promise<Product> {
  if (USE_MOCK) {
    const mock = normalize({
      id: Date.now(),
      ...input,
      price: Number(input.price),
      stock: input.stock ?? 0,
      active: input.active ?? true,
    });
    productsMock.unshift(mock);
    if (__DEV__) console.debug("[products] MOCK create", mock);
    return mock;
  }

  // ❗ No enviamos imageUrl si el backend no tiene esa columna/validador
  const body = {
    name: input.name.trim(),
    price: Number(input.price),
    sku: input.sku ?? null,
    stock: input.stock ?? 0,
    active: input.active ?? true,
  };

  const { data } = await http.post("/products", body);
  return normalize(data);
}

/**
 * Actualizar propiedades (nombre, precio, sku, categoría, etc.)
 */
export async function updateProduct(
  id: Product["id"],
  patch: Partial<ProductInput>
): Promise<Product> {
  if (USE_MOCK) {
    const idx = productsMock.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) {
      productsMock[idx] = { ...productsMock[idx], ...patch };
      if (__DEV__) console.debug("[products] MOCK update", productsMock[idx]);
      return productsMock[idx];
    }
    throw new Error("Producto no encontrado (MOCK)");
  }

  if (__DEV__) console.debug("[products] PUT /products/:id", id, patch);
  const { data } = await http.put<Product>(`/products/${id}`, patch);
  return { ...data, stock: data.stock ?? 0 };
}

/**
 * Establecer stock exacto
 */
export async function setStock(id: Product["id"], stock: number): Promise<Product> {
  if (USE_MOCK) {
    const idx = productsMock.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) {
      productsMock[idx] = { ...productsMock[idx], stock };
      if (__DEV__) console.debug("[products] MOCK setStock", productsMock[idx]);
      return productsMock[idx];
    }
    throw new Error("Producto no encontrado (MOCK)");
  }

  if (__DEV__) console.debug("[products] PATCH /products/:id/stock -> { stock }", id, stock);
  const { data } = await http.patch<Product>(`/products/${id}/stock`, { stock });
  return { ...data, stock: data.stock ?? 0 };
}

/**
 * Ajustar stock (+/-)
 */
export async function adjustStock(id: Product["id"], delta: number): Promise<Product> {
  if (USE_MOCK) {
    const idx = productsMock.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) {
      const newStock = Math.max(0, (productsMock[idx].stock ?? 0) + delta);
      productsMock[idx] = { ...productsMock[idx], stock: newStock };
      if (__DEV__) console.debug("[products] MOCK adjustStock", productsMock[idx]);
      return productsMock[idx];
    }
    throw new Error("Producto no encontrado (MOCK)");
  }

  if (__DEV__) console.debug("[products] PATCH /products/:id/stock -> { delta }", id, delta);
  const { data } = await http.patch<Product>(`/products/${id}/stock`, { delta });
  return { ...data, stock: data.stock ?? 0 };
}
