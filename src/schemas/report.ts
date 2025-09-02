import { z } from "zod";

export const DailyReportSchema = z.object({
  date: z.string(), // 'YYYY-MM-DD'
  range: z.object({
    from: z.string().or(z.date()).transform((v) => String(v)),
    to: z.string().or(z.date()).transform((v) => String(v)),
  }),
  sales: z.object({
    count: z.number().nonnegative(),
    sumTotal: z.number().nonnegative(),
    avgTicket: z.number().nonnegative(),
  }),
  byPayment: z.array(
    z.object({
      paymentMethod: z.string(),
      total: z.number().nonnegative(),
    })
  ),
  // Tu endpoint devuelve además topProducts → lo incluimos como opcional
  topProducts: z
    .array(
      z.object({
        productId: z.number(),
        sku: z.string(),
        name: z.string(),
        qty: z.number().nonnegative(),
        total: z.number().nonnegative(),
      })
    )
    .optional(),
});
export const RangeDaySchema = z.object({
  day: z.string(), // 'YYYY-MM-DD'
  count: z.number().nonnegative(),
  sumTotal: z.number().nonnegative(),
  avgTicket: z.number().nonnegative(),
});

export const RangeReportSchema = z.object({
  from: z.string(),
  to: z.string(),
  days: z.array(RangeDaySchema),
});

export type RangeReport = z.infer<typeof RangeReportSchema>;
export type DailyReport = z.infer<typeof DailyReportSchema>;
