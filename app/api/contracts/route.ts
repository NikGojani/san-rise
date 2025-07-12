import { NextResponse } from 'next/server'
import type { Contract } from '@/lib/schemas/contract'
import { supabase } from '@/lib/supabase'

// Hilfsfunktion: Supabase Contract zu App Contract konvertieren
function mapSupabaseToContract(supabaseContract: any): Contract {
  return {
    id: supabaseContract.id,
    name: supabaseContract.name,
    amount: Number(supabaseContract.amount) || 0,
    category: supabaseContract.category,
    interval: supabaseContract.interval as Contract['interval'],
    startDate: supabaseContract.start_date || '',
    endDate: supabaseContract.end_date || undefined,
    attachments: supabaseContract.attachments || [],
  }
}

// Hilfsfunktion: App Contract zu Supabase Contract konvertieren
function mapContractToSupabase(contract: Partial<Contract>): any {
  return {
    name: contract.name,
    amount: contract.amount,
    category: contract.category,
    interval: contract.interval,
    start_date: contract.startDate || null,
    end_date: contract.endDate && contract.endDate.trim() !== '' ? contract.endDate : null,
    attachments: contract.attachments || [],
  }
}

export async function GET() {
  try {
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('*')
      .order('name')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Verträge' },
        { status: 500 }
      )
    }

    // Konvertiere Supabase-Daten zu App-Format
    const mappedContracts = contracts?.map(mapSupabaseToContract) || []
    
    return NextResponse.json(mappedContracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Verträge' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Konvertiere zu Supabase-Format
    const supabaseData = mapContractToSupabase(body)
    
    const { data, error } = await supabase
      .from('contracts')
      .insert([supabaseData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Vertrags' },
        { status: 500 }
      )
    }

    // Konvertiere zurück zu App-Format
    const mappedContract = mapSupabaseToContract(data)
    
    return NextResponse.json(mappedContract)
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern des Vertrags' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'Vertrag-ID ist erforderlich' }, { status: 400 })
    }
    
    // Konvertiere zu Supabase-Format (ohne ID)
    const { id, ...updateData } = body
    const supabaseData = mapContractToSupabase(updateData)
    
    const { data, error } = await supabase
      .from('contracts')
      .update(supabaseData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Vertrags' },
        { status: 500 }
      )
    }

    // Konvertiere zurück zu App-Format
    const mappedContract = mapSupabaseToContract(data)
    
    return NextResponse.json(mappedContract)
  } catch (error) {
    console.error('Error updating contract:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Vertrags' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Vertrags' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Vertrag gelöscht' })
  } catch (error) {
    console.error('Error deleting contract:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen des Vertrags' }, { status: 500 })
  }
} 