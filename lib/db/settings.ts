import { supabase } from '@/lib/supabase'

export async function getSettings() {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching settings:', error)
    // Wenn keine Einstellungen gefunden werden, erstelle Standardeinstellungen
    if (error.code === 'PGRST116') {
      return createDefaultSettings()
    }
    return null
  }

  return settings
}

async function createDefaultSettings() {
  const defaultSettings = {
    id: 1,
    companyName: 'SAN RISE GMBH',
    gemaPercentage: 9,
    currency: 'EUR',
    logoUrl: null,
    logoText: 'SAN RISE GMBH',
    nikPercentage: 31.5,
    adrianPercentage: 31.5,
    sebastianPercentage: 17,
    mexifyPercentage: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: settings, error } = await supabase
    .from('settings')
    .insert([defaultSettings])
    .select()
    .single()

  if (error) {
    console.error('Error creating default settings:', error)
    return defaultSettings
  }

  return settings
}

export async function updateSettings(data: {
  companyName: string
  gemaPercentage: number
  currency: string
  logoUrl?: string | null
  logoText?: string | null
  nikPercentage: number
  adrianPercentage: number
  sebastianPercentage: number
  mexifyPercentage: number
}) {
  // Validiere die Gewinnverteilung
  const totalPercentage = data.nikPercentage + data.adrianPercentage + data.sebastianPercentage + data.mexifyPercentage
  if (Math.abs(totalPercentage - 100) > 0.1) {
    throw new Error('Die Gewinnverteilung muss insgesamt 100% ergeben')
  }

  const { data: settings, error } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      ...data,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating settings:', error)
    throw new Error('Fehler beim Speichern der Einstellungen')
  }

  return settings
} 