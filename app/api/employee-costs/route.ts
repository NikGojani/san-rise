import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Lade die Mitarbeiterdaten direkt von Supabase
    const { data: allEmployees, error } = await supabase
      .from('employees')
      .select('*')

    if (error) {
      throw error
    }

    // Filtere nur aktive Mitarbeiter für Kostenberechnung
    const activeEmployees = allEmployees.filter(employee => employee.is_active)
    
    // Berechne Gesamtmonatskosten nur für aktive Mitarbeiter
    const totalMonthlyCosts = activeEmployees.reduce((total, employee) => {
      const grossSalary = employee.brutto || 0
      const additionalCostsPercentage = employee.additional_cc || 0
      const additionalCosts = (grossSalary * additionalCostsPercentage) / 100
      const totalMonthlyCost = grossSalary + additionalCosts

      return total + totalMonthlyCost
    }, 0)

    return NextResponse.json({
      totalMonthlyCosts,
      employeeCount: activeEmployees.length,
      totalEmployees: allEmployees.length,
      inactiveEmployees: allEmployees.length - activeEmployees.length,
      breakdown: activeEmployees.map(emp => ({
        name: emp.name,
        grossSalary: emp.brutto || 0,
        additionalCosts: ((emp.brutto || 0) * (emp.additional_cc || 0)) / 100,
        additionalCostsPercentage: emp.additional_cc || 0,
        totalCost: (emp.brutto || 0) + ((emp.brutto || 0) * (emp.additional_cc || 0)) / 100
      }))
    })
  } catch (error) {
    console.error('Error calculating employee costs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Berechnen der Mitarbeiterkosten' },
      { status: 500 }
    )
  }
} 