import { create } from 'zustand';

type CartItem = { sku: string; name: string; price: number; qty: number; };
type State = {
  items: CartItem[];
  addItem: (p: { sku: string; name: string; price: number }) => void;
  removeItem: (sku: string) => void;
  total: () => number;
  clear: () => void;
};

export const useCart = create<State>((set, get) => ({
  items: [],
  addItem: (p) => set(({ items }) => {
    const f = items.find(i => i.sku === p.sku);
    if (f) { f.qty += 1; return { items: [...items] }; }
    return { items: [...items, { ...p, qty: 1 }] };
  }),
  removeItem: (sku) => set(({ items }) => ({ items: items.filter(i => i.sku !== sku) })),
  total: () => get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
  clear: () => set({ items: [] }),
}));
