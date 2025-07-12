import { NextResponse } from 'next/server'
import { settingsSchema } from '@/lib/schemas/settings'
import { getSettings, updateSettings } from '@/lib/db/settings'

export async function GET() {
  try {
    const settings = await getSettings()
    
    if (!settings) {
      return NextResponse.json({ error: 'Einstellungen nicht gefunden' }, { status: 404 })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Einstellungen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validiere die eingehenden Daten mit Zod
    const validationResult = settingsSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error)
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validatedSettings = validationResult.data
    
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
    console.error('Error in POST /api/settings:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Fehler beim Speichern der Einstellungen' }, { status: 500 })
  }
} 