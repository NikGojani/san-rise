import { NextResponse } from 'next/server'
import type { Employee } from '@/lib/schemas/employee'
import { calculateAdditionalCosts, calculateTotalMonthlyCosts } from '@/lib/schemas/employee'
import { supabase, type SupabaseEmployee } from '@/lib/supabase'

// Hilfsfunktion: Supabase Employee zu App Employee konvertieren
function mapSupabaseToEmployee(supabaseEmployee: any): Employee {
  return {
    id: supabaseEmployee.id,
    name: supabaseEmployee.name,
    address: supabaseEmployee.address,
    role: supabaseEmployee.role,
    grossSalary: Number(supabaseEmployee.grossSalary) || 0,
    netSalary: Number(supabaseEmployee.netSalary) || 0,
    additionalCostsPercentage: Number(supabaseEmployee.additionalCostsPercentage) || 20,
    startDate: supabaseEmployee.startDate || '',
    email: supabaseEmployee.email || '',
    phone: supabaseEmployee.phone || '',
    isActive: supabaseEmployee.isActive ?? true,
    files: supabaseEmployee.files || [],
  }
}

// Hilfsfunktion: App Employee zu Supabase Employee konvertieren
function mapEmployeeToSupabase(employee: Partial<Employee>): any {
  return {
    name: employee.name,
    address: employee.address,
    role: employee.role,
    grossSalary: employee.grossSalary,
    netSalary: employee.netSalary,
    additionalCostsPercentage: employee.additionalCostsPercentage,
    startDate: employee.startDate,
    email: employee.email,
    phone: employee.phone,
    isActive: employee.isActive,
    files: employee.files,
  }
}

// Hilfsfunktion um Mitarbeiterdaten mit berechneten Werten zu erweitern
function enrichEmployeeData(employee: Employee) {
  // Stelle sicher, dass die Werte Numbers sind (Schutz gegen NaN)
  const grossSalary = Number(employee.grossSalary) || 0
  const additionalCostsPercentage = Number(employee.additionalCostsPercentage) || 0
  
  const additionalCosts = calculateAdditionalCosts(grossSalary, additionalCostsPercentage)
  const totalMonthlyCosts = calculateTotalMonthlyCosts(grossSalary, additionalCostsPercentage)
  
  return {
    ...employee,
    grossSalary, // Stelle sicher dass es ein Number ist
    additionalCostsPercentage, // Stelle sicher dass es ein Number ist
    additionalCosts, // Automatisch berechnet
    totalMonthlyCosts // Automatisch berechnet
  }
}

export async function GET() {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('name')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Mitarbeiter' },
        { status: 500 }
      )
    }

    // Konvertiere Supabase-Daten zu App-Format und erweitere um berechnete Werte
    const mappedEmployees = employees?.map(mapSupabaseToEmployee) || []
    const enrichedEmployees = mappedEmployees.map(enrichEmployeeData)
    
    return NextResponse.json(enrichedEmployees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Mitarbeiter' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const newEmployee = await request.json()
    
    // Konvertiere numerische Felder von Strings zu Numbers um NaN zu vermeiden
    const sanitizedEmployee: Partial<Employee> = {
      ...newEmployee,
      grossSalary: typeof newEmployee.grossSalary === 'string' ? parseFloat(newEmployee.grossSalary) : newEmployee.grossSalary,
      netSalary: typeof newEmployee.netSalary === 'string' ? parseFloat(newEmployee.netSalary) : newEmployee.netSalary,
      additionalCostsPercentage: typeof newEmployee.additionalCostsPercentage === 'string' ? parseFloat(newEmployee.additionalCostsPercentage) : newEmployee.additionalCostsPercentage,
    }
    
    // Konvertiere zu Supabase-Format
    const supabaseData = mapEmployeeToSupabase(sanitizedEmployee)
    
    const { data, error } = await supabase
      .from('employees')
      .insert([supabaseData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Erstellen des Mitarbeiters' },
        { status: 500 }
      )
    }

    // Konvertiere zurück zu App-Format und erweitere um berechnete Werte
    const mappedEmployee = mapSupabaseToEmployee(data)
    const enrichedEmployee = enrichEmployeeData(mappedEmployee)
    
    return NextResponse.json(enrichedEmployee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Mitarbeiters' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const updatedEmployee = await request.json()
    
    if (!updatedEmployee.id) {
      return NextResponse.json(
        { error: 'Mitarbeiter-ID erforderlich' },
        { status: 400 }
      )
    }
    
    // Konvertiere numerische Felder von Strings zu Numbers um NaN zu vermeiden
    const sanitizedEmployee: Partial<Employee> = {
      ...updatedEmployee,
      grossSalary: typeof updatedEmployee.grossSalary === 'string' ? parseFloat(updatedEmployee.grossSalary) : updatedEmployee.grossSalary,
      netSalary: typeof updatedEmployee.netSalary === 'string' ? parseFloat(updatedEmployee.netSalary) : updatedEmployee.netSalary,
      additionalCostsPercentage: typeof updatedEmployee.additionalCostsPercentage === 'string' ? parseFloat(updatedEmployee.additionalCostsPercentage) : updatedEmployee.additionalCostsPercentage,
    }
    
    // Konvertiere zu Supabase-Format (ohne ID)
    const { id, ...updateData } = sanitizedEmployee
    const supabaseData = mapEmployeeToSupabase(updateData)
    
    const { data, error } = await supabase
      .from('employees')
      .update(supabaseData)
      .eq('id', updatedEmployee.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Mitarbeiters' },
        { status: 500 }
      )
    }

    // Konvertiere zurück zu App-Format und erweitere um berechnete Werte
    const mappedEmployee = mapSupabaseToEmployee(data)
    const enrichedEmployee = enrichEmployeeData(mappedEmployee)
    
    return NextResponse.json(enrichedEmployee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Mitarbeiters' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Mitarbeiter-ID erforderlich' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Mitarbeiters' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Mitarbeiters' },
      { status: 500 }
    )
  }
}

// Zusätzliche Route für das Pausieren/Aktivieren von Mitarbeitern
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isActive } = body
    
    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Mitarbeiter-ID und isActive Status erforderlich' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('employees')
      .update({ isActive: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Mitarbeiters' },
        { status: 500 }
      )
    }

    // Konvertiere zurück zu App-Format und erweitere um berechnete Werte
    const mappedEmployee = mapSupabaseToEmployee(data)
    const enrichedEmployee = enrichEmployeeData(mappedEmployee)
    
    return NextResponse.json(enrichedEmployee)
  } catch (error) {
    console.error('Error updating employee status:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Mitarbeiterstatus' },
      { status: 500 }
    )
  }
} 