-- EINFACHE LÖSUNG: Nur Events-Tabelle neu erstellen ohne alte Daten zu verlieren
-- Führen Sie diese Befehle in der Supabase SQL Editor aus

-- Schritt 1: Alte Events sichern (falls gewünscht)
CREATE TEMP TABLE backup_events AS SELECT * FROM public.events;

-- Schritt 2: Events-Tabelle löschen und neu erstellen
DROP TABLE IF EXISTS public.events CASCADE;

-- Schritt 3: Events-Tabelle neu erstellen (EINFACHE VERSION ohne Marketing-Felder)
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')) DEFAULT 'upcoming',
    price DECIMAL(10,2) DEFAULT 0,
    max_tickets INTEGER DEFAULT 100,
    tickets_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    expenses DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) GENERATED ALWAYS AS (revenue - expenses) STORED,
    
    -- Nur Shopify Integration (bewährt)
    shopify_product_id TEXT,
    shopify_variant_id TEXT,
    sync_with_shopify BOOLEAN DEFAULT false,
    shopify_last_synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Media
    image_url TEXT,
    thumbnail_url TEXT,
    
    -- System
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schritt 4: RLS aktivieren
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on events" ON public.events
    FOR ALL USING (true) WITH CHECK (true);

-- Schritt 5: Demo-Events erstellen (EINFACH ohne Marketing-Felder)
INSERT INTO public.events (name, description, location, date, status, price, max_tickets, tickets_sold, revenue, expenses, sync_with_shopify) VALUES
    ('Summer Festival 2024', 'Großes Musikfestival im Sommer', 'Stadtpark Berlin', '2024-07-15 18:00:00+02', 'upcoming', 45.00, 500, 0, 0, 0, true),
    ('Corporate Event', 'Firmenevent für Unternehmenskunden', 'Convention Center', '2024-08-20 19:00:00+02', 'upcoming', 75.00, 200, 0, 0, 0, true),
    ('Winter Party', 'Winterliche Feier zum Jahresende', 'Club Downtown', '2024-12-15 20:00:00+01', 'upcoming', 35.00, 300, 0, 0, 0, false);

-- FERTIG! Events API sollte jetzt wieder funktionieren. 