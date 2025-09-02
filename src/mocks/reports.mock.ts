import { DailyReport } from '../types';

export function dailyReportMock(): DailyReport {
  const now = new Date();
  const iso = now.toISOString();
  return {
    date: iso.slice(0, 10),
    range: { from: iso, to: iso },
    sales: { count: 3, sumTotal: 123000, avgTicket: 41000 },
    byPayment: [{ paymentMethod: 'cash', total: 123000 }],
  };
}
