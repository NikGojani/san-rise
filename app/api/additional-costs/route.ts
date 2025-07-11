import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { AdditionalCost } from '@/lib/schemas/additional-cost'

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
    const newCost = await request.json()
    
    const { data, error } = await supabase
      .from('additional_costs')
      .insert([newCost])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der zusätzlichen Kosten' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
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
    const body = await request.json()
    const costs = await loadAdditionalCosts()
    
    const index = costs.findIndex(cost => cost.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Kosten nicht gefunden' }, { status: 404 })
    }
    
    costs[index] = { ...costs[index], ...body }
    await saveAdditionalCosts(costs)
    
    return NextResponse.json(costs[index])
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren der Kosten' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
    }
    
    const costs = await loadAdditionalCosts()
    const filteredCosts = costs.filter(cost => cost.id !== id)
    
    if (filteredCosts.length === costs.length) {
      return NextResponse.json({ error: 'Kosten nicht gefunden' }, { status: 404 })
    }
    
    await saveAdditionalCosts(filteredCosts)
    
    return NextResponse.json({ message: 'Kosten gelöscht' })
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen der Kosten' }, { status: 500 })
  }
} 