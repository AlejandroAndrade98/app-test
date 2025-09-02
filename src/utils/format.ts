export const money = (n: number, currency: string = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(n);

export const datetimeLocal = (iso: string) =>
  new Date(iso).toLocaleString('es-CO');
