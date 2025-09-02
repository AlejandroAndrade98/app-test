export type Product = {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
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
