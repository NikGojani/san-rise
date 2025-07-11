-- QUICK FIX: Fehlende Marketing-Felder zu bestehenden Events hinzufügen
-- Führen Sie diese Befehle in der Supabase SQL Editor aus

-- Alle fehlenden Marketing-Felder zu bestehenden Events hinzufügen
UPDATE public.events SET
    -- Meta Integration Felder (falls sie nicht existieren)
    sync_with_meta = COALESCE(sync_with_meta, false),
    
    -- Marketing Performance Felder (falls sie nicht existieren)
    marketing_budget = COALESCE(marketing_budget, 0),
    marketing_spent = COALESCE(marketing_spent, 0),
    marketing_impressions = COALESCE(marketing_impressions, 0),
    marketing_clicks = COALESCE(marketing_clicks, 0),
    marketing_conversions = COALESCE(marketing_conversions, 0),
    cost_per_click = COALESCE(cost_per_click, 0),
    cost_per_conversion = COALESCE(cost_per_conversion, 0),
    return_on_ad_spend = COALESCE(return_on_ad_spend, 0)
WHERE 
    sync_with_meta IS NULL 
    OR marketing_budget IS NULL 
    OR marketing_spent IS NULL;

-- Fallback: Wenn die Spalten nicht existieren, werden sie übersprungen
-- Das SQL wird nur erfolgreich ausgeführt, wenn die Spalten bereits durch das FRESH_SUPABASE_SETUP erstellt wurden 