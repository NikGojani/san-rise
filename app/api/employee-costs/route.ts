import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Lade die aktuellen Mitarbeiterdaten von der Mitarbeiter-API
    const response = await fetch('/api/employees', {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Mitarbeiter')
    }
    
    const allEmployees = await response.json()
    
    // Filtere nur aktive Mitarbeiter für Kostenberechnung
    const activeEmployees = allEmployees.filter((employee: any) => employee.isActive)
    
    // Berechne Gesamtmonatskosten nur für aktive Mitarbeiter
    const totalMonthlyCosts = activeEmployees.reduce((total: number, employee: any) => {
      return total + employee.totalMonthlyCosts
    }, 0)

    return NextResponse.json({
      totalMonthlyCosts,
      employeeCount: activeEmployees.length,
      totalEmployees: allEmployees.length,
      inactiveEmployees: allEmployees.length - activeEmployees.length,
      breakdown: activeEmployees.map((emp: any) => ({
        name: emp.name,
        grossSalary: emp.grossSalary,
        additionalCosts: emp.additionalCosts,
        additionalCostsPercentage: emp.additionalCostsPercentage,
        totalCost: emp.totalMonthlyCosts
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