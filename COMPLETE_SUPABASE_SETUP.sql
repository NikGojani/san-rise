-- ===============================================
-- VOLLSTÄNDIGE SUPABASE TABELLEN FÜR SAN RISE DASHBOARD
-- ===============================================
-- Führen Sie diese Befehle in der Supabase SQL Editor aus

-- 1. Users Tabelle erstellen
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'team')) DEFAULT 'team',
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Events Tabelle erstellen
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
    shopify_product_id TEXT,
    shopify_variant_id TEXT,
    sync_with_shopify BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tasks Tabelle erstellen
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
    assigned_to TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    drive_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Calculator Configs Tabelle erstellen
CREATE TABLE public.calculator_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    vk_percentage DECIMAL(5,2) DEFAULT 100,
    termine INTEGER DEFAULT 1,
    gema_percentage DECIMAL(5,2) DEFAULT 9,
    marketing_costs DECIMAL(10,2) DEFAULT 0,
    artist_costs DECIMAL(10,2) DEFAULT 0,
    location_costs DECIMAL(10,2) DEFAULT 0,
    merchandiser_costs DECIMAL(10,2) DEFAULT 0,
    travel_costs DECIMAL(10,2) DEFAULT 0,
    rabatt DECIMAL(10,2) DEFAULT 0,
    aufbauhelfer DECIMAL(10,2) DEFAULT 0,
    variable_costs DECIMAL(10,2) DEFAULT 0,
    ticketing_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id)
);

-- 5. Mitarbeiter Tabelle (aktualisiert)
CREATE TABLE IF NOT EXISTS public.mitarbeiter (
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

-- 6. Vertragskosten Tabelle (aktualisiert)
CREATE TABLE IF NOT EXISTS public.vertragskosten (
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

-- 7. RLS (Row Level Security) aktivieren
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitarbeiter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vertragskosten ENABLE ROW LEVEL SECURITY;

-- 8. Policies für public access erstellen (für Development)
-- ACHTUNG: In Production sollten diese restriktiver sein!
CREATE POLICY "Allow all operations on users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on events" ON public.events
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on tasks" ON public.tasks
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on calculator_configs" ON public.calculator_configs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on mitarbeiter" ON public.mitarbeiter
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on vertragskosten" ON public.vertragskosten
    FOR ALL USING (true) WITH CHECK (true);

-- 9. Trigger für updated_at Felder
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculator_configs_updated_at BEFORE UPDATE ON public.calculator_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mitarbeiter_updated_at BEFORE UPDATE ON public.mitarbeiter 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vertragskosten_updated_at BEFORE UPDATE ON public.vertragskosten 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Demo-Benutzer erstellen (Passwort: "123456")
INSERT INTO public.users (username, display_name, email, password_hash, role) VALUES
    ('nik', 'Nik Gojani', 'nik@sanrise.de', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
    ('admin', 'Administrator', 'admin@sanrise.de', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
    ('team', 'Team Member', 'team@sanrise.de', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'team');

-- 11. Demo-Events erstellen
INSERT INTO public.events (name, description, location, date, status, price, max_tickets, tickets_sold, revenue, expenses) VALUES
    ('Summer Festival 2024', 'Großes Musikfestival im Sommer', 'Stadtpark Berlin', '2024-07-15 18:00:00+02', 'upcoming', 45.00, 500, 0, 0, 0),
    ('Corporate Event', 'Firmenevent für Unternehmenskunden', 'Convention Center', '2024-08-20 19:00:00+02', 'upcoming', 75.00, 200, 0, 0, 0),
    ('Winter Party', 'Winterliche Feier zum Jahresende', 'Club Downtown', '2024-12-15 20:00:00+01', 'upcoming', 35.00, 300, 0, 0, 0);

-- 12. Demo-Tasks erstellen
INSERT INTO public.tasks (title, description, priority, status, assigned_to, due_date) VALUES
    ('Event-Planung vorbereiten', 'Grundlegende Planung für das Summer Festival', 'high', 'todo', 'Nik', '2024-06-01 23:59:59+02'),
    ('Marketing-Kampagne starten', 'Social Media und Werbung für Events', 'medium', 'in-progress', 'Team', '2024-05-15 23:59:59+02'),
    ('Location buchen', 'Verträge mit Veranstaltungsorten abschließen', 'high', 'todo', 'Admin', '2024-05-20 23:59:59+02');

-- 13. Demo-Mitarbeiter (falls noch nicht vorhanden)
INSERT INTO public.mitarbeiter (name, adresse, position, brutto, netto, email, phone) VALUES
    ('Max Mustermann', 'Musterstraße 1, 12345 Musterstadt', 'Event Manager', 4500.00, 2800.00, 'max@sanrise.de', '+49 123 456789'),
    ('Anna Schmidt', 'Beispielweg 2, 54321 Beispielstadt', 'Marketing Manager', 4200.00, 2600.00, 'anna@sanrise.de', '+49 987 654321')
ON CONFLICT DO NOTHING;

-- 14. Demo-Verträge (falls noch nicht vorhanden)
INSERT INTO public.vertragskosten (name, betrag, intervall, kategorie) VALUES
    ('Office Miete', 2500.00, 'monthly', 'Betriebskosten'),
    ('Software Lizenzen', 500.00, 'monthly', 'IT'),
    ('Versicherung', 1200.00, 'yearly', 'Versicherungen'),
    ('Strom/Gas', 300.00, 'monthly', 'Betriebskosten')
ON CONFLICT DO NOTHING; 