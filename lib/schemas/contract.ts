import { z } from 'zod'

export const contractSchema = z.object({
  name: z.string().min(1, 'Vertragsname ist erforderlich'),
  amount: z.number().min(0, 'Betrag muss positiv sein'),
  category: z.string().min(1, 'Kategorie ist erforderlich'),
  interval: z.enum(['monthly', 'yearly', 'once'], {
    errorMap: () => ({ message: 'Bitte wählen Sie ein gültiges Intervall' }),
  }),
  startDate: z.string().min(1, 'Startdatum ist erforderlich'),
  endDate: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
    uploadedAt: z.string(),
  })).default([]),
})

export type Contract = z.infer<typeof contractSchema> & {
  id: string
}

export const calculateMonthlyAmount = (amount: number, interval: Contract['interval']) => {
  switch (interval) {
    case 'monthly':
      return amount
    case 'yearly':
      return amount / 12
    case 'once':
      return 0 // Einmalige Kosten werden nicht in monatliche Berechnung einbezogen
    default:
      return 0
  }
}

export const calculateYearlyAmount = (amount: number, interval: Contract['interval']) => {
  switch (interval) {
    case 'monthly':
      return amount * 12
    case 'yearly':
      return amount
    case 'once':
      return amount // Einmalige Kosten werden als Jahreskosten angezeigt
    default:
      return 0
  }
} 