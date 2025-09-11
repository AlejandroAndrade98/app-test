export type Product = {
  id: number | string;
  sku: string;
  name: string;
  price: number;
  stock?: number;

  // Opcionales: dependiendo de cómo guardes en la DB / API
  image_url?: string;  // snake_case (ej. en Supabase/Postgres)
  imageUrl?: string;   // camelCase
  image?: string;      // genérico
};

export type SaleItemInput = { sku: string; qty: number };
export type SaleCreateInput = {
  userId: number;
  cashSessionId: number | null;
  paymentMethod: string;
  items: SaleItemInput[];
};

export type DailyReport = {
  date: string;
  range: { from: string; to: string };
  sales: { count: number; sumTotal: number; avgTicket: number };
  byPayment: { paymentMethod: string; total: number }[];
};
