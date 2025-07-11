import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: corporateCosts, error } = await supabase
      .from('corporate_costs')
      .select('*')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Unternehmenskosten' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      amount: corporateCosts?.amount || 0
    })
  } catch (error) {
    console.error('Error fetching corporate costs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Unternehmenskosten' },
      { status: 500 }
    )
  }
} 