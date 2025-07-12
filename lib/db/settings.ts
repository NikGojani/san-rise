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
    throw error
  }

  return settings
} 