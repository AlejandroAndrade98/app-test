// ---------- Productos ----------
export type ProductId = number;

export type Product = {
  id: ProductId;
  name: string;
  price: number;
  stock: number;
  sku?: string | null;
  active?: boolean;
  imageUrl?: string | null;
};

export type ProductInput = {
  name: string;
  price: number;
  sku?: string;   // opcional
  stock?: number; // solo al crear
  imageUrl?: string | null; // opcional
  active?: boolean;
};

// ---------- Ventas (tu definición existente) ----------
export type SaleItemInput = { sku: string; qty: number };
export type SaleCreateInput = {
  userId: number;
  cashSessionId: number | null;
  paymentMethod: string;
  items: SaleItemInput[];
};

// ---------- Reportes ----------
/** Resumen que ya usas para el reporte diario */
export type DailyReport = {
  date: string;
  range: { from: string; to: string };
  sales: { count: number; sumTotal: number; avgTicket: number };
  byPayment: { paymentMethod: string; total: number }[];
};
export type RangeReport = {
  from: string;
  to: string;
  days: { day: string; count: number; sumTotal: number }[];
  sales?: { count: number; sumTotal: number; avgTicket: number }; // <- mejor opcional por si el backend no lo manda
};

/** Filas tabulares para exportar a PDF/tabla (diario o mensual) */
export type ReportRow = {
  date: string;     // ISO o yyyy-mm-dd
  items: number;    // unidades vendidas
  subtotal: number; // sin impuestos (si aplica)
  total: number;    // total cobrando todo
};

// ---------- Metas ----------
export type Goals = {
  dailyTarget: number;
  monthlyTarget: number;
};

// ---------- Helpers opcionales para mapear formatos ----------
/** Convierte tu DailyReport (resumen) a una tabla simple para exportar */
export function mapDailyToRows(r: DailyReport): ReportRow[] {
  return [
    {
      date: r.date,
      items: r.sales.count,
      // Si "sumTotal" ya es total, puedes duplicarlo o ajustar según tu regla
      subtotal: r.sales.sumTotal,
      total: r.sales.sumTotal,
    },
  ];
}

export function mapMonthlyToRows(r: RangeReport): ReportRow[] {
  return r.days.map(d => ({
    date: d.day,
    items: d.count,
    subtotal: d.sumTotal,
    total: d.sumTotal,
  }));
}