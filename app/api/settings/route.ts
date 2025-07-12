import { NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/db/settings'

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Einstellungen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Direkte Verwendung der Daten ohne Schema-Validierung für jetzt
    const dbData = {
      companyName: body.companyName || 'SAN RISE GMBH',
      gemaPercentage: body.gemaPercentage || 9,
      currency: body.currency || 'EUR',
      logoUrl: body.logoUrl || null,
      logoText: body.logoText || 'SAN RISE GMBH',
      nikPercentage: body.profitDistribution?.nik || 31.5,
      adrianPercentage: body.profitDistribution?.adrian || 31.5,
      sebastianPercentage: body.profitDistribution?.sebastian || 17,
      mexifyPercentage: body.profitDistribution?.mexify || 20,
    }
    
    const settings = await updateSettings(dbData)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings API Error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Fehler beim Speichern der Einstellungen' }, { status: 500 })
  }
} 