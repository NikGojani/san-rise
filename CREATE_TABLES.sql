-- ===============================================
-- SUPABASE TABELLEN FÜR SAN RISE DASHBOARD
-- ===============================================
-- Führen Sie diese Befehle in der Supabase SQL Editor aus

-- 1. Mitarbeiter Tabelle erstellen
CREATE TABLE public.mitarbeiter (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    adresse TEXT,
    position TEXT,
    geburtsdatum DATE,
    einstellungsde DATE,
    brutto DECIMAL(10,2),
    netto DECIMAL(10,2),
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    additional_cc DECIMAL(5,2) DEFAULT 20.00,
    files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vertragskosten Tabelle erstellen
CREATE TABLE public.vertragskosten (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    betrag DECIMAL(10,2),
    intervall TEXT CHECK (intervall IN ('monthly', 'yearly', 'once')),
    kategorie TEXT,
    start_date DATE,
    end_date DATE,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS (Row Level Security) aktivieren
ALTER TABLE public.mitarbeiter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vertragskosten ENABLE ROW LEVEL SECURITY;

-- 4. Policies für public access erstellen (für Development)
-- ACHTUNG: In Production sollten diese restriktiver sein!
CREATE POLICY "Allow all operations on mitarbeiter" ON public.mitarbeiter
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on vertragskosten" ON public.vertragskosten
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Beispiel-Daten einfügen (optional)
INSERT INTO public.mitarbeiter (name, adresse, position, brutto, netto, email, phone) VALUES
    ('Max Mustermann', 'Musterstraße 1, 12345 Musterstadt', 'Event Manager', 4500.00, 2800.00, 'max@sanrise.de', '+49 123 456789'),
    ('Anna Schmidt', 'Beispielweg 2, 54321 Beispielstadt', 'Marketing Manager', 4200.00, 2600.00, 'anna@sanrise.de', '+49 987 654321');

INSERT INTO public.vertragskosten (name, betrag, intervall, kategorie) VALUES
    ('Office Miete', 2500.00, 'monthly', 'Betriebskosten'),
    ('Software Lizenzen', 500.00, 'monthly', 'IT'),
    ('Versicherung', 1200.00, 'yearly', 'Versicherungen'); 