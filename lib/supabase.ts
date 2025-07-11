import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions für Supabase Tabellen
export interface SupabaseUser {
  id: string
  username: string
  display_name: string
  email: string | null
  password_hash: string
  role: 'admin' | 'team'
  avatar: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  last_login: string | null
}

export interface SupabaseEmployee {
  id: string
  name: string
  adresse: string
  position: string
  geburtsdatum: string | null
  einstellungsde: string | null // einstellungsdatum
  brutto: number
  netto: number
  email: string | null
  phone: string | null
  is_active: boolean | null
  additional_cc: number | null // additional_costs_percentage
  files: any[] | null
}

export interface SupabaseContract {
  id: string
  name: string
  betrag: number
  intervall: string
  kategorie: string
  start_date: string | null
  end_date: string | null
  attachments: any[] | null
}

export interface SupabaseTask {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  assigned_to: string
  due_date: string
  status: 'todo' | 'in-progress' | 'done'
  description: string | null
  drive_link: string | null
  created_at: string
  updated_at: string
}

export interface SupabaseEvent {
  id: string
  name: string
  description: string | null
  location: string | null
  date: string
  start_time: string | null
  end_time: string | null
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  price: number
  max_tickets: number
  termine: number // Termine pro Monat für Calculator
  tickets_sold: number
  revenue: number
  expenses: number
  profit: number // computed field
  
  // Shopify Integration
  shopify_product_id: string | null
  shopify_variant_id: string | null
  sync_with_shopify: boolean
  shopify_last_synced_at: string | null
  
  // Meta (Facebook/Instagram) Integration (optional für Abwärtskompatibilität)
  meta_event_id?: string | null
  meta_pixel_id?: string | null
  sync_with_meta?: boolean
  meta_last_synced_at?: string | null
  meta_campaign_id?: string | null
  meta_ad_account_id?: string | null
  meta_adset_id?: string | null
  
  // Google Ads Integration (optional für Abwärtskompatibilität)
  google_campaign_id?: string | null
  google_adgroup_id?: string | null
  google_ads_account_id?: string | null
  
  // Marketing Budget & Performance (optional für Abwärtskompatibilität)
  marketing_budget?: number
  marketing_spent?: number
  marketing_impressions?: number
  marketing_clicks?: number
  marketing_conversions?: number
  cost_per_click?: number
  cost_per_conversion?: number
  return_on_ad_spend?: number
  
  // Media
  image_url: string | null
  thumbnail_url: string | null
  
  // System
  created_at: string
  updated_at: string
}

// App Interface für Users
export interface AppUser {
  id: string
  username: string
  displayName: string
  email?: string
  role: 'admin' | 'team'
  avatar?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

// App Interface für Tasks (bleibt gleich)
export interface AppTask {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  dueDate: string
  status: 'todo' | 'in-progress' | 'done'
  description?: string
  driveLink?: string
}

// App Interface für Events (erweitert für Marketing Integration)
export interface AppEvent {
  id: string
  name: string
  description?: string
  location?: string
  date: string
  startTime?: string
  endTime?: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  price: number
  maxTickets: number
  termine: number // Termine pro Monat für Calculator
  ticketsSold: number
  revenue: number
  expenses: number
  profit: number
  
  // Shopify Integration
  shopifyProductId?: string
  shopifyVariantId?: string
  syncWithShopify: boolean
  shopifyLastSyncedAt?: string
  
  // Meta (Facebook/Instagram) Integration
  metaEventId?: string
  metaPixelId?: string
  syncWithMeta?: boolean
  metaLastSyncedAt?: string
  metaCampaignId?: string
  metaAdAccountId?: string
  metaAdsetId?: string
  
  // Google Ads Integration
  googleCampaignId?: string
  googleAdgroupId?: string
  googleAdsAccountId?: string
  
  // Marketing Budget & Performance
  marketingBudget?: number
  marketingSpent?: number
  marketingImpressions?: number
  marketingClicks?: number
  marketingConversions?: number
  costPerClick?: number
  costPerConversion?: number
  returnOnAdSpend?: number
  
