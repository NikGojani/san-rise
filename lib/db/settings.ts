import { supabase } from '@/lib/supabase'

export async function getSettings() {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching settings:', error)
    return null
  }

  // Konvertiere snake_case zu camelCase für Frontend
  if (settings) {
    return {
      id: settings.id,
      companyName: settings.company_name,
      gemaPercentage: settings.gema_percentage,
      currency: settings.currency,
      logoUrl: settings.logo_url,
      logoText: settings.logo_text,
      nikPercentage: settings.nik_percentage,
      adrianPercentage: settings.adrian_percentage,
      sebastianPercentage: settings.sebastian_percentage,
      mexifyPercentage: settings.mexify_percentage,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at,
    }
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
  // Konvertiere camelCase zu snake_case für Datenbank
  const dbData = {
    company_name: data.companyName,
    gema_percentage: data.gemaPercentage,
    currency: data.currency,
    logo_url: data.logoUrl || null,
    logo_text: data.logoText || null,
    nik_percentage: data.nikPercentage,
    adrian_percentage: data.adrianPercentage,
    sebastian_percentage: data.sebastianPercentage,
    mexify_percentage: data.mexifyPercentage,
    updated_at: new Date().toISOString()
  }

  const { data: settings, error } = await supabase
    .from('settings')
    .upsert(dbData)
    .select()
    .single()

  if (error) {
    console.error('Error updating settings:', error)
    throw error
  }

  return settings
} 