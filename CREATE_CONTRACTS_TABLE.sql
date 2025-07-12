-- ===============================================
-- CONTRACTS TABLE FÜR SAN RISE DASHBOARD
-- ===============================================
-- Führen Sie diese Befehle in der Supabase SQL Editor aus

-- 1. Contracts Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly', 'once')),
    start_date DATE,
    end_date DATE,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS (Row Level Security) aktivieren
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 3. Policy für Contracts erstellen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Allow all operations on contracts') THEN
        CREATE POLICY "Allow all operations on contracts" ON public.contracts
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ✅ ERFOLGREICH! Contracts Tabelle wurde erstellt. 