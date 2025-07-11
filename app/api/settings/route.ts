import { NextResponse } from 'next/server'
import { settingsSchema } from '@/lib/schemas/settings'
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
    const validatedSettings = settingsSchema.parse(body)
    
    // Konvertiere das validierte Schema in das Datenbankformat
    const dbData = {
      companyName: validatedSettings.companyName,
      gemaPercentage: validatedSettings.gemaPercentage,
      currency: validatedSettings.currency,
      logoUrl: validatedSettings.logoUrl || null,
      logoText: validatedSettings.logoText || null,
      nikPercentage: validatedSettings.profitDistribution.nik,
      adrianPercentage: validatedSettings.profitDistribution.adrian,
      sebastianPercentage: validatedSettings.profitDistribution.sebastian,
      mexifyPercentage: validatedSettings.profitDistribution.mexify,
    }
    
    const settings = await updateSettings(dbData)
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Fehler beim Speichern der Einstellungen' }, { status: 500 })
  }
} 