  // Media
  imageUrl?: string
  thumbnailUrl?: string
}

// Mapping-Funktionen für Users
export const mapSupabaseUserToApp = (supabaseUser: SupabaseUser): AppUser => ({
  id: supabaseUser.id,
  username: supabaseUser.username,
  displayName: supabaseUser.display_name,
  email: supabaseUser.email || undefined,
  role: supabaseUser.role,
  avatar: supabaseUser.avatar || undefined,
  isActive: supabaseUser.is_active,
  createdAt: supabaseUser.created_at,
  lastLogin: supabaseUser.last_login || undefined,
})

export const mapAppUserToSupabase = (appUser: Partial<AppUser>): Partial<SupabaseUser> => ({
  username: appUser.username,
  display_name: appUser.displayName,
  email: appUser.email || null,
  role: appUser.role,
  avatar: appUser.avatar || null,
  is_active: appUser.isActive,
  last_login: appUser.lastLogin || null,
})

// Mapping-Funktionen für Tasks
export const mapSupabaseTaskToApp = (supabaseTask: SupabaseTask): AppTask => ({
  id: supabaseTask.id,
  title: supabaseTask.title,
  priority: supabaseTask.priority,
  assignedTo: supabaseTask.assigned_to,
  dueDate: supabaseTask.due_date,
  status: supabaseTask.status,
  description: supabaseTask.description || undefined,
  driveLink: supabaseTask.drive_link || undefined,
})

export const mapAppTaskToSupabase = (appTask: Partial<AppTask>): Partial<SupabaseTask> => ({
  title: appTask.title,
  priority: appTask.priority,
  assigned_to: appTask.assignedTo,
  due_date: appTask.dueDate,
  status: appTask.status,
  description: appTask.description || null,
  drive_link: appTask.driveLink || null,
})

// Mapping-Funktionen für Events
export const mapSupabaseEventToApp = (supabaseEvent: SupabaseEvent): AppEvent => ({
  id: supabaseEvent.id,
  name: supabaseEvent.name,
  description: supabaseEvent.description || undefined,
  location: supabaseEvent.location || undefined,
  date: supabaseEvent.date,
  startTime: supabaseEvent.start_time || undefined,
  endTime: supabaseEvent.end_time || undefined,
  status: supabaseEvent.status,
  price: supabaseEvent.price,
  maxTickets: supabaseEvent.max_tickets,
  termine: supabaseEvent.termine,
  ticketsSold: supabaseEvent.tickets_sold,
  revenue: supabaseEvent.revenue,
  expenses: supabaseEvent.expenses,
  profit: supabaseEvent.profit,
  
  // Shopify Integration
  shopifyProductId: supabaseEvent.shopify_product_id || undefined,
  shopifyVariantId: supabaseEvent.shopify_variant_id || undefined,
  syncWithShopify: supabaseEvent.sync_with_shopify,
  shopifyLastSyncedAt: supabaseEvent.shopify_last_synced_at || undefined,
  
  // Meta Integration (mit Fallbacks für Abwärtskompatibilität)
  metaEventId: supabaseEvent.meta_event_id || undefined,
  metaPixelId: supabaseEvent.meta_pixel_id || undefined,
  syncWithMeta: supabaseEvent.sync_with_meta || false,
  metaLastSyncedAt: supabaseEvent.meta_last_synced_at || undefined,
  metaCampaignId: supabaseEvent.meta_campaign_id || undefined,
  metaAdAccountId: supabaseEvent.meta_ad_account_id || undefined,
  metaAdsetId: supabaseEvent.meta_adset_id || undefined,
  
  // Google Ads Integration (mit Fallbacks für Abwärtskompatibilität)
  googleCampaignId: supabaseEvent.google_campaign_id || undefined,
  googleAdgroupId: supabaseEvent.google_adgroup_id || undefined,
  googleAdsAccountId: supabaseEvent.google_ads_account_id || undefined,
  
  // Marketing Performance (mit Fallback auf 0 falls Felder noch nicht existieren)
  marketingBudget: supabaseEvent.marketing_budget || 0,
  marketingSpent: supabaseEvent.marketing_spent || 0,
  marketingImpressions: supabaseEvent.marketing_impressions || 0,
  marketingClicks: supabaseEvent.marketing_clicks || 0,
  marketingConversions: supabaseEvent.marketing_conversions || 0,
  costPerClick: supabaseEvent.cost_per_click || 0,
  costPerConversion: supabaseEvent.cost_per_conversion || 0,
  returnOnAdSpend: supabaseEvent.return_on_ad_spend || 0,
  
  // Media
  imageUrl: supabaseEvent.image_url || undefined,
  thumbnailUrl: supabaseEvent.thumbnail_url || undefined,
})

export const mapAppEventToSupabase = (appEvent: Partial<AppEvent>): Partial<SupabaseEvent> => ({
  name: appEvent.name,
  description: appEvent.description || null,
  location: appEvent.location || null,
  date: appEvent.date,
  start_time: appEvent.startTime || null,
  end_time: appEvent.endTime || null,
  status: appEvent.status,
  price: appEvent.price,
  max_tickets: appEvent.maxTickets,
  termine: appEvent.termine,
  tickets_sold: appEvent.ticketsSold,
  revenue: appEvent.revenue,
  expenses: appEvent.expenses,
  
  // Shopify Integration
  shopify_product_id: appEvent.shopifyProductId || null,
  shopify_variant_id: appEvent.shopifyVariantId || null,
  sync_with_shopify: appEvent.syncWithShopify || false,
  shopify_last_synced_at: appEvent.shopifyLastSyncedAt || null,
  
  // Meta Integration (nur wenn Felder gesetzt sind)
  ...(appEvent.metaEventId !== undefined && { meta_event_id: appEvent.metaEventId || null }),
  ...(appEvent.metaPixelId !== undefined && { meta_pixel_id: appEvent.metaPixelId || null }),
  ...(appEvent.syncWithMeta !== undefined && { sync_with_meta: appEvent.syncWithMeta || false }),
  ...(appEvent.metaLastSyncedAt !== undefined && { meta_last_synced_at: appEvent.metaLastSyncedAt || null }),
  ...(appEvent.metaCampaignId !== undefined && { meta_campaign_id: appEvent.metaCampaignId || null }),
  ...(appEvent.metaAdAccountId !== undefined && { meta_ad_account_id: appEvent.metaAdAccountId || null }),
  ...(appEvent.metaAdsetId !== undefined && { meta_adset_id: appEvent.metaAdsetId || null }),
  
  // Google Ads Integration (nur wenn Felder gesetzt sind)
  ...(appEvent.googleCampaignId !== undefined && { google_campaign_id: appEvent.googleCampaignId || null }),
  ...(appEvent.googleAdgroupId !== undefined && { google_adgroup_id: appEvent.googleAdgroupId || null }),
  ...(appEvent.googleAdsAccountId !== undefined && { google_ads_account_id: appEvent.googleAdsAccountId || null }),
  
  // Marketing Performance (nur wenn Felder gesetzt sind)
  ...(appEvent.marketingBudget !== undefined && { marketing_budget: appEvent.marketingBudget || 0 }),
  ...(appEvent.marketingSpent !== undefined && { marketing_spent: appEvent.marketingSpent || 0 }),
  ...(appEvent.marketingImpressions !== undefined && { marketing_impressions: appEvent.marketingImpressions || 0 }),
  ...(appEvent.marketingClicks !== undefined && { marketing_clicks: appEvent.marketingClicks || 0 }),
  ...(appEvent.marketingConversions !== undefined && { marketing_conversions: appEvent.marketingConversions || 0 }),
  ...(appEvent.costPerClick !== undefined && { cost_per_click: appEvent.costPerClick || 0 }),
  ...(appEvent.costPerConversion !== undefined && { cost_per_conversion: appEvent.costPerConversion || 0 }),
  ...(appEvent.returnOnAdSpend !== undefined && { return_on_ad_spend: appEvent.returnOnAdSpend || 0 }),
  
  // Media
  image_url: appEvent.imageUrl || null,
  thumbnail_url: appEvent.thumbnailUrl || null,
}) 