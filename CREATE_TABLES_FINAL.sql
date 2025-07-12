-- ===============================================
-- SUPABASE TABELLEN FINAL - NUR BENÖTIGTE TABELLEN
-- ===============================================
-- Führen Sie diese Befehle in der Supabase SQL Editor aus

-- 1. Settings Tabelle erstellen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'SAN RISE GMBH',
    gema_percentage DECIMAL(5,2) DEFAULT 9.00,
    currency TEXT DEFAULT 'EUR',
    logo_url TEXT,
    logo_text TEXT DEFAULT 'SAN RISE GMBH',
    nik_percentage DECIMAL(5,2) DEFAULT 31.5,
    adrian_percentage DECIMAL(5,2) DEFAULT 31.5,
    sebastian_percentage DECIMAL(5,2) DEFAULT 17.0,
    mexify_percentage DECIMAL(5,2) DEFAULT 20.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Additional Costs Tabelle erstellen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.additional_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('one-time', 'monthly', 'yearly')),
    date DATE NOT NULL,
    description TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Standard-Settings einfügen (falls noch nicht vorhanden)
INSERT INTO public.settings (company_name, logo_text, gema_percentage, currency, nik_percentage, adrian_percentage, sebastian_percentage, mexify_percentage) 
SELECT 'SAN RISE GMBH', 'SAN RISE GMBH', 9.00, 'EUR', 31.5, 31.5, 17.0, 20.0
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- 4. RLS (Row Level Security) aktivieren (falls nicht bereits aktiv)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_costs ENABLE ROW LEVEL SECURITY;

-- 5. Policies für Settings erstellen (falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow all operations on settings') THEN
        CREATE POLICY "Allow all operations on settings" ON public.settings
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 6. Policies für Additional Costs erstellen (falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'additional_costs' AND policyname = 'Allow all operations on additional_costs') THEN
        CREATE POLICY "Allow all operations on additional_costs" ON public.additional_costs
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 7. Employees Tabelle aktualisieren (falls Spalten fehlen)
-- Prüfe ob die Tabelle 'employees' existiert und füge fehlende Spalten hinzu
DO $$ 
BEGIN
    -- Prüfe ob employees Tabelle existiert
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        -- Füge additional_costs_percentage Spalte hinzu falls nicht vorhanden
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'additional_costs_percentage') THEN
            ALTER TABLE public.employees ADD COLUMN additional_costs_percentage DECIMAL(5,2) DEFAULT 20.00;
        END IF;
        
        -- Füge files Spalte hinzu falls nicht vorhanden
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'files') THEN
            ALTER TABLE public.employees ADD COLUMN files JSONB DEFAULT '[]'::jsonb;
        END IF;
    END IF;
END $$;

-- 8. Contracts/Vertragskosten Tabelle aktualisieren (falls Spalten fehlen)
DO $$ 
BEGIN
    -- Prüfe ob vertragskosten Tabelle existiert
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vertragskosten') THEN
        -- Füge attachments Spalte hinzu falls nicht vorhanden
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vertragskosten' AND column_name = 'attachments') THEN
            ALTER TABLE public.vertragskosten ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
        END IF;
    END IF;
    
    -- Prüfe ob contracts Tabelle existiert (alternative Benennung)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts') THEN
        -- Füge attachments Spalte hinzu falls nicht vorhanden
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'attachments') THEN
            ALTER TABLE public.contracts ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
        END IF;
    END IF;
END $$;

-- ✅ ERFOLGREICH! Alle benötigten Tabellen wurden erstellt/aktualisiert. 