import { z } from 'zod'

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  role: z.string().min(1, 'Position ist erforderlich'),
  grossSalary: z.number().min(0, 'Bruttogehalt muss positiv sein'),
  netSalary: z.number().min(0, 'Nettogehalt muss positiv sein'),
  additionalCostsPercentage: z.number().min(0).max(100, 'Lohnnebenkosten-Prozentsatz muss zwischen 0 und 100% liegen').default(20), // Standardwert 20%
  address: z.string().min(1, 'Adresse ist erforderlich'),
  startDate: z.string().min(1, 'Eintrittsdatum ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().min(1, 'Telefonnummer ist erforderlich'),
  isActive: z.boolean().default(true),
  files: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
    uploadedAt: z.string(),
  })).default([]),
})

export type Employee = z.infer<typeof employeeSchema> & {
  id: string
}

// Erweiterte Employee-Type mit berechneten Feldern für API-Responses
export type EnrichedEmployee = Employee & {
  additionalCosts: number // Berechnet
  totalMonthlyCosts: number // Berechnet
}

// Hilfsfunktion zur Berechnung der Lohnnebenkosten
export function calculateAdditionalCosts(grossSalary: number, percentage: number): number {
  // Zusätzliche Sicherheit gegen NaN
  const salary = Number(grossSalary) || 0
  const percent = Number(percentage) || 0
  return Math.round((salary * percent) / 100)
}

// Hilfsfunktion zur Berechnung der Gesamtkosten
export function calculateTotalMonthlyCosts(grossSalary: number, additionalCostsPercentage: number): number {
  // Zusätzliche Sicherheit gegen NaN
  const salary = Number(grossSalary) || 0
  const additionalCosts = calculateAdditionalCosts(salary, additionalCostsPercentage)
  return salary + additionalCosts
} 