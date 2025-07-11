import { z } from 'zod'

export const settingsSchema = z.object({
  companyName: z.string().min(1, 'Firmenname ist erforderlich'),
  gemaPercentage: z.number().min(0).max(100),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  logoUrl: z.string().optional().transform(val => val === '' ? undefined : val),
  logoText: z.string().optional().transform(val => val === '' ? undefined : val),
  profitDistribution: z.object({
    nik: z.number().min(0).max(100),
    adrian: z.number().min(0).max(100),
    sebastian: z.number().min(0).max(100),
    mexify: z.number().min(0).max(100),
  }).refine((data) => {
    const total = data.nik + data.adrian + data.sebastian + data.mexify
    return total === 100
  }, 'Die Gewinnverteilung muss insgesamt 100% ergeben'),
})

export type Settings = z.infer<typeof settingsSchema> 