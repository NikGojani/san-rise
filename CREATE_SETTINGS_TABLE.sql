-- ===============================================
-- SETTINGS TABLE FÜR SAN RISE DASHBOARD
-- ===============================================

-- 1. Settings Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'SAN RISE GMBH',
    gema_percentage DECIMAL(5,2) NOT NULL DEFAULT 9.00,
    currency TEXT NOT NULL DEFAULT 'EUR',
    logo_url TEXT,
    logo_text TEXT NOT NULL DEFAULT 'SAN RISE GMBH',
    nik_percentage DECIMAL(5,2) NOT NULL DEFAULT 31.5,
    adrian_percentage DECIMAL(5,2) NOT NULL DEFAULT 31.5,
    sebastian_percentage DECIMAL(5,2) NOT NULL DEFAULT 31.5,
    mexify_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS aktivieren
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 3. Policy erstellen
DO $$ 
BEGIN
   IF NOT EXISTS (
       SELECT 1 FROM pg_policies 
       WHERE schemaname = 'public' 
       AND tablename = 'settings' 
       AND policyname = 'Allow all operations on settings'
   ) THEN
       CREATE POLICY "Allow all operations on settings" ON public.settings
       FOR ALL USING (true) WITH CHECK (true);
   END IF;
END $$;

-- 4. Standard-Einstellungen einfügen
INSERT INTO public.settings (
    company_name, 
    gema_percentage, 
    currency, 
    logo_text, 
    nik_percentage, 
    adrian_percentage, 
    sebastian_percentage, 
    mexify_percentage
) VALUES (
    'SAN RISE GMBH', 
    9.00, 
    'EUR', 
    'SAN RISE GMBH', 
    31.5, 
    31.5, 
    31.5, 
    5.5
)
ON CONFLICT (id) DO NOTHING;

-- Falls keine Einstellungen vorhanden sind, füge Standard-Einstellungen ein
INSERT INTO public.settings (
    company_name, 
    gema_percentage, 
    currency, 
    logo_text, 
    nik_percentage, 
    adrian_percentage, 
    sebastian_percentage, 
    mexify_percentage
) 
SELECT 
    'SAN RISE GMBH', 
    9.00, 
    'EUR', 
    'SAN RISE GMBH', 
    31.5, 
    31.5, 
    31.5, 
    5.5
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

COMMIT; 