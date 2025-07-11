import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export interface CalculatorConfig {
  id: string
  eventId: string
  vkPercentage: number
  termine: number
  gemaPercentage: number
  marketingCosts: number
  artistCosts: number
  locationCosts: number
  merchandiserCosts: number
  travelCosts: number
  rabatt: number
  aufbauhelfer: number
  variableCosts: number
  ticketingFee: number
  createdAt: string
  updatedAt: string
}

export interface SupabaseCalculatorConfig {
  id: string
  event_id: string
  vk_percentage: number
  termine: number
  gema_percentage: number
  marketing_costs: number
  artist_costs: number
  location_costs: number
  merchandiser_costs: number
  travel_costs: number
  rabatt: number
  aufbauhelfer: number
  variable_costs: number
  ticketing_fee: number
  created_at: string
  updated_at: string
}

// Mapping-Funktionen
const mapSupabaseToApp = (supabaseConfig: SupabaseCalculatorConfig): CalculatorConfig => ({
  id: supabaseConfig.id,
  eventId: supabaseConfig.event_id,
  vkPercentage: supabaseConfig.vk_percentage,
  termine: supabaseConfig.termine,
  gemaPercentage: supabaseConfig.gema_percentage,
  marketingCosts: supabaseConfig.marketing_costs,
  artistCosts: supabaseConfig.artist_costs,
  locationCosts: supabaseConfig.location_costs,
  merchandiserCosts: supabaseConfig.merchandiser_costs,
  travelCosts: supabaseConfig.travel_costs,
  rabatt: supabaseConfig.rabatt,
  aufbauhelfer: supabaseConfig.aufbauhelfer,
  variableCosts: supabaseConfig.variable_costs,
  ticketingFee: supabaseConfig.ticketing_fee,
  createdAt: supabaseConfig.created_at,
  updatedAt: supabaseConfig.updated_at,
})

const mapAppToSupabase = (appConfig: Partial<CalculatorConfig>): Partial<SupabaseCalculatorConfig> => ({
  event_id: appConfig.eventId,
  vk_percentage: appConfig.vkPercentage,
  termine: appConfig.termine,
  gema_percentage: appConfig.gemaPercentage,
  marketing_costs: appConfig.marketingCosts,
  artist_costs: appConfig.artistCosts,
  location_costs: appConfig.locationCosts,
  merchandiser_costs: appConfig.merchandiserCosts,
  travel_costs: appConfig.travelCosts,
  rabatt: appConfig.rabatt,
  aufbauhelfer: appConfig.aufbauhelfer,
  variable_costs: appConfig.variableCosts,
  ticketing_fee: appConfig.ticketingFee,
})

// GET - Calculator-Config für ein Event oder alle Events laden
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const loadAll = searchParams.get('all') === 'true'
    
    if (loadAll) {
      // Lade alle Calculator-Configs auf einmal (Performance-Optimierung)
      console.log('Loading all calculator configs')
      
      const { data: configs, error } = await supabase
        .from('calculator_configs')
        .select('*')

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { error: 'Fehler beim Laden der Calculator-Konfigurationen' },
          { status: 500 }
        )
      }

      const appConfigs = configs?.map(mapSupabaseToApp) || []
      return NextResponse.json(appConfigs)
    }
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event-ID erforderlich' },
        { status: 400 }
      )
    }

    console.log('Loading calculator config for event:', eventId)
    
    const { data: config, error } = await supabase
      .from('calculator_configs')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Calculator-Konfiguration' },
        { status: 500 }
      )
    }

    if (!config) {
      // Keine Konfiguration gefunden - Standard-Werte zurückgeben
      return NextResponse.json(null)
    }

    const appConfig = mapSupabaseToApp(config as SupabaseCalculatorConfig)
    return NextResponse.json(appConfig)
  } catch (error) {
    console.error('Error fetching calculator config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Calculator-Konfiguration' },
      { status: 500 }
    )
  }
}

// POST - Neue Calculator-Config erstellen
export async function POST(request: Request) {
  try {
    const configData: Partial<CalculatorConfig> = await request.json()
    console.log('Creating calculator config:', configData)

    if (!configData.eventId) {
      return NextResponse.json(
        { error: 'Event-ID erforderlich' },
        { status: 400 }
      )
    }

    const supabaseConfig = mapAppToSupabase(configData)
    
    const { data, error } = await supabase
      .from('calculator_configs')
      .insert([supabaseConfig])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Erstellen der Calculator-Konfiguration' },
        { status: 500 }
      )
    }

    const appConfig = mapSupabaseToApp(data as SupabaseCalculatorConfig)
    return NextResponse.json(appConfig, { status: 201 })
  } catch (error) {
    console.error('Error creating calculator config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Calculator-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Calculator-Config aktualisieren
export async function PUT(request: Request) {
  try {
    const configData: CalculatorConfig = await request.json()
    console.log('Updating calculator config:', configData)
    
    if (!configData.eventId) {
      return NextResponse.json(
        { error: 'Event-ID erforderlich' },
        { status: 400 }
      )
    }

    const supabaseConfig = mapAppToSupabase(configData)
    
    // Erst prüfen, ob bereits eine Konfiguration für diese Event-ID existiert
    const { data: existingConfig, error: checkError } = await supabase
      .from('calculator_configs')
      .select('id')
      .eq('event_id', configData.eventId)
      .single()

    let data, error

    if (existingConfig) {
      // Update existierende Konfiguration
      const result = await supabase
        .from('calculator_configs')
        .update(supabaseConfig)
        .eq('event_id', configData.eventId)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Erstelle neue Konfiguration
      const result = await supabase
        .from('calculator_configs')
        .insert([{ ...supabaseConfig, event_id: configData.eventId }])
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der Calculator-Konfiguration' },
        { status: 500 }
      )
    }

    const appConfig = mapSupabaseToApp(data as SupabaseCalculatorConfig)
    return NextResponse.json(appConfig)
  } catch (error) {
    console.error('Error updating calculator config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Calculator-Konfiguration' },
      { status: 500 }
    )
  }
}

// DELETE - Calculator-Config löschen
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event-ID erforderlich' },
        { status: 400 }
      )
    }

    console.log('Deleting calculator config for event:', eventId)
    
    const { error } = await supabase
      .from('calculator_configs')
      .delete()
      .eq('event_id', eventId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Löschen der Calculator-Konfiguration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calculator config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Calculator-Konfiguration' },
      { status: 500 }
    )
  }
} 