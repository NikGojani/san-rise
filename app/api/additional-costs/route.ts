import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { additionalCostSchema, type AdditionalCost } from '@/lib/schemas/additional-cost'

export async function GET() {
  try {
    const { data: costs, error } = await supabase
      .from('additional_costs')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der zusätzlichen Kosten' },
        { status: 500 }
      )
    }

    // Konvertiere Supabase-Format zu AdditionalCost-Format
    const additionalCosts: AdditionalCost[] = costs.map(cost => ({
      id: cost.id,
      name: cost.name,
      amount: Number(cost.amount),
      category: cost.category,
      type: cost.type,
      date: cost.date,
      description: cost.description || undefined,
      attachments: cost.attachments || [],
    }))

    return NextResponse.json(additionalCosts)
  } catch (error) {
    console.error('Error loading additional costs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der zusätzlichen Kosten' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validiere die eingehenden Daten mit Zod
    const validationResult = additionalCostSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error)
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const newCost = validationResult.data
    
    // Validiere die Anhänge
    if (newCost.attachments?.length > 0) {
      for (const attachment of newCost.attachments) {
        if (!attachment.url || !attachment.url.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
          return NextResponse.json(
            { error: 'Ungültige Datei-URL' },
            { status: 400 }
          )
        }
      }
    }
    
    // Stelle sicher, dass numerische Werte als Zahlen gespeichert werden
    const dbCost = {
      ...newCost,
      amount: Number(newCost.amount),
      attachments: newCost.attachments || [],
    }
    
    const { data, error } = await supabase
      .from('additional_costs')
      .insert([dbCost])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der zusätzlichen Kosten' },
        { status: 500 }
      )
    }

    // Konvertiere zurück zum AdditionalCost-Format
    const savedCost: AdditionalCost = {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      category: data.category,
      type: data.type,
      date: data.date,
      description: data.description || undefined,
      attachments: data.attachments || [],
    }

    return NextResponse.json(savedCost)
  } catch (error) {
    console.error('Error saving additional cost:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der zusätzlichen Kosten' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const updatedCost = await request.json()
    
    if (!updatedCost.id) {
      return NextResponse.json(
        { error: 'Kosten-ID erforderlich' },
        { status: 400 }
      )
    }

    // Validiere die eingehenden Daten mit Zod
    const validationResult = additionalCostSchema.safeParse(updatedCost)
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error)
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('additional_costs')
      .update(updatedCost)
      .eq('id', updatedCost.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der Kosten' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating cost:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kosten' },
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
        { error: 'Keine ID angegeben' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('additional_costs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Löschen der zusätzlichen Kosten' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting additional cost:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der zusätzlichen Kosten' },
      { status: 500 }
    )
  }
} 