import { z } from 'zod'

export const additionalCostSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name ist erforderlich'),
  amount: z.number().min(0, 'Betrag muss positiv sein'),
  category: z.string().min(1, 'Kategorie ist erforderlich'),
  type: z.enum(['one-time', 'monthly', 'yearly']),
  date: z.string().min(1, 'Datum ist erforderlich'),
  description: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string(),
    uploadedAt: z.string(),
  })).optional().default([]),
})

export type AdditionalCost = z.infer<typeof additionalCostSchema>

// Hilfsfunktionen für Berechnungen
export function calculateMonthlyCostImpact(cost: AdditionalCost, targetMonth: Date): number {
  const costDate = new Date(cost.date)
  const targetMonthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1)
  const targetMonthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)

  switch (cost.type) {
    case 'monthly':
      // Monatliche Kosten gelten für jeden Monat ab dem Startdatum
      if (costDate <= targetMonthEnd) {
        return cost.amount
      }
      return 0

    case 'yearly':
      // Jährliche Kosten werden auf 12 Monate aufgeteilt
      if (costDate <= targetMonthEnd) {
        return cost.amount / 12
      }
      return 0

    case 'one-time':
      // Einmalige Kosten gelten nur für den Monat, in dem sie anfallen
      if (costDate >= targetMonthStart && costDate <= targetMonthEnd) {
        return cost.amount
      }
      return 0

    default:
      return 0
  }
} 